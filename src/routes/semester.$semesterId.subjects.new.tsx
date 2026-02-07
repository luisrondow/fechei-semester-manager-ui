import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/semester/$semesterId/subjects/new")({
	component: NewSubjectPage,
});

function NewSubjectPage() {
	const { semesterId } = Route.useParams();
	const { t } = useI18n();

	return (
		<div className="max-w-2xl py-4">
			<Button
				variant="ghost"
				size="sm"
				className="mb-6 -ml-2 text-muted-foreground"
				asChild
			>
				<Link to="/semester/$semesterId" params={{ semesterId }}>
					<ArrowLeft className="w-4 h-4 mr-1" />
					{t.common.back}
				</Link>
			</Button>

			<PageHeader title={t.subject.add} description="Coming in Phase 2" />
		</div>
	);
}
