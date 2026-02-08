import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	BookOpen,
	CalendarDays,
	FileText,
	GraduationCap,
	Trash2,
	Upload,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ExtractionProgress } from "@/components/extraction-progress";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrief } from "@/hooks/queries/use-briefs";
import { useEventsBySubject } from "@/hooks/queries/use-events";
import {
	usePUC,
	useUpdatePUCStatus,
	useUploadPUC,
} from "@/hooks/queries/use-puc";
import { useResourcesBySubject } from "@/hooks/queries/use-resources";
import { useDeleteSubject, useSubject } from "@/hooks/queries/use-subjects";
import { asId } from "@/lib/convex-helpers";
import { useI18n } from "@/lib/i18n";
import type { PUCProcessingStatus } from "@/lib/types";

export const Route = createFileRoute(
	"/semester/$semesterId/subject/$subjectId/",
)({
	component: SubjectOverviewPage,
});

function SubjectOverviewPage() {
	const { semesterId, subjectId } = Route.useParams();
	const { t } = useI18n();
	const navigate = useNavigate();
	const { data: subject, isLoading } = useSubject(subjectId);
	const { data: puc } = usePUC(subjectId);
	const { data: events = [] } = useEventsBySubject(subjectId);
	const { data: brief } = useBrief(subjectId);
	const { data: resourcesList = [] } = useResourcesBySubject(subjectId);
	const deleteSubject = useDeleteSubject(semesterId);
	const uploadPUC = useUploadPUC(subjectId, semesterId);
	const updatePUCStatus = useUpdatePUCStatus();

	const assessments = events.filter((e) => e.type === "assessment");
	const studyBlocks = events.filter((e) => e.type === "study_block");

	// PUC upload simulation
	const [uploadingStatus, setUploadingStatus] =
		useState<PUCProcessingStatus | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handlePUCUpload = useCallback(
		async (file: File) => {
			setUploadingStatus("uploading");
			const doc = await uploadPUC.mutateAsync({
				subjectId: asId<"subjects">(subjectId),
				fileName: file.name,
			});

			setTimeout(() => {
				setUploadingStatus("processing");
				updatePUCStatus.mutate({
					id: asId<"pucDocuments">(doc.id),
					status: "processing",
				});
			}, 1500);

			setTimeout(() => {
				setUploadingStatus("extracted");
				updatePUCStatus.mutate({
					id: asId<"pucDocuments">(doc.id),
					status: "extracted",
				});
				toast.success(t.puc.extracted);
			}, 4000);
		},
		[subjectId, uploadPUC, updatePUCStatus, t.puc.extracted],
	);

	const handleDelete = async () => {
		if (!subject) return;
		await deleteSubject.mutateAsync({ id: asId<"subjects">(subject.id) });
		toast.success(t.subject.deleted);
		navigate({
			to: "/semester/$semesterId",
			params: { semesterId },
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-20 rounded-lg" />
					))}
				</div>
			</div>
		);
	}

	if (!subject) {
		return (
			<EmptyState
				icon={GraduationCap}
				title={t.common.error}
				description="Subject not found"
			/>
		);
	}

	const hasPUC = puc?.status === "extracted";
	const showUploadProgress = uploadingStatus && uploadingStatus !== "extracted";

	return (
		<div className="space-y-8">
			{/* Stats ribbon */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{[
					{
						label: t.event.assessment,
						value: String(assessments.length),
						icon: CalendarDays,
					},
					{
						label: t.event.studyBlock,
						value: String(studyBlocks.length),
						icon: BookOpen,
					},
					{
						label: t.resource.title,
						value: String(resourcesList.length),
						icon: FileText,
					},
					{
						label: t.subject.brief,
						value: brief ? "1" : "0",
						icon: GraduationCap,
					},
				].map((stat) => (
					<div
						key={stat.label}
						className="bg-card rounded-lg border border-border p-4 flex items-center gap-3"
					>
						<div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
							<stat.icon className="w-4 h-4 text-primary" />
						</div>
						<div>
							<p className="text-2xl font-display leading-none">{stat.value}</p>
							<p className="text-xs text-muted-foreground mt-0.5">
								{stat.label}
							</p>
						</div>
					</div>
				))}
			</div>

			{/* PUC status section */}
			{showUploadProgress ? (
				<div className="space-y-2">
					<h3 className="font-display text-lg">{t.subject.pucStatus}</h3>
					<ExtractionProgress status={uploadingStatus} />
				</div>
			) : !hasPUC ? (
				<div className="rounded-xl border border-dashed border-border p-6 text-center space-y-3">
					<div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
						<Upload className="w-6 h-6 text-muted-foreground" />
					</div>
					<div>
						<p className="text-sm font-medium">{t.puc.noDocument}</p>
						<p className="text-xs text-muted-foreground mt-1">
							{t.puc.uploadHint}
						</p>
					</div>
					<input
						ref={fileInputRef}
						type="file"
						accept=".pdf"
						className="hidden"
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) handlePUCUpload(file);
						}}
					/>
					<Button
						variant="outline"
						size="sm"
						onClick={() => fileInputRef.current?.click()}
					>
						<Upload className="w-3.5 h-3.5 mr-1.5" />
						{t.puc.upload}
					</Button>
				</div>
			) : (
				<div className="rounded-xl border border-success/20 bg-success/5 p-4 flex items-center gap-3">
					<div className="w-9 h-9 rounded-lg bg-success/15 flex items-center justify-center shrink-0">
						<FileText className="w-4.5 h-4.5 text-success" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium">{t.puc.extracted}</p>
						<p className="text-xs text-muted-foreground truncate">
							{puc?.fileName}
						</p>
					</div>
					<Badge
						variant="outline"
						className="bg-success/15 text-success border-success/25 text-[10px]"
					>
						v{puc?.version}
					</Badge>
				</div>
			)}

			{/* Upcoming events preview */}
			{events.length > 0 && (
				<div>
					<div className="flex items-center justify-between mb-3">
						<h3 className="font-display text-lg">{t.subject.upcomingEvents}</h3>
						<Link
							to="/semester/$semesterId/subject/$subjectId/review"
							params={{ semesterId, subjectId }}
							className="text-xs text-primary hover:underline"
						>
							{t.common.viewAll}
						</Link>
					</div>
					<div className="space-y-2">
						{events.slice(0, 3).map((event) => {
							const typeConfig = {
								study_block: {
									bg: "bg-event-study/10",
									text: "text-event-study",
									label: t.event.studyBlock,
								},
								assessment: {
									bg: "bg-event-assessment/10",
									text: "text-event-assessment",
									label: t.event.assessment,
								},
								tbd: {
									bg: "bg-event-tbd/10",
									text: "text-event-tbd",
									label: t.event.tbd,
								},
							};
							const cfg = typeConfig[event.type as keyof typeof typeConfig];

							return (
								<div
									key={event.id}
									className="flex items-center gap-3 rounded-lg border border-border p-3"
								>
									<div
										className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}
									>
										<CalendarDays className={`w-4 h-4 ${cfg.text}`} />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium truncate">
											{event.title}
										</p>
										<p className="text-xs text-muted-foreground">
											{new Date(event.startDate).toLocaleDateString("en-GB", {
												day: "numeric",
												month: "short",
											})}
											{event.startDate !== event.endDate &&
												` \u2014 ${new Date(event.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
										</p>
									</div>
									<Badge
										variant="outline"
										className={`${cfg.bg} ${cfg.text} border-transparent text-[10px]`}
									>
										{cfg.label}
									</Badge>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Danger zone */}
			<div className="pt-4 border-t border-border">
				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="text-destructive-foreground"
						>
							<Trash2 className="w-3.5 h-3.5 mr-1.5" />
							{t.subject.delete}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t.subject.delete}</DialogTitle>
							<DialogDescription>{t.subject.deleteConfirm}</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">{t.common.cancel}</Button>
							</DialogClose>
							<Button variant="destructive" onClick={handleDelete}>
								{t.common.delete}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
