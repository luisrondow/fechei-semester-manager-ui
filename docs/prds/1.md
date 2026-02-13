# Product Requirements Document - Semester Manager

## 0) One-paragraph pitch

For college students managing multiple subjects with PUC documents (Planos da Unidade Curricular), who struggle to keep track of weekly topics, assessment deadlines, and required resources across a semester, PUC Semester Manager is a bilingual (EN/PT-PT) web platform that converts uploaded PUC PDFs into an organized internal calendar, an AI-generated Subject Brief, and a personal resource library. Unlike reading PDFs or manually copying dates into Google Calendar, our product makes students feel like semester managers: they upload once, review the extracted plan, and export to their calendar—knowing every deadline and topic is tracked. We'll know it works when 70% of users who upload ≥3 PUCs confirm and export their semester calendar within one session.

---

## 1) Background & strategic fit

### Why now
- Distance-learning universities (e.g., Universidade Aberta) rely on PUC PDFs as the single source of truth for course structure, topics, assessment rules, and schedules[1].
- Students manage 4–6 subjects per semester, each with its own PUC (10–15 pages), leading to missed deadlines and disorganized study plans.
- Existing tools (Google Calendar, Notion, Trello) require manual data entry; students copy dates by hand and lose the connection to the original PUC.

### What we've learned
- PUCs follow a consistent structure: course metadata, competencies, topic roadmap, work plan/calendarization, assessment rules, and bibliography[1].
- Key pain points: extracting dates from tables, understanding assessment windows vs deadlines, and keeping track of "TBD" dates that reference external pages[1].
- Students want to feel in control ("like managing a project") rather than passively reading documents.

### Assumptions
- PUC format remains stable enough for extraction (mostly text-based PDFs, not heavily scanned/image-only).
- Students trust AI-generated summaries if they can verify against source excerpts.
- Export to external calendars (Google/Apple) via .ics is sufficient for MVP (direct API sync is later).

### Constraints
- MVP targets Portuguese universities first (UAb format), with expansion to other PUC-like syllabi later.
- No LMS integration in MVP (no automatic PUC retrieval from PlataformAbERTA/Moodle).
- Budget: small team (2 eng, 1 design), 4-month MVP timeline.

### Dependencies
- LLM API (OpenAI/Anthropic) for extraction and brief generation.
- PDF parsing library with OCR fallback.
- iCalendar library for .ics export compliant with RFC 5545[2][3].

---

## 2) Problem statement

**Problem:** Students waste hours manually extracting dates, topics, and assessment rules from 4–6 PUC PDFs each semester, leading to missed deadlines, disorganized study plans, and stress.

**Who experiences it:** College students (especially distance-learning) who receive PUC documents as the official course guide.

**Evidence:**
- PUC documents are 10–15 pages with mixed formats (tables, prose, nested sections)[1].
- Assessment calendars often use date ranges ("28 Nov – 08 Dec") and "TBD" references ("consult official pages")[1].
- Students report re-reading PUCs multiple times to extract the same information.

**Impact if unsolved:** Missed e-fólio submissions, poor time management, difficulty balancing multiple subjects, and lower academic performance.

**Non-goals (MVP):**
- Automatic grade tracking or LMS integration.
- Social features (shared calendars, study groups).
- Advanced spaced-repetition study planning or flashcard generation.

---

## 3) Users, personas, and jobs-to-be-done

| Persona | Context | Job-to-be-done | Current workaround | Biggest pain | Success looks like |
|---------|---------|----------------|---------------------|--------------|-------------------|
| Distance-learning student (primary) | Managing 4–6 UCs/semester, working part-time, limited study time | Get a clear, trustworthy semester plan from PUCs without manual copying | Manually read PUCs, copy dates to Google Calendar or notebooks | Date extraction is error-prone; "TBD" dates are forgotten; no connection between calendar and PUC source | Upload PUCs → see calendar + brief → export to Google Calendar; feel in control |
| Traditional full-time student (secondary) | Campus-based but receives PUCs online, juggles lab work and lectures | Quickly understand assessment schedule and required books for each subject | Skim PUCs, screenshot important tables, ask classmates for clarifications | Loses track of which books to buy; assessment rules are buried in prose | See all required resources in one place; export deadlines to iPhone calendar |

---

## 4) Scope (MVP vs later)

### MVP outcomes
- Students upload PUCs and get a verified semester calendar in <5 minutes.
- Students export to Google/Apple Calendar via .ics (full calendar or due-dates-only).
- Students see AI-generated Subject Briefs and official + personal resource lists.

### MVP in-scope
- **PUC ingestion:** Upload PDF, extract text (OCR fallback), detect language (PT/EN).
- **Structured extraction:** Course metadata, topics/themes, study blocks (date ranges), assessments (windows/due dates), grading rules, bibliography[1].
- **AI Subject Brief:** Pure text combining Unit overview, Competencies, Roadmap (first 3 PUC sections)[1].
- **"What is the PUC?" explainer:** Show purpose as a learning guide.
- **Internal calendar:** Create events (study blocks, assessments, TBD placeholders), allow edit/confirm.
- **Resources:** Show PUC-extracted bibliography (required/complementary/other)[1] + user-saved links.
- **User-saved resources:** Add/edit/pin links (books, videos, notes) tied to subjects.
- **Export:** Generate .ics (full or due-dates-only) compliant with RFC 5545[2][3].
- **Localization:** Full UI in English and European Portuguese.
- **Dashboard:** Semester status, next due dates, this week's topics, needs-confirmation items.

### MVP out-of-scope
- Direct calendar sync (Google Calendar API, CalDAV); MVP is download .ics + import.
- Notifications/reminders (email/push).
- LMS integration (auto-fetch PUCs from PlataformAbERTA).
- Multi-user/shared calendars.
- Mobile apps (MVP is responsive web only).
- Grade tracking or submission workflows.

### "Later" ideas (not committed)
- Spaced-repetition study planner.
- Automatic PUC diff when a professor updates the document mid-semester.
- Integration with university bookstores to link ISBNs.
- Social features (study groups, shared notes).

---

## 5) Proposed solution (high level)

### Workflow summary (happy path)
1. **Create semester:** User sets semester name, start/end dates, timezone (WET default).
2. **Add subject:** User uploads PUC PDF for "Álgebra Linear I"[1].
3. **System extraction:** Parses PDF → extracts metadata, topics (Temas 1–5), study blocks (Capítulos 1&2: 06–26 Oct), assessments (E-fólio A: 28 Nov–08 Dec), resources (required books)[1].
4. **Review & confirm:** User sees preview with source excerpts; edits dates/titles; confirms.
5. **Subject Brief generated:** AI combines Unit overview + Competencies + Roadmap into student-friendly text[1].
6. **Dashboard ready:** Shows "This week: Matrizes e Sistemas", "Next deadline: E-fólio A (28 Nov)", resources list[1].
7. **Export calendar:** User downloads .ics (full or due-dates-only) and imports to Google/Apple Calendar[2][3].

### Key screens / objects
- **Semester** (name, start/end, timezone, subjects[])
- **Subject** (name, code, instructor, PUC file, extracted data, Subject Brief, events[], resources[])
- **Event** (type: study_block | assessment | TBD, start_date, end_date, title, description, status: pending | confirmed, source_excerpt)
- **Resource** (type: puc_extracted | user_saved, title, authors, url, notes, pinned, subject_id)
- **Dashboard** (upcoming deadlines, this week topics, needs confirmation)

### Permissions model
- Single-user (MVP); each user owns their semesters/subjects/events/resources.
- No sharing or multi-user features in MVP.

### Notifications
- None in MVP (calendar UI + export only).

---

## 6) Functional requirements

### FR-1: PUC ingestion & parsing
**Priority:** Must have
**Requirement:** The system must accept PDF upload per subject, extract text (with OCR fallback for scanned PDFs), and store original file + extracted text for traceability.
**Rationale:** PUCs are the official source; students need to verify extracted data against the original.
**Edge cases:** Non-text PDFs trigger OCR; very large files (>10MB) are queued for async processing.

### FR-2: Structured extraction
**Priority:** Must have
**Requirement:** The system must extract and structure: (a) course metadata (code, name, year, instructor), (b) topics/themes (e.g., "Tema 1: Matrizes e Sistemas")[1], (c) study blocks with date ranges (e.g., "Capítulos 1&2: 06–26 Oct")[1], (d) assessments (e-fólios, exam, windows/due dates)[1], (e) grading rules (thresholds, weights)[1], (f) bibliography (required/complementary/other)[1].
**Rationale:** These are the core PUC components students need to plan their semester[1].
**Edge cases:** "Date TBD" items (e.g., "consult official pages for exam date") are flagged as needs-confirmation[1].

### FR-3: AI Subject Brief
**Priority:** Must have
**Requirement:** The system must generate a pure-text Subject Brief combining: (1) what you will study (Unit presentation), (2) what you should be able to do (Competencies), (3) how content is organized (Roadmap/Temas)[1]. The brief must be editable by the user.
**Rationale:** Students want a quick, clear summary without re-reading 10–15 pages[1].
**Edge cases:** If extraction confidence is low, show a warning and allow manual editing.

### FR-4: "What is the PUC?" explainer
**Priority:** Should have
**Requirement:** The system must display a short explainer communicating the PUC's purpose: "The PUC is a document that guides your learning throughout the course, containing topics to study, competencies to develop, how learning is organized, how to use the virtual space, expectations, and evaluation details."[1]
**Rationale:** Not all students (especially first-year) understand what a PUC is; this builds trust in the extraction.

### FR-5: Internal calendar (source of truth)
**Priority:** Must have
**Requirement:** The system must create internal events for: (a) study blocks (date ranges), (b) assessment windows/due dates, (c) TBD placeholders[1]. Users must be able to edit titles/dates, add notes, and mark events as confirmed.
**Rationale:** The internal calendar is the single source of truth before exporting to external calendars.
**Edge cases:** Date range overlaps (e.g., study block overlaps assessment window) are allowed and shown in the UI.

### FR-6: PUC-extracted resources
**Priority:** Must have
**Requirement:** The system must identify and display "Bibliografia Obrigatória", "Bibliografia Complementar", and "Outros Recursos" from the PUC[1]. Resources should be normalized into: title, authors, edition, publisher, year, and type (required | complementary | other).
**Rationale:** Students need to know which books to buy/borrow before the semester starts[1].
**Edge cases:** If parsing fails, show raw text with a "verify manually" flag.

### FR-7: User-saved key resources
**Priority:** Must have
**Requirement:** The system must allow users to save custom resources (links) with: title, URL, subject (required), notes, and tags (e.g., "Cap. 4", "Exame"). Users must be able to pin (star) and sort (pinned first, then recently added). Saved resources must appear on the Subject page and Dashboard.
**Rationale:** Students discover helpful materials (YouTube videos, book purchase links, PDFs, problem sets) during the semester and need a central place to organize them.
**Edge cases:** No automatic content downloading or copyright hosting; store metadata + user notes only.

### FR-8: External calendar export (.ics)
**Priority:** Must have
**Requirement:** The system must export calendars as iCalendar (.ics) files with VEVENT entries using DTSTART/DTEND for date ranges, compliant with RFC 5545[2][3]. The system must support two export modes: (1) full calendar (study blocks + assessments), (2) due-dates-only (assessments and deadlines only). The system must generate stable UIDs per event to prevent duplication on re-export.
**Rationale:** Students use Google/Apple Calendar as their daily tools; .ics import is universally supported[2][3].
**Edge cases:** TBD events are exported as all-day placeholders with a note "Date not confirmed; check official pages."

### FR-9: Localization (EN + PT-PT)
**Priority:** Must have
**Requirement:** The UI must support English and European Portuguese (PT-PT) end-to-end (navigation, event labels, system messages). The extraction pipeline must detect document language and generate the Subject Brief in the user-selected UI language, while preserving original-source excerpts for verification.
**Rationale:** Target users are primarily Portuguese students, but international students and English-medium programs also use PUC-like syllabi.
**Edge cases:** Mixed-language PUCs default to document language for extraction, user language for UI strings.

### FR-10: Dashboard
**Priority:** Must have
**Requirement:** The dashboard must display: (1) upcoming due dates (next 7 days), (2) this week's topics per subject, (3) needs-confirmation items (TBD dates)[1], (4) pinned/recent saved resources. The dashboard should emphasize control and clarity with status chips (e.g., "On track", "Overdue") and a clean weekly focus view.
**Rationale:** Students need a "semester operations center" to see next actions at a glance.
**Edge cases:** Empty state shows onboarding prompts ("Upload your first PUC").

---

## 7) Non-functional requirements

### Performance
- **Target:** Upload → preview in <30 seconds for typical text-based PUC PDFs (10–15 pages)[1].
- **Constraint:** OCR or very large files (>10MB) may take 60–90 seconds; show progress indicator.

### Availability
- **SLO:** 99% uptime during semester peak periods (weeks 1–3, assessment windows).
- **Maintenance:** Scheduled during low-usage periods (weekends, holidays).

### Scalability
- **Initial:** 500 active users/semester (pilot with one university cohort).
- **Growth:** Scale to 5,000 users within 12 months.

### Security
- **Auth:** Email/password + OAuth (Google Sign-In).
- **Data:** Encryption in transit (TLS) and at rest (AES-256).
- **Access:** Users see only their own semesters/subjects/events/resources.

### Privacy & compliance
- **GDPR:** Users can export all data (PUCs, events, resources) and delete accounts with full data removal.
- **Retention:** PUC files and extracted data retained until user deletes or account is closed.

### Auditability
- **Traceability:** Every extracted event/resource must link to source excerpt from the PUC for user verification[1].
- **Logging:** Track uploads, extractions, exports for support and debugging.

### Accessibility
- **WCAG 2.1 AA:** Keyboard navigation, sufficient contrast, screen reader support for dashboard and calendar views.

### Localization
- **Languages:** English, European Portuguese (PT-PT) in MVP.
- **Timezones:** Support WET/WEST, UTC, and user-configurable timezone.

---

## 8) Data model & events

### Core entities
- **User** (id, email, name, preferred_language, timezone, created_at)
- **Semester** (id, user_id, name, start_date, end_date, timezone)
- **Subject** (id, semester_id, name, code, instructor, created_at)
- **PUCDocument** (id, subject_id, file_path, extracted_text, language, version, uploaded_at)
- **SubjectBrief** (id, subject_id, generated_text, user_edited_text, confidence_score)
- **Event** (id, subject_id, type [study_block | assessment | TBD], start_date, end_date, title, description, status [pending | confirmed], source_excerpt, created_at, updated_at)
- **Resource** (id, subject_id, source_type [puc_extracted | user_saved], title, authors, url, notes, tags[], pinned, created_at, updated_at)

### Relationships
- User 1:N Semester
- Semester 1:N Subject
- Subject 1:1 PUCDocument
- Subject 1:1 SubjectBrief
- Subject 1:N Event
- Subject 1:N Resource

### Event tracking plan (analytics)
- **puc_uploaded** (properties: subject_id, file_size, language, timestamp)
- **extraction_completed** (properties: subject_id, events_created, resources_found, duration_ms)
- **event_confirmed** (properties: event_id, type, edited [true/false])
- **calendar_exported** (properties: semester_id, export_mode [full | due_dates_only], format [.ics])
- **resource_saved** (properties: resource_id, source_type, subject_id)

---

## 9) Integrations & APIs

### External integrations (v1)
- **LLM API** (OpenAI GPT-4 or Anthropic Claude): extraction + Subject Brief generation.
- **PDF parsing** (PyPDF2 / pdfplumber + Tesseract OCR fallback).
- **iCalendar library** (icalendar for Python or similar) for RFC 5545-compliant .ics generation[2][3].

### Webhooks
- None in MVP.

### Public API
- None in MVP; consider later for integrations (e.g., university LMS plugins).

### Import/export
- **Import:** PUC PDF upload only in MVP.
- **Export:** .ics calendar files (full or due-dates-only)[2][3]; user data export (JSON) for GDPR compliance.

---

## 10) Pricing, packaging, and billing

### Pricing model (post-MVP)
- **Free tier:** 1 semester, up to 3 subjects, basic extraction, .ics export.
- **Pro tier** (€4.99/semester or €14.99/year): unlimited subjects, priority extraction, saved resources (unlimited), advanced filters.

### Packaging (MVP)
- MVP is free for pilot users (target: 100–500 students from one university cohort).

### Billing flows
- Deferred until post-MVP; focus on product-market fit first.

---

## 11) Success metrics & release criteria

### North Star Metric
**Semester Plans Created:** Number of users who upload ≥3 PUCs and confirm ≥80% of extracted events within one session.

### Input metrics
- **Activation rate:** % of registered users who upload ≥1 PUC within 7 days.
- **Extraction quality:** % of events confirmed without edits (target: ≥70%).
- **Export rate:** % of users who export .ics within 14 days of creating a semester.
- **Retention:** Weekly active users who check dashboard or calendar.

### Targets
- **Activation:** 60% within 7 days (pilot cohort).
- **Extraction quality:** 70% of events confirmed without edits.
- **Export:** 50% of users export .ics within 14 days.
- **NPS:** ≥40 after 1 month of use.

### Release criteria (must be true to ship MVP)
- [ ] Core extraction works for UAb PUC format (tested on 10+ real PUCs)[1].
- [ ] Subject Brief generates readable, accurate text for 90% of test cases.
- [ ] .ics export imports cleanly into Google Calendar and Apple Calendar without errors[2][3].
- [ ] UI is fully localized (EN + PT-PT).
- [ ] Security review passed (auth, data encryption, GDPR compliance).
- [ ] Performance: 95% of uploads complete preview in <30 seconds.

---

## 12) Rollout & go-to-market

### Rollout plan
1. **Alpha (weeks 1–4):** Internal testing + 10 students; validate extraction + export.
2. **Beta (weeks 5–10):** 100 students from UAb pilot cohort; collect feedback on extraction quality and Subject Brief usefulness.
3. **GA (week 11+):** Open to all UAb students; expand to other Portuguese universities.

### Target customers for beta
- Distance-learning students at Universidade Aberta (UAb) enrolled in STEM or humanities programs with structured PUCs[1].

### Migration plan
- N/A (new product, no legacy data).

### Messaging & positioning
**One-liner:** "Turn your PUC into a semester plan in 5 minutes—upload, review, export."
**3 bullets:**
- No more manual copying: AI extracts topics, deadlines, and resources from your PUC.
- Stay in control: See your semester like a project, not a pile of PDFs.
- Export to your calendar: Google, Apple, or any .ics-compatible app[2][3].

### Sales/support enablement
- **FAQ:** "What is a PUC?", "How accurate is the extraction?", "Can I edit events?", "How do I import .ics to Google Calendar?"[2][3].
- **Support macros:** Common extraction issues (scanned PDFs, date ambiguity), calendar import troubleshooting.

---

## 13) Risks, open questions, and decisions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| PUC format variability breaks extraction | Medium | High | Build extraction pipeline with confidence scoring; flag low-confidence items for manual review; test on 20+ real PUCs before beta[1]. |
| Students don't trust AI-generated summaries | Medium | Medium | Always show source excerpts; allow inline editing of Subject Brief; emphasize "verify before exporting." |
| .ics import issues in Google/Apple Calendar | Low | High | Test .ics export against RFC 5545 compliance[2][3]; validate in multiple calendar clients before beta. |
| Low adoption (students stick to manual copying) | Medium | High | Emphasize time savings in onboarding; show "5 minutes vs 2 hours" comparison; provide demo video. |
| GDPR compliance complexity | Low | High | Consult legal early; implement data export/delete from day 1; document retention policies. |

### Open questions
- **Q1:** Should we support multiple semesters per user in MVP, or limit to 1 semester?
**Decision:** Support multiple semesters (small dev cost, big UX win).
- **Q2:** Should TBD events be exported to .ics, or kept internal-only?
**Decision:** Export as all-day placeholders with note "Date TBC" so students don't forget them.
- **Q3:** Should we auto-detect PUC updates (professor posts revised version)?
**Decision:** Out of scope for MVP; add "Re-upload PUC" button for manual refresh.

### Decisions needed (by whom, by when)
- **LLM provider selection** (OpenAI vs Anthropic): Tech lead, by week 2.
- **Pilot university partnership** (UAb official endorsement?): Product owner, by week 4.
- **Pricing model post-MVP** (freemium vs paid-only): Product + Finance, by week 10.

---

## References

[1] Plano da Unidade Curricular: Álgebra Linear I (UAb, 2025/2026). Retrieved from PlataformAbERTA, October 6, 2025.

[2] RFC 5545: Internet Calendaring and Scheduling Core Object Specification (iCalendar). (2009). https://datatracker.ietf.org/doc/html/rfc5545

[3] iCalendar.org. (2007). 3.6.1. Event Component. https://icalendar.org/iCalendar-RFC-5545/3-6-1-event-component.html