import { Archive } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function ArchiveBanner() {
	const { t } = useI18n();

	return (
		<div className="flex items-center gap-2 rounded-lg border border-warning/25 bg-warning/10 p-3 text-sm text-warning-foreground">
			<Archive className="w-4 h-4 shrink-0" />
			<p>{t.archive.readOnlyBanner}</p>
		</div>
	);
}
