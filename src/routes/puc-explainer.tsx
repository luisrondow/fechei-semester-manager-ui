import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	BookOpen,
	CalendarDays,
	FileSearch,
	FileText,
	Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/puc-explainer")({
	component: PUCExplainerPage,
});

function PUCExplainerPage() {
	const { t } = useI18n();

	const steps = [
		{
			icon: Upload,
			title: t.puc.stepUpload,
			description: t.puc.stepUploadDesc,
		},
		{
			icon: FileSearch,
			title: t.puc.stepExtract,
			description: t.puc.stepExtractDesc,
		},
		{
			icon: CalendarDays,
			title: t.puc.stepCalendar,
			description: t.puc.stepCalendarDesc,
		},
		{
			icon: BookOpen,
			title: t.puc.stepBrief,
			description: t.puc.stepBriefDesc,
		},
	];

	return (
		<div className="max-w-2xl mx-auto px-6 py-8">
			<Button
				variant="ghost"
				size="sm"
				className="mb-8 -ml-2 text-muted-foreground"
				asChild
			>
				<Link to="/semesters">
					<ArrowLeft className="w-4 h-4 mr-1" />
					{t.common.back}
				</Link>
			</Button>

			<div className="mb-10">
				<div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
					<FileText className="w-7 h-7 text-primary" />
				</div>
				<h1 className="text-3xl font-display tracking-tight mb-3">
					{t.puc.whatsThis}
				</h1>
				<p className="text-muted-foreground leading-relaxed">
					{t.puc.explainerDescription}
				</p>
			</div>

			<div className="space-y-6">
				<h2 className="font-display text-xl">{t.puc.howItWorks}</h2>
				{steps.map((step, idx) => (
					<div key={step.title} className="flex gap-4">
						<div className="flex flex-col items-center">
							<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
								<step.icon className="w-5 h-5 text-primary" />
							</div>
							{idx < steps.length - 1 && (
								<div className="w-px flex-1 bg-border mt-2" />
							)}
						</div>
						<div className="pb-6">
							<h3 className="font-medium text-sm mb-1">{step.title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{step.description}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
