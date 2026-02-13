import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertNotArchived, getSemesterIdForBrief } from "./helpers";

export const getBySubject = query({
	args: { subjectId: v.string() },
	handler: async (ctx, args) => {
		const normalizedId = ctx.db.normalizeId("subjects", args.subjectId);
		if (!normalizedId) return null;
		const brief = await ctx.db
			.query("subjectBriefs")
			.withIndex("by_subject", (q) => q.eq("subjectId", normalizedId))
			.first();
		if (!brief) return null;
		return {
			id: brief._id,
			subjectId: brief.subjectId,
			generatedText: brief.generatedText,
			userEditedText: brief.userEditedText ?? null,
			confidenceScore: brief.confidenceScore,
		};
	},
});

export const update = mutation({
	args: {
		id: v.id("subjectBriefs"),
		userEditedText: v.optional(v.union(v.string(), v.null())),
	},
	handler: async (ctx, args) => {
		const semesterId = await getSemesterIdForBrief(ctx, args.id);
		await assertNotArchived(ctx, semesterId);
		const patch: Record<string, unknown> = {};
		if (args.userEditedText === null) {
			// Reset to generated text — remove user edit
			patch.userEditedText = undefined;
		} else if (args.userEditedText !== undefined) {
			patch.userEditedText = args.userEditedText;
		}
		await ctx.db.patch(args.id, patch);
		const b = await ctx.db.get(args.id);
		return {
			id: b!._id,
			subjectId: b!.subjectId,
			generatedText: b!.generatedText,
			userEditedText: b!.userEditedText ?? null,
			confidenceScore: b!.confidenceScore,
		};
	},
});
