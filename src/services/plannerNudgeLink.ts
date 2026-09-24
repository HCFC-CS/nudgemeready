import type { NudgeItem } from "../types/nudge";
import type { NudgeItemType } from "../types/nudge";
import type { PlannerItem } from "../types/ready4Planner";
import { createItem } from "./nudgeItems";
import { nudgeIntentForPlannerType } from "./ready4PlannerParse";

export function mapPlannerTypeToNudge(type: PlannerItem["type"]): NudgeItemType {
  if (type === "appointment" || type === "class" || type === "event") {
    return "appointment";
  }
  if (type === "reminder" || type === "deadline") {
    return "reminder";
  }
  if (type === "assignment") {
    return "project";
  }
  return "task";
}

export function plannerDatesForNudge(item: PlannerItem) {
  return {
    dueDate: item.dueAt ?? item.startAt ?? undefined,
    startDate: item.startAt ?? undefined,
    endDate: item.endAt ?? undefined
  };
}

export function findLinkedNudge(nudges: NudgeItem[], item: PlannerItem): NudgeItem | undefined {
  if (item.nudgeItemId) {
    const byId = nudges.find((nudge) => nudge.id === item.nudgeItemId);
    if (byId) {
      return byId;
    }
  }
  return nudges.find((nudge) => nudge.anchorPlannerItemId === item.id);
}

export function buildLinkedNudgeFromPlanner(
  item: PlannerItem,
  actor: NudgeItem["createdBy"],
  existing?: NudgeItem | null
): NudgeItem {
  const dates = plannerDatesForNudge(item);
  if (existing) {
    return {
      ...existing,
      title: item.title,
      type: mapPlannerTypeToNudge(item.type),
      dueDate: dates.dueDate,
      startDate: dates.startDate,
      endDate: dates.endDate,
      sourcePackId: item.ready4PackId,
      notes: item.notes ?? existing.notes,
      anchorPlannerItemId: existing.anchorPlannerItemId ?? item.id,
      syncToCalendar: existing.syncToCalendar ?? true,
      updatedAt: new Date().toISOString()
    };
  }
  return createItem({
    title: item.title,
    type: mapPlannerTypeToNudge(item.type),
    createdBy: actor,
    dueDate: dates.dueDate,
    startDate: dates.startDate,
    endDate: dates.endDate,
    sourcePackId: item.ready4PackId,
    nudgeIntent: nudgeIntentForPlannerType(item.type),
    notes: item.notes ?? undefined,
    syncToCalendar: true,
    anchorPlannerItemId: item.id
  });
}

export function plannerPatchFromNudge(nudge: NudgeItem): Partial<PlannerItem> {
  const patch: Partial<PlannerItem> = {
    title: nudge.title,
    startAt: nudge.startDate ?? null,
    endAt: nudge.endDate ?? null,
    dueAt: nudge.dueDate ?? nudge.startDate ?? null
  };
  if (nudge.status === "done") {
    patch.status = "done";
  }
  if (nudge.status === "cancelled") {
    patch.archived = true;
  }
  return patch;
}

function sameOptional(left?: string | null, right?: string | null) {
  return (left ?? null) === (right ?? null);
}

export function plannerNeedsNudgeSync(item: PlannerItem, nudge: NudgeItem): boolean {
  const dates = plannerDatesForNudge(item);
  return (
    item.title !== nudge.title ||
    !sameOptional(dates.dueDate, nudge.dueDate) ||
    !sameOptional(dates.startDate, nudge.startDate) ||
    !sameOptional(dates.endDate, nudge.endDate) ||
    Boolean(item.ready4PackId && item.ready4PackId !== nudge.sourcePackId)
  );
}

export function plannerNeedsNudgeCompletionSync(item: PlannerItem, nudge: NudgeItem): boolean {
  if (nudge.status === "done" && item.status !== "done") {
    return true;
  }
  if (nudge.status === "cancelled" && !item.archived) {
    return true;
  }
  return plannerNeedsNudgeSync(item, nudge);
}
