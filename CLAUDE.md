# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Semester Manager UI - A bilingual (EN/PT-PT) web platform that converts uploaded PUC (Plano da Unidade Curricular) PDFs into organized semester calendars with AI-generated subject briefs. Targets Portuguese university students, particularly distance-learning programs like Universidade Aberta.

## Commands

```bash
npm run dev        # Start dev server on port 3000
npm run build      # Build for production
npm run test       # Run tests (Vitest)
npm run lint       # Lint with Biome
npm run format     # Format with Biome
npm run check      # Biome check (lint + format)
npm run deploy     # Build and deploy to Cloudflare Workers
```

### Adding Shadcn components
```bash
pnpm dlx shadcn@latest add <component>
```

## Architecture

### Stack
- **Framework**: TanStack Start (React 19 + SSR) with TanStack Router (file-based routing)
- **Data Fetching**: TanStack Query with SSR integration
- **Forms**: TanStack Form with Zod validation (app form hook at `src/components/forms/`)
- **Auth**: Better Auth (email/password, configured for TanStack Start cookies)
- **Styling**: Tailwind CSS v4 + Shadcn UI (new-york style) with warm parchment/terracotta theme
- **Fonts**: DM Serif Text (headings) + DM Sans (body)
- **i18n**: Custom lightweight system (2 locales: EN/PT-PT, ~300 keys, full type safety)
- **Deployment**: Cloudflare Workers via Wrangler
- **Calendar Export**: Client-side RFC 5545 .ics generation (full or due-dates-only)

### Key Directories
- `src/routes/` - File-based routing (TanStack Router auto-generates `routeTree.gen.ts`)
- `src/routes/api/` - API routes (e.g., `auth/$.ts` for Better Auth catch-all)
- `src/components/ui/` - Shadcn UI components
- `src/components/layout/` - App shell, sidebar, page header, empty state
- `src/components/forms/` - App form hook, context, field components (TextField, TextArea, Select, DateField)
- `src/components/` - Feature components (semester-card, subject-card, event-card, resource-item, brief-editor, puc-upload, locale-switcher, etc.)
- `src/integrations/` - Third-party integration wrappers (tanstack-query, better-auth)
- `src/lib/` - Utilities, auth, types, i18n, API functions
- `src/lib/i18n/` - i18n provider, translations (en.ts, pt.ts)
- `src/lib/api/` - Async API functions (mock now, HTTP later) — **only layer that changes when swapping backend**
- `src/hooks/queries/` - TanStack Query hooks (useQuery/useMutation wrappers)
- `src/data/mock/` - In-memory CRUD store with realistic seed data (2 subjects, ~10 events each, resources, briefs)

### Data Architecture (Three-layer pattern)
```
src/data/mock/          → Static seed data + in-memory CRUD store
src/lib/api/            → Async functions (call mock now, HTTP later) ← ONLY layer that changes
src/hooks/queries/      → TanStack Query hooks (useQuery/useMutation wrappers)
```

### Type Definitions
All core entities in `src/lib/types.ts`: Semester, Subject, PUCDocument, SubjectBrief, CalendarEvent, Resource, plus input types for CRUD operations.

### Routing Patterns
- Routes in `src/routes/` map to URLs (e.g., `index.tsx` → `/`, `semesters.tsx` → `/semesters`)
- Root layout at `src/routes/__root.tsx` wraps all pages with I18nProvider and AppShell
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
/semesters                                       → Semester list
/semesters/new                                   → Create semester form
/semester/:id                                    → Semester detail (subjects grid, stats)
/semester/:id/edit                               → Edit semester form
/semester/:id/calendar                           → Month calendar view
/semester/:id/export                             → .ics export (full / due-dates-only)
/semester/:id/subjects/new                       → Add subject + PUC upload
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

### API Layer (`src/lib/api/`)
| File | Purpose |
|------|---------|
| `semesters.ts` | Semester CRUD |
| `subjects.ts` | Subject CRUD by semester |
| `puc.ts` | PUC upload + extraction status polling |
| `events.ts` | Calendar events CRUD + confirm |
| `briefs.ts` | Subject brief fetch + update |
| `resources.ts` | Resource CRUD + pin toggle |
| `calendar-export.ts` | Client-side .ics generation + download |

### Code Style
- Biome for linting/formatting (tabs, double quotes)
- Path alias: `@/*` → `./src/*`
- React Compiler enabled via Babel plugin
- TypeScript strict mode enabled

### Implementation Status
All MVP features are implemented (Phases 0-6 complete):
- Semester CRUD, Subject management, PUC upload/extraction
- Calendar events (view/edit/confirm), month calendar view
- Subject briefs (AI-generated, editable), Resources (CRUD, pin/sort)
- Dashboard with aggregated data, .ics export, Settings, full EN/PT-PT i18n
- Demo files cleaned up
