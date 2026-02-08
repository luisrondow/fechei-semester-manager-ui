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
		return subjects.map((s) => ({
			id: s._id,
			semesterId: s.semesterId,
			name: s.name,
			code: s.code,
			instructor: s.instructor,
			createdAt: new Date(s._creationTime).toISOString(),
		}));
	},
});

export const listBySemesterWithPuc = query({
	args: { semesterId: v.string() },
	handler: async (ctx, args) => {
		const normalizedId = ctx.db.normalizeId("semesters", args.semesterId);
		if (!normalizedId) return [];
		const subjects = await ctx.db
			.query("subjects")
			.withIndex("by_semester", (q) => q.eq("semesterId", normalizedId))
			.collect();
		return Promise.all(
			subjects.map(async (s) => {
				const puc = await ctx.db
					.query("pucDocuments")
					.withIndex("by_subject", (q) => q.eq("subjectId", s._id))
					.first();
				return {
					id: s._id,
					semesterId: s.semesterId,
					name: s.name,
					code: s.code,
					instructor: s.instructor,
					createdAt: new Date(s._creationTime).toISOString(),
					pucStatus: puc?.status ?? null,
					pucFileName: puc?.fileName ?? null,
				};
			}),
		);
	},
});

export const get = query({
	args: { id: v.string() },
	handler: async (ctx, args) => {
		const normalizedId = ctx.db.normalizeId("subjects", args.id);
		if (!normalizedId) return null;
		const s = await ctx.db.get(normalizedId);
		if (!s) return null;
		return {
			id: s._id,
			semesterId: s.semesterId,
			name: s.name,
			code: s.code,
			instructor: s.instructor,
			createdAt: new Date(s._creationTime).toISOString(),
		};
	},
});

export const create = mutation({
	args: {
		semesterId: v.id("semesters"),
		name: v.string(),
		code: v.string(),
		instructor: v.string(),
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert("subjects", {
			semesterId: args.semesterId,
			name: args.name,
			code: args.code,
			instructor: args.instructor,
		});
		const s = await ctx.db.get(id);
		return {
			id: s!._id,
			semesterId: s!.semesterId,
			name: s!.name,
			code: s!.code,
			instructor: s!.instructor,
			createdAt: new Date(s!._creationTime).toISOString(),
		};
	},
});

export const remove = mutation({
	args: { id: v.id("subjects") },
	handler: async (ctx, args) => {
		// Cascade delete children
		const events = await ctx.db
			.query("calendarEvents")
			.withIndex("by_subject", (q) => q.eq("subjectId", args.id))
			.collect();
		for (const e of events) await ctx.db.delete(e._id);

		const briefs = await ctx.db
			.query("subjectBriefs")
			.withIndex("by_subject", (q) => q.eq("subjectId", args.id))
			.collect();
		for (const b of briefs) await ctx.db.delete(b._id);

		const resources = await ctx.db
			.query("resources")
			.withIndex("by_subject", (q) => q.eq("subjectId", args.id))
			.collect();
		for (const r of resources) await ctx.db.delete(r._id);

		const pucs = await ctx.db
			.query("pucDocuments")
			.withIndex("by_subject", (q) => q.eq("subjectId", args.id))
			.collect();
		for (const p of pucs) await ctx.db.delete(p._id);

		await ctx.db.delete(args.id);
	},
});
