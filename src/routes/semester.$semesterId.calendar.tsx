import { createFileRoute, Link } from "@tanstack/react-router";
import {
	BookOpen,
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	HelpCircle,
	Megaphone,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EventList } from "@/components/event-list";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventsBySemester } from "@/hooks/queries/use-events";
import { useSemester } from "@/hooks/queries/use-semesters";
import { useSubjectsBySemester } from "@/hooks/queries/use-subjects";
import { useI18n } from "@/lib/i18n";
import type { CalendarEvent } from "@/lib/types";

export const Route = createFileRoute("/semester/$semesterId/calendar")({
	component: CalendarPage,
});

const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAYS_PT = ["Seg", "Ter", "Qua", "Qui", "Sex", "S\u00e1b", "Dom"];

function getMonthDays(year: number, month: number) {
	const firstDay = new Date(year, month, 1);
	// Shift so Monday = 0
	let startDow = firstDay.getDay() - 1;
	if (startDow < 0) startDow = 6;

	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const days: Array<{ date: Date; inMonth: boolean }> = [];

	// Leading days from previous month
	for (let i = startDow - 1; i >= 0; i--) {
		const d = new Date(year, month, -i);
		days.push({ date: d, inMonth: false });
	}

	// Current month
	for (let i = 1; i <= daysInMonth; i++) {
		days.push({ date: new Date(year, month, i), inMonth: true });
	}

	// Trailing days to fill grid (6 rows max)
	while (days.length % 7 !== 0) {
		const d = new Date(
			year,
			month + 1,
			days.length - startDow - daysInMonth + 1,
		);
		days.push({ date: d, inMonth: false });
	}

	return days;
}

function dateStr(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function eventOnDate(event: CalendarEvent, date: string): boolean {
	return event.startDate <= date && event.endDate >= date;
}

const typeConfig = {
	study_block: {
		bg: "bg-event-study",
		text: "text-white",
		icon: BookOpen,
	},
	assessment: {
		bg: "bg-event-assessment",
		text: "text-white",
		icon: CalendarDays,
	},
	announcement: {
		bg: "bg-event-announcement",
		text: "text-white",
		icon: Megaphone,
	},
	tbd: {
		bg: "bg-event-tbd",
		text: "text-white",
		icon: HelpCircle,
	},
};

function CalendarPage() {
	const { semesterId } = Route.useParams();
	const { t, locale } = useI18n();
	const { isLoading: semLoading } = useSemester(semesterId);
	const { data: events = [], isLoading: evtLoading } =
		useEventsBySemester(semesterId);
	const { data: subjects = [] } = useSubjectsBySemester(semesterId);

	const subjectNames: Record<string, string> = {};
	for (const s of subjects) {
		subjectNames[s.id] = s.name;
	}

	const today = new Date();
	const [year, setYear] = useState(today.getFullYear());
	const [month, setMonth] = useState(today.getMonth());
	const [selectedDate, setSelectedDate] = useState<string | null>(null);

	const days = useMemo(() => getMonthDays(year, month), [year, month]);
	const weekdays = locale === "pt" ? WEEKDAYS_PT : WEEKDAYS_EN;

	const monthLabel = new Date(year, month).toLocaleDateString(
		locale === "pt" ? "pt-PT" : "en-GB",
		{ month: "long", year: "numeric" },
	);

	const goBack = () => {
		if (month === 0) {
			setMonth(11);
			setYear(year - 1);
		} else {
			setMonth(month - 1);
		}
		setSelectedDate(null);
	};

	const goForward = () => {
		if (month === 11) {
			setMonth(0);
			setYear(year + 1);
		} else {
			setMonth(month + 1);
		}
		setSelectedDate(null);
	};

	const goToday = () => {
		setYear(today.getFullYear());
		setMonth(today.getMonth());
		setSelectedDate(null);
	};

	const selectedEvents = selectedDate
		? events.filter((e) => eventOnDate(e, selectedDate))
		: [];

	if (semLoading || evtLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-9 w-48" />
				<Skeleton className="h-96 rounded-xl" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title={t.calendar.title}
				actions={
					<Button variant="outline" size="sm" asChild>
						<Link to="/semester/$semesterId" params={{ semesterId }}>
							{t.common.back}
						</Link>
					</Button>
				}
			/>

			{/* Month navigation */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={goBack}
					>
						<ChevronLeft className="w-4 h-4" />
					</Button>
					<h2 className="font-display text-xl capitalize min-w-[180px] text-center">
						{monthLabel}
					</h2>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={goForward}
					>
						<ChevronRight className="w-4 h-4" />
					</Button>
				</div>
				<Button variant="outline" size="sm" onClick={goToday}>
					{t.calendar.today}
				</Button>
			</div>

			{/* Calendar grid */}
			<div className="rounded-xl border border-border bg-card overflow-hidden">
				{/* Weekday headers */}
				<div className="grid grid-cols-7 border-b border-border">
					{weekdays.map((day) => (
						<div
							key={day}
							className="py-2 text-center text-xs font-medium text-muted-foreground"
						>
							{day}
						</div>
					))}
				</div>

				{/* Day cells */}
				<div className="grid grid-cols-7">
					{days.map(({ date, inMonth }) => {
						const ds = dateStr(date);
						const isToday = ds === dateStr(today);
						const isSelected = ds === selectedDate;
						const dayEvents = events.filter((e) => eventOnDate(e, ds));

						return (
							<button
								key={ds}
								type="button"
								onClick={() => setSelectedDate(isSelected ? null : ds)}
								className={`
									relative min-h-[80px] p-1.5 border-b border-r border-border text-left transition-colors
									${!inMonth ? "bg-muted/30" : ""}
									${isSelected ? "bg-primary/5 ring-1 ring-primary/30" : "hover:bg-muted/50"}
								`}
							>
								<span
									className={`
										inline-flex items-center justify-center w-6 h-6 text-xs rounded-full
										${isToday ? "bg-primary text-primary-foreground font-bold" : ""}
										${!inMonth ? "text-muted-foreground/50" : "text-foreground"}
									`}
								>
									{date.getDate()}
								</span>

								{/* Event dots/pills */}
								<div className="mt-0.5 space-y-0.5">
									{dayEvents.slice(0, 3).map((evt) => {
										const cfg = typeConfig[evt.type as keyof typeof typeConfig];
										return (
											<div
												key={evt.id}
												className={`${cfg.bg} ${cfg.text} rounded px-1 py-px text-[9px] leading-tight truncate`}
											>
												{evt.title}
											</div>
										);
									})}
									{dayEvents.length > 3 && (
										<span className="text-[9px] text-muted-foreground">
											+{dayEvents.length - 3}
										</span>
									)}
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{/* Selected date events */}
			{selectedDate && (
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<h3 className="font-display text-lg">
							{new Date(selectedDate).toLocaleDateString(
								locale === "pt" ? "pt-PT" : "en-GB",
								{ weekday: "long", day: "numeric", month: "long" },
							)}
						</h3>
						<Badge variant="outline" className="text-[10px]">
							{selectedEvents.length}{" "}
							{selectedEvents.length === 1 ? "event" : "events"}
						</Badge>
					</div>
					<EventList events={selectedEvents} subjectNames={subjectNames} />
				</div>
			)}

			{/* Legend */}
			<div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
				{(
					[
						["study_block", t.event.studyBlock],
						["assessment", t.event.assessment],
						["announcement", t.event.announcement],
						["tbd", t.event.tbd],
					] as const
				).map(([type, label]) => (
					<div key={type} className="flex items-center gap-1.5">
						<div className={`w-3 h-3 rounded-sm ${typeConfig[type].bg}`} />
						<span>{label}</span>
					</div>
				))}
			</div>
		</div>
	);
}
