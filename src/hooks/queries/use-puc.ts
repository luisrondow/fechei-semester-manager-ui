import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function usePUC(subjectId: string) {
	return useQuery(convexQuery(api.puc.getBySubject, { subjectId }));
}

export function useUploadPUC() {
	return useConvexMutation(api.puc.upload);
}

export function useUpdatePUCStatus() {
	return useConvexMutation(api.puc.updateStatus);
}

export function useGenerateUploadUrl() {
	return useConvexMutation(api.puc.generateUploadUrl);
}

export function useProcessPuc() {
	return useAction(api.pucProcessing.processPuc);
}
