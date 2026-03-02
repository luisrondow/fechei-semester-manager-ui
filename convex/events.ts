import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import {
	assertNotArchived,
	getSemesterIdForEvent,
	getSemesterIdForSubject,
} from "./helpers";
import type { EventType, EventStatus } from "../src/lib/types";

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
			type: e.type as EventType,
			startDate: e.startDate,
			endDate: e.endDate,
			title: e.title,
			description: e.description,
			status: e.status as EventStatus,
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
			type: e.type as EventType,
			startDate: e.startDate,
			endDate: e.endDate,
			title: e.title,
			description: e.description,
			status: e.status as EventStatus,
			sourceExcerpt: e.sourceExcerpt ?? null,
			createdAt: new Date(e._creationTime).toISOString(),
			updatedAt: e.updatedAt,
		}));
	},
});

export const update = mutation({
	args: {
		id: v.id("calendarEvents"),
		type: v.optional(v.string()),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
		status: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const semesterId = await getSemesterIdForEvent(ctx, args.id);
		await assertNotArchived(ctx, semesterId);
		const currentEvent = await ctx.db.get(args.id);
		if (!currentEvent) {
			throw new ConvexError("Calendar event not found");
		}
		const { id, ...fields } = args;
		const updates: Record<string, string> = {
			updatedAt: new Date().toISOString(),
		};
		const editableFieldChanged =
			(fields.type !== undefined && fields.type !== currentEvent.type) ||
			(fields.title !== undefined && fields.title !== currentEvent.title) ||
			(fields.description !== undefined &&
				fields.description !== currentEvent.description) ||
			(fields.startDate !== undefined &&
				fields.startDate !== currentEvent.startDate) ||
			(fields.endDate !== undefined && fields.endDate !== currentEvent.endDate);
		if (fields.type !== undefined) updates.type = fields.type;
		if (fields.title !== undefined) updates.title = fields.title;
		if (fields.description !== undefined)
			updates.description = fields.description;
		if (fields.startDate !== undefined) updates.startDate = fields.startDate;
		if (fields.endDate !== undefined) updates.endDate = fields.endDate;
		if (fields.status !== undefined) updates.status = fields.status;
		if (currentEvent.status === "confirmed" && editableFieldChanged) {
			updates.status = "pending";
		}
		await ctx.db.patch(id, updates);
		const e = await ctx.db.get(id);
		return {
			id: e!._id,
			subjectId: e!.subjectId,
			type: e!.type as EventType,
			startDate: e!.startDate,
			endDate: e!.endDate,
			title: e!.title,
			description: e!.description,
			status: e!.status as EventStatus,
			sourceExcerpt: e!.sourceExcerpt ?? null,
			createdAt: new Date(e!._creationTime).toISOString(),
			updatedAt: e!.updatedAt,
		};
	},
});

export const create = mutation({
	args: {
		subjectId: v.id("subjects"),
		type: v.string(),
		title: v.string(),
		description: v.optional(v.string()),
		startDate: v.string(),
		endDate: v.string(),
	},
	handler: async (ctx, args) => {
		const semesterId = await getSemesterIdForSubject(ctx, args.subjectId);
		await assertNotArchived(ctx, semesterId);
		const now = new Date().toISOString();
		const id = await ctx.db.insert("calendarEvents", {
			subjectId: args.subjectId,
			type: args.type,
			startDate: args.startDate,
			endDate: args.endDate,
			title: args.title,
			description: args.description ?? "",
			status: "pending",
			updatedAt: now,
		});
		const e = await ctx.db.get(id);
		return {
			id: e!._id,
			subjectId: e!.subjectId,
			type: e!.type as EventType,
			startDate: e!.startDate,
			endDate: e!.endDate,
			title: e!.title,
			description: e!.description,
			status: e!.status as EventStatus,
			sourceExcerpt: e!.sourceExcerpt ?? null,
			createdAt: new Date(e!._creationTime).toISOString(),
			updatedAt: e!.updatedAt,
		};
	},
});

export const remove = mutation({
	args: { id: v.id("calendarEvents") },
	handler: async (ctx, args) => {
		const semesterId = await getSemesterIdForEvent(ctx, args.id);
		await assertNotArchived(ctx, semesterId);
		await ctx.db.delete(args.id);
	},
});

export const confirm = mutation({
	args: { id: v.id("calendarEvents") },
	handler: async (ctx, args) => {
		const semesterId = await getSemesterIdForEvent(ctx, args.id);
		await assertNotArchived(ctx, semesterId);
		await ctx.db.patch(args.id, {
			status: "confirmed",
			updatedAt: new Date().toISOString(),
		});
	},
});

export const createBatch = internalMutation({
	args: {
		events: v.array(
			v.object({
				subjectId: v.id("subjects"),
				type: v.string(),
				startDate: v.string(),
				endDate: v.string(),
				title: v.string(),
				description: v.string(),
				sourceExcerpt: v.optional(v.string()),
			}),
		),
	},
	handler: async (ctx, args) => {
		const now = new Date().toISOString();
		for (const event of args.events) {
			await ctx.db.insert("calendarEvents", {
				subjectId: event.subjectId,
				type: event.type,
				startDate: event.startDate,
				endDate: event.endDate,
				title: event.title,
				description: event.description,
				status: "pending",
				sourceExcerpt: event.sourceExcerpt,
				updatedAt: now,
			});
		}
	},
});

export const deleteBySubject = internalMutation({
	args: { subjectId: v.id("subjects") },
	handler: async (ctx, args) => {
		const events = await ctx.db
			.query("calendarEvents")
			.withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
			.collect();
		for (const e of events) {
			await ctx.db.delete(e._id);
		}
	},
});
