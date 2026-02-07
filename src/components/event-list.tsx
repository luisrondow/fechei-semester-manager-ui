import { CalendarDays } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/layout/empty-state";
import { useI18n } from "@/lib/i18n";
import type { CalendarEvent } from "@/lib/types";

interface EventListProps {
	events: CalendarEvent[];
	subjectNames?: Record<string, string>;
	compact?: boolean;
	emptyMessage?: string;
}

export function EventList({
	events,
	subjectNames,
	compact,
	emptyMessage,
}: EventListProps) {
	const { t } = useI18n();

	if (events.length === 0) {
		return (
			<EmptyState
				icon={CalendarDays}
				title={t.calendar.noEvents}
				description={emptyMessage ?? t.calendar.noEvents}
			/>
		);
	}

	return (
		<div className="space-y-2">
			{events.map((event) => (
				<EventCard
					key={event.id}
					event={event}
					subjectName={subjectNames?.[event.subjectId]}
					compact={compact}
				/>
			))}
		</div>
	);
}
