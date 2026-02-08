import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		const semesters = await ctx.db.query("semesters").collect();
		return semesters.map((s) => ({
			id: s._id,
			userId: s.userId,
			name: s.name,
			startDate: s.startDate,
			endDate: s.endDate,
			timezone: s.timezone,
			createdAt: new Date(s._creationTime).toISOString(),
			updatedAt: s.updatedAt,
		}));
	},
});

export const get = query({
	args: { id: v.string() },
	handler: async (ctx, args) => {
		const normalizedId = ctx.db.normalizeId("semesters", args.id);
		if (!normalizedId) return null;
		const s = await ctx.db.get(normalizedId);
		if (!s) return null;
		return {
			id: s._id,
			userId: s.userId,
			name: s.name,
			startDate: s.startDate,
			endDate: s.endDate,
			timezone: s.timezone,
			createdAt: new Date(s._creationTime).toISOString(),
			updatedAt: s.updatedAt,
		};
	},
});

export const listWithSubjects = query({
	args: {},
	handler: async (ctx) => {
		const semesters = await ctx.db.query("semesters").collect();
		return Promise.all(
			semesters.map(async (s) => {
				const subjects = await ctx.db
					.query("subjects")
					.withIndex("by_semester", (q) => q.eq("semesterId", s._id))
					.collect();
				return {
					id: s._id,
					userId: s.userId,
					name: s.name,
					startDate: s.startDate,
					endDate: s.endDate,
					timezone: s.timezone,
					createdAt: new Date(s._creationTime).toISOString(),
					updatedAt: s.updatedAt,
					subjects: subjects.map((sub) => ({
						id: sub._id,
						semesterId: sub.semesterId,
						name: sub.name,
						code: sub.code,
						instructor: sub.instructor,
						createdAt: new Date(sub._creationTime).toISOString(),
					})),
				};
			}),
		);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		startDate: v.string(),
		endDate: v.string(),
		timezone: v.string(),
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert("semesters", {
			userId: "user-1",
			name: args.name,
			startDate: args.startDate,
			endDate: args.endDate,
			timezone: args.timezone,
			updatedAt: new Date().toISOString(),
		});
		const s = await ctx.db.get(id);
		return {
			id: s!._id,
			userId: s!.userId,
			name: s!.name,
			startDate: s!.startDate,
			endDate: s!.endDate,
			timezone: s!.timezone,
			createdAt: new Date(s!._creationTime).toISOString(),
			updatedAt: s!.updatedAt,
		};
	},
});

export const update = mutation({
	args: {
		id: v.id("semesters"),
		name: v.optional(v.string()),
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
		timezone: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { id, ...fields } = args;
		const updates: Record<string, string> = {
			updatedAt: new Date().toISOString(),
		};
		if (fields.name !== undefined) updates.name = fields.name;
		if (fields.startDate !== undefined) updates.startDate = fields.startDate;
		if (fields.endDate !== undefined) updates.endDate = fields.endDate;
		if (fields.timezone !== undefined) updates.timezone = fields.timezone;
		await ctx.db.patch(id, updates);
		const s = await ctx.db.get(id);
		return {
			id: s!._id,
			userId: s!.userId,
			name: s!.name,
			startDate: s!.startDate,
			endDate: s!.endDate,
			timezone: s!.timezone,
			createdAt: new Date(s!._creationTime).toISOString(),
			updatedAt: s!.updatedAt,
		};
	},
});

export const remove = mutation({
	args: { id: v.id("semesters") },
	handler: async (ctx, args) => {
		// Cascade delete: subjects → events, briefs, resources, PUC docs → semester
		const subjects = await ctx.db
			.query("subjects")
			.withIndex("by_semester", (q) => q.eq("semesterId", args.id))
			.collect();

		for (const sub of subjects) {
			// Delete events
			const events = await ctx.db
				.query("calendarEvents")
				.withIndex("by_subject", (q) => q.eq("subjectId", sub._id))
				.collect();
			for (const e of events) await ctx.db.delete(e._id);

			// Delete briefs
			const briefs = await ctx.db
				.query("subjectBriefs")
				.withIndex("by_subject", (q) => q.eq("subjectId", sub._id))
				.collect();
			for (const b of briefs) await ctx.db.delete(b._id);

			// Delete resources
			const resources = await ctx.db
				.query("resources")
				.withIndex("by_subject", (q) => q.eq("subjectId", sub._id))
				.collect();
			for (const r of resources) await ctx.db.delete(r._id);

			// Delete PUC docs
			const pucs = await ctx.db
				.query("pucDocuments")
				.withIndex("by_subject", (q) => q.eq("subjectId", sub._id))
				.collect();
			for (const p of pucs) await ctx.db.delete(p._id);

			// Delete subject
			await ctx.db.delete(sub._id);
		}

		await ctx.db.delete(args.id);
	},
});
