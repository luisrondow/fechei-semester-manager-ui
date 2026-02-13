# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Semester Manager UI - A bilingual (EN/PT-PT) web platform that converts uploaded PUC (Plano da Unidade Curricular) PDFs into organized semester calendars with AI-generated subject briefs. Targets Portuguese university students, particularly distance-learning programs like Universidade Aberta.

## Commands

```bash
npm run dev        # Start dev server on port 3000
npx convex dev     # Start Convex dev server (runs alongside npm run dev)
npm run build      # Build for production
npm run test       # Run tests (Vitest)
npm run lint       # Lint with Biome
npm run format     # Format with Biome
npm run check      # Biome check (lint + format)
npm run deploy     # Build and deploy to Cloudflare Workers
```

### Convex commands
```bash
npx convex dev              # Start dev server + codegen (interactive setup on first run)
npx convex run seed:seedData # Seed the database with demo data
npx convex codegen          # Regenerate types without dev server
```

### Adding Shadcn components
```bash
pnpm dlx shadcn@latest add <component>
```

## Architecture

### Stack
- **Framework**: TanStack Start (React 19 + SSR) with TanStack Router (file-based routing)
- **Backend**: Convex (real-time database, serverless functions, file storage)
- **Data Fetching**: TanStack Query + `@convex-dev/react-query` (reactive subscriptions via `convexQuery`). No SSR dehydration (Convex is client-only)
- **Forms**: TanStack Form with Zod validation (app form hook at `src/components/forms/`)
- **Auth**: Better Auth (email/password, configured for TanStack Start cookies) — not yet wired into Convex
- **Styling**: Tailwind CSS v4 + Shadcn UI (new-york style) with warm parchment/terracotta theme
- **Fonts**: DM Serif Text (headings) + DM Sans (body)
- **i18n**: Custom lightweight system (2 locales: EN/PT-PT, ~300 keys, full type safety)
- **Deployment**: Cloudflare Workers via Wrangler
- **Calendar Export**: Client-side RFC 5545 .ics generation (full or due-dates-only)
- **AI Processing**: Vercel AI SDK v6 (`ai` + `@ai-sdk/openai`) with GPT-4o-mini for PUC extraction
- **PDF Parsing**: `pdf-parse` v1 (Node.js, used inside Convex `"use node"` action)

### Key Directories
- `convex/` - Convex backend functions (schema, queries, mutations, seed data)
- `src/routes/` - File-based routing (TanStack Router auto-generates `routeTree.gen.ts`)
- `src/routes/api/` - API routes (e.g., `auth/$.ts` for Better Auth catch-all)
- `src/components/ui/` - Shadcn UI components
- `src/components/layout/` - App shell, sidebar, page header, empty state
- `src/components/forms/` - App form hook, context, field components (TextField, TextArea, Select, DateField)
- `src/components/` - Feature components (semester-card, subject-card, event-card, resource-item, brief-editor, puc-upload, locale-switcher, etc.)
- `src/integrations/` - Third-party integration wrappers (tanstack-query + Convex, better-auth)
- `src/lib/` - Utilities, auth, types, i18n, helpers
- `src/lib/i18n/` - i18n provider, translations (en.ts, pt.ts)
- `src/lib/api/` - Client-side API utilities (calendar-export.ts)
- `src/hooks/queries/` - TanStack Query hooks wrapping Convex queries/mutations

### Data Architecture
```
convex/                     → Schema, queries, mutations (server-side)
src/hooks/queries/          → TanStack Query hooks using convexQuery + useConvexMutation
src/components + routes     → React UI consuming hooks
```

### Convex Backend (`convex/`)
| File | Purpose |
|------|---------|
| `schema.ts` | Table definitions with indexes |
| `semesters.ts` | Semester CRUD (list, get, listWithSubjects, create, update, remove) |
| `subjects.ts` | Subject CRUD (listBySemester, listBySemesterWithPuc, get, create, remove) |
| `events.ts` | Calendar events (listBySemester, listBySubject, update, confirm) + internal `createBatch`, `deleteBySubject` |
| `briefs.ts` | Subject briefs (getBySubject, update) + internal `create`, `deleteBySubject` |
| `resources.ts` | Resources (listBySubject, create, update, remove, togglePin) + internal `createFromExtraction`, `deleteExtractedBySubject` |
| `puc.ts` | PUC docs (getBySubject, generateUploadUrl, upload, updateStatus) + internal `saveExtractedText`, `updateStatusInternal`, `getPucWithContext` |
| `pucProcessing.ts` | `"use node"` action: PDF extraction + AI structured output → batch insert events/brief/resources |
| `pdf-parse.d.ts` | Type declaration for `pdf-parse/lib/pdf-parse.js` internal import |
| `dashboard.ts` | Aggregation query (subjects + pinned resources for dashboard) |
| `seed.ts` | Seed mutation for demo data |
| `helpers.ts` | Archive guards (`assertNotArchived`) + entity→semester resolvers |

All Convex queries map `_id` → `id` and `_creationTime` → `createdAt` to match `src/lib/types.ts` interfaces.

### Type Definitions
All core entities in `src/lib/types.ts`: Semester, Subject, PUCDocument, SubjectBrief, CalendarEvent, Resource, plus input types for CRUD operations.

### ID Handling
- Convex **query** args use `v.string()` + `ctx.db.normalizeId()` to gracefully handle invalid IDs (returns `null`/`[]` instead of throwing)
- Convex **mutation** args use `v.id("tableName")` (they receive valid Convex IDs from already-loaded data)
- `src/lib/convex-helpers.ts` exports `asId<T>(id: string)` to cast URL param strings to Convex `Id<T>` types (used in mutation calls only)
- Hooks pass plain strings to queries (no `asId` needed); use `"skip"` token for empty/missing IDs

### Routing Patterns
- Routes in `src/routes/` map to URLs (e.g., `index.tsx` → `/`, `semesters.tsx` → `/semesters`)
- Root layout at `src/routes/__root.tsx` wraps all pages with ConvexProvider, QueryClientProvider, I18nProvider, and AppShell
- `index.tsx` redirects to `/dashboard`
- Semester detail uses layout route: `semester.$semesterId.tsx` → `semester.$semesterId.index.tsx`
- Subject detail uses nested layout: `semester.$semesterId.subject.$subjectId.tsx` (tabbed: overview, review, brief, resources)
- API routes use `.ts` extension with handler exports
- Route context includes `queryClient` from TanStack Query
- Each page wraps its own content with `max-w-Nxl mx-auto px-6 py-10` (AppShell provides no content padding)

### Route Map
```
/                                                → Redirect to /dashboard
/dashboard                                       → Aggregated overview (deadlines, this week, pinned)
/semesters                                       → Semester list (active + upcoming only)
/semesters/new                                   → Create semester form
/archive                                         → Archived semesters (read-only)
/semester/:id                                    → Semester detail (subjects grid, stats)
/semester/:id/edit                               → Edit semester form (redirects if archived)
/semester/:id/calendar                           → Month calendar view
/semester/:id/export                             → .ics export (full / due-dates-only)
/semester/:id/subjects/new                       → Add subject + PUC upload (redirects if archived)
/semester/:id/subject/:subId                     → Subject overview (tabbed layout)
/semester/:id/subject/:subId/review              → Review PUC extraction
/semester/:id/subject/:subId/brief               → AI subject brief (view/edit)
/semester/:id/subject/:subId/resources            → Resources (CRUD, pin/sort)
/puc-explainer                                   → "What is the PUC?" info page
/settings                                        → Language + timezone
```

### i18n Pattern
```tsx
const { t } = useI18n()
// Usage: t.dashboard.upcomingDeadlines → "Upcoming Deadlines" or "Próximos Prazos"
```
Locale stored in localStorage, detected from browser language on first visit. `<html lang>` driven by current locale.

### Code Style
- Biome for linting/formatting (tabs, double quotes)
- Path alias: `@/*` → `./src/*`
- React Compiler enabled via Babel plugin
- TypeScript strict mode enabled

### Archive & Current Semester
- **Archive status** is computed from `endDate < today` — no schema changes, no stored flag
- `src/lib/semester-utils.ts` exports `isSemesterArchived()`, `getSemesterStatus()`, `getActiveSemester()`, `dateStr()`
- `getActiveSemester()` returns `{ semester, hasOverlap }` — picks latest `startDate` when multiple semesters overlap
- Dashboard shows overlap warning or "no current semester" empty state
- `/semesters` filters out archived; `/archive` shows only archived
- Archived semesters are read-only: edit/delete/add/confirm buttons hidden, edit/create routes redirect
- `convex/helpers.ts` has `assertNotArchived()` guard called at the start of every mutation
- Components accept `readOnly` prop for archive mode: `BriefEditor`, `ResourceList`, `ResourceItem`, `EventReviewCard`

### PUC Processing (AI Pipeline)
- **Action**: `convex/pucProcessing.ts` — `"use node"` action orchestrating the full pipeline
- **Flow**: Upload PDF → Convex storage → `pdf-parse` text extraction → GPT-4o-mini structured output → batch insert events/brief/resources
- **AI SDK v6**: Uses `generateText` + `Output.object({ schema })` (NOT deprecated `generateObject`)
- **Zod schema constraints**: OpenAI structured output requires all fields to be required — use `.nullable()` instead of `.optional()` for optional AI output fields
- **pdf-parse v1**: Must import `pdf-parse/lib/pdf-parse.js` directly (not the main entry) — `index.js` has a debug block that tries to load a test PDF at module init, which fails in Convex's bundler
- **Convex `"use node"` limitation**: Only actions can be defined in `"use node"` files — queries/mutations must live in separate files
- **Re-processing**: Subject overview has a "Re-process" button that deletes old AI-extracted data and re-runs the pipeline
- **Error handling**: On failure, PUC status is set to `"error"` with retry button in the UI
- **Locale-aware**: Brief and event titles generated in user's current locale; `sourceExcerpt` stays in original Portuguese
- **Env var**: `OPENAI_API_KEY` must be set via `npx convex env set OPENAI_API_KEY sk-...`

### Implementation Status
All MVP features are implemented (Phases 0-6 complete) + Convex backend migration + Feature A (archive) + Feature B (AI PUC processing):
- Semester CRUD, Subject management, PUC upload/extraction
- AI-powered PUC processing (PDF → events, brief, resources via GPT-4o-mini)
- Calendar events (view/edit/confirm), month calendar view
- Subject briefs (AI-generated, editable), Resources (CRUD, pin/sort)
- Dashboard with aggregated data, .ics export, Settings, full EN/PT-PT i18n
- Real-time data via Convex (queries auto-update across tabs)
- Current semester detection (date-based), archive system with read-only enforcement

### Auth (Deferred)
Auth is configured (Better Auth) but not wired into Convex. All queries use hardcoded `userId: "user-1"`. Auth integration is a follow-up task.
