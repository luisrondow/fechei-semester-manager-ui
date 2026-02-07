import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute(
	"/semester/$semesterId/subject/$subjectId/brief",
)({
	component: BriefPage,
});

function BriefPage() {
	const { t } = useI18n();

	return (
		<EmptyState
			icon={BookOpen}
			title={t.brief.title}
			description={t.brief.comingSoon}
		/>
	);
}
