import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	BookOpen,
	CalendarDays,
	ChevronRight,
	ExternalLink,
	GraduationCap,
	Pin,
} from "lucide-react";
import { useMemo } from "react";
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getResourcesBySubject,
	getSubjectsBySemester,
} from "@/data/mock/store";
import { useEventsBySemester } from "@/hooks/queries/use-events";
import { useSemesters } from "@/hooks/queries/use-semesters";
import { useI18n } from "@/lib/i18n";
import type { CalendarEvent, Resource, Semester, Subject } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
	component: DashboardPage,
});

function getActiveSemester(semesters: Semester[]): Semester | undefined {
	const now = new Date();
	// Prefer active semester
	const active = semesters.find((s) => {
		const start = new Date(s.startDate);
		const end = new Date(s.endDate);
		return now >= start && now <= end;
	});
	if (active) return active;
	// Fall back to most recently created
	return semesters.length > 0
		? [...semesters].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
		: undefined;
}

function DashboardPage() {
	const { t } = useI18n();
	const navigate = useNavigate();
	const { data: semesters = [], isLoading: semLoading } = useSemesters();

	const activeSemester = useMemo(
		() => getActiveSemester(semesters),
		[semesters],
	);

	const { data: allEvents = [], isLoading: evtLoading } = useEventsBySemester(
		activeSemester?.id ?? "",
	);

	const subjects = useMemo(
		() => (activeSemester ? getSubjectsBySemester(activeSemester.id) : []),
		[activeSemester],
	);

	const subjectNames = useMemo(() => {
		const map: Record<string, string> = {};
		for (const s of subjects) {
			map[s.id] = s.name;
		}
		return map;
	}, [subjects]);

	const { upcoming, thisWeek, needsConfirmation, pinnedResources } =
		useMemo(() => {
			const now = new Date();
			const todayStr = dateStr(now);
			const weekEnd = new Date(now);
			weekEnd.setDate(weekEnd.getDate() + 7);
			const weekEndStr = dateStr(weekEnd);

			const upcoming = allEvents
				.filter(
					(e) =>
						e.type === "assessment" &&
						e.startDate >= todayStr &&
						e.startDate <= weekEndStr,
				)
				.sort((a, b) => a.startDate.localeCompare(b.startDate));

			const thisWeek = allEvents
				.filter(
					(e) =>
						e.type === "study_block" &&
						e.startDate <= weekEndStr &&
						e.endDate >= todayStr,
				)
				.sort((a, b) => a.startDate.localeCompare(b.startDate));

			const needsConfirmation = allEvents.filter((e) => e.status === "pending");

			const pinned: Array<Resource & { subjectName: string }> = [];
			for (const sub of subjects) {
				const res = getResourcesBySubject(sub.id);
				for (const r of res) {
					if (r.pinned) {
						pinned.push({ ...r, subjectName: sub.name });
					}
				}
			}

			return {
				upcoming,
				thisWeek,
				needsConfirmation,
				pinnedResources: pinned,
			};
		}, [allEvents, subjects]);

	if (semLoading || evtLoading) {
		return (
			<div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
				<Skeleton className="h-9 w-48" />
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-48 rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	if (semesters.length === 0) {
		return (
			<div className="max-w-5xl mx-auto px-6 py-10">
				<EmptyState
					icon={GraduationCap}
					title={t.dashboard.empty.title}
					description={t.dashboard.empty.description}
					actionLabel={t.dashboard.empty.cta}
					onAction={() => navigate({ to: "/semesters" })}
				/>
			</div>
		);
	}

	return (
		<div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
			<PageHeader
				title={t.dashboard.welcome}
				actions={
					activeSemester && (
						<Button variant="outline" size="sm" asChild>
							<Link
								to="/semester/$semesterId"
								params={{ semesterId: activeSemester.id }}
							>
								{activeSemester.name}
								<ChevronRight className="w-4 h-4 ml-1" />
							</Link>
						</Button>
					)
				}
			/>

			{/* Stats overview */}
			{activeSemester && (
				<StatsRibbon
					subjects={subjects}
					events={allEvents}
					semester={activeSemester}
				/>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Upcoming Deadlines */}
				<DashboardSection
					title={t.dashboard.upcomingDeadlines}
					icon={CalendarDays}
					count={upcoming.length}
				>
					{upcoming.length === 0 ? (
						<p className="text-sm text-muted-foreground py-4">
							{t.dashboard.noUpcoming}
						</p>
					) : (
						<div className="space-y-2">
							{upcoming.slice(0, 5).map((event) => (
								<EventCard
									key={event.id}
									event={event}
									subjectName={subjectNames[event.subjectId]}
									compact
								/>
							))}
						</div>
					)}
				</DashboardSection>

				{/* This Week's Topics */}
				<DashboardSection
					title={t.dashboard.thisWeek}
					icon={BookOpen}
					count={thisWeek.length}
				>
					{thisWeek.length === 0 ? (
						<p className="text-sm text-muted-foreground py-4">
							{t.dashboard.nothingThisWeek}
						</p>
					) : (
						<div className="space-y-2">
							{thisWeek.slice(0, 5).map((event) => (
								<EventCard
									key={event.id}
									event={event}
									subjectName={subjectNames[event.subjectId]}
									compact
								/>
							))}
						</div>
					)}
				</DashboardSection>

				{/* Needs Confirmation */}
				<DashboardSection
					title={t.dashboard.needsConfirmation}
					icon={AlertCircle}
					count={needsConfirmation.length}
				>
					{needsConfirmation.length === 0 ? (
						<p className="text-sm text-muted-foreground py-4">
							{t.dashboard.allConfirmed}
						</p>
					) : (
						<div className="space-y-2">
							{needsConfirmation.slice(0, 5).map((event) => (
								<EventCard
									key={event.id}
									event={event}
									subjectName={subjectNames[event.subjectId]}
									compact
								/>
							))}
							{needsConfirmation.length > 5 && activeSemester && (
								<Link
									to="/semester/$semesterId/calendar"
									params={{ semesterId: activeSemester.id }}
									className="text-xs text-primary hover:underline block pt-1"
								>
									{t.common.viewAll} ({needsConfirmation.length})
								</Link>
							)}
						</div>
					)}
				</DashboardSection>

				{/* Pinned Resources */}
				<DashboardSection
					title={t.dashboard.pinnedResources}
					icon={Pin}
					count={pinnedResources.length}
				>
					{pinnedResources.length === 0 ? (
						<p className="text-sm text-muted-foreground py-4">
							{t.dashboard.noPinned}
						</p>
					) : (
						<div className="space-y-2">
							{pinnedResources.slice(0, 5).map((resource) => (
								<PinnedResourceRow key={resource.id} resource={resource} />
							))}
						</div>
					)}
				</DashboardSection>
			</div>
		</div>
	);
}

function StatsRibbon({
	subjects,
	events,
	semester,
}: {
	subjects: Subject[];
	events: CalendarEvent[];
	semester: Semester;
}) {
	const { t } = useI18n();

	const assessments = events.filter((e) => e.type === "assessment").length;
	const confirmed = events.filter((e) => e.status === "confirmed").length;

	return (
		<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
			{[
				{
					label: t.semester.subjects,
					value: String(subjects.length),
					icon: GraduationCap,
				},
				{
					label: t.event.assessment,
					value: String(assessments),
					icon: CalendarDays,
				},
				{
					label: t.event.studyBlock,
					value: String(events.filter((e) => e.type === "study_block").length),
					icon: BookOpen,
				},
				{
					label: t.event.confirmed,
					value: `${confirmed}/${events.length}`,
					icon: AlertCircle,
				},
			].map((stat) => (
				<Link
					key={stat.label}
					to="/semester/$semesterId"
					params={{ semesterId: semester.id }}
					className="bg-card rounded-lg border border-border p-4 flex items-center gap-3 hover:border-primary/30 transition-colors"
				>
					<div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
						<stat.icon className="w-4 h-4 text-primary" />
					</div>
					<div>
						<p className="text-2xl font-display leading-none">{stat.value}</p>
						<p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
					</div>
				</Link>
			))}
		</div>
	);
}

function DashboardSection({
	title,
	icon: Icon,
	count,
	children,
}: {
	title: string;
	icon: React.ElementType;
	count: number;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-xl border border-border bg-card p-5">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<Icon className="w-4 h-4 text-muted-foreground" />
					<h3 className="font-display text-base">{title}</h3>
				</div>
				{count > 0 && (
					<Badge variant="secondary" className="text-xs">
						{count}
					</Badge>
				)}
			</div>
			{children}
		</div>
	);
}

function PinnedResourceRow({
	resource,
}: {
	resource: Resource & { subjectName: string };
}) {
	return (
		<div className="flex items-center gap-3 rounded-lg border border-border p-3">
			<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
				<Pin className="w-4 h-4 text-primary fill-primary" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium truncate">{resource.title}</p>
				<p className="text-xs text-muted-foreground truncate">
					{resource.subjectName}
					{resource.authors && ` \u2014 ${resource.authors}`}
				</p>
			</div>
			{resource.url && (
				<a
					href={resource.url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-muted-foreground hover:text-primary transition-colors shrink-0"
				>
					<ExternalLink className="w-3.5 h-3.5" />
				</a>
			)}
		</div>
	);
}

function dateStr(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
