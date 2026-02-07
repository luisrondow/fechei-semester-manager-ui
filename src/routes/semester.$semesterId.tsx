import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useSemester } from "@/hooks/queries/use-semesters";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/semester/$semesterId")({
	component: SemesterLayout,
});

function SemesterLayout() {
	const { semesterId } = Route.useParams();
	const { t } = useI18n();
	const { data: semester, isLoading } = useSemester(semesterId);

	return (
		<div className="max-w-5xl mx-auto px-6 py-6">
			{/* Breadcrumb */}
			<Breadcrumb className="mb-6">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link to="/semesters">{t.semester.title}</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						{isLoading ? (
							<Skeleton className="h-4 w-32" />
						) : (
							<BreadcrumbPage>{semester?.name}</BreadcrumbPage>
						)}
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<Outlet />
		</div>
	);
}
