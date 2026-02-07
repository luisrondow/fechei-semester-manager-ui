import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/semester/$semesterId/subject/$subjectId",
)({
	component: SubjectLayout,
});

function SubjectLayout() {
	return <Outlet />;
}
