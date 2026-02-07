import { createFileRoute } from "@tanstack/react-router";
import {
	BookOpen,
	CalendarDays,
	Check,
	CheckCircle2,
	Clock,
	HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { StatusChip } from "@/components/status-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	useConfirmEvent,
	useEventsBySubject,
} from "@/hooks/queries/use-events";
import { usePUC } from "@/hooks/queries/use-puc";
import { useI18n } from "@/lib/i18n";
import type { CalendarEvent } from "@/lib/types";

export const Route = createFileRoute(
	"/semester/$semesterId/subject/$subjectId/review",
)({
	component: ReviewPage,
});

function ReviewPage() {
	const { semesterId, subjectId } = Route.useParams();
	const { t } = useI18n();

	const { data: puc, isLoading: pucLoading } = usePUC(subjectId);
	const { data: events = [], isLoading: evtLoading } =
		useEventsBySubject(subjectId);

	const confirmedCount = events.filter((e) => e.status === "confirmed").length;
	const pendingCount = events.filter((e) => e.status === "pending").length;

	if (pucLoading || evtLoading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-24 rounded-xl" />
				))}
			</div>
		);
	}

	if (!puc || puc.status !== "extracted") {
		return (
			<EmptyState
				icon={CalendarDays}
				title={t.puc.noExtraction}
				description={t.puc.uploadFirst}
			/>
		);
	}

	return (
		<div className="space-y-6">
			{/* Summary bar */}
			<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
				<div className="flex items-center gap-2">
					<CheckCircle2 className="w-4 h-4 text-success" />
					<span className="text-sm">
						{confirmedCount} {t.event.confirmed.toLowerCase()}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Clock className="w-4 h-4 text-warning" />
					<span className="text-sm">
						{pendingCount} {t.event.pending.toLowerCase()}
					</span>
				</div>
				<div className="flex items-center gap-2 text-muted-foreground">
					<CalendarDays className="w-4 h-4" />
					<span className="text-sm">{events.length} total</span>
				</div>
			</div>

			{/* Events list */}
			<div className="space-y-3">
				{events.map((event) => (
					<EventReviewCard
						key={event.id}
						event={event}
						subjectId={subjectId}
						semesterId={semesterId}
					/>
				))}
			</div>
		</div>
	);
}

function EventReviewCard({
	event,
	subjectId,
	semesterId,
}: {
	event: CalendarEvent;
	subjectId: string;
	semesterId: string;
}) {
	const { t } = useI18n();
	const confirmEvent = useConfirmEvent(subjectId, semesterId);

	const handleConfirm = () => {
		confirmEvent.mutate(event.id, {
			onSuccess: () => toast.success(t.event.confirmed),
		});
	};

	const typeConfig = {
		study_block: {
			bg: "bg-event-study/10",
			border: "border-event-study/20",
			text: "text-event-study",
			label: t.event.studyBlock,
			icon: BookOpen,
		},
		assessment: {
			bg: "bg-event-assessment/10",
			border: "border-event-assessment/20",
			text: "text-event-assessment",
			label: t.event.assessment,
			icon: CalendarDays,
		},
		tbd: {
			bg: "bg-event-tbd/10",
			border: "border-event-tbd/20",
			text: "text-event-tbd",
			label: t.event.tbd,
			icon: HelpCircle,
		},
	};

	const cfg = typeConfig[event.type];
	const dateOpts: Intl.DateTimeFormatOptions = {
		day: "numeric",
		month: "short",
		year: "numeric",
	};

	return (
		<div
			className={`rounded-xl border ${event.status === "confirmed" ? "border-border" : cfg.border} bg-card p-5 transition-all`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-3 min-w-0">
					<div
						className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}
					>
						<cfg.icon className={`w-5 h-5 ${cfg.text}`} />
					</div>
					<div className="min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<Badge
								variant="outline"
								className={`${cfg.bg} ${cfg.text} border-transparent text-[10px]`}
							>
								{cfg.label}
							</Badge>
							<StatusChip status={event.status} />
						</div>

						<h4 className="font-medium text-sm mb-1">{event.title}</h4>

						<p className="text-xs text-muted-foreground mb-2">
							{new Date(event.startDate).toLocaleDateString("en-GB", dateOpts)}
							{event.startDate !== event.endDate &&
								` \u2014 ${new Date(event.endDate).toLocaleDateString("en-GB", dateOpts)}`}
						</p>

						{event.description && (
							<p className="text-xs text-muted-foreground line-clamp-2">
								{event.description}
							</p>
						)}

						{event.sourceExcerpt && (
							<div className="mt-2 px-3 py-2 bg-muted/50 rounded-md border-l-2 border-primary/30">
								<p className="text-[11px] text-muted-foreground italic">
									{event.sourceExcerpt}
								</p>
							</div>
						)}
					</div>
				</div>

				{event.status === "pending" && (
					<Button
						variant="outline"
						size="sm"
						className="shrink-0"
						onClick={handleConfirm}
					>
						<Check className="w-3.5 h-3.5 mr-1" />
						{t.event.confirm}
					</Button>
				)}
			</div>
		</div>
	);
}
