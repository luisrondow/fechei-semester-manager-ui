import { FileText, HelpCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function PUCExplainerCard() {
	const { t } = useI18n();

	return (
		<div className="rounded-xl border border-info/20 bg-info/5 p-5">
			<div className="flex items-start gap-3">
				<div className="w-9 h-9 rounded-lg bg-info/15 flex items-center justify-center shrink-0">
					<HelpCircle className="w-4.5 h-4.5 text-info" />
				</div>
				<div>
					<h4 className="text-sm font-medium mb-1">{t.puc.whatsThis}</h4>
					<p className="text-xs text-muted-foreground leading-relaxed">
						{t.puc.explainerDescription}
					</p>
					<div className="mt-3 flex items-center gap-2 text-xs text-info">
						<FileText className="w-3.5 h-3.5" />
						<span>{t.puc.explainerFormat}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
