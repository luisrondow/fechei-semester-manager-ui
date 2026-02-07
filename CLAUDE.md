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
- **i18n**: Custom lightweight system (2 locales: EN/PT-PT, ~200 keys, full type safety)
- **Deployment**: Cloudflare Workers via Wrangler

### Key Directories
- `src/routes/` - File-based routing (TanStack Router auto-generates `routeTree.gen.ts`)
- `src/routes/api/` - API routes (e.g., `auth/$.ts` for Better Auth catch-all)
- `src/components/ui/` - Shadcn UI components
- `src/components/layout/` - App shell, sidebar, page header, empty state
- `src/components/forms/` - App form hook, context, field components (TextField, TextArea, Select, DateField)
- `src/integrations/` - Third-party integration wrappers (tanstack-query, better-auth)
- `src/lib/` - Utilities, auth, types, i18n, API functions
- `src/lib/i18n/` - i18n provider, translations (en.ts, pt.ts)
- `src/lib/api/` - Async API functions (mock now, HTTP later) — **only layer that changes when swapping backend**
- `src/hooks/queries/` - TanStack Query hooks (useQuery/useMutation wrappers)
- `src/data/mock/` - In-memory CRUD store with realistic seed data

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
- `index.tsx` redirects to `/semesters`
- Semester detail uses layout route: `semester.$semesterId.tsx` → `semester.$semesterId.index.tsx`
- Subject detail uses nested layout: `semester.$semesterId.subject.$subjectId.tsx`
- API routes use `.ts` extension with handler exports
- Route context includes `queryClient` from TanStack Query

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
