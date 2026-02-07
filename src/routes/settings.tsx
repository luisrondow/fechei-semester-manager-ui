import { createFileRoute } from "@tanstack/react-router";
import { Globe, Languages } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { t } = useI18n();

	return (
		<div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
			<PageHeader title={t.settings.title} />

			<div className="space-y-6">
				{/* Language */}
				<div className="rounded-xl border border-border bg-card p-6">
					<div className="flex items-start gap-4">
						<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
							<Languages className="w-5 h-5 text-primary" />
						</div>
						<div className="flex-1">
							<h3 className="font-medium text-sm mb-1">
								{t.settings.language}
							</h3>
							<p className="text-xs text-muted-foreground mb-3">
								{t.settings.languageDescription}
							</p>
							<LocaleSwitcher />
						</div>
					</div>
				</div>

				{/* Timezone */}
				<div className="rounded-xl border border-border bg-card p-6">
					<div className="flex items-start gap-4">
						<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
							<Globe className="w-5 h-5 text-primary" />
						</div>
						<div className="flex-1">
							<h3 className="font-medium text-sm mb-1">
								{t.settings.timezone}
							</h3>
							<p className="text-xs text-muted-foreground mb-3">
								{t.settings.timezoneDescription}
							</p>
							<p className="text-sm font-medium">
								{Intl.DateTimeFormat().resolvedOptions().timeZone}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
