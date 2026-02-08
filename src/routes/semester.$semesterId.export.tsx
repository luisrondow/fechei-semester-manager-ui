import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Download, FileText } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventsBySemester } from "@/hooks/queries/use-events";
import { useSemester } from "@/hooks/queries/use-semesters";
import { useSubjectsBySemester } from "@/hooks/queries/use-subjects";
import { downloadICS, type ExportMode } from "@/lib/api/calendar-export";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/semester/$semesterId/export")({
	component: ExportPage,
});

function ExportPage() {
	const { semesterId } = Route.useParams();
	const { t } = useI18n();
	const { data: semester, isLoading: semLoading } = useSemester(semesterId);
	const { data: events = [], isLoading: evtLoading } =
		useEventsBySemester(semesterId);
	const { data: subjects = [] } = useSubjectsBySemester(semesterId);

	const subjectNames = useMemo(() => {
		const map: Record<string, string> = {};
		for (const s of subjects) {
			map[s.id] = s.name;
		}
		return map;
	}, [subjects]);

	const assessments = events.filter(
		(e) => e.type === "assessment" || e.type === "tbd",
	);

	const handleExport = (mode: ExportMode) => {
		if (!semester) return;
		try {
			downloadICS({
				events,
				subjectNames,
				semesterName: semester.name,
				timezone: semester.timezone,
				mode,
			});
			toast.success(t.export.downloaded);
		} catch {
			toast.error(t.common.error);
		}
	};

	if (semLoading || evtLoading) {
		return (
			<div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
				<Skeleton className="h-9 w-48" />
				<Skeleton className="h-48 rounded-xl" />
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
			<PageHeader
				title={t.export.title}
				actions={
					<Button variant="outline" size="sm" asChild>
						<Link to="/semester/$semesterId" params={{ semesterId }}>
							{t.common.back}
						</Link>
					</Button>
				}
			/>

			<div className="space-y-4">
				{/* Full calendar export */}
				<div className="rounded-xl border border-border bg-card p-6">
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-start gap-4">
							<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
								<CalendarDays className="w-5 h-5 text-primary" />
							</div>
							<div>
								<h3 className="font-medium text-sm mb-1">{t.export.full}</h3>
								<p className="text-xs text-muted-foreground mb-2">
									{t.export.fullDescription}
								</p>
								<Badge variant="secondary" className="text-xs">
									{events.length} events
								</Badge>
							</div>
						</div>
						<Button size="sm" onClick={() => handleExport("full")}>
							<Download className="w-4 h-4 mr-1.5" />
							{t.export.download}
						</Button>
					</div>
				</div>

				{/* Due dates only export */}
				<div className="rounded-xl border border-border bg-card p-6">
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-start gap-4">
							<div className="w-10 h-10 rounded-lg bg-event-assessment/10 flex items-center justify-center shrink-0">
								<FileText className="w-5 h-5 text-event-assessment" />
							</div>
							<div>
								<h3 className="font-medium text-sm mb-1">{t.export.dueOnly}</h3>
								<p className="text-xs text-muted-foreground mb-2">
									{t.export.dueDescription}
								</p>
								<Badge variant="secondary" className="text-xs">
									{assessments.length} events
								</Badge>
							</div>
						</div>
						<Button
							size="sm"
							variant="outline"
							onClick={() => handleExport("due_only")}
						>
							<Download className="w-4 h-4 mr-1.5" />
							{t.export.download}
						</Button>
					</div>
				</div>
			</div>

			{/* Info */}
			<p className="text-xs text-muted-foreground text-center">
				{t.export.importHint}
			</p>
		</div>
	);
}
