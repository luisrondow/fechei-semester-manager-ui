import { createFileRoute } from "@tanstack/react-router";
import { Archive } from "lucide-react";
import { useMemo } from "react";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { SemesterCard } from "@/components/semester-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSemestersWithSubjects } from "@/hooks/queries/use-semesters";
import { useI18n } from "@/lib/i18n";
import { isSemesterArchived } from "@/lib/semester-utils";

export const Route = createFileRoute("/archive")({
	component: ArchivePage,
});

function ArchivePage() {
	const { t } = useI18n();
	const { data: semesters, isLoading } = useSemestersWithSubjects();

	const archivedSemesters = useMemo(
		() => (semesters ?? []).filter((s) => isSemesterArchived(s)),
		[semesters],
	);

	return (
		<div className="max-w-5xl mx-auto px-6 py-10">
			<PageHeader title={t.archive.title} description={t.archive.description} />

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
				) : archivedSemesters.length === 0 ? (
					<EmptyState
						icon={Archive}
						title={t.archive.empty.title}
						description={t.archive.empty.description}
					/>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{archivedSemesters.map((semester) => (
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
