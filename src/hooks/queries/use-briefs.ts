import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";

export function useBrief(subjectId: string) {
	return useQuery(convexQuery(api.briefs.getBySubject, { subjectId }));
}

export function useUpdateBrief(_subjectId: string) {
	return useConvexMutation(api.briefs.update);
}
