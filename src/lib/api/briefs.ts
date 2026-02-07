import {
	getBriefBySubject,
	updateBrief as updateBriefInStore,
} from "@/data/mock/store";
import type { SubjectBrief } from "@/lib/types";

function delay(ms = 100): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchSubjectBrief(
	subjectId: string,
): Promise<SubjectBrief | null> {
	await delay(80);
	return getBriefBySubject(subjectId) ?? null;
}

export async function updateSubjectBrief(
	briefId: string,
	userEditedText: string | null,
): Promise<SubjectBrief> {
	await delay(150);
	const updated = updateBriefInStore(briefId, { userEditedText });
	if (!updated) throw new Error(`Brief not found: ${briefId}`);
	return updated;
}
