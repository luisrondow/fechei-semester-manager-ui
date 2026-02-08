import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	semesters: defineTable({
		userId: v.string(),
		name: v.string(),
		startDate: v.string(),
		endDate: v.string(),
		timezone: v.string(),
		updatedAt: v.string(),
	}).index("by_user", ["userId"]),

	subjects: defineTable({
		semesterId: v.id("semesters"),
		name: v.string(),
		code: v.string(),
		instructor: v.string(),
	}).index("by_semester", ["semesterId"]),

	pucDocuments: defineTable({
		subjectId: v.id("subjects"),
		fileName: v.string(),
		extractedText: v.optional(v.string()),
		language: v.string(),
		status: v.string(),
		version: v.number(),
		storageId: v.optional(v.id("_storage")),
	}).index("by_subject", ["subjectId"]),

	subjectBriefs: defineTable({
		subjectId: v.id("subjects"),
		generatedText: v.string(),
		userEditedText: v.optional(v.string()),
		confidenceScore: v.number(),
	}).index("by_subject", ["subjectId"]),

	calendarEvents: defineTable({
		subjectId: v.id("subjects"),
		type: v.string(),
		startDate: v.string(),
		endDate: v.string(),
		title: v.string(),
		description: v.string(),
		status: v.string(),
		sourceExcerpt: v.optional(v.string()),
		updatedAt: v.string(),
	}).index("by_subject", ["subjectId"]),

	resources: defineTable({
		subjectId: v.id("subjects"),
		sourceType: v.string(),
		resourceType: v.string(),
		title: v.string(),
		authors: v.optional(v.string()),
		url: v.optional(v.string()),
		notes: v.optional(v.string()),
		tags: v.array(v.string()),
		pinned: v.boolean(),
		updatedAt: v.string(),
	}).index("by_subject", ["subjectId"]),
});
