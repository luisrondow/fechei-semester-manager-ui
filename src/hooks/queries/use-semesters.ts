import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";

export function useSemesters() {
	return useQuery(convexQuery(api.semesters.list, {}));
}

export function useSemester(id: string) {
	return useQuery(convexQuery(api.semesters.get, { id }));
}

export function useSemestersWithSubjects() {
	return useQuery(convexQuery(api.semesters.listWithSubjects, {}));
}

export function useCreateSemester() {
	return useConvexMutation(api.semesters.create);
}

export function useUpdateSemester(_id: string) {
	return useConvexMutation(api.semesters.update);
}

export function useDeleteSemester() {
	return useConvexMutation(api.semesters.remove);
}
