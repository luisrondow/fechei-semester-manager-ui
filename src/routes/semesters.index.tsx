import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Archive, GraduationCap, Plus } from "lucide-react";
import { useMemo } from "react";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { SemesterCard } from "@/components/semester-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSemestersWithSubjects } from "@/hooks/queries/use-semesters";
import { useI18n } from "@/lib/i18n";
import { isSemesterArchived } from "@/lib/semester-utils";

export const Route = createFileRoute("/semesters/")({
	component: SemestersPage,
});

function SemestersPage() {
	const { t } = useI18n();
	const navigate = useNavigate();
	const { data: semesters, isLoading } = useSemestersWithSubjects();

	const { activeSemesters, hasArchived } = useMemo(() => {
		if (!semesters) return { activeSemesters: [], hasArchived: false };
		const active = semesters.filter((s) => !isSemesterArchived(s));
		const archived = semesters.length - active.length;
		return { activeSemesters: active, hasArchived: archived > 0 };
	}, [semesters]);

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
				) : activeSemesters.length === 0 ? (
					<div className="space-y-6">
						<EmptyState
							icon={GraduationCap}
							title={t.semester.empty.title}
							description={t.semester.empty.description}
							actionLabel={t.semester.empty.cta}
							onAction={() => navigate({ to: "/semesters/new" })}
						/>
						{hasArchived && (
							<div className="text-center">
								<Link
									to="/archive"
									className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
								>
									<Archive className="w-3.5 h-3.5" />
									{t.archive.viewArchive}
								</Link>
							</div>
						)}
					</div>
				) : (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{activeSemesters.map((semester) => (
								<SemesterCard
									key={semester.id}
									semester={semester}
									subjects={semester.subjects}
								/>
							))}
						</div>
						{hasArchived && (
							<div className="text-center pt-2">
								<Link
									to="/archive"
									className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
								>
									<Archive className="w-3.5 h-3.5" />
									{t.archive.viewArchive}
								</Link>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
