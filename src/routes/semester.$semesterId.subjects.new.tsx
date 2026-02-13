import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod/v4";
import { useAppForm } from "@/components/forms/form-hook";
import { PageHeader } from "@/components/layout/page-header";
import { PUCExplainerCard } from "@/components/puc-explainer-card";
import { PUCUpload } from "@/components/puc-upload";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSemester } from "@/hooks/queries/use-semesters";
import { useCreateSubject } from "@/hooks/queries/use-subjects";
import { asId } from "@/lib/convex-helpers";
import { useI18n } from "@/lib/i18n";
import { isSemesterArchived } from "@/lib/semester-utils";

export const Route = createFileRoute("/semester/$semesterId/subjects/new")({
	component: NewSubjectPage,
});

function NewSubjectPage() {
	const { semesterId } = Route.useParams();
	const { t } = useI18n();
	const navigate = useNavigate();
	const { data: semester, isLoading: semLoading } = useSemester(semesterId);
	const createSubject = useCreateSubject(semesterId);
	const [pucFile, setPucFile] = useState<File | null>(null);

	const handleFileSelect = useCallback((file: File) => {
		setPucFile(file);
	}, []);

	const isArchived = semester ? isSemesterArchived(semester) : false;

	const form = useAppForm({
		defaultValues: {
			name: "",
			code: "",
			instructor: "",
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(1, t.common.required),
				code: z.string().min(1, t.common.required),
				instructor: z.string().min(1, t.common.required),
			}),
		},
		onSubmit: async ({ value }) => {
			const subject = await createSubject({
				semesterId: asId<"semesters">(semesterId),
				...value,
			});
			toast.success(t.subject.created);

			if (pucFile) {
				// Navigate to subject page — PUC upload will be simulated there
				navigate({
					to: "/semester/$semesterId/subject/$subjectId",
					params: { semesterId, subjectId: subject.id },
				});
			} else {
				navigate({
					to: "/semester/$semesterId/subject/$subjectId",
					params: { semesterId, subjectId: subject.id },
				});
			}
		},
	});

	useEffect(() => {
		if (isArchived) {
			navigate({
				to: "/semester/$semesterId",
				params: { semesterId },
				replace: true,
			});
		}
	}, [isArchived, navigate, semesterId]);

	if (semLoading || isArchived) {
		return (
			<div className="max-w-2xl space-y-6 py-4">
				<Skeleton className="h-9 w-48" />
				<Skeleton className="h-10 w-full" />
			</div>
		);
	}

	return (
		<div className="max-w-2xl py-4">
			<Button
				variant="ghost"
				size="sm"
				className="mb-6 -ml-2 text-muted-foreground"
				asChild
			>
				<Link to="/semester/$semesterId" params={{ semesterId }}>
					<ArrowLeft className="w-4 h-4 mr-1" />
					{t.common.back}
				</Link>
			</Button>

			<PageHeader title={t.subject.add} />

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
							label={t.subject.name}
							placeholder={t.subject.namePlaceholder}
						/>
					)}
				</form.AppField>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<form.AppField name="code">
						{(field) => (
							<field.TextField
								label={t.subject.code}
								placeholder={t.subject.codePlaceholder}
							/>
						)}
					</form.AppField>

					<form.AppField name="instructor">
						{(field) => (
							<field.TextField
								label={t.subject.instructor}
								placeholder={t.subject.instructorPlaceholder}
							/>
						)}
					</form.AppField>
				</div>

				{/* PUC Upload */}
				<div className="space-y-3">
					<h3 className="font-display text-lg">{t.puc.upload}</h3>
					<p className="text-sm text-muted-foreground">{t.puc.uploadHint}</p>
					<PUCUpload onFileSelect={handleFileSelect} />
					<PUCExplainerCard />
				</div>

				<div className="flex gap-3 pt-4">
					<form.AppForm>
						<form.SubscribeButton label={t.subject.add} />
					</form.AppForm>
					<Button type="button" variant="outline" asChild>
						<Link to="/semester/$semesterId" params={{ semesterId }}>
							{t.common.cancel}
						</Link>
					</Button>
				</div>
			</form>
		</div>
	);
}
