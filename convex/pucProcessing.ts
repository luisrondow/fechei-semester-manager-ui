"use node";

import { openai } from "@ai-sdk/openai";
import { Output, generateText } from "ai";
import { ConvexError, v } from "convex/values";
import { z } from "zod";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";

const extractionSchema = z.object({
	events: z.array(
		z.object({
			type: z
				.enum(["study_block", "assessment", "tbd", "announcement"])
				.describe(
					"study_block = study periods or activity windows, assessment = exams/quizzes/assignments with deadlines, announcement = a known date when the professor will publish a later date or grade, tbd = mentioned but date itself is still unclear",
				),
			startDate: z
				.string()
				.describe("ISO date string (YYYY-MM-DD) for the event start"),
			endDate: z
				.string()
				.describe(
					"ISO date string (YYYY-MM-DD) for the event end (same as startDate for single-day events)",
				),
			title: z.string().describe("Short descriptive title for the event"),
			description: z
				.string()
				.describe("Detailed description of what this event involves"),
			sourceExcerpt: z
				.string()
				.nullable()
				.describe(
					"Original text excerpt from the PDF that this event was extracted from (keep in original Portuguese), or null if not available",
				),
		}),
	),
	brief: z.object({
		generatedText: z
			.string()
			.describe(
				"Comprehensive markdown-formatted subject brief including: overview, learning objectives, competencies, methodology, assessment structure, and study roadmap",
			),
		confidenceScore: z
			.number()
			.describe(
				"Confidence in the extraction quality (0-1). Lower if document is unclear or information is sparse",
			),
	}),
	resources: z.array(
		z.object({
			resourceType: z
				.enum(["required", "complementary", "other"])
				.describe(
					"required = mandatory bibliography, complementary = supplementary reading, other = additional references",
				),
			title: z.string().describe("Title of the resource/book/article"),
			authors: z
				.string()
				.nullable()
				.describe("Author(s) of the resource, or null if unknown"),
			url: z
				.string()
				.nullable()
				.describe("URL if available, or null"),
			notes: z
				.string()
				.nullable()
				.describe("Additional notes about the resource, or null"),
			tags: z
				.array(z.string())
				.describe(
					"Relevant tags (e.g. 'textbook', 'article', 'online', 'chapter 1-5')",
				),
		}),
	),
});

function buildPrompt(
	pdfText: string,
	subjectName: string,
	subjectCode: string,
	semesterStart: string,
	semesterEnd: string,
	locale: string,
): string {
	const lang =
		locale === "pt"
			? "Portuguese (PT-PT)"
			: "English";
	return `You are an academic document analyzer specialized in Portuguese university course unit plans (PUC - Plano da Unidade Curricular).

Analyze the following extracted PDF text from a PUC document and extract structured data.

**Subject**: ${subjectName} (${subjectCode})
**Semester period**: ${semesterStart} to ${semesterEnd}

**Output language**: Generate all titles, descriptions, and brief text in ${lang}.
**EXCEPTION**: sourceExcerpt fields must remain in the original Portuguese as they reference the source document.

**Portuguese PUC conventions** (common terms to recognize):
- "Plano de atividades formativas" = study activity schedule with explicit dates
- "e-fólio" / "p-fólio" = online / in-person assessment components
- "Época normal" / "Época de recurso" = normal / resit exam period
- "Bibliografia obrigatória" = required bibliography
- "Bibliografia complementar" = complementary bibliography
- "Competências" = competencies/skills
- "Objetivos de aprendizagem" = learning objectives
- "Metodologia" = methodology
- "ECTS" = European Credit Transfer System (workload indicator)
- "UC" = Unidade Curricular (course unit)

**Extraction rules**:

EVENTS:
- Extract all dates that represent study blocks, assessment deadlines, exam dates, assignment due dates, activity periods, or dates when the professor will publish a later date/grade
- For date ranges (e.g. "study period from X to Y"), use the full range with startDate and endDate
- For single dates (e.g. "exam on date X"), set both startDate and endDate to the same date
- Classify as: "assessment" for exams, tests, assignments, quizzes; "study_block" for study periods, activity windows, module dates; "announcement" when the PUC provides a concrete date when the professor will later announce/publish something (such as an exam date or a grade); "tbd" when the actual date is unresolved, external, or still unclear
- All dates must fall within the semester period (${semesterStart} to ${semesterEnd}) or be reasonable academic dates
- Include sourceExcerpt with the original Portuguese text that mentions this date
- For assessment events, include the weight/percentage in the title if stated in the PUC (e.g., "e-Fólio A (20%)" or "Exame Final (60%)")
- Include assessment modality in the description (online, in-person, open-book, timed, etc.) when mentioned
- For announcement events, make the title explicit about what will be announced (e.g. "Grade published for e-Fólio A" or "Exam date announcement")

**IMPORTANT — Inferring study blocks when no explicit dates are given**:
If the PUC does NOT contain a "plano de atividades formativas" or other explicit study period schedule, but DOES list topics, modules, or thematic units, you MUST generate "study_block" events for each topic by distributing them evenly across the semester:
1. Count the number of topics/modules/units listed
2. Divide the semester duration equally: each topic gets (semester_duration_in_days / N) days
3. Assign sequential non-overlapping date ranges starting from ${semesterStart}
4. Title each block with the topic/module name (e.g., "Module 1: Introduction to X")
5. Set description to the specific content or subtopics covered in that block
6. Set sourceExcerpt to the original Portuguese text listing that topic/module
This ensures students always have a study schedule even when the PUC omits explicit dates.

BRIEF:
- Generate a comprehensive subject brief in markdown format
- Include sections: ## Overview, ## Learning Objectives, ## Competencies, ## Methodology, ## Assessment Structure, ## Workload, ## Study Roadmap
- In **Assessment Structure**, list each component with its weight percentage, modality (online/in-person), and any specific requirements
- In **Workload**, include ECTS credits and estimated weekly study hours if mentioned in the PUC
- The **Study Roadmap** should be a chronological timeline matching the extracted events, giving students a clear module-by-module progression
- Set confidenceScore: 0.8–1.0 if PUC is detailed with clear dates and structure; 0.5–0.7 if some information is ambiguous or missing; 0.3–0.5 if very sparse

RESOURCES:
- Extract all bibliography entries, references, and recommended readings
- Classify as: "required" for mandatory/main bibliography ("Bibliografia obrigatória"), "complementary" for supplementary reading ("Bibliografia complementar"), "other" for any other references or web resources
- Parse author names in the format they appear (typically "Lastname, Firstname")
- For books, include publisher and year in the notes field if available
- For articles/chapters, include journal/book name and pages in the notes field
- If ISBN or DOI is present, include it in the notes field
- Add relevant tags: "textbook", "article", "online", "chapter X-Y", "video", etc.
- If the PUC mentions specific chapters or page ranges to read, include those in the tags

Here is the extracted PDF text:

---
${pdfText}
---

Extract the structured data following the schema precisely.`;
}

export const processPuc = action({
	args: {
		pucId: v.id("pucDocuments"),
		locale: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// 1. Fetch PUC document
		const puc = await ctx.runQuery(internal.puc.getPucWithContext, {
			pucId: args.pucId,
		});
		if (!puc) {
			throw new ConvexError("PUC document not found");
		}

		// 2. Check archived status
		if (new Date() > new Date(puc.semester.endDate)) {
			throw new ConvexError(
				"This semester is archived and cannot be modified.",
			);
		}

		// 3. Set status to processing
		await ctx.runMutation(internal.puc.updateStatusInternal, {
			id: args.pucId,
			status: "processing",
		});

		try {
			// 4. Download PDF from storage
			if (!puc.storageId) {
				throw new ConvexError("PUC document has no associated file");
			}
			const fileUrl = await ctx.storage.getUrl(
				puc.storageId as Id<"_storage">,
			);
			if (!fileUrl) {
				throw new ConvexError("Could not get file URL from storage");
			}
			const response = await fetch(fileUrl);
			const arrayBuffer = await response.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			// 5. Extract text with pdf-parse (import inner module to skip test file load in index.js)
			const pdf = require("pdf-parse/lib/pdf-parse.js");
			const pdfData = await pdf(buffer);
			const extractedText = pdfData.text;

			if (extractedText.trim().length < 50) {
				throw new ConvexError(
					"PDF appears to be scanned or contains very little text. Only text-based PDFs are supported.",
				);
			}

			// 6. Save extracted text
			await ctx.runMutation(internal.puc.saveExtractedText, {
				id: args.pucId,
				extractedText,
				status: "processing",
			});

			// 7. Call AI for structured extraction
			const locale = args.locale ?? "en";
			const prompt = buildPrompt(
				extractedText,
				puc.subject.name,
				puc.subject.code,
				puc.semester.startDate,
				puc.semester.endDate,
				locale,
			);

			const { output: result } = await generateText({
				model: openai("gpt-5-mini"),
				prompt,
				output: Output.object({ schema: extractionSchema }),
			});

			if (!result) {
				throw new ConvexError(
					"AI failed to produce structured output from the PUC document",
				);
			}

			// 8. Delete old AI-extracted data (for re-processing)
			await ctx.runMutation(internal.events.deleteBySubject, {
				subjectId: puc.subjectId,
			});
			await ctx.runMutation(internal.briefs.deleteBySubject, {
				subjectId: puc.subjectId,
			});
			await ctx.runMutation(internal.resources.deleteExtractedBySubject, {
				subjectId: puc.subjectId,
			});

			// 9. Insert new extracted data
			if (result.events.length > 0) {
				await ctx.runMutation(internal.events.createBatch, {
					events: result.events.map((e) => ({
						subjectId: puc.subjectId,
						type: e.type,
						startDate: e.startDate,
						endDate: e.endDate,
						title: e.title,
						description: e.description,
						sourceExcerpt: e.sourceExcerpt ?? undefined,
					})),
				});
			}

			await ctx.runMutation(internal.briefs.create, {
				subjectId: puc.subjectId,
				generatedText: result.brief.generatedText,
				confidenceScore: result.brief.confidenceScore,
			});

			if (result.resources.length > 0) {
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
			}

			// 10. Set status to extracted
			await ctx.runMutation(internal.puc.updateStatusInternal, {
				id: args.pucId,
				status: "extracted",
			});
		} catch (error) {
			// 11. On error, set status to error and re-throw
			await ctx.runMutation(internal.puc.updateStatusInternal, {
				id: args.pucId,
				status: "error",
			});
			throw error;
		}
	},
});
