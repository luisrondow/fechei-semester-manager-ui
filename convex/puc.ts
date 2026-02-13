import { v } from "convex/values";
import {
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server";
import {
	assertNotArchived,
	getSemesterIdForPuc,
	getSemesterIdForSubject,
} from "./helpers";

export const getBySubject = query({
	args: { subjectId: v.string() },
	handler: async (ctx, args) => {
		const normalizedId = ctx.db.normalizeId("subjects", args.subjectId);
		if (!normalizedId) return null;
		const puc = await ctx.db
			.query("pucDocuments")
			.withIndex("by_subject", (q) => q.eq("subjectId", normalizedId))
			.first();
		if (!puc) return null;
		return {
			id: puc._id,
			subjectId: puc.subjectId,
			fileName: puc.fileName,
			extractedText: puc.extractedText ?? null,
			language: puc.language,
			status: puc.status,
			version: puc.version,
			storageId: puc.storageId ?? null,
			uploadedAt: new Date(puc._creationTime).toISOString(),
		};
	},
});

export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		return await ctx.storage.generateUploadUrl();
	},
});

export const upload = mutation({
	args: {
		subjectId: v.id("subjects"),
		fileName: v.string(),
		storageId: v.optional(v.id("_storage")),
	},
	handler: async (ctx, args) => {
		const semesterId = await getSemesterIdForSubject(ctx, args.subjectId);
		await assertNotArchived(ctx, semesterId);
		const id = await ctx.db.insert("pucDocuments", {
			subjectId: args.subjectId,
			fileName: args.fileName,
			language: "pt",
			status: "uploading",
			version: 1,
			storageId: args.storageId,
		});
		const puc = await ctx.db.get(id);
		return {
			id: puc!._id,
			subjectId: puc!.subjectId,
			fileName: puc!.fileName,
			extractedText: puc!.extractedText ?? null,
			language: puc!.language,
			status: puc!.status,
			version: puc!.version,
			uploadedAt: new Date(puc!._creationTime).toISOString(),
		};
	},
});

export const updateStatus = mutation({
	args: {
		id: v.id("pucDocuments"),
		status: v.string(),
	},
	handler: async (ctx, args) => {
		const semesterId = await getSemesterIdForPuc(ctx, args.id);
		await assertNotArchived(ctx, semesterId);
		await ctx.db.patch(args.id, { status: args.status });
	},
});

export const saveExtractedText = internalMutation({
	args: {
		id: v.id("pucDocuments"),
		extractedText: v.string(),
		status: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			extractedText: args.extractedText,
			status: args.status,
		});
	},
});

export const updateStatusInternal = internalMutation({
	args: {
		id: v.id("pucDocuments"),
		status: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { status: args.status });
	},
});

export const getPucWithContext = internalQuery({
	args: { pucId: v.string() },
	handler: async (ctx, args) => {
		const normalizedId = ctx.db.normalizeId("pucDocuments", args.pucId);
		if (!normalizedId) return null;
		const puc = await ctx.db.get(normalizedId);
		if (!puc) return null;

		const subject = await ctx.db.get(puc.subjectId);
		if (!subject) return null;

		const semester = await ctx.db.get(subject.semesterId);
		if (!semester) return null;

		return {
			id: puc._id,
			subjectId: puc.subjectId,
			storageId: puc.storageId ?? null,
			fileName: puc.fileName,
			status: puc.status,
			subject: {
				name: subject.name,
				code: subject.code,
			},
			semester: {
				startDate: semester.startDate,
				endDate: semester.endDate,
			},
		};
	},
});
