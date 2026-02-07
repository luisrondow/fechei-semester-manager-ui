import {
	ExternalLink,
	MoreHorizontal,
	Pencil,
	Pin,
	PinOff,
	Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";
import type { Resource } from "@/lib/types";

interface ResourceItemProps {
	resource: Resource;
	onTogglePin: (id: string) => void;
	onEdit: (resource: Resource) => void;
	onDelete: (id: string) => void;
}

export function ResourceItem({
	resource,
	onTogglePin,
	onEdit,
	onDelete,
}: ResourceItemProps) {
	const { t } = useI18n();

	const typeLabels: Record<string, string> = {
		required: t.resource.required,
		complementary: t.resource.complementary,
		other: t.resource.other,
	};

	const typeColors: Record<string, string> = {
		required: "bg-primary/10 text-primary border-primary/25",
		complementary: "bg-info/10 text-info border-info/25",
		other: "bg-muted text-muted-foreground border-transparent",
	};

	const sourceLabels: Record<string, string> = {
		puc_extracted: t.resource.pucExtracted,
		user_saved: t.resource.userSaved,
	};

	return (
		<div
			className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
				resource.pinned
					? "border-primary/20 bg-primary/5"
					: "border-border bg-card"
			}`}
		>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2 mb-1">
					<h4 className="text-sm font-medium truncate">{resource.title}</h4>
					{resource.pinned && (
						<Pin className="w-3 h-3 text-primary shrink-0 fill-primary" />
					)}
				</div>

				{resource.authors && (
					<p className="text-xs text-muted-foreground mb-1.5">
						{resource.authors}
					</p>
				)}

				{resource.notes && (
					<p className="text-xs text-muted-foreground mb-2 line-clamp-2">
						{resource.notes}
					</p>
				)}

				<div className="flex items-center gap-1.5 flex-wrap">
					<Badge
						variant="outline"
						className={`text-[10px] ${typeColors[resource.resourceType]}`}
					>
						{typeLabels[resource.resourceType]}
					</Badge>
					<Badge variant="outline" className="text-[10px]">
						{sourceLabels[resource.sourceType]}
					</Badge>
					{resource.tags.map((tag) => (
						<Badge key={tag} variant="secondary" className="text-[10px] px-1.5">
							{tag}
						</Badge>
					))}
				</div>
			</div>

			<div className="flex items-center gap-1 shrink-0">
				{resource.url && (
					<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
						<a href={resource.url} target="_blank" rel="noopener noreferrer">
							<ExternalLink className="w-3.5 h-3.5" />
						</a>
					</Button>
				)}

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<MoreHorizontal className="w-4 h-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onTogglePin(resource.id)}>
							{resource.pinned ? (
								<PinOff className="w-4 h-4 mr-2" />
							) : (
								<Pin className="w-4 h-4 mr-2" />
							)}
							{resource.pinned ? t.resource.unpin : t.resource.pin}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onEdit(resource)}>
							<Pencil className="w-4 h-4 mr-2" />
							{t.common.edit}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => onDelete(resource.id)}
							className="text-destructive"
						>
							<Trash2 className="w-4 h-4 mr-2" />
							{t.common.delete}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
