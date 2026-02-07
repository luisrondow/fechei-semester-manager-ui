import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createSubject,
	deleteSubject,
	fetchSubject,
	fetchSubjectsBySemester,
} from "@/lib/api/subjects";
import type { CreateSubjectInput } from "@/lib/types";
import { semesterKeys } from "./use-semesters";

export const subjectKeys = {
	bySemester: (semesterId: string) => ["subjects", semesterId] as const,
	detail: (id: string) => ["subjects", "detail", id] as const,
};

export function useSubjectsBySemester(semesterId: string) {
	return useQuery({
		queryKey: subjectKeys.bySemester(semesterId),
		queryFn: () => fetchSubjectsBySemester(semesterId),
	});
}

export function useSubject(id: string) {
	return useQuery({
		queryKey: subjectKeys.detail(id),
		queryFn: () => fetchSubject(id),
	});
}

export function useCreateSubject(semesterId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateSubjectInput) => createSubject(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: subjectKeys.bySemester(semesterId),
			});
			queryClient.invalidateQueries({
				queryKey: semesterKeys.detail(semesterId),
			});
		},
	});
}

export function useDeleteSubject(semesterId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteSubject(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: subjectKeys.bySemester(semesterId),
			});
			queryClient.invalidateQueries({
				queryKey: semesterKeys.detail(semesterId),
			});
		},
	});
}
