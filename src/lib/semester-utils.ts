import type { Semester } from "@/lib/types";

export type SemesterStatus = "active" | "upcoming" | "archived";

export function isSemesterArchived(semester: { endDate: string }): boolean {
	return new Date() > new Date(semester.endDate);
}

export function getSemesterStatus(semester: {
	startDate: string;
	endDate: string;
}): SemesterStatus {
	const now = new Date();
	const start = new Date(semester.startDate);
	const end = new Date(semester.endDate);
	if (now > end) return "archived";
	if (now < start) return "upcoming";
	return "active";
}

export function getActiveSemester(semesters: Semester[]): {
	semester: Semester | undefined;
	hasOverlap: boolean;
} {
	const now = new Date();

	// Filter out archived semesters
	const nonArchived = semesters.filter((s) => !isSemesterArchived(s));

	// Find active semesters (today within date range)
	const active = nonArchived.filter((s) => {
		const start = new Date(s.startDate);
		const end = new Date(s.endDate);
		return now >= start && now <= end;
	});

	if (active.length > 1) {
		// Multiple overlap — pick latest startDate
		const sorted = [...active].sort((a, b) =>
			b.startDate.localeCompare(a.startDate),
		);
		return { semester: sorted[0], hasOverlap: true };
	}

	if (active.length === 1) {
		return { semester: active[0], hasOverlap: false };
	}

	// No active semester
	return { semester: undefined, hasOverlap: false };
}

export function dateStr(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
