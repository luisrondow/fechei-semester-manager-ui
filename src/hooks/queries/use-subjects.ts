import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";

export function useSubjectsBySemester(semesterId: string) {
	return useQuery(convexQuery(api.subjects.listBySemester, { semesterId }));
}

export function useSubjectsBySemesterWithPuc(semesterId: string) {
	return useQuery(
		convexQuery(api.subjects.listBySemesterWithPuc, { semesterId }),
	);
}

export function useSubject(id: string) {
	return useQuery(convexQuery(api.subjects.get, { id }));
}

export function useCreateSubject(_semesterId: string) {
	return useConvexMutation(api.subjects.create);
}

export function useDeleteSubject(_semesterId: string) {
	return useConvexMutation(api.subjects.remove);
}
