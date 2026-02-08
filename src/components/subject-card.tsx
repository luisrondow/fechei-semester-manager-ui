import { Link } from "@tanstack/react-router";
import { ChevronRight, FileText, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import type { PUCProcessingStatus, Subject } from "@/lib/types";

function PUCStatusBadge({ status }: { status: PUCProcessingStatus | null }) {
	const { t } = useI18n();

	if (!status) {
		return (
			<Badge
				variant="outline"
				className="bg-muted/50 text-muted-foreground border-border text-[10px]"
			>
				{t.subject.uploadPuc}
			</Badge>
		);
	}

	const config: Record<
		PUCProcessingStatus,
		{ label: string; className: string }
	> = {
		uploading: {
			label: t.puc.processing,
			className: "bg-warning/15 text-warning border-warning/25",
		},
		processing: {
			label: t.puc.processing,
			className: "bg-info/15 text-info border-info/25",
		},
		extracted: {
			label: t.puc.extracted,
			className: "bg-success/15 text-success border-success/25",
		},
		error: {
			label: t.puc.error,
			className:
				"bg-destructive/15 text-destructive-foreground border-destructive/25",
		},
	};

	const c = config[status];
	return (
		<Badge variant="outline" className={`${c.className} text-[10px]`}>
			{c.label}
		</Badge>
	);
}

export function SubjectCard({
	subject,
	semesterId,
	pucStatus,
	pucFileName,
}: {
	subject: Subject;
	semesterId: string;
	pucStatus?: string | null;
	pucFileName?: string | null;
}) {
	return (
		<Link
			to="/semester/$semesterId/subject/$subjectId"
			params={{ semesterId, subjectId: subject.id }}
			className="group block"
		>
			<div className="bg-card rounded-xl border border-border p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5">
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center gap-2">
						<Badge
							variant="outline"
							className="text-[10px] uppercase tracking-wider"
						>
							{subject.code}
						</Badge>
						<PUCStatusBadge
							status={(pucStatus as PUCProcessingStatus) ?? null}
						/>
					</div>
					<ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
				</div>

				<h3 className="font-display text-lg group-hover:text-primary transition-colors mb-1.5">
					{subject.name}
				</h3>

				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<GraduationCap className="w-3.5 h-3.5 shrink-0" />
					<span>{subject.instructor}</span>
				</div>

				{pucStatus === "extracted" && pucFileName && (
					<div className="mt-3 pt-3 border-t border-border">
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<FileText className="w-3 h-3" />
							<span className="truncate">{pucFileName}</span>
						</div>
					</div>
				)}
			</div>
		</Link>
	);
}
