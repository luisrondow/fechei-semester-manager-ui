import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import {
	assertNotArchived,
	getSemesterIdForResource,
	getSemesterIdForSubject,
} from "./helpers";
import type { ResourceSourceType, ResourceType } from "../src/lib/types";

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
			sourceType: r.sourceType as ResourceSourceType,
			resourceType: r.resourceType as ResourceType,
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
		const semesterId = await getSemesterIdForSubject(ctx, args.subjectId);
		await assertNotArchived(ctx, semesterId);
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
			sourceType: r!.sourceType as ResourceSourceType,
			resourceType: r!.resourceType as ResourceType,
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
		const semesterId = await getSemesterIdForResource(ctx, args.id);
		await assertNotArchived(ctx, semesterId);
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
			sourceType: r!.sourceType as ResourceSourceType,
			resourceType: r!.resourceType as ResourceType,
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
		const semesterId = await getSemesterIdForResource(ctx, args.id);
		await assertNotArchived(ctx, semesterId);
		await ctx.db.delete(args.id);
	},
});

export const togglePin = mutation({
	args: { id: v.id("resources") },
	handler: async (ctx, args) => {
		const semesterId = await getSemesterIdForResource(ctx, args.id);
		await assertNotArchived(ctx, semesterId);
		const r = await ctx.db.get(args.id);
		if (!r) throw new Error("Resource not found");
		await ctx.db.patch(args.id, {
			pinned: !r.pinned,
			updatedAt: new Date().toISOString(),
		});
	},
});

export const createFromExtraction = internalMutation({
	args: {
		resources: v.array(
			v.object({
				subjectId: v.id("subjects"),
				resourceType: v.string(),
				title: v.string(),
				authors: v.optional(v.string()),
				url: v.optional(v.string()),
				notes: v.optional(v.string()),
				tags: v.array(v.string()),
			}),
		),
	},
	handler: async (ctx, args) => {
		const now = new Date().toISOString();
		for (const resource of args.resources) {
			await ctx.db.insert("resources", {
				subjectId: resource.subjectId,
				sourceType: "puc_extracted",
				resourceType: resource.resourceType,
				title: resource.title,
				authors: resource.authors,
				url: resource.url,
				notes: resource.notes,
				tags: resource.tags,
				pinned: false,
				updatedAt: now,
			});
		}
	},
});

export const deleteExtractedBySubject = internalMutation({
	args: { subjectId: v.id("subjects") },
	handler: async (ctx, args) => {
		const resources = await ctx.db
			.query("resources")
			.withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
			.collect();
		for (const r of resources) {
			if (r.sourceType === "puc_extracted") {
				await ctx.db.delete(r._id);
			}
		}
	},
});
