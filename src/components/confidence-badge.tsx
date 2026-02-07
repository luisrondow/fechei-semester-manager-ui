import { Badge } from "@/components/ui/badge";

export function ConfidenceBadge({ score }: { score: number }) {
	const pct = Math.round(score * 100);

	let className: string;
	if (pct >= 90) {
		className = "bg-success/15 text-success border-success/25";
	} else if (pct >= 70) {
		className = "bg-warning/15 text-warning border-warning/25";
	} else {
		className =
			"bg-destructive/15 text-destructive-foreground border-destructive/25";
	}

	return (
		<Badge variant="outline" className={`${className} text-[10px]`}>
			{pct}%
		</Badge>
	);
}
