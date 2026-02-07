import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute(
	"/semester/$semesterId/subject/$subjectId/resources",
)({
	component: ResourcesPage,
});

function ResourcesPage() {
	const { t } = useI18n();

	return (
		<EmptyState
			icon={FileText}
			title={t.resource.title}
			description={t.resource.comingSoon}
		/>
	);
}
