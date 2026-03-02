import { createFileRoute } from "@tanstack/react-router";
import {
	BookOpen,
	CalendarDays,
	Check,
	CheckCircle2,
	Clock,
	HelpCircle,
	Megaphone,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { StatusChip } from "@/components/status-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
	useConfirmEvent,
	useCreateEvent,
	useDeleteEvent,
	useEventsBySubject,
	useUpdateEvent,
} from "@/hooks/queries/use-events";
import { usePUC } from "@/hooks/queries/use-puc";
import { useSemester } from "@/hooks/queries/use-semesters";
import { asId } from "@/lib/convex-helpers";
import { useI18n } from "@/lib/i18n";
import { isSemesterArchived } from "@/lib/semester-utils";
import type { CalendarEvent, EventType } from "@/lib/types";

export const Route = createFileRoute(
	"/semester/$semesterId/subject/$subjectId/review",
)({
	component: ReviewPage,
});

function ReviewPage() {
	const { semesterId, subjectId } = Route.useParams();
	const { t } = useI18n();
	const { data: semester } = useSemester(semesterId);
	const isArchived = semester ? isSemesterArchived(semester) : false;
	const createEvent = useCreateEvent(subjectId, semesterId);
	const updateEvent = useUpdateEvent(subjectId, semesterId);
	const deleteEvent = useDeleteEvent(subjectId, semesterId);

	const { data: puc, isLoading: pucLoading } = usePUC(subjectId);
	const { data: events = [], isLoading: evtLoading } =
		useEventsBySubject(subjectId);
	const [isCreatingEvent, setIsCreatingEvent] = useState(false);
	const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
	const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(
		null,
	);

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
			{!isArchived && (
				<div className="flex justify-end">
					<Button size="sm" onClick={() => setIsCreatingEvent(true)}>
						<Plus className="mr-1 h-4 w-4" />
						{t.event.createEvent}
					</Button>
				</div>
			)}

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
					<span className="text-sm">
						{events.length} {t.event.total}
					</span>
				</div>
			</div>

			{events.length === 0 ? (
				<EmptyState
					icon={CalendarDays}
					title={t.event.noEvents}
					description={t.event.noEventsDescription}
				/>
			) : (
				<div className="space-y-3">
					{events.map((event) => (
						<EventReviewCard
							key={event.id}
							event={event}
							subjectId={subjectId}
							semesterId={semesterId}
							readOnly={isArchived}
							onEdit={() => setEditingEvent(event)}
							onDelete={() => setEventToDelete(event)}
						/>
					))}
				</div>
			)}

			{isCreatingEvent && (
				<EventFormDialog
					mode="create"
					onClose={() => setIsCreatingEvent(false)}
					onSave={async (values) => {
						await createEvent({
							subjectId: asId<"subjects">(subjectId),
							type: values.type,
							title: values.title,
							description: values.description,
							startDate: values.startDate,
							endDate: values.endDate,
						});
						toast.success(t.event.created);
						setIsCreatingEvent(false);
					}}
				/>
			)}

			{editingEvent && (
				<EventFormDialog
					mode="edit"
					key={editingEvent.id}
					event={editingEvent}
					onClose={() => setEditingEvent(null)}
					onSave={async (values) => {
						await updateEvent({
							id: asId<"calendarEvents">(editingEvent.id),
							type: values.type,
							title: values.title,
							description: values.description,
							startDate: values.startDate,
							endDate: values.endDate,
						});
						toast.success(t.event.updated);
						setEditingEvent(null);
					}}
				/>
			)}

			{eventToDelete && (
				<DeleteEventDialog
					event={eventToDelete}
					onClose={() => setEventToDelete(null)}
					onConfirm={async (event) => {
						await deleteEvent({ id: asId<"calendarEvents">(event.id) });
						toast.success(t.event.deleted);
						setEventToDelete(null);
					}}
				/>
			)}
		</div>
	);
}

function EventReviewCard({
	event,
	subjectId,
	semesterId,
	readOnly,
	onEdit,
	onDelete,
}: {
	event: CalendarEvent;
	subjectId: string;
	semesterId: string;
	readOnly: boolean;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const { t } = useI18n();
	const confirmEvent = useConfirmEvent(subjectId, semesterId);

	const handleConfirm = async () => {
		await confirmEvent({ id: asId<"calendarEvents">(event.id) });
		toast.success(t.event.confirmed);
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
		announcement: {
			bg: "bg-event-announcement/10",
			border: "border-event-announcement/20",
			text: "text-event-announcement",
			label: t.event.announcement,
			icon: Megaphone,
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

				{!readOnly && (
					<div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
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
						<div className="flex flex-wrap justify-end gap-2">
							<Button variant="outline" size="sm" onClick={onEdit}>
								<Pencil className="w-3.5 h-3.5 mr-1" />
								{t.common.edit}
							</Button>
							<Button variant="outline" size="sm" onClick={onDelete}>
								<Trash2 className="w-3.5 h-3.5 mr-1" />
								{t.common.delete}
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

type EditableEventValues = {
	type: EventType;
	title: string;
	description: string;
	startDate: string;
	endDate: string;
};

type EventFormDialogProps =
	| {
			mode: "create";
			event?: never;
			onClose: () => void;
			onSave: (values: EditableEventValues) => Promise<void>;
	  }
	| {
			mode: "edit";
			event: CalendarEvent;
			onClose: () => void;
			onSave: (values: EditableEventValues) => Promise<void>;
	  };

function EventFormDialog(props: EventFormDialogProps) {
	const { t } = useI18n();
	const formId = useId();
	const today = new Date().toISOString().slice(0, 10);
	const initialValues: EditableEventValues =
		props.mode === "edit"
			? {
					type: props.event.type,
					title: props.event.title,
					description: props.event.description,
					startDate: props.event.startDate,
					endDate: props.event.endDate,
				}
			: {
					type: "study_block",
					title: "",
					description: "",
					startDate: today,
					endDate: today,
				};
	const [values, setValues] = useState<EditableEventValues>({
		...initialValues,
	});
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	const typeLabels: Record<EventType, string> = {
		study_block: t.event.studyBlock,
		assessment: t.event.assessment,
		announcement: t.event.announcement,
		tbd: t.event.tbd,
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const nextValues = {
			...values,
			title: values.title.trim(),
			description: values.description.trim(),
		};

		if (!nextValues.title) return;
		if (nextValues.endDate < nextValues.startDate) {
			setError(t.event.dateRangeError);
			return;
		}

		setError(null);
		setSaving(true);
		try {
			await props.onSave(nextValues);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open onOpenChange={(open) => !open && props.onClose()}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>
							{props.mode === "create"
								? t.event.createEvent
								: t.event.editEvent}
						</DialogTitle>
						<DialogDescription>{t.puc.stepCalendarDesc}</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor={`${formId}-type`}>{t.event.typeLabel}</Label>
							<Select
								value={values.type}
								onValueChange={(value) =>
									setValues((current) => ({
										...current,
										type: value as EventType,
									}))
								}
							>
								<SelectTrigger id={`${formId}-type`} className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>{t.event.typeLabel}</SelectLabel>
										{(
											[
												"study_block",
												"assessment",
												"announcement",
												"tbd",
											] as const
										).map((type) => (
											<SelectItem key={type} value={type}>
												{typeLabels[type]}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor={`${formId}-title`}>{t.event.titleLabel}</Label>
							<Input
								id={`${formId}-title`}
								value={values.title}
								onChange={(e) =>
									setValues((current) => ({
										...current,
										title: e.target.value,
									}))
								}
								required
							/>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor={`${formId}-start`}>
									{t.event.startDateLabel}
								</Label>
								<Input
									id={`${formId}-start`}
									type="date"
									value={values.startDate}
									onChange={(e) =>
										setValues((current) => ({
											...current,
											startDate: e.target.value,
										}))
									}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor={`${formId}-end`}>{t.event.endDateLabel}</Label>
								<Input
									id={`${formId}-end`}
									type="date"
									value={values.endDate}
									onChange={(e) =>
										setValues((current) => ({
											...current,
											endDate: e.target.value,
										}))
									}
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor={`${formId}-description`}>
								{t.event.descriptionLabel}
							</Label>
							<Textarea
								id={`${formId}-description`}
								rows={4}
								value={values.description}
								onChange={(e) =>
									setValues((current) => ({
										...current,
										description: e.target.value,
									}))
								}
							/>
						</div>

						{props.mode === "edit" && (
							<div className="space-y-2">
								<Label>{t.event.sourceExcerptLabel}</Label>
								<div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
									{props.event.sourceExcerpt ?? t.event.noSourceExcerpt}
								</div>
							</div>
						)}

						{error && (
							<p className="text-sm text-destructive-foreground">{error}</p>
						)}
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={props.onClose}>
							{t.common.cancel}
						</Button>
						<Button type="submit" disabled={!values.title.trim() || saving}>
							{props.mode === "create" ? t.common.create : t.common.save}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function DeleteEventDialog({
	event,
	onClose,
	onConfirm,
}: {
	event: CalendarEvent;
	onClose: () => void;
	onConfirm: (event: CalendarEvent) => Promise<void>;
}) {
	const { t } = useI18n();
	const [deleting, setDeleting] = useState(false);

	const handleConfirm = async () => {
		setDeleting(true);
		try {
			await onConfirm(event);
		} finally {
			setDeleting(false);
		}
	};

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t.common.delete}</DialogTitle>
					<DialogDescription>{t.event.deleteConfirm}</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={onClose}>
						{t.common.cancel}
					</Button>
					<Button
						variant="destructive"
						onClick={handleConfirm}
						disabled={deleting}
					>
						{t.common.delete}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
