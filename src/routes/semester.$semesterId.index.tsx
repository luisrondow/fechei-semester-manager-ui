import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	GraduationCap,
	MoreHorizontal,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { getSubjectsBySemester } from "@/data/mock/store";
import { useDeleteSemester, useSemester } from "@/hooks/queries/use-semesters";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/semester/$semesterId/")({
	component: SemesterDetailPage,
});

function SemesterDetailPage() {
	const { semesterId } = Route.useParams();
	const { t } = useI18n();
	const navigate = useNavigate();
	const { data: semester, isLoading } = useSemester(semesterId);
	const deleteSemester = useDeleteSemester();

	const subjects = semester ? getSubjectsBySemester(semester.id) : [];

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-9 w-64" />
				<Skeleton className="h-5 w-48" />
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
					{[1, 2].map((i) => (
						<div key={i} className="rounded-xl border p-5">
							<Skeleton className="h-5 w-16 mb-3" />
							<Skeleton className="h-6 w-40 mb-2" />
							<Skeleton className="h-4 w-28" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (!semester) {
		return (
			<EmptyState
				icon={GraduationCap}
				title={t.common.error}
				description="Semester not found"
			/>
		);
	}

	const handleDelete = async () => {
		await deleteSemester.mutateAsync(semester.id);
		toast.success(t.semester.delete);
		navigate({ to: "/semesters" });
	};

	const dateOpts: Intl.DateTimeFormatOptions = {
		day: "numeric",
		month: "long",
		year: "numeric",
	};
	const startFormatted = new Date(semester.startDate).toLocaleDateString(
		"en-GB",
		dateOpts,
	);
	const endFormatted = new Date(semester.endDate).toLocaleDateString(
		"en-GB",
		dateOpts,
	);

	return (
		<div className="space-y-8">
			{/* Header */}
			<PageHeader
				title={semester.name}
				description={`${startFormatted} \u2014 ${endFormatted}`}
				actions={
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" asChild>
							<Link
								to="/semester/$semesterId/edit"
								params={{ semesterId: semester.id }}
							>
								<Pencil className="w-3.5 h-3.5 mr-1.5" />
								{t.common.edit}
							</Link>
						</Button>

						<Dialog>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="w-4 h-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem asChild>
										<Link
											to="/semester/$semesterId/edit"
											params={{ semesterId: semester.id }}
										>
											<Pencil className="w-4 h-4 mr-2" />
											{t.semester.edit}
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DialogTrigger asChild>
										<DropdownMenuItem className="text-destructive-foreground">
											<Trash2 className="w-4 h-4 mr-2" />
											{t.semester.delete}
										</DropdownMenuItem>
									</DialogTrigger>
								</DropdownMenuContent>
							</DropdownMenu>

							<DialogContent>
								<DialogHeader>
									<DialogTitle>{t.semester.delete}</DialogTitle>
									<DialogDescription>
										{t.semester.deleteConfirm}
									</DialogDescription>
								</DialogHeader>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant="outline">{t.common.cancel}</Button>
									</DialogClose>
									<Button variant="destructive" onClick={handleDelete}>
										{t.common.delete}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				}
			/>

			{/* Stats ribbon */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{[
					{
						label: t.semester.subjects,
						value: String(subjects.length),
						icon: GraduationCap,
					},
				].map((stat) => (
					<div
						key={stat.label}
						className="bg-card rounded-lg border border-border p-4 flex items-center gap-3"
					>
						<div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
							<stat.icon className="w-4 h-4 text-primary" />
						</div>
						<div>
							<p className="text-2xl font-display leading-none">{stat.value}</p>
							<p className="text-xs text-muted-foreground mt-0.5">
								{stat.label}
							</p>
						</div>
					</div>
				))}
			</div>

			{/* Subjects grid */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<h2 className="font-display text-xl">{t.subject.title}</h2>
					<Button size="sm" variant="outline" asChild>
						<Link
							to="/semester/$semesterId/subjects/new"
							params={{ semesterId: semester.id }}
						>
							<Plus className="w-4 h-4 mr-1.5" />
							{t.subject.add}
						</Link>
					</Button>
				</div>

				{subjects.length === 0 ? (
					<EmptyState
						icon={GraduationCap}
						title={t.semester.noSubjects}
						description={t.subject.add}
						actionLabel={t.subject.add}
						onAction={() =>
							navigate({
								to: "/semester/$semesterId/subjects/new",
								params: { semesterId: semester.id },
							})
						}
					/>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{subjects.map((subject) => (
							<Link
								key={subject.id}
								to="/semester/$semesterId/subject/$subjectId"
								params={{
									semesterId: semester.id,
									subjectId: subject.id,
								}}
								className="group"
							>
								<div className="bg-card rounded-xl border border-border p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5">
									<div className="flex items-start justify-between mb-2">
										<Badge
											variant="outline"
											className="text-[10px] uppercase tracking-wider"
										>
											{subject.code}
										</Badge>
									</div>
									<h3 className="font-display text-lg group-hover:text-primary transition-colors mb-1">
										{subject.name}
									</h3>
									<p className="text-sm text-muted-foreground">
										{subject.instructor}
									</p>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
