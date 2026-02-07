import { BookOpen, CalendarDays, HelpCircle } from "lucide-react";
import { StatusChip } from "@/components/status-chip";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import type { CalendarEvent } from "@/lib/types";

const typeConfig = {
	study_block: {
		bg: "bg-event-study/10",
		text: "text-event-study",
		icon: BookOpen,
	},
	assessment: {
		bg: "bg-event-assessment/10",
		text: "text-event-assessment",
		icon: CalendarDays,
	},
	tbd: {
		bg: "bg-event-tbd/10",
		text: "text-event-tbd",
		icon: HelpCircle,
	},
};

interface EventCardProps {
	event: CalendarEvent;
	subjectName?: string;
	compact?: boolean;
}

export function EventCard({ event, subjectName, compact }: EventCardProps) {
	const { t } = useI18n();
	const cfg = typeConfig[event.type];
	const typeLabels = {
		study_block: t.event.studyBlock,
		assessment: t.event.assessment,
		tbd: t.event.tbd,
	};

	const dateOpts: Intl.DateTimeFormatOptions = {
		day: "numeric",
		month: "short",
	};

	return (
		<div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
			<div
				className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}
			>
				<cfg.icon className={`w-4 h-4 ${cfg.text}`} />
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium truncate">{event.title}</p>
				<p className="text-xs text-muted-foreground">
					{subjectName && (
						<span className="mr-1.5">{subjectName} &middot;</span>
					)}
					{new Date(event.startDate).toLocaleDateString("en-GB", dateOpts)}
					{event.startDate !== event.endDate &&
						` \u2014 ${new Date(event.endDate).toLocaleDateString("en-GB", dateOpts)}`}
				</p>
			</div>
			{!compact && (
				<div className="flex items-center gap-1.5 shrink-0">
					<Badge
						variant="outline"
						className={`${cfg.bg} ${cfg.text} border-transparent text-[10px]`}
					>
						{typeLabels[event.type]}
					</Badge>
					<StatusChip status={event.status} />
				</div>
			)}
		</div>
	);
}
