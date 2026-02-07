import {
	createFileRoute,
	Link,
	Outlet,
	useMatchRoute,
} from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubject } from "@/hooks/queries/use-subjects";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute(
	"/semester/$semesterId/subject/$subjectId",
)({
	component: SubjectLayout,
});

function SubjectLayout() {
	const { semesterId, subjectId } = Route.useParams();
	const { t } = useI18n();
	const { data: subject, isLoading } = useSubject(subjectId);
	const matchRoute = useMatchRoute();

	const tabs = [
		{
			label: t.subject.overview,
			to: "/semester/$semesterId/subject/$subjectId" as const,
			params: { semesterId, subjectId },
		},
		{
			label: t.subject.review,
			to: "/semester/$semesterId/subject/$subjectId/review" as const,
			params: { semesterId, subjectId },
		},
		{
			label: t.subject.brief,
			to: "/semester/$semesterId/subject/$subjectId/brief" as const,
			params: { semesterId, subjectId },
		},
		{
			label: t.subject.resources,
			to: "/semester/$semesterId/subject/$subjectId/resources" as const,
			params: { semesterId, subjectId },
		},
	];

	return (
		<div>
			{/* Subject header */}
			<div className="mb-6">
				{isLoading ? (
					<>
						<Skeleton className="h-8 w-48 mb-1" />
						<Skeleton className="h-4 w-32" />
					</>
				) : subject ? (
					<>
						<h1 className="text-2xl font-display tracking-tight">
							{subject.name}
						</h1>
						<p className="text-sm text-muted-foreground mt-0.5">
							{subject.code} &middot; {subject.instructor}
						</p>
					</>
				) : null}
			</div>

			{/* Tab navigation */}
			<div className="border-b border-border mb-6">
				<nav className="flex gap-1 -mb-px" aria-label="Subject tabs">
					{tabs.map((tab) => {
						const isActive = matchRoute({
							to: tab.to,
							params: tab.params,
							fuzzy: false,
						});

						return (
							<Link
								key={tab.to}
								to={tab.to}
								params={tab.params}
								className={`
									px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
									${
										isActive
											? "border-primary text-primary"
											: "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
									}
								`}
							>
								{tab.label}
							</Link>
						);
					})}
				</nav>
			</div>

			<Outlet />
		</div>
	);
}
