import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listBySubject = query({
	args: { subjectId: v.string() },
	handler: async (ctx, args) => {
		const normalizedId = ctx.db.normalizeId("subjects", args.subjectId);
		if (!normalizedId) return [];
		const resources = await ctx.db
			.query("resources")
			.withIndex("by_subject", (q) => q.eq("subjectId", normalizedId))
			.collect();
		return resources.map((r) => ({
			id: r._id,
			subjectId: r.subjectId,
			sourceType: r.sourceType,
			resourceType: r.resourceType,
			title: r.title,
			authors: r.authors ?? null,
			url: r.url ?? null,
			notes: r.notes ?? null,
			tags: r.tags,
			pinned: r.pinned,
			createdAt: new Date(r._creationTime).toISOString(),
			updatedAt: r.updatedAt,
		}));
	},
});

export const create = mutation({
	args: {
		subjectId: v.id("subjects"),
		title: v.string(),
		url: v.string(),
		notes: v.optional(v.string()),
		tags: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert("resources", {
			subjectId: args.subjectId,
			sourceType: "user_saved",
			resourceType: "other",
			title: args.title,
			url: args.url || undefined,
			notes: args.notes,
			tags: args.tags ?? [],
			pinned: false,
			updatedAt: new Date().toISOString(),
		});
		const r = await ctx.db.get(id);
		return {
			id: r!._id,
			subjectId: r!.subjectId,
			sourceType: r!.sourceType,
			resourceType: r!.resourceType,
			title: r!.title,
			authors: r!.authors ?? null,
			url: r!.url ?? null,
			notes: r!.notes ?? null,
			tags: r!.tags,
			pinned: r!.pinned,
			createdAt: new Date(r!._creationTime).toISOString(),
			updatedAt: r!.updatedAt,
		};
	},
});

export const update = mutation({
	args: {
		id: v.id("resources"),
		title: v.optional(v.string()),
		url: v.optional(v.string()),
		notes: v.optional(v.string()),
		tags: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		const { id, ...fields } = args;
		const updates: Record<string, unknown> = {
			updatedAt: new Date().toISOString(),
		};
		if (fields.title !== undefined) updates.title = fields.title;
		if (fields.url !== undefined) updates.url = fields.url;
		if (fields.notes !== undefined) updates.notes = fields.notes;
		if (fields.tags !== undefined) updates.tags = fields.tags;
		await ctx.db.patch(id, updates);
		const r = await ctx.db.get(id);
		return {
			id: r!._id,
			subjectId: r!.subjectId,
			sourceType: r!.sourceType,
			resourceType: r!.resourceType,
			title: r!.title,
			authors: r!.authors ?? null,
			url: r!.url ?? null,
			notes: r!.notes ?? null,
			tags: r!.tags,
			pinned: r!.pinned,
			createdAt: new Date(r!._creationTime).toISOString(),
			updatedAt: r!.updatedAt,
		};
	},
});

export const remove = mutation({
	args: { id: v.id("resources") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	},
});

export const togglePin = mutation({
	args: { id: v.id("resources") },
	handler: async (ctx, args) => {
		const r = await ctx.db.get(args.id);
		if (!r) throw new Error("Resource not found");
		await ctx.db.patch(args.id, {
			pinned: !r.pinned,
			updatedAt: new Date().toISOString(),
		});
	},
});
