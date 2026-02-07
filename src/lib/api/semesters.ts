import {
	addSemester,
	getSemester,
	getSemesters,
	removeSemester,
	updateSemester as updateSemesterInStore,
} from "@/data/mock/store";
import type {
	CreateSemesterInput,
	Semester,
	UpdateSemesterInput,
} from "@/lib/types";

function delay(ms = 100): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchSemesters(): Promise<Semester[]> {
	await delay(120);
	return getSemesters();
}

export async function fetchSemester(id: string): Promise<Semester> {
	await delay(80);
	const semester = getSemester(id);
	if (!semester) throw new Error(`Semester not found: ${id}`);
	return semester;
}

export async function createSemester(
	input: CreateSemesterInput,
): Promise<Semester> {
	await delay(150);
	return addSemester(input);
}

export async function updateSemester(
	id: string,
	input: UpdateSemesterInput,
): Promise<Semester> {
	await delay(120);
	const updated = updateSemesterInStore(id, input);
	if (!updated) throw new Error(`Semester not found: ${id}`);
	return updated;
}

export async function deleteSemester(id: string): Promise<void> {
	await delay(100);
	const removed = removeSemester(id);
	if (!removed) throw new Error(`Semester not found: ${id}`);
}
