import { Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import type { EventStatus } from "@/lib/types";

export function StatusChip({ status }: { status: EventStatus }) {
	const { t } = useI18n();

	if (status === "confirmed") {
		return (
			<Badge
				variant="outline"
				className="bg-success/15 text-success border-success/25 text-[10px]"
			>
				<Check className="w-3 h-3 mr-0.5" />
				{t.event.confirmed}
			</Badge>
		);
	}

	return (
		<Badge
			variant="outline"
			className="bg-warning/15 text-warning border-warning/25 text-[10px]"
		>
			<Clock className="w-3 h-3 mr-0.5" />
			{t.event.pending}
		</Badge>
	);
}
