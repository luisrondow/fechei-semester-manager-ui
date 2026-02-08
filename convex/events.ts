import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listBySemester = query({
	args: { semesterId: v.string() },
	handler: async (ctx, args) => {
		const normalizedId = ctx.db.normalizeId("semesters", args.semesterId);
		if (!normalizedId) return [];
		const subjects = await ctx.db
			.query("subjects")
			.withIndex("by_semester", (q) => q.eq("semesterId", normalizedId))
			.collect();

		const allEvents = [];
		for (const sub of subjects) {
			const events = await ctx.db
				.query("calendarEvents")
				.withIndex("by_subject", (q) => q.eq("subjectId", sub._id))
				.collect();
			allEvents.push(...events);
		}

		return allEvents.map((e) => ({
			id: e._id,
			subjectId: e.subjectId,
			type: e.type,
			startDate: e.startDate,
			endDate: e.endDate,
			title: e.title,
			description: e.description,
			status: e.status,
			sourceExcerpt: e.sourceExcerpt ?? null,
			createdAt: new Date(e._creationTime).toISOString(),
			updatedAt: e.updatedAt,
		}));
	},
});

export const listBySubject = query({
	args: { subjectId: v.string() },
	handler: async (ctx, args) => {
		const normalizedId = ctx.db.normalizeId("subjects", args.subjectId);
		if (!normalizedId) return [];
		const events = await ctx.db
			.query("calendarEvents")
			.withIndex("by_subject", (q) => q.eq("subjectId", normalizedId))
			.collect();
		return events.map((e) => ({
			id: e._id,
			subjectId: e.subjectId,
			type: e.type,
			startDate: e.startDate,
			endDate: e.endDate,
			title: e.title,
			description: e.description,
			status: e.status,
			sourceExcerpt: e.sourceExcerpt ?? null,
			createdAt: new Date(e._creationTime).toISOString(),
			updatedAt: e.updatedAt,
		}));
	},
});

export const update = mutation({
	args: {
		id: v.id("calendarEvents"),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
		status: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { id, ...fields } = args;
		const updates: Record<string, string> = {
			updatedAt: new Date().toISOString(),
		};
		if (fields.title !== undefined) updates.title = fields.title;
		if (fields.description !== undefined)
			updates.description = fields.description;
		if (fields.startDate !== undefined) updates.startDate = fields.startDate;
		if (fields.endDate !== undefined) updates.endDate = fields.endDate;
		if (fields.status !== undefined) updates.status = fields.status;
		await ctx.db.patch(id, updates);
		const e = await ctx.db.get(id);
		return {
			id: e!._id,
			subjectId: e!.subjectId,
			type: e!.type,
			startDate: e!.startDate,
			endDate: e!.endDate,
			title: e!.title,
			description: e!.description,
			status: e!.status,
			sourceExcerpt: e!.sourceExcerpt ?? null,
			createdAt: new Date(e!._creationTime).toISOString(),
			updatedAt: e!.updatedAt,
		};
	},
});

export const confirm = mutation({
	args: { id: v.id("calendarEvents") },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			status: "confirmed",
			updatedAt: new Date().toISOString(),
		});
	},
});
