import type { PlannerItem } from "../types/ready4Planner";

/** Anchor datetime for a planner item (due preferred, else start). */
export function plannerItemAnchorIso(item: Pick<PlannerItem, "dueAt" | "startAt">): string | null {
  return item.dueAt ?? item.startAt ?? null;
}

/** Active planner items that have a date — candidates for list anchoring. */
export function datedPlannerItemsForPack(items: PlannerItem[], packId?: string | null): PlannerItem[] {
  return items
    .filter((item) => !item.archived)
    .filter((item) => item.status !== "done" && item.status !== "not_needed")
    .filter((item) => (packId ? item.ready4PackId === packId : true))
    .filter((item) => Boolean(plannerItemAnchorIso(item)))
    .sort((a, b) => (plannerItemAnchorIso(a) || "").localeCompare(plannerItemAnchorIso(b) || ""));
}

/**
 * List due datetime from a planner event.
 * offsetDays 0 = same calendar day as the event.
 * offsetDays 1 = the night before (evening of the previous day).
 */
export function listDueDateFromPlannerAnchor(anchorIso: string, offsetDays = 0): string | null {
  const anchor = new Date(anchorIso);
  if (Number.isNaN(anchor.getTime())) {
    return null;
  }
  const due = new Date(anchor);
  due.setDate(due.getDate() - Math.max(0, offsetDays));
  if (offsetDays > 0) {
    due.setHours(20, 0, 0, 0);
  } else {
    // Keep a gentle morning default on the day, unless the event already has a time.
    if (due.getHours() === 0 && due.getMinutes() === 0) {
      due.setHours(9, 0, 0, 0);
    }
  }
  return due.toISOString();
}

export function listPlannerOffsetLabel(offsetDays: number): string {
  if (offsetDays <= 0) {
    return "On the day";
  }
  if (offsetDays === 1) {
    return "Night before";
  }
  return `${offsetDays} days before`;
}

export function formatPlannerEventChoice(
  item: Pick<PlannerItem, "title" | "dueAt" | "startAt">,
  formatDate: (iso: string) => string
): string {
  const iso = plannerItemAnchorIso(item);
  if (!iso) {
    return item.title;
  }
  return `${item.title} · ${formatDate(iso)}`;
}
