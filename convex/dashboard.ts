import { v } from "convex/values";
import { query } from "./_generated/server";
import type { ResourceSourceType, ResourceType } from "../src/lib/types";

export const aggregatedData = query({
	args: { semesterId: v.string() },
	handler: async (ctx, args) => {
		const normalizedId = ctx.db.normalizeId("semesters", args.semesterId);
		if (!normalizedId) return { subjects: [], pinnedResources: [] };
		const subjects = await ctx.db
			.query("subjects")
			.withIndex("by_semester", (q) => q.eq("semesterId", normalizedId))
			.collect();

		const mappedSubjects = subjects.map((s) => ({
			id: s._id,
			semesterId: s.semesterId,
			name: s.name,
			code: s.code,
			instructor: s.instructor,
			createdAt: new Date(s._creationTime).toISOString(),
		}));

		const pinnedResources: Array<{
			id: string;
			subjectId: string;
			sourceType: ResourceSourceType;
			resourceType: ResourceType;
			title: string;
			authors: string | null;
			url: string | null;
			notes: string | null;
			tags: string[];
			pinned: boolean;
			createdAt: string;
			updatedAt: string;
			subjectName: string;
		}> = [];

		for (const sub of subjects) {
			const resources = await ctx.db
				.query("resources")
				.withIndex("by_subject", (q) => q.eq("subjectId", sub._id))
				.collect();
			for (const r of resources) {
				if (r.pinned) {
					pinnedResources.push({
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
						subjectName: sub.name,
					});
				}
			}
		}

		return { subjects: mappedSubjects, pinnedResources };
	},
});
