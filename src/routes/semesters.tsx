import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Plus } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { SemesterCard } from "@/components/semester-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSemestersWithSubjects } from "@/hooks/queries/use-semesters";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/semesters")({
	component: SemestersPage,
});

function SemestersPage() {
	const { t } = useI18n();
	const navigate = useNavigate();
	const { data: semesters, isLoading } = useSemestersWithSubjects();

	return (
		<div className="max-w-5xl mx-auto px-6 py-10">
			<PageHeader
				title={t.semester.title}
				actions={
					<Button onClick={() => navigate({ to: "/semesters/new" })}>
						<Plus className="w-4 h-4 mr-2" />
						{t.semester.create}
					</Button>
				}
			/>

			<div className="mt-8">
				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{[1, 2].map((i) => (
							<div key={i} className="rounded-xl border border-border p-6">
								<Skeleton className="h-5 w-16 mb-4" />
								<Skeleton className="h-7 w-48 mb-3" />
								<Skeleton className="h-4 w-36 mb-2" />
								<Skeleton className="h-4 w-28" />
							</div>
						))}
					</div>
				) : !semesters || semesters.length === 0 ? (
					<EmptyState
						icon={GraduationCap}
						title={t.semester.empty.title}
						description={t.semester.empty.description}
						actionLabel={t.semester.empty.cta}
						onAction={() => navigate({ to: "/semesters/new" })}
					/>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{semesters.map((semester) => (
							<SemesterCard
								key={semester.id}
								semester={semester}
								subjects={semester.subjects}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
