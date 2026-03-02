import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";

export function useEventsBySemester(semesterId: string) {
	return useQuery(
		convexQuery(
			api.events.listBySemester,
			semesterId ? { semesterId } : "skip",
		),
	);
}

export function useEventsBySubject(subjectId: string) {
	return useQuery(convexQuery(api.events.listBySubject, { subjectId }));
}

export function useUpdateEvent(_subjectId: string, _semesterId?: string) {
	return useConvexMutation(api.events.update);
}

export function useCreateEvent(_subjectId: string, _semesterId?: string) {
	return useConvexMutation(api.events.create);
}

export function useConfirmEvent(_subjectId: string, _semesterId?: string) {
	return useConvexMutation(api.events.confirm);
}

export function useDeleteEvent(_subjectId: string, _semesterId?: string) {
	return useConvexMutation(api.events.remove);
}
