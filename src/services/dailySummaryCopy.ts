import type { NudgeItem } from "../types/nudge";
import { getPrimaryDate } from "./nudgeItems";

function isSameLocalDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function itemsDueToday(items: NudgeItem[], now = new Date()): NudgeItem[] {
  return items.filter((item) => {
    if (item.status !== "open") {
      return false;
    }
    const at = getPrimaryDate(item);
    return Boolean(at && isSameLocalDay(at, now));
  });
}

/** Morning lock-screen copy. Null means stay silent — nothing is due. */
export function buildDailySummaryBody(items: NudgeItem[], now = new Date()): string | null {
  const due = itemsDueToday(items, now);
  const titles = due.map((item) => item.title.trim()).filter(Boolean);
  if (!titles.length) {
    return null;
  }
  if (titles.length === 1) {
    return `Today: ${titles[0]}.`;
  }
  if (titles.length === 2) {
    return `Today: ${titles[0]} and ${titles[1]}.`;
  }
  if (titles.length === 3) {
    return `Today: ${titles[0]}, ${titles[1]}, and ${titles[2]}.`;
  }
  return `Today: ${titles[0]}, ${titles[1]}, and ${titles.length - 2} more.`;
}
