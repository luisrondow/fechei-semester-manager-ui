# Fechei - Semester Manager

A bilingual (EN/PT-PT) web platform that converts uploaded PUC (Plano da Unidade Curricular) PDFs into organized semester calendars with AI-generated subject briefs. Built for Portuguese university students, particularly distance-learning programs like Universidade Aberta.

## Features

- **Semester Management** — Create, edit, and archive semesters with date-based lifecycle
- **Subject Tracking** — Organize subjects per semester with instructor and course code info
- **AI-Powered PUC Processing** — Upload a PUC PDF and get automatic extraction of:
  - Calendar events (assessments, study blocks, deadlines)
  - Subject brief (markdown summary with learning objectives, methodology, study roadmap)
  - Bibliography resources (required, complementary, other)
- **Calendar View** — Month-based calendar with color-coded event types
- **Event Review** — Confirm or edit AI-extracted dates before they're finalized
- **Resource Management** — Pin, edit, and add your own resources alongside PUC-extracted ones
- **Dashboard** — Upcoming deadlines, this week's schedule, items needing confirmation, pinned resources
- **Calendar Export** — Download .ics files (full calendar or due-dates-only) for Google Calendar, Apple Calendar, etc.
- **Bilingual** — Full EN/PT-PT support with browser-detected locale
- **Archive System** — Past semesters become read-only automatically after their end date
- **Real-time Updates** — Data syncs across tabs via Convex reactive queries

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19 + SSR) with file-based routing
- **Backend**: [Convex](https://convex.dev) (real-time database, serverless functions, file storage)
- **AI**: [Vercel AI SDK v6](https://ai-sdk.dev) + GPT-4o-mini for PUC extraction
- **PDF Parsing**: [pdf-parse](https://www.npmjs.com/package/pdf-parse) (Node.js, text-based PDFs)
- **Data Fetching**: TanStack Query + `@convex-dev/react-query`
- **Forms**: TanStack Form + Zod validation
- **Styling**: Tailwind CSS v4 + [Shadcn UI](https://ui.shadcn.com) (warm parchment/terracotta theme)
- **i18n**: Custom lightweight system (2 locales, ~300 keys, full type safety)
- **Deployment**: Cloudflare Workers via Wrangler

## Getting Started

### Prerequisites

- Node.js >= 20
- npm
- A [Convex](https://convex.dev) account (free tier available)
- An [OpenAI API key](https://platform.openai.com/api-keys) (for PUC processing)

### Installation

```bash
npm install
```

### Convex Setup

On first run, Convex will guide you through project creation:

```bash
npx convex dev
```

This starts the Convex dev server and generates types in `convex/_generated/`. Keep this running alongside the app.

Set the OpenAI API key for AI-powered PUC processing:

```bash
npx convex env set OPENAI_API_KEY sk-...
```

Optionally seed the database with demo data:

```bash
npx convex run seed:seedData
```

### Development

Run both the app dev server and Convex dev server:

```bash
# Terminal 1 — App
npm run dev

# Terminal 2 — Convex
npx convex dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Build for production |
| `npm run test` | Run tests (Vitest) |
| `npm run lint` | Lint with Biome |
| `npm run format` | Format with Biome |
| `npm run check` | Biome check (lint + format) |
| `npm run deploy` | Build and deploy to Cloudflare Workers |
| `npx convex dev` | Start Convex dev server + codegen |
| `npx convex run seed:seedData` | Seed database with demo data |

## Project Structure

```
convex/                  Convex backend (schema, queries, mutations, actions)
  schema.ts              Table definitions with indexes
  pucProcessing.ts       AI processing action ("use node")
  semesters.ts           Semester CRUD
  subjects.ts            Subject CRUD
  events.ts              Calendar event queries + internal batch mutations
  briefs.ts              Subject brief queries + internal mutations
  resources.ts           Resource queries + internal extraction mutations
  puc.ts                 PUC document management + internal helpers
  dashboard.ts           Dashboard aggregation query
  helpers.ts             Archive guards + entity resolvers
  seed.ts                Demo data seeder

src/
  routes/                File-based routing (TanStack Router)
  components/
    ui/                  Shadcn UI components
    layout/              App shell, sidebar, page header, empty state
    forms/               Form hook, field components
  hooks/queries/         TanStack Query hooks wrapping Convex
  lib/
    types.ts             Core entity types
    i18n/                Translations (en.ts, pt.ts)
    api/                 Client-side utilities (calendar export)
  integrations/          Third-party wrappers (Convex, Better Auth)

docs/
  puc-processing.md      Detailed PUC processing pipeline documentation
```

## How PUC Processing Works

1. **Upload** — User selects a PDF on the subject overview page. The file is uploaded to Convex storage.
2. **Extract** — A Node.js action downloads the PDF and extracts text with `pdf-parse`.
3. **Analyze** — The extracted text is sent to GPT-4o-mini with a structured output schema (Zod). The AI returns events, a brief, and resources in a single call.
4. **Populate** — The extracted data is inserted into the database via internal mutations. All events start as "pending" for user review.
5. **Review** — Users can confirm dates, edit events, modify the brief, and manage resources.

Re-processing is supported — clicking "Re-process PUC" re-runs the AI on the same uploaded file, replacing old AI-extracted data while preserving user-saved resources.

For the full technical breakdown, see [docs/puc-processing.md](docs/puc-processing.md).

## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting (tabs, double quotes):

```bash
npm run check          # Check for issues
npx biome check --write  # Auto-fix safe issues
```

## Adding Shadcn Components

```bash
pnpm dlx shadcn@latest add <component>
```

## Auth

Authentication is configured via [Better Auth](https://www.better-auth.com) (email/password) but not yet wired into Convex. All queries currently use a hardcoded `userId: "user-1"`. Auth integration is a follow-up task.

## License

Private project.
