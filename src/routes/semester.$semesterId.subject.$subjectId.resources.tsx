import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { toast } from "sonner";
import { ResourceList } from "@/components/resource-list";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
	useCreateResource,
	useDeleteResource,
	useResourcesBySubject,
	useTogglePin,
	useUpdateResource,
} from "@/hooks/queries/use-resources";
import { useSemester } from "@/hooks/queries/use-semesters";
import { asId } from "@/lib/convex-helpers";
import { useI18n } from "@/lib/i18n";
import { isSemesterArchived } from "@/lib/semester-utils";
import type { Resource } from "@/lib/types";

export const Route = createFileRoute(
	"/semester/$semesterId/subject/$subjectId/resources",
)({
	component: ResourcesPage,
});

function ResourcesPage() {
	const { semesterId, subjectId } = Route.useParams();
	const { t } = useI18n();
	const { data: semester } = useSemester(semesterId);
	const isArchived = semester ? isSemesterArchived(semester) : false;

	const { data: resources = [], isLoading } = useResourcesBySubject(subjectId);
	const createResource = useCreateResource(subjectId);
	const updateResource = useUpdateResource(subjectId);
	const deleteResource = useDeleteResource(subjectId);
	const togglePin = useTogglePin(subjectId);

	const [addOpen, setAddOpen] = useState(false);
	const [editingResource, setEditingResource] = useState<Resource | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const handleTogglePin = useCallback(
		(id: string) => {
			const resource = resources.find((r) => r.id === id);
			togglePin.mutate(
				{ id: asId<"resources">(id) },
				{
					onSuccess: () => {
						toast.success(
							resource?.pinned ? t.resource.unpinned : t.resource.pinned,
						);
					},
				},
			);
		},
		[togglePin, resources, t.resource.pinned, t.resource.unpinned],
	);

	const handleDelete = useCallback(
		(id: string) => {
			deleteResource.mutate(
				{ id: asId<"resources">(id) },
				{
					onSuccess: () => {
						toast.success(t.resource.deleted);
						setDeleteId(null);
					},
				},
			);
		},
		[deleteResource, t.resource.deleted],
	);

	if (isLoading) {
		return (
			<div className="space-y-3">
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-24 rounded-xl" />
				))}
			</div>
		);
	}

	if (isArchived) {
		return (
			<div className="space-y-4">
				<ResourceList resources={resources} readOnly />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header with add button */}
			<div className="flex items-center justify-end">
				<Dialog open={addOpen} onOpenChange={setAddOpen}>
					<DialogTrigger asChild>
						<Button size="sm">
							<Plus className="w-4 h-4 mr-1" />
							{t.resource.add}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<ResourceForm
							subjectId={subjectId}
							onSave={async (data) => {
								await createResource.mutateAsync({
									...data,
									subjectId: asId<"subjects">(data.subjectId),
								});
								toast.success(t.resource.created);
								setAddOpen(false);
							}}
							onCancel={() => setAddOpen(false)}
						/>
					</DialogContent>
				</Dialog>
			</div>

			{/* Resource list */}
			<ResourceList
				resources={resources}
				onTogglePin={handleTogglePin}
				onEdit={(resource) => setEditingResource(resource)}
				onDelete={(id) => setDeleteId(id)}
			/>

			{/* Edit dialog */}
			<Dialog
				open={editingResource !== null}
				onOpenChange={(open) => {
					if (!open) setEditingResource(null);
				}}
			>
				<DialogContent>
					{editingResource && (
						<ResourceForm
							subjectId={subjectId}
							resource={editingResource}
							onSave={async (data) => {
								await updateResource.mutateAsync({
									id: asId<"resources">(editingResource.id),
									title: data.title,
									url: data.url,
									notes: data.notes,
									tags: data.tags,
								});
								toast.success(t.resource.updated);
								setEditingResource(null);
							}}
							onCancel={() => setEditingResource(null)}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete confirmation dialog */}
			<Dialog
				open={deleteId !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteId(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t.common.delete}</DialogTitle>
						<DialogDescription>{t.resource.deleteConfirm}</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">{t.common.cancel}</Button>
						</DialogClose>
						<Button
							variant="destructive"
							onClick={() => deleteId && handleDelete(deleteId)}
						>
							{t.common.delete}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function ResourceForm({
	subjectId,
	resource,
	onSave,
	onCancel,
}: {
	subjectId: string;
	resource?: Resource;
	onSave: (data: {
		subjectId: string;
		title: string;
		url: string;
		notes?: string;
		tags?: string[];
	}) => Promise<void>;
	onCancel: () => void;
}) {
	const { t } = useI18n();
	const formId = useId();
	const [title, setTitle] = useState(resource?.title ?? "");
	const [url, setUrl] = useState(resource?.url ?? "");
	const [notes, setNotes] = useState(resource?.notes ?? "");
	const [tagsInput, setTagsInput] = useState(resource?.tags.join(", ") ?? "");
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		setSaving(true);
		const tags = tagsInput
			.split(",")
			.map((tag) => tag.trim())
			.filter(Boolean);

		await onSave({
			subjectId,
			title: title.trim(),
			url: url.trim(),
			notes: notes.trim() || undefined,
			tags: tags.length > 0 ? tags : undefined,
		});
		setSaving(false);
	};

	return (
		<form onSubmit={handleSubmit}>
			<DialogHeader>
				<DialogTitle>{resource ? t.common.edit : t.resource.add}</DialogTitle>
			</DialogHeader>

			<div className="space-y-4 py-4">
				<div className="space-y-2">
					<Label htmlFor={`${formId}-title`}>{t.resource.titleLabel}</Label>
					<Input
						id={`${formId}-title`}
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder={t.resource.titlePlaceholder}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor={`${formId}-url`}>{t.resource.urlLabel}</Label>
					<Input
						id={`${formId}-url`}
						type="url"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder={t.resource.urlPlaceholder}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor={`${formId}-notes`}>{t.resource.notesLabel}</Label>
					<Textarea
						id={`${formId}-notes`}
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder={t.resource.notesPlaceholder}
						rows={3}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor={`${formId}-tags`}>{t.resource.tagsLabel}</Label>
					<Input
						id={`${formId}-tags`}
						value={tagsInput}
						onChange={(e) => setTagsInput(e.target.value)}
						placeholder={t.resource.tagsPlaceholder}
					/>
				</div>
			</div>

			<DialogFooter>
				<Button type="button" variant="outline" onClick={onCancel}>
					{t.common.cancel}
				</Button>
				<Button type="submit" disabled={!title.trim() || saving}>
					{resource ? t.common.save : t.resource.add}
				</Button>
			</DialogFooter>
		</form>
	);
}
