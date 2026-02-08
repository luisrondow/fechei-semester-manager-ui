import { FileText } from "lucide-react";
import { useMemo } from "react";
import { EmptyState } from "@/components/layout/empty-state";
import { ResourceItem } from "@/components/resource-item";
import { useI18n } from "@/lib/i18n";
import type { Resource } from "@/lib/types";

interface ResourceListProps {
	resources: Resource[];
	readOnly?: boolean;
	onTogglePin?: (id: string) => void;
	onEdit?: (resource: Resource) => void;
	onDelete?: (id: string) => void;
}

export function ResourceList({
	resources,
	readOnly,
	onTogglePin,
	onEdit,
	onDelete,
}: ResourceListProps) {
	const { t } = useI18n();

	const sorted = useMemo(() => {
		return [...resources].sort((a, b) => {
			// Pinned first
			if (a.pinned && !b.pinned) return -1;
			if (!a.pinned && b.pinned) return 1;
			// Then by resource type: required > complementary > other
			const typeOrder = { required: 0, complementary: 1, other: 2 };
			const typeA = typeOrder[a.resourceType];
			const typeB = typeOrder[b.resourceType];
			if (typeA !== typeB) return typeA - typeB;
			// Then by creation date (newest first)
			return b.createdAt.localeCompare(a.createdAt);
		});
	}, [resources]);

	if (resources.length === 0) {
		return (
			<EmptyState
				icon={FileText}
				title={t.resource.empty}
				description={t.resource.emptyDescription}
			/>
		);
	}

	return (
		<div className="space-y-2">
			{sorted.map((resource) => (
				<ResourceItem
					key={resource.id}
					resource={resource}
					readOnly={readOnly}
					onTogglePin={onTogglePin}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
}
