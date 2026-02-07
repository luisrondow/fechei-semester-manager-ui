import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod/v4";
import { useAppForm } from "@/components/forms/form-hook";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCreateSemester } from "@/hooks/queries/use-semesters";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/semesters/new")({
	component: NewSemesterPage,
});

function NewSemesterPage() {
	const { t } = useI18n();
	const navigate = useNavigate();
	const createSemester = useCreateSemester();

	const form = useAppForm({
		defaultValues: {
			name: "",
			startDate: "",
			endDate: "",
			timezone: "Europe/Lisbon",
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
			await createSemester.mutateAsync(value);
			toast.success(t.semester.create);
			navigate({ to: "/semesters" });
		},
	});

	return (
		<div className="max-w-2xl mx-auto px-6 py-10">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate({ to: "/semesters" })}
				className="mb-6 -ml-2 text-muted-foreground"
			>
				<ArrowLeft className="w-4 h-4 mr-1" />
				{t.common.back}
			</Button>

			<PageHeader title={t.semester.create} />

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
						{(form) => <form.SubscribeButton label={t.common.create} />}
					</form.AppForm>
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate({ to: "/semesters" })}
					>
						{t.common.cancel}
					</Button>
				</div>
			</form>
		</div>
	);
}
