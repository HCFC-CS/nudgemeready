import type { EventPrepStep } from "../types/nudge";
import { formatTimeInput } from "./reminderDates";

export type EventTimelineEntry = {
  id: string;
  kind: "prep" | "ready" | "leave" | "event";
  title: string;
  startAt: Date;
  endAt: Date;
  durationMinutes?: number;
  subtitle?: string;
};

export const defaultEventPrepSteps: EventPrepStep[] = [
  { id: "prep-start", title: "Start prep", durationMinutes: 15 },
  { id: "prep-outfit", title: "Choose outfit", durationMinutes: 15 },
  { id: "prep-shower", title: "Shower", durationMinutes: 15 },
  { id: "prep-hair", title: "Hair", durationMinutes: 30 },
  { id: "prep-makeup", title: "Makeup", durationMinutes: 30 }
];

export function buildEventPrepTimeline(
  eventAt: Date | undefined,
  travelMinutes: number,
  readyMinutes: number,
  prepSteps: EventPrepStep[],
  venueLabel?: string
): EventTimelineEntry[] {
  if (!eventAt || Number.isNaN(eventAt.getTime())) {
    return prepSteps.map((step) => ({
      id: step.id,
      kind: "prep" as const,
      title: step.title,
      startAt: new Date(Number.NaN),
      endAt: new Date(Number.NaN),
      durationMinutes: step.durationMinutes
    }));
  }

  const eventStart = eventAt;
  const leaveAt = new Date(eventStart.getTime() - travelMinutes * 60_000);
  const readyAt = new Date(leaveAt.getTime() - readyMinutes * 60_000);
  const prepEntries: EventTimelineEntry[] = [];
  let cursor = readyAt;

  for (let index = prepSteps.length - 1; index >= 0; index -= 1) {
    const step = prepSteps[index];
    const startAt = new Date(cursor.getTime() - step.durationMinutes * 60_000);
    prepEntries.unshift({
      id: step.id,
      kind: "prep",
      title: step.title,
      startAt,
      endAt: new Date(cursor),
      durationMinutes: step.durationMinutes
    });
    cursor = startAt;
  }

  return [
    ...prepEntries,
    {
      id: "ready",
      kind: "ready",
      title: "Be ready",
      startAt: readyAt,
      endAt: leaveAt,
      durationMinutes: readyMinutes
    },
    {
      id: "leave",
      kind: "leave",
      title: "Leave home",
      startAt: leaveAt,
      endAt: eventStart,
      durationMinutes: travelMinutes,
      subtitle: `${travelMinutes} min to get there`
    },
    {
      id: "event",
      kind: "event",
      title: venueLabel ? `Event at ${venueLabel}` : "Event starts",
      startAt: eventStart,
      endAt: eventStart,
      subtitle: formatTimelineTime(eventStart)
    }
  ];
}

export function formatTimelineTime(value: Date) {
  if (Number.isNaN(value.getTime())) {
    return "—";
  }
  return formatTimeInput(value);
}

export function formatTimelineRange(startAt: Date, endAt: Date) {
  if (Number.isNaN(startAt.getTime())) {
    return "Set date & time";
  }
  if (startAt.getTime() === endAt.getTime()) {
    return formatTimelineTime(startAt);
  }
  return `${formatTimelineTime(startAt)} – ${formatTimelineTime(endAt)}`;
}

export function parseEventDateTime(dateText: string, timeText: string) {
  const dateMatch = dateText.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  const timeMatch = timeText.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!dateMatch || !timeMatch) {
    return undefined;
  }
  const [, day, month, year] = dateMatch;
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const eventAt = new Date(Number(year), Number(month) - 1, Number(day), hours, minutes, 0, 0);
  if (Number.isNaN(eventAt.getTime())) {
    return undefined;
  }
  return eventAt;
}

export function getMilestoneTimeline(
  eventAt: Date | undefined,
  travelMinutes: number,
  readyMinutes: number,
  prepSteps: EventPrepStep[],
  venueLabel?: string
) {
  return buildEventPrepTimeline(eventAt, travelMinutes, readyMinutes, prepSteps, venueLabel).filter(
    (entry) => entry.kind !== "prep"
  );
}

export function getPrepStepTimeMap(
  eventAt: Date | undefined,
  travelMinutes: number,
  readyMinutes: number,
  prepSteps: EventPrepStep[]
) {
  return new Map(
    buildEventPrepTimeline(eventAt, travelMinutes, readyMinutes, prepSteps)
      .filter((entry) => entry.kind === "prep")
      .map((entry) => [entry.id, formatTimelineTime(entry.startAt)])
  );
}

export function getPrepStartTime(
  eventAt: Date | undefined,
  travelMinutes: number,
  readyMinutes: number,
  prepSteps: EventPrepStep[]
) {
  const timeline = buildEventPrepTimeline(eventAt, travelMinutes, readyMinutes, prepSteps);
  const firstPrep = timeline.find((entry) => entry.kind === "prep");
  return firstPrep?.startAt;
}
