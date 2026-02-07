import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createResource,
	deleteResource,
	fetchResourcesBySubject,
	togglePin,
	updateResource,
} from "@/lib/api/resources";
import type { CreateResourceInput, UpdateResourceInput } from "@/lib/types";

export const resourceKeys = {
	bySubject: (subjectId: string) =>
		["resources", "subject", subjectId] as const,
};

export function useResourcesBySubject(subjectId: string) {
	return useQuery({
		queryKey: resourceKeys.bySubject(subjectId),
		queryFn: () => fetchResourcesBySubject(subjectId),
	});
}

export function useCreateResource(subjectId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateResourceInput) => createResource(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: resourceKeys.bySubject(subjectId),
			});
		},
	});
}

export function useUpdateResource(subjectId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateResourceInput }) =>
			updateResource(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: resourceKeys.bySubject(subjectId),
			});
		},
	});
}

export function useDeleteResource(subjectId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteResource(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: resourceKeys.bySubject(subjectId),
			});
		},
	});
}

export function useTogglePin(subjectId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => togglePin(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: resourceKeys.bySubject(subjectId),
			});
		},
	});
}
