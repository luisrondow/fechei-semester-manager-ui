import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPUCBySubject, uploadPUC } from "@/lib/api/puc";
import { subjectKeys } from "./use-subjects";

export const pucKeys = {
	bySubject: (subjectId: string) => ["puc", subjectId] as const,
};

export function usePUC(subjectId: string) {
	return useQuery({
		queryKey: pucKeys.bySubject(subjectId),
		queryFn: () => fetchPUCBySubject(subjectId),
	});
}

export function useUploadPUC(subjectId: string, _semesterId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (fileName: string) => uploadPUC(subjectId, fileName),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: pucKeys.bySubject(subjectId),
			});
			queryClient.invalidateQueries({
				queryKey: subjectKeys.detail(subjectId),
			});
		},
	});
}
