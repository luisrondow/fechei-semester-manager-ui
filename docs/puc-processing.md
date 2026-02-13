# PUC Processing Pipeline

This document describes the complete procedure for processing a PUC (Plano da Unidade Curricular) document, from the moment a user selects a PDF file to the final display of extracted events, subject brief, and bibliography resources.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Frontend Upload Flow](#frontend-upload-flow)
5. [Backend Processing Action](#backend-processing-action)
6. [AI Extraction](#ai-extraction)
7. [Data Insertion](#data-insertion)
8. [Re-processing](#re-processing)
9. [Error Handling](#error-handling)
10. [Technical Constraints & Gotchas](#technical-constraints--gotchas)
11. [Environment Setup](#environment-setup)
12. [Data Flow Diagram](#data-flow-diagram)

---

## Overview

The PUC processing pipeline converts an uploaded PDF document into three types of structured data:

- **Calendar Events** — assessment deadlines, study blocks, and activity periods extracted from the document
- **Subject Brief** — an AI-generated markdown summary covering learning objectives, competencies, methodology, assessment structure, and a study roadmap
- **Resources** — bibliography entries classified as required, complementary, or other reading material

The pipeline runs as a Convex `"use node"` action, which has access to Node.js APIs (file system, npm packages) and can call third-party services (OpenAI). It uses `pdf-parse` for text extraction and Vercel AI SDK v6 with GPT-4o-mini for structured data generation.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│                                                                 │
│  Subject Overview Page                                          │
│  semester.$semesterId.subject.$subjectId.index.tsx              │
│                                                                 │
│  1. User selects PDF file                                       │
│  2. generateUploadUrl() → gets presigned URL                    │
│  3. fetch(POST) → uploads PDF to Convex storage                 │
│  4. uploadPUC() → creates pucDocuments record with storageId    │
│  5. processPuc() → triggers backend action                      │
│                                                                 │
│  Hooks used:                                                    │
│  - useGenerateUploadUrl() → api.puc.generateUploadUrl           │
│  - useUploadPUC()         → api.puc.upload                      │
│  - useProcessPuc()        → api.pucProcessing.processPuc        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CONVEX BACKEND (Node.js Action)               │
│                                                                 │
│  convex/pucProcessing.ts ("use node")                           │
│                                                                 │
│  1. Fetch PUC + subject + semester context (internal query)     │
│  2. Check semester is not archived                              │
│  3. Set PUC status → "processing"                               │
│  4. Download PDF from Convex storage via URL                    │
│  5. Extract text with pdf-parse                                 │
│  6. Save extracted text to pucDocuments record                  │
│  7. Call GPT-4o-mini with structured output schema              │
│  8. Delete old AI-extracted data (events, brief, resources)     │
│  9. Insert new extracted data via internal mutations             │
│ 10. Set PUC status → "extracted"                                │
│                                                                 │
│  On error: Set PUC status → "error", re-throw                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       CONVEX DATABASE                           │
│                                                                 │
│  pucDocuments  → status, extractedText, storageId               │
│  calendarEvents → events with type, dates, sourceExcerpt        │
│  subjectBriefs  → generatedText (markdown), confidenceScore     │
│  resources      → bibliography with sourceType: "puc_extracted" │
└─────────────────────────────────────────────────────────────────┘
```

### File Map

| File | Role |
|------|------|
| `src/routes/semester.$semesterId.subject.$subjectId.index.tsx` | Frontend upload UI, progress display, re-process button |
| `src/hooks/queries/use-puc.ts` | React hooks wrapping Convex mutations/actions |
| `src/components/extraction-progress.tsx` | Progress stepper UI (uploading → processing → extracted / error) |
| `convex/pucProcessing.ts` | Main Node.js action: PDF parse + AI extraction + data insertion |
| `convex/puc.ts` | PUC document CRUD + internal mutations (`saveExtractedText`, `updateStatusInternal`, `getPucWithContext`) |
| `convex/events.ts` | Internal mutations: `createBatch`, `deleteBySubject` |
| `convex/briefs.ts` | Internal mutations: `create`, `deleteBySubject` |
| `convex/resources.ts` | Internal mutations: `createFromExtraction`, `deleteExtractedBySubject` |
| `convex/pdf-parse.d.ts` | TypeScript declaration for the `pdf-parse/lib/pdf-parse.js` internal import |

---

## Database Schema

The following tables are involved in PUC processing (defined in `convex/schema.ts`):

### `pucDocuments`

```ts
pucDocuments: defineTable({
  subjectId: v.id("subjects"),     // FK to subject
  fileName: v.string(),            // Original uploaded file name
  extractedText: v.optional(v.string()), // Raw text extracted from PDF
  language: v.string(),            // Always "pt" (PUCs are in Portuguese)
  status: v.string(),              // "uploading" | "processing" | "extracted" | "error"
  version: v.number(),             // Document version (currently always 1)
  storageId: v.optional(v.id("_storage")), // Convex file storage reference
}).index("by_subject", ["subjectId"])
```

### `calendarEvents`

```ts
calendarEvents: defineTable({
  subjectId: v.id("subjects"),
  type: v.string(),                // "study_block" | "assessment" | "tbd"
  startDate: v.string(),           // ISO date (YYYY-MM-DD)
  endDate: v.string(),             // ISO date (YYYY-MM-DD)
  title: v.string(),
  description: v.string(),
  status: v.string(),              // "pending" | "confirmed" — AI-created events start as "pending"
  sourceExcerpt: v.optional(v.string()), // Original Portuguese text from the PDF
  updatedAt: v.string(),
}).index("by_subject", ["subjectId"])
```

### `subjectBriefs`

```ts
subjectBriefs: defineTable({
  subjectId: v.id("subjects"),
  generatedText: v.string(),       // AI-generated markdown brief
  userEditedText: v.optional(v.string()), // User's edited version (if modified)
  confidenceScore: v.number(),     // 0-1, how confident the AI is in the extraction
}).index("by_subject", ["subjectId"])
```

### `resources`

```ts
resources: defineTable({
  subjectId: v.id("subjects"),
  sourceType: v.string(),          // "puc_extracted" | "user_saved"
  resourceType: v.string(),        // "required" | "complementary" | "other"
  title: v.string(),
  authors: v.optional(v.string()),
  url: v.optional(v.string()),
  notes: v.optional(v.string()),
  tags: v.array(v.string()),
  pinned: v.boolean(),             // AI-created resources start as false
  updatedAt: v.string(),
}).index("by_subject", ["subjectId"])
```

---

## Frontend Upload Flow

The upload flow is handled in the subject overview page (`semester.$semesterId.subject.$subjectId.index.tsx`). It involves three Convex calls in sequence.

### Step 1: Generate Upload URL

```ts
const uploadUrl = await generateUploadUrl({});
```

Calls `api.puc.generateUploadUrl`, a Convex mutation that returns a short-lived presigned URL for uploading a file to Convex's built-in file storage.

### Step 2: Upload PDF to Convex Storage

```ts
const uploadResponse = await fetch(uploadUrl, {
  method: "POST",
  headers: { "Content-Type": file.type },
  body: file,
});
const { storageId } = await uploadResponse.json();
```

The file is uploaded directly to Convex storage via the presigned URL. The response contains a `storageId` (`Id<"_storage">`) that references the stored file. This upload happens client-side — the file never passes through our Convex functions.

### Step 3: Create PUC Document Record

```ts
const doc = await uploadPUC({
  subjectId: asId<"subjects">(subjectId),
  fileName: file.name,
  storageId,
});
```

Calls `api.puc.upload`, which inserts a new `pucDocuments` record with:
- `status: "uploading"` (initial state)
- `storageId` pointing to the uploaded file
- `language: "pt"` (PUCs are always Portuguese)
- `version: 1`

This mutation also validates that the semester is not archived via `assertNotArchived()`.

### Step 4: Trigger AI Processing

```ts
setUploadingStatus("processing");
await processPuc({
  pucId: asId<"pucDocuments">(doc.id),
  locale,
});
```

Calls `api.pucProcessing.processPuc`, the main action. The `locale` parameter (from `useI18n()`) tells the AI what language to generate titles and descriptions in. The action runs asynchronously on Convex's Node.js runtime.

### UI Progress States

The `ExtractionProgress` component renders a visual stepper showing three stages:

| Status | UI Display |
|--------|------------|
| `"uploading"` | Spinner on "Uploading..." step |
| `"processing"` | Spinner on "Processing PUC..." step |
| `"extracted"` | All steps completed with checkmarks |
| `"error"` | Error message with optional retry button |

The status is tracked both locally (`uploadingStatus` state) and server-side (`puc.status` in the database). On page reload during processing, the component reads the server-side status to resume the correct display.

---

## Backend Processing Action

The `processPuc` action in `convex/pucProcessing.ts` is the core of the pipeline. It runs in Convex's Node.js environment (`"use node"` directive) which gives it access to npm packages and Node.js APIs.

### Arguments

```ts
args: {
  pucId: v.id("pucDocuments"),     // Which PUC document to process
  locale: v.optional(v.string()),  // "en" | "pt" — output language for AI
}
```

### Step-by-Step Execution

#### 1. Fetch Context

```ts
const puc = await ctx.runQuery(internal.puc.getPucWithContext, { pucId: args.pucId });
```

The `getPucWithContext` internal query (in `convex/puc.ts`) resolves the full context chain:

```
pucDocuments → subjects → semesters
```

It returns a flattened object containing:
- PUC fields: `id`, `subjectId`, `storageId`, `fileName`, `status`
- Subject fields: `subject.name`, `subject.code`
- Semester fields: `semester.startDate`, `semester.endDate`

This single query replaces what would otherwise be three separate lookups.

#### 2. Archive Guard

```ts
if (new Date() > new Date(puc.semester.endDate)) {
  throw new ConvexError("This semester is archived and cannot be modified.");
}
```

Prevents processing PUCs for archived semesters. This check is done in the action itself because actions cannot use the `assertNotArchived()` helper (which requires a `MutationCtx`).

#### 3. Set Status to Processing

```ts
await ctx.runMutation(internal.puc.updateStatusInternal, {
  id: args.pucId,
  status: "processing",
});
```

Updates the PUC status in the database. This triggers a real-time update on the frontend (via Convex's reactive queries), so the progress UI updates immediately.

The `updateStatusInternal` mutation is used instead of `updateStatus` because:
- It's an `internalMutation` — callable only from other Convex functions, not from clients
- It skips the `assertNotArchived()` check (which was already done in step 2)

#### 4. Download PDF from Storage

```ts
const fileUrl = await ctx.storage.getUrl(puc.storageId as Id<"_storage">);
const response = await fetch(fileUrl);
const arrayBuffer = await response.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);
```

Convex actions can access stored files via `ctx.storage.getUrl()`, which returns a temporary download URL. The file is fetched and converted to a Node.js `Buffer` for `pdf-parse`.

#### 5. Extract Text

```ts
const pdf = require("pdf-parse/lib/pdf-parse.js");
const pdfData = await pdf(buffer);
const extractedText = pdfData.text;
```

`pdf-parse` extracts all text content from the PDF. Note the import path — see [Technical Constraints](#technical-constraints--gotchas) for why `pdf-parse/lib/pdf-parse.js` is used instead of `pdf-parse`.

A minimum text length check (50 characters) catches scanned PDFs or image-only documents that `pdf-parse` can't read:

```ts
if (extractedText.trim().length < 50) {
  throw new ConvexError("PDF appears to be scanned or contains very little text.");
}
```

#### 6. Save Extracted Text

```ts
await ctx.runMutation(internal.puc.saveExtractedText, {
  id: args.pucId,
  extractedText,
  status: "processing",
});
```

Persists the raw extracted text to the `pucDocuments` record. This serves two purposes:
- Debugging: the raw text can be inspected in the Convex dashboard
- Future use: re-processing could potentially skip the PDF download step

#### 7. AI Extraction (see [AI Extraction](#ai-extraction) section below)

#### 8-9. Delete Old Data & Insert New Data (see [Data Insertion](#data-insertion) section below)

#### 10. Set Status to Extracted

```ts
await ctx.runMutation(internal.puc.updateStatusInternal, {
  id: args.pucId,
  status: "extracted",
});
```

Final status update. The frontend detects this via reactive query and shows the completion state.

---

## AI Extraction

### Model & SDK

- **Model**: `gpt-4o-mini` via OpenAI API
- **SDK**: Vercel AI SDK v6 (`ai` + `@ai-sdk/openai`)
- **Method**: `generateText()` with `Output.object()` for structured output

```ts
const { output: result } = await generateText({
  model: openai("gpt-4o-mini"),
  prompt,
  output: Output.object({ schema: extractionSchema }),
});
```

The `Output.object()` wrapper converts the Zod schema to a JSON Schema that OpenAI's structured output API enforces. This guarantees the response conforms to the schema — no parsing or retry logic needed.

### Output Schema

The extraction schema is a Zod object with three sections:

```ts
const extractionSchema = z.object({
  events: z.array(z.object({
    type: z.enum(["study_block", "assessment", "tbd"]),
    startDate: z.string(),    // YYYY-MM-DD
    endDate: z.string(),      // YYYY-MM-DD
    title: z.string(),
    description: z.string(),
    sourceExcerpt: z.string().nullable(),  // Original Portuguese text
  })),

  brief: z.object({
    generatedText: z.string(),   // Markdown-formatted
    confidenceScore: z.number(), // 0-1
  }),

  resources: z.array(z.object({
    resourceType: z.enum(["required", "complementary", "other"]),
    title: z.string(),
    authors: z.string().nullable(),
    url: z.string().nullable(),
    notes: z.string().nullable(),
    tags: z.array(z.string()),
  })),
});
```

All optional fields use `.nullable()` (not `.optional()`) — see [Technical Constraints](#technical-constraints--gotchas).

### Prompt Engineering

The `buildPrompt()` function constructs the prompt with:

1. **Role**: Academic document analyzer for Portuguese university PUCs
2. **Context**: Subject name, code, and semester date range
3. **Language directive**: Output in user's locale (EN or PT-PT), except `sourceExcerpt` which stays in original Portuguese
4. **Extraction rules**: Detailed instructions for each section:
   - **Events**: How to classify types, handle date ranges vs single dates, semester boundaries
   - **Brief**: Required sections (Overview, Learning Objectives, Competencies, Methodology, Assessment Structure, Study Roadmap)
   - **Resources**: Classification rules, parsing guidance for bibliography entries
5. **PDF text**: The full extracted text, delimited by `---` markers

### Locale Handling

| Field | Language |
|-------|----------|
| Event titles & descriptions | User's locale (EN or PT-PT) |
| Brief `generatedText` | User's locale |
| Resource titles & notes | User's locale |
| Event `sourceExcerpt` | Always original Portuguese |

---

## Data Insertion

After the AI produces structured output, the action performs a **replace** operation: delete old data, then insert new data.

### Step 8: Delete Old Data

Three internal mutations run in sequence:

```ts
// Delete ALL events for this subject (both AI and manually created)
await ctx.runMutation(internal.events.deleteBySubject, { subjectId });

// Delete existing brief for this subject
await ctx.runMutation(internal.briefs.deleteBySubject, { subjectId });

// Delete only "puc_extracted" resources (preserves "user_saved" ones)
await ctx.runMutation(internal.resources.deleteExtractedBySubject, { subjectId });
```

Note the asymmetry: events and briefs are fully replaced, but resources only delete those with `sourceType: "puc_extracted"`. User-saved resources are preserved across re-processing.

### Step 9: Insert New Data

#### Events (`internal.events.createBatch`)

```ts
await ctx.runMutation(internal.events.createBatch, {
  events: result.events.map((e) => ({
    subjectId: puc.subjectId,
    type: e.type,
    startDate: e.startDate,
    endDate: e.endDate,
    title: e.title,
    description: e.description,
    sourceExcerpt: e.sourceExcerpt ?? undefined,  // null → undefined for Convex
  })),
});
```

All events are created with `status: "pending"`. Users can then review and confirm each event individually.

#### Brief (`internal.briefs.create`)

```ts
await ctx.runMutation(internal.briefs.create, {
  subjectId: puc.subjectId,
  generatedText: result.brief.generatedText,
  confidenceScore: result.brief.confidenceScore,
});
```

Creates a single brief per subject. The `userEditedText` field starts as `undefined` — it gets populated when a user edits the brief.

#### Resources (`internal.resources.createFromExtraction`)

```ts
await ctx.runMutation(internal.resources.createFromExtraction, {
  resources: result.resources.map((r) => ({
    subjectId: puc.subjectId,
    resourceType: r.resourceType,
    title: r.title,
    authors: r.authors ?? undefined,
    url: r.url ?? undefined,
    notes: r.notes ?? undefined,
    tags: r.tags,
  })),
});
```

All extracted resources are created with `sourceType: "puc_extracted"` and `pinned: false`.

### Null-to-Undefined Conversion

The AI schema uses `.nullable()` (producing `string | null`), but Convex schema uses `v.optional(v.string())` (expecting `string | undefined`). The `?? undefined` coercion bridges this mismatch at the insertion boundary.

---

## Re-processing

When a PUC has already been extracted (`status === "extracted"`), the subject overview page shows a "Re-process" button. This triggers the same `processPuc` action with the existing PUC's ID — no re-upload needed.

### Flow

1. User clicks "Re-process PUC" button
2. A confirmation dialog warns: "This will replace all AI-extracted events, brief, and resources. User-saved resources will be kept."
3. On confirm, `handleReprocess()` calls `processPuc({ pucId, locale })`
4. The action re-downloads the same PDF from storage, re-extracts text, re-runs AI, deletes old data, inserts new data
5. UI updates reactively via Convex queries

### Use Cases

- **Locale change**: User switches from EN to PT and wants the brief regenerated in Portuguese
- **AI improvements**: If the prompt or model is updated, re-processing picks up the changes
- **Corrections**: If initial extraction missed dates or misclassified events

---

## Error Handling

### Backend Error Recovery

The entire processing pipeline is wrapped in a try/catch. On any error:

```ts
catch (error) {
  await ctx.runMutation(internal.puc.updateStatusInternal, {
    id: args.pucId,
    status: "error",
  });
  throw error;
}
```

This ensures the PUC status is always set to `"error"` if anything fails, so the UI can display the error state. The error is re-thrown so it appears in Convex logs for debugging.

### Frontend Error Handling

```ts
catch {
  setUploadingStatus("error");
  toast.error(t.puc.error);
}
```

The `ExtractionProgress` component shows an error state with a retry button (via the `onRetry` prop).

### Retry Behavior

The retry button behavior depends on the state:

- **If `storageId` exists** (file was uploaded but processing failed): Calls `handleReprocess()` which re-runs the action on the existing PUC document
- **If no `storageId`** (upload itself failed): Resets `uploadingStatus` to `null`, returning the user to the upload prompt

### Common Error Scenarios

| Error | Cause | User Experience |
|-------|-------|-----------------|
| Scanned PDF | `pdf-parse` returns < 50 chars | Error with retry button |
| OpenAI quota exceeded | API key billing limit | Error with retry button |
| AI output validation failure | AI returns non-conforming JSON | Error with retry button |
| Archived semester | Processing attempted after semester end | Error thrown, blocked |
| Storage URL expired | Convex storage URL timeout | Error with retry button |
| Network failure | Connection issues during fetch | Error with retry button |

### Server-Side Status Detection

If a user navigates away during processing and returns, the page reads the PUC status from the database:

```ts
const serverProcessing =
  !uploadingStatus &&
  (puc?.status === "uploading" || puc?.status === "processing");
const serverError = !uploadingStatus && puc?.status === "error";
```

This ensures the correct progress or error state is shown even after a page refresh.

---

## Technical Constraints & Gotchas

### pdf-parse Import Path

```ts
// WRONG — triggers test file load at module init
import pdf from "pdf-parse";

// WRONG — dynamic import still triggers test file load
const pdf = (await import("pdf-parse")).default;

// CORRECT — bypasses index.js debug block
const pdf = require("pdf-parse/lib/pdf-parse.js");
```

`pdf-parse` v1's `index.js` contains a debug block (`if (!module.parent)`) that tries to load `./test/data/05-versions-space.pdf`. In Convex's bundler, `module.parent` is `undefined`, so this block always executes. Importing `lib/pdf-parse.js` directly bypasses this entirely.

A custom type declaration (`convex/pdf-parse.d.ts`) provides TypeScript types for this internal path.

### pdf-parse Version

Pin to v1 (`^1.1.1`). Version 2 has a completely incompatible class-based API (`new PDFParse()` with configuration objects) that doesn't work as a drop-in replacement.

### Convex "use node" Restriction

Only **actions** can be defined in files with the `"use node"` directive. Queries and mutations must live in separate files. This is why `getPucWithContext` (an internal query) is in `convex/puc.ts` rather than alongside the action in `convex/pucProcessing.ts`.

### OpenAI Structured Output: No Optional Fields

OpenAI's structured output API (JSON Schema mode) requires all properties in an object to be listed in the `required` array. Zod's `.optional()` marks fields as non-required, causing a validation error:

```
Missing 'sourceExcerpt' in 'required' array
```

The fix is `.nullable()` instead of `.optional()`:
- `.optional()` → field may be absent → not in `required` array → OpenAI rejects
- `.nullable()` → field is always present but can be `null` → in `required` array → OpenAI accepts

At the Convex insertion boundary, `null` values are converted to `undefined` with `?? undefined` since the Convex schema uses `v.optional(v.string())`.

### AI SDK v6 API

AI SDK v6 deprecated `generateObject()`. Use `generateText()` with the `output` property:

```ts
// WRONG (deprecated)
import { generateObject } from "ai";
const { object } = await generateObject({ model, schema, prompt });

// CORRECT (v6)
import { Output, generateText } from "ai";
const { output } = await generateText({
  model,
  prompt,
  output: Output.object({ schema }),
});
```

### Convex Document Size Limit

Convex documents have a 1MB size limit. PUC PDFs are typically 5-20 pages, so the extracted text fits well within this limit. However, extremely large documents could theoretically exceed it.

---

## Environment Setup

### Required Environment Variable

```bash
npx convex env set OPENAI_API_KEY sk-...
```

The `OPENAI_API_KEY` is read by `@ai-sdk/openai` automatically from the environment. It must be set as a Convex environment variable (not `.env.local`) because the action runs on Convex's servers.

### Dependencies

```json
{
  "dependencies": {
    "ai": "^6.0.86",
    "@ai-sdk/openai": "^3.0.28",
    "pdf-parse": "^1.1.1"
  },
  "devDependencies": {
    "@types/pdf-parse": "^1.1.5"
  }
}
```

---

## Data Flow Diagram

```
User selects PDF
       │
       ▼
┌──────────────┐     POST file
│ generateUrl  │────────────────►  Convex Storage
│ (mutation)   │                      │
└──────────────┘                      │ returns storageId
                                      ▼
                               ┌──────────────┐
                               │ upload (mut)  │ → INSERT pucDocuments
                               │ status:       │   {status: "uploading",
                               │ "uploading"   │    storageId: "..."}
                               └──────┬───────┘
                                      │
                                      ▼
                               ┌──────────────────────────────────┐
                               │     processPuc (action)          │
                               │                                  │
                               │  ┌─ getPucWithContext ──────┐    │
                               │  │  PUC → Subject → Semester│    │
                               │  └──────────────────────────┘    │
                               │           │                      │
                               │           ▼                      │
                               │  status → "processing"           │
                               │           │                      │
                               │           ▼                      │
                               │  ┌─ Download PDF ───────────┐   │
                               │  │  ctx.storage.getUrl()     │   │
                               │  │  fetch() → Buffer         │   │
                               │  └───────────────────────────┘   │
                               │           │                      │
                               │           ▼                      │
                               │  ┌─ pdf-parse ──────────────┐   │
                               │  │  Buffer → extractedText   │   │
                               │  │  (min 50 chars check)     │   │
                               │  └───────────────────────────┘   │
                               │           │                      │
                               │           ▼                      │
                               │  ┌─ saveExtractedText ──────┐   │
                               │  │  Persist raw text to DB   │   │
                               │  └───────────────────────────┘   │
                               │           │                      │
                               │           ▼                      │
                               │  ┌─ GPT-4o-mini ───────────┐    │
                               │  │  generateText() with     │    │
                               │  │  Output.object({schema})  │    │
                               │  │                          │    │
                               │  │  Returns:                │    │
                               │  │  - events[]              │    │
                               │  │  - brief{}               │    │
                               │  │  - resources[]           │    │
                               │  └───────────────────────────┘   │
                               │           │                      │
                               │           ▼                      │
                               │  ┌─ Delete old data ────────┐   │
                               │  │  events.deleteBySubject   │   │
                               │  │  briefs.deleteBySubject   │   │
                               │  │  resources.deleteExtracted│   │
                               │  └───────────────────────────┘   │
                               │           │                      │
                               │           ▼                      │
                               │  ┌─ Insert new data ────────┐   │
                               │  │  events.createBatch       │   │
                               │  │  briefs.create            │   │
                               │  │  resources.createFromExtr │   │
                               │  └───────────────────────────┘   │
                               │           │                      │
                               │           ▼                      │
                               │  status → "extracted"            │
                               └──────────────────────────────────┘
                                      │
                                      ▼
                               Convex reactive queries
                               auto-update frontend
                                      │
                                      ▼
                               Subject Overview shows:
                               - Events in Review tab
                               - Brief in Brief tab
                               - Resources in Resources tab
```
