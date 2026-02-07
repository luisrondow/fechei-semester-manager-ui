import {
	addSubject,
	getSubject,
	getSubjectsBySemester,
	removeSubject,
} from "@/data/mock/store";
import type { CreateSubjectInput, Subject } from "@/lib/types";

function delay(ms = 100): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchSubjectsBySemester(
	semesterId: string,
): Promise<Subject[]> {
	await delay(100);
	return getSubjectsBySemester(semesterId);
}

export async function fetchSubject(id: string): Promise<Subject> {
	await delay(80);
	const subject = getSubject(id);
	if (!subject) throw new Error(`Subject not found: ${id}`);
	return subject;
}

export async function createSubject(
	input: CreateSubjectInput,
): Promise<Subject> {
	await delay(150);
	return addSubject(input);
}

export async function deleteSubject(id: string): Promise<void> {
	await delay(100);
	const removed = removeSubject(id);
	if (!removed) throw new Error(`Subject not found: ${id}`);
}
