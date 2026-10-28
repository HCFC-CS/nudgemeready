import { compareHorizonEntries, localDateKey, startOfLocalDay } from "./nudgeHorizonEngine";
import type { HorizonEntry } from "../types/nudgeHorizon";

export type CalendarViewId = "day" | "week" | "month" | "year";

export type CalendarCell = {
  dateKey: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  count: number;
};

export type CalendarYearMonth = {
  monthKey: string;
  label: string;
  count: number;
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function calendarWeekdayLabels() {
  return [...WEEKDAY_LABELS];
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function mondayOf(date: Date) {
  const start = startOfLocalDay(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  return start;
}

export function countByDateKey(entries: HorizonEntry[]) {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    if (!entry.at) {
      continue;
    }
    const key = localDateKey(new Date(entry.at));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export function entriesForDateKey(entries: HorizonEntry[], dateKey: string) {
  return entries
    .filter((entry) => entry.at && localDateKey(new Date(entry.at)) === dateKey)
    .sort(compareHorizonEntries);
}

export function formatDateKeyLong(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export function formatMonthTitle(date: Date) {
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function buildMonthCells(
  viewDate: Date,
  selectedKey: string,
  counts: Map<string, number>,
  now = new Date()
): CalendarCell[] {
  const monthStart = startOfMonth(viewDate);
  const gridStart = mondayOf(monthStart);
  const todayKey = localDateKey(now);
  const cells: CalendarCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const dateKey = localDateKey(date);
    cells.push({
      dateKey,
      day: date.getDate(),
      inMonth: date.getMonth() === viewDate.getMonth(),
      isToday: dateKey === todayKey,
      isSelected: dateKey === selectedKey,
      count: counts.get(dateKey) ?? 0
    });
  }

  return cells;
}

export function buildWeekDateKeys(selected: Date) {
  const start = mondayOf(selected);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return localDateKey(date);
  });
}

export function buildYearMonths(viewDate: Date, counts: Map<string, number>): CalendarYearMonth[] {
  const year = viewDate.getFullYear();
  return Array.from({ length: 12 }, (_, month) => {
    const date = new Date(year, month, 1);
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    let count = 0;
    for (const [key, value] of counts) {
      if (key.startsWith(prefix)) {
        count += value;
      }
    }
    return {
      monthKey: prefix,
      label: date.toLocaleDateString("en-GB", { month: "short" }),
      count
    };
  });
}
