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

export function generateICS(opts: {
	events: CalendarEvent[];
	subjectNames: Record<string, string>;
	semesterName: string;
	timezone: string;
	mode?: ExportMode;
}): string {
	const { subjectNames, semesterName, timezone, mode = "full" } = opts;
	let { events } = opts;

	if (mode === "due_only") {
		events = events.filter((e) => e.type === "assessment" || e.type === "tbd");
	}

	const calName = `Fechei - ${semesterName}`;

	const lines = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Fechei//Semester Manager//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		`X-WR-CALNAME:${escapeICS(calName)}`,
		`X-WR-TIMEZONE:${timezone}`,
	];

	for (const event of events) {
		const subjectName = subjectNames[event.subjectId] ?? "Unknown";
		lines.push(buildVEvent(event, subjectName));
	}

	lines.push("END:VCALENDAR");
	return lines.join("\r\n");
}

export function downloadICS(opts: {
	events: CalendarEvent[];
	subjectNames: Record<string, string>;
	semesterName: string;
	timezone: string;
	mode: ExportMode;
}): void {
	const ics = generateICS(opts);
	const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = `fechei-calendar-${opts.mode}.ics`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
