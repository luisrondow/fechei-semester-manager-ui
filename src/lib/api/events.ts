import {
	confirmEvent as confirmEventInStore,
	getEventsBySemester,
	getEventsBySubject,
	updateEvent as updateEventInStore,
} from "@/data/mock/store";
import type { CalendarEvent } from "@/lib/types";

function delay(ms = 100): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchEventsBySemester(
	semesterId: string,
): Promise<CalendarEvent[]> {
	await delay(100);
	return getEventsBySemester(semesterId);
}

export async function fetchEventsBySubject(
	subjectId: string,
): Promise<CalendarEvent[]> {
	await delay(80);
	return getEventsBySubject(subjectId);
}

export async function updateEvent(
	id: string,
	data: Partial<
		Pick<
			CalendarEvent,
			"title" | "description" | "startDate" | "endDate" | "status"
		>
	>,
): Promise<CalendarEvent> {
	await delay(120);
	const updated = updateEventInStore(id, data);
	if (!updated) throw new Error(`Event not found: ${id}`);
	return updated;
}

export async function confirmEvent(id: string): Promise<CalendarEvent> {
	await delay(100);
	const confirmed = confirmEventInStore(id);
	if (!confirmed) throw new Error(`Event not found: ${id}`);
	return confirmed;
}
