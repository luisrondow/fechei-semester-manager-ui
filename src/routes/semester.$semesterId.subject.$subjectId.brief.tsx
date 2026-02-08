import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { BriefEditor } from "@/components/brief-editor";
import { EmptyState } from "@/components/layout/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrief } from "@/hooks/queries/use-briefs";
import { usePUC } from "@/hooks/queries/use-puc";
import { useSemester } from "@/hooks/queries/use-semesters";
import { useI18n } from "@/lib/i18n";
import { isSemesterArchived } from "@/lib/semester-utils";

export const Route = createFileRoute(
	"/semester/$semesterId/subject/$subjectId/brief",
)({
	component: BriefPage,
});

function BriefPage() {
	const { semesterId, subjectId } = Route.useParams();
	const { t } = useI18n();
	const { data: semester } = useSemester(semesterId);
	const { data: puc, isLoading: pucLoading } = usePUC(subjectId);
	const { data: brief, isLoading: briefLoading } = useBrief(subjectId);

	const isArchived = semester ? isSemesterArchived(semester) : false;

	if (pucLoading || briefLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 rounded-xl" />
			</div>
		);
	}

	if (!puc || puc.status !== "extracted" || !brief) {
		return (
			<EmptyState
				icon={BookOpen}
				title={t.brief.noBrief}
				description={t.brief.noBriefDescription}
			/>
		);
	}

	return (
		<BriefEditor brief={brief} subjectId={subjectId} readOnly={isArchived} />
	);
}
