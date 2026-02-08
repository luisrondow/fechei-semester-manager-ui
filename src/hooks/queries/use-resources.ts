import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";

export function useResourcesBySubject(subjectId: string) {
	return useQuery(convexQuery(api.resources.listBySubject, { subjectId }));
}

export function useCreateResource(_subjectId: string) {
	return useConvexMutation(api.resources.create);
}

export function useUpdateResource(_subjectId: string) {
	return useConvexMutation(api.resources.update);
}

export function useDeleteResource(_subjectId: string) {
	return useConvexMutation(api.resources.remove);
}

export function useTogglePin(_subjectId: string) {
	return useConvexMutation(api.resources.togglePin);
}
