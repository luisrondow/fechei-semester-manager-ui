import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "../types";
import { generateICS } from "./calendar-export";

function makeEvent(overrides: Partial<CalendarEvent>): CalendarEvent {
	return {
		id: "evt_1",
		subjectId: "subject_1",
		type: "assessment",
		startDate: "2026-05-10",
		endDate: "2026-05-10",
		title: "Default event",
		description: "Default description",
		status: "pending",
		sourceExcerpt: null,
		createdAt: "2026-03-02T00:00:00.000Z",
		updatedAt: "2026-03-02T00:00:00.000Z",
		...overrides,
	};
}

describe("generateICS", () => {
	it("uses the ANNOUNCEMENT category for announcement events", () => {
		const ics = generateICS({
			events: [
				makeEvent({
					type: "announcement",
					title: "Grade release date announced",
				}),
			],
			subjectNames: { subject_1: "Algorithms" },
			semesterName: "2025/26",
			timezone: "Europe/Lisbon",
			mode: "full",
		});

		expect(ics).toContain("CATEGORIES:ANNOUNCEMENT");
		expect(ics).toContain("SUMMARY:[Algorithms] Grade release date announced");
	});

	it("excludes announcement events from due-only exports", () => {
		const ics = generateICS({
			events: [
				makeEvent({
					id: "evt_announcement",
					type: "announcement",
					title: "Exam date announcement",
				}),
				makeEvent({
					id: "evt_tbd",
					type: "tbd",
					title: "Exam date TBD",
				}),
			],
			subjectNames: { subject_1: "Algorithms" },
			semesterName: "2025/26",
			timezone: "Europe/Lisbon",
			mode: "due_only",
		});

		expect(ics).not.toContain("SUMMARY:[Algorithms] Exam date announcement");
		expect(ics).toContain("SUMMARY:[Algorithms] Exam date TBD");
	});
});
