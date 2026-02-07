import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute(
	"/semester/$semesterId/subject/$subjectId/",
)({
	component: SubjectOverviewPage,
});

function SubjectOverviewPage() {
	const { t } = useI18n();

	return (
		<div className="py-4">
			<PageHeader title={t.subject.overview} description="Coming in Phase 2" />
		</div>
	);
}
