import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createSemester,
	deleteSemester,
	fetchSemester,
	fetchSemesters,
	updateSemester,
} from "@/lib/api/semesters";
import type { CreateSemesterInput, UpdateSemesterInput } from "@/lib/types";

export const semesterKeys = {
	all: ["semesters"] as const,
	detail: (id: string) => ["semesters", id] as const,
};

export function useSemesters() {
	return useQuery({
		queryKey: semesterKeys.all,
		queryFn: fetchSemesters,
	});
}

export function useSemester(id: string) {
	return useQuery({
		queryKey: semesterKeys.detail(id),
		queryFn: () => fetchSemester(id),
	});
}

export function useCreateSemester() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateSemesterInput) => createSemester(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: semesterKeys.all });
		},
	});
}

export function useUpdateSemester(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpdateSemesterInput) => updateSemester(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: semesterKeys.all });
			queryClient.invalidateQueries({ queryKey: semesterKeys.detail(id) });
		},
	});
}

export function useDeleteSemester() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteSemester(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: semesterKeys.all });
		},
	});
}
