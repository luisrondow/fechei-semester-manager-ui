import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
		await ctx.db.patch(args.id, { status: args.status });
	},
});
