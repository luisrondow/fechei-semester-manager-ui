import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSubjectBrief, updateSubjectBrief } from "@/lib/api/briefs";

export const briefKeys = {
	bySubject: (subjectId: string) => ["briefs", subjectId] as const,
};

export function useBrief(subjectId: string) {
	return useQuery({
		queryKey: briefKeys.bySubject(subjectId),
		queryFn: () => fetchSubjectBrief(subjectId),
	});
}

export function useUpdateBrief(subjectId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			briefId,
			userEditedText,
		}: {
			briefId: string;
			userEditedText: string | null;
		}) => updateSubjectBrief(briefId, userEditedText),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: briefKeys.bySubject(subjectId),
			});
		},
	});
}
