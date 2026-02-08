import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

/**
 * Throws a ConvexError if the semester's endDate has passed (archived).
 */
export async function assertNotArchived(
	ctx: MutationCtx,
	semesterId: Id<"semesters">,
) {
	const semester = await ctx.db.get(semesterId);
	if (!semester) {
		throw new ConvexError("Semester not found");
	}
	if (new Date() > new Date(semester.endDate)) {
		throw new ConvexError(
			"This semester is archived and cannot be modified.",
		);
	}
}

/**
 * Resolves the semesterId for a subject.
 */
export async function getSemesterIdForSubject(
	ctx: MutationCtx,
	subjectId: Id<"subjects">,
): Promise<Id<"semesters">> {
	const subject = await ctx.db.get(subjectId);
	if (!subject) {
		throw new ConvexError("Subject not found");
	}
	return subject.semesterId;
}

/**
 * Resolves the semesterId for a calendar event (event → subject → semester).
 */
export async function getSemesterIdForEvent(
	ctx: MutationCtx,
	eventId: Id<"calendarEvents">,
): Promise<Id<"semesters">> {
	const event = await ctx.db.get(eventId);
	if (!event) {
		throw new ConvexError("Event not found");
	}
	return getSemesterIdForSubject(ctx, event.subjectId);
}

/**
 * Resolves the semesterId for a resource (resource → subject → semester).
 */
export async function getSemesterIdForResource(
	ctx: MutationCtx,
	resourceId: Id<"resources">,
): Promise<Id<"semesters">> {
	const resource = await ctx.db.get(resourceId);
	if (!resource) {
		throw new ConvexError("Resource not found");
	}
	return getSemesterIdForSubject(ctx, resource.subjectId);
}

/**
 * Resolves the semesterId for a brief (brief → subject → semester).
 */
export async function getSemesterIdForBrief(
	ctx: MutationCtx,
	briefId: Id<"subjectBriefs">,
): Promise<Id<"semesters">> {
	const brief = await ctx.db.get(briefId);
	if (!brief) {
		throw new ConvexError("Brief not found");
	}
	return getSemesterIdForSubject(ctx, brief.subjectId);
}

/**
 * Resolves the semesterId for a PUC document (puc → subject → semester).
 */
export async function getSemesterIdForPuc(
	ctx: MutationCtx,
	pucId: Id<"pucDocuments">,
): Promise<Id<"semesters">> {
	const puc = await ctx.db.get(pucId);
	if (!puc) {
		throw new ConvexError("PUC document not found");
	}
	return getSemesterIdForSubject(ctx, puc.subjectId);
}
