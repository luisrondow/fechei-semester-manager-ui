export type Locale = "en" | "pt";

export type EventType = "study_block" | "assessment" | "tbd" | "announcement";
export type EventStatus = "pending" | "confirmed";
export type ResourceSourceType = "puc_extracted" | "user_saved";
export type ResourceType = "required" | "complementary" | "other";
export type PUCProcessingStatus =
	| "uploading"
	| "processing"
	| "extracted"
	| "error";

export interface Semester {
	id: string;
	userId: string;
	name: string;
	startDate: string;
	endDate: string;
	timezone: string;
	createdAt: string;
	updatedAt: string;
}

export interface Subject {
	id: string;
	semesterId: string;
	name: string;
	code: string;
	instructor: string;
	createdAt: string;
}

export interface PUCDocument {
	id: string;
	subjectId: string;
	fileName: string;
	extractedText: string | null;
	language: Locale;
	status: PUCProcessingStatus;
	version: number;
	storageId: string | null;
	uploadedAt: string;
}

export interface SubjectBrief {
	id: string;
	subjectId: string;
	generatedText: string;
	userEditedText: string | null;
	confidenceScore: number;
}

export interface CalendarEvent {
	id: string;
	subjectId: string;
	type: EventType;
	startDate: string;
	endDate: string;
	title: string;
	description: string;
	status: EventStatus;
	sourceExcerpt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface Resource {
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
}

export interface CreateSemesterInput {
	name: string;
	startDate: string;
	endDate: string;
	timezone: string;
}

export interface UpdateSemesterInput {
	name?: string;
	startDate?: string;
	endDate?: string;
	timezone?: string;
}

export interface CreateSubjectInput {
	semesterId: string;
	name: string;
	code: string;
	instructor: string;
}

export interface CreateResourceInput {
	subjectId: string;
	title: string;
	url: string;
	notes?: string;
	tags?: string[];
}

export interface UpdateResourceInput {
	title?: string;
	url?: string;
	notes?: string;
	tags?: string[];
}
