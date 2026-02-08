import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";

export function usePUC(subjectId: string) {
	return useQuery(convexQuery(api.puc.getBySubject, { subjectId }));
}

export function useUploadPUC(_subjectId: string, _semesterId: string) {
	return useConvexMutation(api.puc.upload);
}

export function useUpdatePUCStatus() {
	return useConvexMutation(api.puc.updateStatus);
}
