import { Check, FileSearch, Loader2, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import type { PUCProcessingStatus } from "@/lib/types";

interface ExtractionProgressProps {
	status: PUCProcessingStatus;
}

const steps: Array<{
	key: PUCProcessingStatus;
	icon: typeof Upload;
	labelKey: "uploading" | "processing" | "extracted";
}> = [
	{ key: "uploading", icon: Upload, labelKey: "uploading" },
	{ key: "processing", icon: FileSearch, labelKey: "processing" },
	{ key: "extracted", icon: Check, labelKey: "extracted" },
];

const statusOrder: Record<PUCProcessingStatus, number> = {
	uploading: 0,
	processing: 1,
	extracted: 2,
	error: -1,
};

export function ExtractionProgress({ status }: ExtractionProgressProps) {
	const { t } = useI18n();
	const currentIndex = statusOrder[status];
	const progressValue =
		status === "error" ? 0 : ((currentIndex + 1) / steps.length) * 100;

	const labels: Record<string, string> = {
		uploading: t.puc.uploading,
		processing: t.puc.processing,
		extracted: t.puc.extracted,
	};

	if (status === "error") {
		return (
			<div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
				<p className="text-sm font-medium text-destructive-foreground">
					{t.puc.error}
				</p>
				<p className="text-xs text-muted-foreground mt-1">{t.puc.errorRetry}</p>
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-border bg-card p-5 space-y-4">
			<Progress value={progressValue} className="h-1.5" />

			<div className="flex justify-between">
				{steps.map((step, idx) => {
					const isDone = currentIndex > idx;
					const isCurrent = currentIndex === idx;

					return (
						<div key={step.key} className="flex flex-col items-center gap-2">
							<div
								className={`
									w-9 h-9 rounded-full flex items-center justify-center transition-colors
									${isDone ? "bg-success/15 text-success" : ""}
									${isCurrent ? "bg-primary/15 text-primary" : ""}
									${!isDone && !isCurrent ? "bg-muted text-muted-foreground" : ""}
								`}
							>
								{isDone ? (
									<Check className="w-4 h-4" />
								) : isCurrent ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<step.icon className="w-4 h-4" />
								)}
							</div>
							<span
								className={`text-xs ${isCurrent ? "font-medium text-foreground" : "text-muted-foreground"}`}
							>
								{labels[step.labelKey]}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
