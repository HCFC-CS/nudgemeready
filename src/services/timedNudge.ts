import type { NudgeItem } from "../types/nudge";

export function getTimedNudgeAt(item: Pick<NudgeItem, "reminderDate" | "startDate" | "dueDate">): Date | undefined {
  const raw = item.reminderDate ?? item.startDate ?? item.dueDate;
  if (!raw) {
    return undefined;
  }
  const at = new Date(raw);
  return Number.isNaN(at.getTime()) ? undefined : at;
}

export function shouldScheduleTimedNudge(
  item: Pick<NudgeItem, "status" | "reminderDate" | "startDate" | "dueDate">,
  now = new Date()
): boolean {
  if (item.status === "done" || item.status === "cancelled" || item.status === "paused") {
    return false;
  }
  const at = getTimedNudgeAt(item);
  return Boolean(at && at.getTime() > now.getTime());
}
