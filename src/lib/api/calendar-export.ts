import {
	getEventsBySemester,
	getSemester,
	getSubject,
} from "@/data/mock/store";
import type { CalendarEvent } from "@/lib/types";

function formatICSDate(dateStr: string): string {
	return dateStr.replace(/-/g, "");
}

function escapeICS(text: string): string {
	return text
		.replace(/\\/g, "\\\\")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
		.replace(/\n/g, "\\n");
}

function stableUID(eventId: string): string {
	return `${eventId}@fechei.app`;
}

function buildVEvent(event: CalendarEvent, subjectName: string): string {
	const lines = [
		"BEGIN:VEVENT",
		`UID:${stableUID(event.id)}`,
		`DTSTART;VALUE=DATE:${formatICSDate(event.startDate)}`,
		`DTEND;VALUE=DATE:${formatICSDate(event.endDate)}`,
		`SUMMARY:${escapeICS(`[${subjectName}] ${event.title}`)}`,
	];

	if (event.description) {
		lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
	}

	const categories =
		event.type === "assessment"
			? "ASSESSMENT"
			: event.type === "study_block"
				? "STUDY"
				: "TBD";
	lines.push(`CATEGORIES:${categories}`);
	lines.push(
		`STATUS:${event.status === "confirmed" ? "CONFIRMED" : "TENTATIVE"}`,
	);
	lines.push("END:VEVENT");

	return lines.join("\r\n");
}

export type ExportMode = "full" | "due_only";

export function generateICS(
	semesterId: string,
	mode: ExportMode = "full",
): string {
	const semester = getSemester(semesterId);
	if (!semester) throw new Error(`Semester not found: ${semesterId}`);

	let events = getEventsBySemester(semesterId);

	if (mode === "due_only") {
		events = events.filter((e) => e.type === "assessment" || e.type === "tbd");
	}

	const calName = `Fechei - ${semester.name}`;

	const lines = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Fechei//Semester Manager//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		`X-WR-CALNAME:${escapeICS(calName)}`,
		`X-WR-TIMEZONE:${semester.timezone}`,
	];

	for (const event of events) {
		const subject = getSubject(event.subjectId);
		const subjectName = subject?.name ?? "Unknown";
		lines.push(buildVEvent(event, subjectName));
	}

	lines.push("END:VCALENDAR");
	return lines.join("\r\n");
}

export function downloadICS(semesterId: string, mode: ExportMode): void {
	const ics = generateICS(semesterId, mode);
	const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = `fechei-calendar-${mode}.ics`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
