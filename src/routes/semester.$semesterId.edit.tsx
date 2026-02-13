import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod/v4";
import { useAppForm } from "@/components/forms/form-hook";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSemester, useUpdateSemester } from "@/hooks/queries/use-semesters";
import { asId } from "@/lib/convex-helpers";
import { useI18n } from "@/lib/i18n";
import { isSemesterArchived } from "@/lib/semester-utils";

export const Route = createFileRoute("/semester/$semesterId/edit")({
	component: EditSemesterPage,
});

function EditSemesterPage() {
	const { semesterId } = Route.useParams();
	const navigate = useNavigate();
	const { data: semester, isLoading } = useSemester(semesterId);

	const isArchived = semester ? isSemesterArchived(semester) : false;

	useEffect(() => {
		if (isArchived) {
			navigate({
				to: "/semester/$semesterId",
				params: { semesterId },
				replace: true,
			});
		}
	}, [isArchived, navigate, semesterId]);

	if (isLoading || !semester || isArchived) {
		return (
			<div className="max-w-2xl space-y-6 py-4">
				<Skeleton className="h-9 w-48" />
				<Skeleton className="h-10 w-full" />
				<div className="grid grid-cols-2 gap-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
			</div>
		);
	}

	return <EditForm semester={semester} />;
}

function EditForm({
	semester,
}: {
	semester: {
		id: string;
		name: string;
		startDate: string;
		endDate: string;
		timezone: string;
	};
}) {
	const { t } = useI18n();
	const navigate = useNavigate();
	const updateSemester = useUpdateSemester(semester.id);

	const form = useAppForm({
		defaultValues: {
			name: semester.name,
			startDate: semester.startDate,
			endDate: semester.endDate,
			timezone: semester.timezone,
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(1, t.common.required),
				startDate: z.string().min(1, t.common.required),
				endDate: z.string().min(1, t.common.required),
				timezone: z.string().min(1, t.common.required),
			}),
		},
		onSubmit: async ({ value }) => {
			await updateSemester({
				id: asId<"semesters">(semester.id),
				...value,
			});
			toast.success(t.semester.edit);
			navigate({
				to: "/semester/$semesterId",
				params: { semesterId: semester.id },
			});
		},
	});

	return (
		<div className="max-w-2xl py-4">
			<Button
				variant="ghost"
				size="sm"
				onClick={() =>
					navigate({
						to: "/semester/$semesterId",
						params: { semesterId: semester.id },
					})
				}
				className="mb-6 -ml-2 text-muted-foreground"
			>
				<ArrowLeft className="w-4 h-4 mr-1" />
				{t.common.back}
			</Button>

			<PageHeader title={t.semester.edit} />

			<form
				className="mt-8 space-y-6"
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<form.AppField name="name">
					{(field) => (
						<field.TextField
							label={t.semester.name}
							placeholder={t.semester.namePlaceholder}
						/>
					)}
				</form.AppField>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<form.AppField name="startDate">
						{(field) => <field.DateField label={t.semester.startDate} />}
					</form.AppField>

					<form.AppField name="endDate">
						{(field) => <field.DateField label={t.semester.endDate} />}
					</form.AppField>
				</div>

				<form.AppField name="timezone">
					{(field) => (
						<field.Select
							label={t.semester.timezone}
							values={[
								{ label: "WET (Lisbon)", value: "Europe/Lisbon" },
								{ label: "CET (Berlin)", value: "Europe/Berlin" },
								{ label: "UTC", value: "UTC" },
								{ label: "GMT", value: "GMT" },
							]}
						/>
					)}
				</form.AppField>

				<div className="flex gap-3 pt-4">
					<form.AppForm>
						<form.SubscribeButton label={t.common.save} />
					</form.AppForm>
					<Button
						type="button"
						variant="outline"
						onClick={() =>
							navigate({
								to: "/semester/$semesterId",
								params: { semesterId: semester.id },
							})
						}
					>
						{t.common.cancel}
					</Button>
				</div>
			</form>
		</div>
	);
}
