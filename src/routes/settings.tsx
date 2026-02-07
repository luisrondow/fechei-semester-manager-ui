import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { t } = useI18n();

	return (
		<div className="max-w-2xl mx-auto px-6 py-10">
			<PageHeader title={t.settings.title} description="Coming in Phase 6" />
		</div>
	);
}
