import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	confirmEvent,
	fetchEventsBySemester,
	fetchEventsBySubject,
	updateEvent,
} from "@/lib/api/events";
import type { CalendarEvent } from "@/lib/types";

export const eventKeys = {
	bySemester: (semesterId: string) =>
		["events", "semester", semesterId] as const,
	bySubject: (subjectId: string) => ["events", "subject", subjectId] as const,
};

export function useEventsBySemester(semesterId: string) {
	return useQuery({
		queryKey: eventKeys.bySemester(semesterId),
		queryFn: () => fetchEventsBySemester(semesterId),
	});
}

export function useEventsBySubject(subjectId: string) {
	return useQuery({
		queryKey: eventKeys.bySubject(subjectId),
		queryFn: () => fetchEventsBySubject(subjectId),
	});
}

export function useUpdateEvent(subjectId: string, semesterId?: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Partial<
				Pick<
					CalendarEvent,
					"title" | "description" | "startDate" | "endDate" | "status"
				>
			>;
		}) => updateEvent(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: eventKeys.bySubject(subjectId),
			});
			if (semesterId) {
				queryClient.invalidateQueries({
					queryKey: eventKeys.bySemester(semesterId),
				});
			}
		},
	});
}

export function useConfirmEvent(subjectId: string, semesterId?: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => confirmEvent(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: eventKeys.bySubject(subjectId),
			});
			if (semesterId) {
				queryClient.invalidateQueries({
					queryKey: eventKeys.bySemester(semesterId),
				});
			}
		},
	});
}
