import type {
	CalendarEvent,
	PUCDocument,
	Resource,
	Semester,
	Subject,
	SubjectBrief,
} from "@/lib/types";
import {
	seedBriefs,
	seedEvents,
	seedPUCDocuments,
	seedResources,
	seedSemesters,
	seedSubjects,
} from "./seed";

let semesters: Semester[] = [...seedSemesters];
let subjects: Subject[] = [...seedSubjects];
let pucDocuments: PUCDocument[] = [...seedPUCDocuments];
let briefs: SubjectBrief[] = [...seedBriefs];
let events: CalendarEvent[] = [...seedEvents];
let resources: Resource[] = [...seedResources];

function genId(prefix: string): string {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function now(): string {
	return new Date().toISOString();
}

// --- Semesters ---

export function getSemesters(): Semester[] {
	return [...semesters];
}

export function getSemester(id: string): Semester | undefined {
	return semesters.find((s) => s.id === id);
}

export function addSemester(
	data: Omit<Semester, "id" | "userId" | "createdAt" | "updatedAt">,
): Semester {
	const semester: Semester = {
		...data,
		id: genId("sem"),
		userId: "user-1",
		createdAt: now(),
		updatedAt: now(),
	};
	semesters = [...semesters, semester];
	return semester;
}

export function updateSemester(
	id: string,
	data: Partial<Pick<Semester, "name" | "startDate" | "endDate" | "timezone">>,
): Semester | undefined {
	const idx = semesters.findIndex((s) => s.id === id);
	if (idx === -1) return undefined;
	semesters = semesters.map((s) =>
		s.id === id ? { ...s, ...data, updatedAt: now() } : s,
	);
	return semesters[idx];
}

export function removeSemester(id: string): boolean {
	const len = semesters.length;
	semesters = semesters.filter((s) => s.id !== id);
	subjects = subjects.filter((s) => s.semesterId !== id);
	return semesters.length < len;
}

// --- Subjects ---

export function getSubjectsBySemester(semesterId: string): Subject[] {
	return subjects.filter((s) => s.semesterId === semesterId);
}

export function getSubject(id: string): Subject | undefined {
	return subjects.find((s) => s.id === id);
}

export function addSubject(data: Omit<Subject, "id" | "createdAt">): Subject {
	const subject: Subject = {
		...data,
		id: genId("sub"),
		createdAt: now(),
	};
	subjects = [...subjects, subject];
	return subject;
}

export function removeSubject(id: string): boolean {
	const len = subjects.length;
	subjects = subjects.filter((s) => s.id !== id);
	return subjects.length < len;
}

// --- PUC Documents ---

export function getPUCBySubject(subjectId: string): PUCDocument | undefined {
	return pucDocuments.find((p) => p.subjectId === subjectId);
}

export function addPUCDocument(
	data: Omit<PUCDocument, "id" | "uploadedAt">,
): PUCDocument {
	const doc: PUCDocument = {
		...data,
		id: genId("puc"),
		uploadedAt: now(),
	};
	pucDocuments = [...pucDocuments, doc];
	return doc;
}

export function updatePUCStatus(
	id: string,
	status: PUCDocument["status"],
): void {
	pucDocuments = pucDocuments.map((p) => (p.id === id ? { ...p, status } : p));
}

// --- Briefs ---

export function getBriefBySubject(subjectId: string): SubjectBrief | undefined {
	return briefs.find((b) => b.subjectId === subjectId);
}

export function updateBrief(
	id: string,
	data: Partial<Pick<SubjectBrief, "userEditedText">>,
): SubjectBrief | undefined {
	const idx = briefs.findIndex((b) => b.id === id);
	if (idx === -1) return undefined;
	briefs = briefs.map((b) => (b.id === id ? { ...b, ...data } : b));
	return briefs[idx];
}

// --- Events ---

export function getEventsBySemester(semesterId: string): CalendarEvent[] {
	const subjectIds = subjects
		.filter((s) => s.semesterId === semesterId)
		.map((s) => s.id);
	return events.filter((e) => subjectIds.includes(e.subjectId));
}

export function getEventsBySubject(subjectId: string): CalendarEvent[] {
	return events.filter((e) => e.subjectId === subjectId);
}

export function updateEvent(
	id: string,
	data: Partial<
		Pick<
			CalendarEvent,
			"title" | "description" | "startDate" | "endDate" | "status"
		>
	>,
): CalendarEvent | undefined {
	const idx = events.findIndex((e) => e.id === id);
	if (idx === -1) return undefined;
	events = events.map((e) =>
		e.id === id ? { ...e, ...data, updatedAt: now() } : e,
	);
	return events[idx];
}

export function confirmEvent(id: string): CalendarEvent | undefined {
	return updateEvent(id, { status: "confirmed" });
}

// --- Resources ---

export function getResourcesBySubject(subjectId: string): Resource[] {
	return resources.filter((r) => r.subjectId === subjectId);
}

export function addResource(
	data: Omit<Resource, "id" | "createdAt" | "updatedAt">,
): Resource {
	const resource: Resource = {
		...data,
		id: genId("res"),
		createdAt: now(),
		updatedAt: now(),
	};
	resources = [...resources, resource];
	return resource;
}

export function updateResource(
	id: string,
	data: Partial<Pick<Resource, "title" | "url" | "notes" | "tags" | "pinned">>,
): Resource | undefined {
	const idx = resources.findIndex((r) => r.id === id);
	if (idx === -1) return undefined;
	resources = resources.map((r) =>
		r.id === id ? { ...r, ...data, updatedAt: now() } : r,
	);
	return resources[idx];
}

export function removeResource(id: string): boolean {
	const len = resources.length;
	resources = resources.filter((r) => r.id !== id);
	return resources.length < len;
}

export function togglePinResource(id: string): Resource | undefined {
	const resource = resources.find((r) => r.id === id);
	if (!resource) return undefined;
	return updateResource(id, { pinned: !resource.pinned });
}
