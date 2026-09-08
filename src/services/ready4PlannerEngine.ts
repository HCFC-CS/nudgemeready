import type { PlannerItem, PlannerItemStatus, PlannerState } from "../types/ready4Planner";

export function createPlannerId(prefix = "plan") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultPlannerState(at = new Date().toISOString()): PlannerState {
  return {
    version: 1,
    items: [],
    dismissedTips: [],
    createdAt: at,
    updatedAt: at
  };
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

/** Local calendar day key — avoids UTC off-by-one. */
export function dateKey(iso: string) {
  const instant = new Date(iso);
  if (Number.isNaN(instant.getTime())) {
    return "";
  }
  return `${instant.getFullYear()}-${pad2(instant.getMonth() + 1)}-${pad2(instant.getDate())}`;
}

function localDateKeyFromDate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function itemSortKey(item: PlannerItem) {
  return item.startAt || item.dueAt || item.endAt || item.createdAt;
}

export function activeItems(items: PlannerItem[], packId?: string) {
  return items
    .filter((item) => !item.archived)
    .filter((item) => (packId ? item.ready4PackId === packId : true))
    .filter((item) => item.status !== "not_needed");
}

export function itemsForToday(items: PlannerItem[], packId?: string, now = new Date()) {
  const key = localDateKeyFromDate(now);
  return activeItems(items, packId)
    .filter((item) => {
      const start = item.startAt ? dateKey(item.startAt) : "";
      const due = item.dueAt ? dateKey(item.dueAt) : "";
      return start === key || due === key;
    })
    .sort((a, b) => itemSortKey(a).localeCompare(itemSortKey(b)));
}

export function itemsForThisWeek(items: PlannerItem[], packId?: string, now = new Date()) {
  const start = startOfDay(now);
  const end = addDays(start, 7);
  return activeItems(items, packId)
    .filter((item) => {
      const raw = item.startAt || item.dueAt;
      if (!raw) {
        return false;
      }
      const ms = Date.parse(raw);
      return Number.isFinite(ms) && ms >= start.getTime() && ms < end.getTime();
    })
    .sort((a, b) => itemSortKey(a).localeCompare(itemSortKey(b)));
}

export function groupItemsByDay(items: PlannerItem[], now = new Date()) {
  const groups = new Map<string, PlannerItem[]>();
  for (const item of items) {
    const raw = item.startAt || item.dueAt;
    const key = raw ? dateKey(raw) : localDateKeyFromDate(now);
    if (!key) {
      continue;
    }
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKeyValue, dayItems]) => ({
      dateKey: dateKeyValue,
      label: formatDayLabel(dateKeyValue, now),
      items: dayItems.sort((a, b) => itemSortKey(a).localeCompare(itemSortKey(b)))
    }));
}

export function formatDayLabel(dateKeyValue: string, now = new Date()) {
  const today = localDateKeyFromDate(now);
  const tomorrow = localDateKeyFromDate(addDays(startOfDay(now), 1));
  if (dateKeyValue === today) {
    return "Today";
  }
  if (dateKeyValue === tomorrow) {
    return "Tomorrow";
  }
  const [year, month, day] = dateKeyValue.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1, 12, 0, 0, 0);
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

/** Calm status copy — never “OVERDUE”. */
export function plannerStatusLabel(status: PlannerItemStatus): string {
  switch (status) {
    case "planned":
      return "Planned";
    case "in_progress":
      return "In progress";
    case "done":
      return "Done";
    case "moved":
      return "Moved";
    case "not_needed":
      return "Not needed";
    default:
      return "Planned";
  }
}

export function stillNeedThis(item: PlannerItem, now = new Date()): boolean {
  if (item.status === "done" || item.status === "not_needed") {
    return false;
  }
  const due = item.dueAt || item.startAt;
  if (!due) {
    return false;
  }
  const ms = Date.parse(due);
  return Number.isFinite(ms) && ms < startOfDay(now).getTime();
}

export function stillNeedCopy(): string {
  return "Still need this?";
}

export function resetFlexibleWeek(items: PlannerItem[], now = new Date()): PlannerItem[] {
  const start = startOfDay(now);
  const weekAgo = addDays(start, -7);
  return items.map((item) => {
    if (item.archived || item.status === "done" || item.status === "not_needed") {
      return item;
    }
    // Fixed deadlines / appointments keep their dates.
    if (item.type === "deadline" || item.type === "appointment" || item.type === "class") {
      return item;
    }
    const raw = item.startAt || item.dueAt;
    if (!raw) {
      return item;
    }
    const ms = Date.parse(raw);
    if (!Number.isFinite(ms) || ms >= start.getTime()) {
      return item;
    }
    // Past flexible item from the recent week → move to tomorrow afternoon.
    if (ms >= weekAgo.getTime()) {
      const moved = addDays(start, 1);
      moved.setHours(15, 0, 0, 0);
      return {
        ...item,
        startAt: moved.toISOString(),
        status: "moved" as const,
        updatedAt: now.toISOString()
      };
    }
    return item;
  });
}

export const ASSIGNMENT_BREAKDOWN_STEPS = [
  "Read question",
  "Research",
  "Gather sources",
  "Outline",
  "First draft",
  "Edit",
  "References",
  "Final check",
  "Submit"
];

export function accentColor(accent: "blue" | "taupe" | "gold" | "grey") {
  switch (accent) {
    case "blue":
      return "#7BA8C9";
    case "taupe":
      return "#B8ADA1";
    case "gold":
      return "#B8954F";
    default:
      return "#8E959E";
  }
}
