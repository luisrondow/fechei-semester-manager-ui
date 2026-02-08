import { Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { getSemesterStatus } from "@/lib/semester-utils";
import type { Semester, Subject } from "@/lib/types";

function formatDateRange(startDate: string, endDate: string): string {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const opts: Intl.DateTimeFormatOptions = {
		month: "short",
		year: "numeric",
	};
	return `${start.toLocaleDateString("en-GB", opts)} \u2014 ${end.toLocaleDateString("en-GB", opts)}`;
}

export function SemesterCard({
	semester,
	subjects,
}: {
	semester: Semester;
	subjects: Subject[];
}) {
	const { t } = useI18n();
	const status = getSemesterStatus(semester);

	const statusConfig = {
		active: {
			label: t.semester.status.active,
			className: "bg-success/15 text-success border-success/25",
		},
		upcoming: {
			label: t.semester.status.upcoming,
			className: "bg-info/15 text-info border-info/25",
		},
		archived: {
			label: t.semester.status.archived,
			className: "bg-muted text-muted-foreground border-border",
		},
	};

	const statusInfo = statusConfig[status];

	return (
		<Link
			to="/semester/$semesterId"
			params={{ semesterId: semester.id }}
			className="group block"
		>
			<div className="bg-card rounded-xl border border-border p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
				{/* Top row */}
				<div className="flex items-start justify-between mb-4">
					<Badge variant="outline" className={statusInfo.className}>
						{statusInfo.label}
					</Badge>
					<ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
				</div>

				{/* Title */}
				<h3 className="font-display text-xl mb-3 group-hover:text-primary transition-colors">
					{semester.name}
				</h3>

				{/* Meta */}
				<div className="space-y-2 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<CalendarDays className="w-4 h-4 shrink-0" />
						<span>{formatDateRange(semester.startDate, semester.endDate)}</span>
					</div>
					<div className="flex items-center gap-2">
						<GraduationCap className="w-4 h-4 shrink-0" />
						<span>
							{t.semester.subjectCount.replace(
								"{count}",
								String(subjects.length),
							)}
						</span>
					</div>
				</div>

				{/* Subject pills preview */}
				{subjects.length > 0 && (
					<div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-1.5">
						{subjects.slice(0, 3).map((subject) => (
							<span
								key={subject.id}
								className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground"
							>
								{subject.code}
							</span>
						))}
						{subjects.length > 3 && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
								+{subjects.length - 3}
							</span>
						)}
					</div>
				)}
			</div>
		</Link>
	);
}
