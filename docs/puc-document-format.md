# PUC Document Format Reference

> **Purpose**: This document describes the structure and content of a PUC (Plano da Unidade Curricular) — the PDF document type currently supported by the extraction pipeline. It serves as the specification baseline for migrating the system to support any PDF with a similar academic calendar structure.

## What Is a PUC?

**PUC** stands for **Plano da Unidade Curricular** (Course Unit Plan). It is the official academic document issued by Portuguese universities for each subject (unidade curricular) in a given semester. It acts as the single source of truth for how a course is structured, assessed, and studied.

The primary target is the **Universidade Aberta (UAb)** PUC format — a distance-learning university where PUCs carry particular weight since they are the main student-facing document for the entire semester. However, most Portuguese higher education institutions produce PUCs with a very similar structure mandated by national accreditation standards (A3ES).

### Key Characteristics

| Property | Value |
|----------|-------|
| Language | Portuguese (PT-PT) |
| Format | Text-based PDF (not scanned images) |
| Typical length | 5-20 pages |
| Frequency | One per subject per semester |
| Issuer | University / Department |
| Audience | Students enrolled in the subject |

---

## PUC Document Structure

A PUC is composed of **7 standard sections**. While naming and ordering may vary between institutions, the content categories are consistent.

```
+================================================================+
|                  PLANO DA UNIDADE CURRICULAR                   |
|                     (Course Unit Plan)                         |
+================================================================+
|                                                                |
|  1. IDENTIFICACAO DA UC  (Course Identification)               |
|  +---------------------------------------------------------+  |
|  | Subject name, code, ECTS, year, semester, department,    |  |
|  | instructor(s), academic year                             |  |
|  +---------------------------------------------------------+  |
|                                                                |
|  2. APRESENTACAO  (Overview / Presentation)                    |
|  +---------------------------------------------------------+  |
|  | Prose description of the subject's purpose, scope,       |  |
|  | and relevance within the degree program                  |  |
|  +---------------------------------------------------------+  |
|                                                                |
|  3. OBJETIVOS / COMPETENCIAS  (Objectives / Competencies)      |
|  +---------------------------------------------------------+  |
|  | - Learning objectives (what students will learn)         |  |
|  | - Competencies to develop (skills students will gain)    |  |
|  | - May be split into two subsections or combined          |  |
|  +---------------------------------------------------------+  |
|                                                                |
|  4. CONTEUDOS / ROTEIRO  (Content / Roadmap)                   |
|  +---------------------------------------------------------+  |
|  | Numbered themes/topics:                                  |  |
|  |   Tema 1: Matrizes e Sistemas                           |  |
|  |   Tema 2: Determinantes                                 |  |
|  |   Tema 3: Espacos Vetoriais                             |  |
|  |   ...                                                   |  |
|  +---------------------------------------------------------+  |
|                                                                |
|  5. METODOLOGIA  (Methodology)                                 |
|  +---------------------------------------------------------+  |
|  | Teaching approach, e-learning platform details,          |  |
|  | virtual classroom sessions, study expectations           |  |
|  +---------------------------------------------------------+  |
|                                                                |
|  6. PLANO DE TRABALHO / CALENDARIZACAO  (Work Plan / Calendar) |
|  +---------------------------------------------------------+  |
|  | Date-mapped activities:                                  |  |
|  |   Caps 1-2: 06 a 26 de outubro (3 semanas)              |  |
|  |   E-folio A: 28 nov a 08 dez (submissao)                |  |
|  |   Exame: consultar calendario oficial                    |  |
|  +---------------------------------------------------------+  |
|                                                                |
|  7. AVALIACAO  (Assessment)                                    |
|  +---------------------------------------------------------+  |
|  | Grading rules, weights per component, minimum grades,    |  |
|  | assessment modalities (continuous / exam / mixed)        |  |
|  +---------------------------------------------------------+  |
|                                                                |
|  8. BIBLIOGRAFIA  (Bibliography)                               |
|  +---------------------------------------------------------+  |
|  | - Bibliografia Obrigatoria  (Required)                   |  |
|  | - Bibliografia Complementar (Complementary)              |  |
|  | - Outros Recursos           (Other)                      |  |
|  +---------------------------------------------------------+  |
|                                                                |
+================================================================+
```

---

## Section-by-Section Breakdown

### 1. Identificacao da UC (Course Identification)

Metadata about the subject. Usually a header or table at the top of the document.

```
+-----------------------------+-------------------------------+
| Field                       | Example                       |
+-----------------------------+-------------------------------+
| Unidade Curricular (Name)   | Algebra Linear I              |
| Codigo (Code)               | 21092                         |
| ECTS                        | 6                             |
| Ano / Semestre              | 1.o Ano / 1.o Semestre        |
| Departamento                | Ciencias e Tecnologia         |
| Docente                     | Prof. Maria Santos            |
| Ano Letivo                  | 2024/25                       |
+-----------------------------+-------------------------------+
```

**Extraction mapping**: Not extracted by AI — entered manually by the user when creating a subject (`name`, `code`, `instructor`). Passed as context to the AI prompt for reference.

### 2. Apresentacao (Overview)

A prose paragraph (1-3 paragraphs) describing what the subject covers, its place in the curriculum, and why it matters. Distance-learning PUCs often mention the e-learning platform and expected study hours here.

**Extraction mapping**: Feeds the `## Overview` section of the generated brief.

### 3. Objetivos / Competencias (Objectives / Competencies)

Two related but distinct lists:

- **Objetivos de Aprendizagem** (Learning Objectives) — goal-oriented statements about what students will learn.
- **Competencias** (Competencies) — skill-oriented statements about what students will be able to do.

Some PUCs merge these into a single section. Example competencies:

```
- Resolver sistemas de equacoes lineares usando diferentes metodos
- Trabalhar com matrizes e determinantes
- Compreender espacos vetoriais e subespacos
- Aplicar transformacoes lineares
```

**Extraction mapping**: Feeds the `## Learning Objectives` and `## Competencies` sections of the generated brief.

### 4. Conteudos / Roteiro (Content / Roadmap)

A numbered list of topics/themes that define the course structure. This is the backbone of the curriculum.

```
Tema 1: Matrizes e Sistemas de Equacoes Lineares
Tema 2: Determinantes
Tema 3: Espacos Vetoriais
Tema 4: Transformacoes Lineares
Tema 5: Valores e Vetores Proprios
```

**Extraction mapping**: Feeds the `## Study Roadmap` section of the generated brief. Cross-referenced with calendar dates from Section 6.

### 5. Metodologia (Methodology)

Describes the teaching approach — particularly important for distance-learning institutions where there are no physical lectures. Includes:

- E-learning platform instructions (Moodle, virtual classroom)
- Expected student workload and study rhythm
- Communication channels (forums, email, virtual sessions)
- Study group expectations

**Extraction mapping**: Feeds the `## Methodology` section of the generated brief.

### 6. Plano de Trabalho / Calendarizacao (Work Plan / Calendar)

**This is the most critical section for the extraction pipeline.** It maps the semester timeline to specific activities, study blocks, and assessments.

#### Structure Patterns

The calendar section typically appears as a table or structured list with date ranges tied to activities:

```
+------------------------------------------------------------------+
| CALENDARIZACAO                                                    |
+------------------------------------------------------------------+
|                                                                   |
| Capitulos 1 e 2 — 06 a 26 de outubro (3 semanas)                 |
|   [study_block]                                                   |
|   Dates: Oct 6 -> Oct 26                                         |
|                                                                   |
| Capitulo 3 — 27 de outubro a 16 de novembro                      |
|   [study_block]                                                   |
|   Dates: Oct 27 -> Nov 16                                        |
|                                                                   |
| E-folio A: 28 de novembro a 08 de dezembro (periodo de submissao)|
|   [assessment]                                                    |
|   Dates: Nov 28 -> Dec 8                                         |
|                                                                   |
| Capitulos 4 e 5 — 17 de novembro a 14 de dezembro                |
|   [study_block]                                                   |
|   Dates: Nov 17 -> Dec 14                                        |
|                                                                   |
| E-folio B: 09 a 19 de janeiro                                    |
|   [assessment]                                                    |
|   Dates: Jan 9 -> Jan 19                                         |
|                                                                   |
| Exame presencial: consultar calendario oficial da UAb             |
|   [tbd]                                                           |
|   Dates: TBD (referenced external calendar)                      |
|                                                                   |
+------------------------------------------------------------------+
```

#### Event Type Classification

| Type | Portuguese Term | Description | Date Pattern |
|------|----------------|-------------|--------------|
| `study_block` | Periodo de estudo, Atividade, Capitulo(s), Tema(s) | Study periods or activity windows tied to specific topics | Date range (start -> end) |
| `assessment` | E-folio, P-folio, Exame, Teste, Trabalho, Entrega | Exams, quizzes, assignments with submission deadlines | Date range (submission window) or single date |
| `tbd` | "consultar calendario", "a definir", "data a anunciar" | Mentioned but date is unclear or references external source | Approximate or placeholder dates |

#### UAb-Specific Assessment Types

Universidade Aberta uses a distinctive assessment model:

```
+---------------------------+-------------------------------------------+
| Assessment Type           | Description                               |
+---------------------------+-------------------------------------------+
| E-folio A / E-folio B     | Online continuous assessment. Multi-day    |
|                           | submission window. Typically 2 per subject.|
+---------------------------+-------------------------------------------+
| P-folio                   | Portfolio assessment. Compiled throughout  |
|                           | the semester, submitted near the end.      |
+---------------------------+-------------------------------------------+
| Exame presencial          | In-person exam. Date often references      |
|                           | the official UAb calendar (extracted as    |
|                           | "tbd" type).                               |
+---------------------------+-------------------------------------------+
```

**Extraction mapping**: Each entry becomes a `CalendarEvent` record with `type`, `startDate`, `endDate`, `title`, `description`, and the original Portuguese text as `sourceExcerpt`. All AI-created events start with `status: "pending"` for user review.

### 7. Avaliacao (Assessment Rules)

Describes how the final grade is calculated. Includes:

- Weight of each assessment component (e.g., E-folio A: 20%, E-folio B: 20%, Exam: 60%)
- Minimum grade thresholds to pass
- Assessment modalities (continuous assessment vs. exam-only vs. mixed)
- Rules for grade improvement or retakes

**Extraction mapping**: Feeds the `## Assessment Structure` section of the generated brief.

### 8. Bibliografia (Bibliography)

Bibliography is divided into standardized categories:

```
+---------------------------------------------------------------+
| BIBLIOGRAFIA                                                   |
+---------------------------------------------------------------+
|                                                                |
| Bibliografia Obrigatoria (Required):                           |
|   - "Algebra Linear e Geometria Analitica"                     |
|     Ana Paula Santana, Joao Filipe Queiro                      |
|     Manual adotado pela UC                                     |
|                                                                |
| Bibliografia Complementar (Complementary):                     |
|   - "Elementary Linear Algebra"                                |
|     Howard Anton                                               |
|     11th Edition                                               |
|                                                                |
| Outros Recursos (Other):                                       |
|   - Khan Academy - Linear Algebra                              |
|     https://www.khanacademy.org/math/linear-algebra             |
|                                                                |
+---------------------------------------------------------------+
```

Each entry typically contains: **title**, **author(s)**, **edition/year**, **publisher**, and occasionally **ISBN** or **URL**.

**Extraction mapping**: Each entry becomes a `Resource` record with `sourceType: "puc_extracted"`, `resourceType` (`required` / `complementary` / `other`), `title`, `authors`, `url`, `notes`, and `tags`.

---

## Data Flow: PUC Sections to Extracted Entities

```
+========================+     +=====================+     +===================+
|     PUC DOCUMENT       |     |    AI EXTRACTION    |     |  DATABASE RECORDS |
+========================+     +=====================+     +===================+
|                        |     |                     |     |                   |
| Identificacao ---------|---->| (context only,      |     |                   |
|                        |     |  not extracted)      |     |                   |
|                        |     |                     |     |                   |
| Apresentacao ----------|--+  |                     |     |                   |
| Objetivos -------------|--+  |                     |     |                   |
| Competencias ----------|--+  |                     |     |                   |
| Conteudos / Roteiro ---|--+->| brief.generatedText |---->| SubjectBrief      |
| Metodologia -----------|--+  |  (markdown, 6       |     |  .generatedText   |
| Avaliacao -------------|--+  |   sections)         |     |  .confidenceScore |
|                        |     | brief.confidence    |     |                   |
|                        |     |  Score              |     |                   |
|                        |     |                     |     |                   |
| Calendarizacao --------|---->| events[]            |---->| CalendarEvent[]   |
|  (dates, activities,   |     |  .type              |     |  .type            |
|   assessments)         |     |  .startDate         |     |  .startDate       |
|                        |     |  .endDate           |     |  .endDate         |
|                        |     |  .title             |     |  .title           |
|                        |     |  .description       |     |  .description     |
|                        |     |  .sourceExcerpt     |     |  .sourceExcerpt   |
|                        |     |                     |     |  .status="pending"|
|                        |     |                     |     |                   |
| Bibliografia ----------|---->| resources[]         |---->| Resource[]        |
|  (required,            |     |  .resourceType      |     |  .sourceType=     |
|   complementary,       |     |  .title             |     |    "puc_extracted" |
|   other)               |     |  .authors           |     |  .resourceType    |
|                        |     |  .url               |     |  .title           |
|                        |     |  .notes             |     |  .authors         |
|                        |     |  .tags              |     |  .url, .notes     |
|                        |     |                     |     |  .tags            |
|                        |     |                     |     |  .pinned=false    |
+========================+     +=====================+     +===================+
```

---

## Migration Guide: Supporting Other PDF Formats

To adapt the pipeline for a non-PUC academic PDF, the following components need to change:

### 1. Identify Section Mapping

Map the new document's sections to the PUC equivalents:

```
+-------------------------------+-------------------------------+
| PUC Section                   | Your Document's Equivalent    |
+-------------------------------+-------------------------------+
| Identificacao da UC           | ? (course metadata)           |
| Apresentacao                  | ? (course overview)           |
| Objetivos / Competencias      | ? (learning outcomes)         |
| Conteudos / Roteiro           | ? (syllabus / topics)         |
| Metodologia                   | ? (teaching approach)         |
| Calendarizacao                | ? (schedule / timeline)       |
| Avaliacao                     | ? (grading / assessment)      |
| Bibliografia                  | ? (references / reading list) |
+-------------------------------+-------------------------------+
```

**Minimum required sections** for the pipeline to produce useful output:
- Calendar/schedule section (dates) — without this, no events are generated
- Bibliography section — without this, no resources are generated
- Any descriptive section — without this, the brief will be low quality

### 2. Update the AI Prompt

The prompt in `convex/pucProcessing.ts` (`buildPrompt()`) references PUC-specific terminology:

```
Current:  "Portuguese university course unit plans (PUC)"
Migrate:  Make the document type configurable or more generic

Current:  References "E-fólio", "P-fólio", UAb-specific terms
Migrate:  Generalize assessment type descriptions

Current:  Extraction rules assume Portuguese date formats
Migrate:  Add locale-aware date parsing instructions
```

### 3. Update Event Type Classification

The current classification is PUC-oriented:

| Current Type | Generalized Equivalent |
|-------------|----------------------|
| `study_block` | Any period dedicated to studying specific content |
| `assessment` | Any graded deliverable with a deadline |
| `tbd` | Any event with an unresolved or external date |

These three types are generic enough for most academic documents. If the new format has additional event types (e.g., `lecture`, `lab`, `office_hours`), the `EventType` enum in `src/lib/types.ts` and the Zod schema need extending.

### 4. Update Resource Classification

The three categories (`required`, `complementary`, `other`) map well to most bibliography formats. If the new document uses different categories, update:
- The Zod extraction schema (`extractionSchema.resources[].resourceType`)
- The `ResourceType` type in `src/lib/types.ts`
- The i18n translations for resource type labels

### 5. Update the Brief Template

The AI prompt requests 6 markdown sections:

```
## Overview
## Learning Objectives
## Competencies
## Methodology
## Assessment Structure
## Study Roadmap
```

If the source document doesn't contain information for all sections (e.g., no methodology section), the AI will produce a sparse or generic section. Consider making the section list configurable or reducing it for document types with less information.

### 6. Handle Language Differences

PUCs are always in Portuguese. The current pipeline:
- Keeps `sourceExcerpt` in original Portuguese
- Generates titles/descriptions in the user's locale (EN or PT)

For documents in other languages, update:
- The `language` field in `pucDocuments` (currently hardcoded to `"pt"`)
- The prompt instructions about source excerpt language
- The locale detection for output language

### 7. Files to Modify

| File | What to Change |
|------|---------------|
| `convex/pucProcessing.ts` | Prompt text, extraction rules, document type references |
| `convex/schema.ts` | Add new fields if needed (e.g., `documentType` on pucDocuments) |
| `src/lib/types.ts` | Extend `EventType`, `ResourceType` if needed |
| `src/lib/i18n/en.ts` | Update PUC-specific labels to generic ones |
| `src/lib/i18n/pt.ts` | Same as above |
| `src/components/puc-upload.tsx` | Rename/generalize upload UI |
| `docs/puc-processing.md` | Update technical documentation |

### 8. Abstraction Strategy

The recommended approach for supporting multiple document types:

```
                    +------------------+
                    |   Upload Handler |
                    +--------+---------+
                             |
                    +--------v---------+
                    | Document Type    |
                    | Detector         |
                    | (PUC? Syllabus?  |
                    |  Course Guide?)  |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
     +--------v---+  +------v-----+  +-----v------+
     | PUC Prompt |  | Syllabus   |  | Generic    |
     | Builder    |  | Prompt     |  | Academic   |
     |            |  | Builder    |  | Prompt     |
     +--------+---+  +------+-----+  +-----+------+
              |              |              |
              +--------------+--------------+
                             |
                    +--------v---------+
                    | AI Extraction    |
                    | (shared schema)  |
                    +--------+---------+
                             |
                    +--------v---------+
                    | Data Insertion   |
                    | (shared pipeline)|
                    +------------------+
```

The extraction schema (`events`, `brief`, `resources`) and database schema are already generic enough to support any academic document. Only the **prompt** and **document type detection** need to be specialized per format. The data insertion pipeline remains unchanged.

---

## Appendix: Real PUC Content Example

Below is a simplified representation of what extracted text from a UAb PUC looks like after `pdf-parse` processing. This is the raw text that gets sent to the AI:

```
PLANO DA UNIDADE CURRICULAR

Unidade Curricular: Algebra Linear I
Codigo: 21092
ECTS: 6
Docente: Prof. Maria Santos
Ano Letivo: 2024/25 - 1.o Semestre

1. APRESENTACAO
A Algebra Linear e uma disciplina fundamental para qualquer curso
de Matematica ou Engenharia. Nesta unidade curricular, os estudantes
irao adquirir os conceitos basicos de algebra linear...

2. COMPETENCIAS
Apos a conclusao desta UC, o estudante devera ser capaz de:
- Resolver sistemas de equacoes lineares
- Trabalhar com matrizes e determinantes
- Compreender espacos vetoriais e subespacos
- Aplicar transformacoes lineares
- Calcular valores e vetores proprios

3. ROTEIRO TEMATICO
Tema 1: Matrizes e Sistemas de Equacoes Lineares
Tema 2: Determinantes
Tema 3: Espacos Vetoriais
Tema 4: Transformacoes Lineares
Tema 5: Valores e Vetores Proprios

4. PLANO DE TRABALHO
Capitulos 1 e 2 - 06 a 26 de outubro (3 semanas)
Capitulo 3 - 27 de outubro a 16 de novembro (3 semanas)
E-folio A: 28 de novembro a 08 de dezembro (periodo de submissao)
Capitulos 4 e 5 - 17 de novembro a 14 de dezembro (4 semanas)
E-folio B: 09 a 19 de janeiro (periodo de submissao)
Exame presencial: consultar calendario oficial da UAb

5. AVALIACAO
Avaliacao continua:
- E-folio A: 20% da nota final (minimo 3.5 valores)
- E-folio B: 20% da nota final (minimo 3.5 valores)
- Exame presencial (P-folio): 60% da nota final (minimo 7 valores)

6. BIBLIOGRAFIA
Bibliografia Obrigatoria:
- Santana, A.P. & Queiro, J.F. (2010). "Algebra Linear e
  Geometria Analitica". Manual adotado pela UC.

Bibliografia Complementar:
- Anton, H. (2019). "Elementary Linear Algebra". 12th Edition.
  Wiley.
- Strang, G. (2016). "Introduction to Linear Algebra". 5th
  Edition. Wellesley-Cambridge Press.
```

This text is what the AI receives (along with subject metadata and semester dates) to produce the structured extraction output.
