import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	actionLabel?: string;
	onAction?: () => void;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	actionLabel,
	onAction,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-20 px-6 text-center">
			<div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
				<Icon className="w-8 h-8 text-muted-foreground" />
			</div>
			<h3 className="font-display text-xl mb-2">{title}</h3>
			<p className="text-muted-foreground text-sm max-w-sm mb-6">
				{description}
			</p>
			{actionLabel && onAction && (
				<Button onClick={onAction}>{actionLabel}</Button>
			)}
		</div>
	);
}
