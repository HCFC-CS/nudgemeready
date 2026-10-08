import type { BudgetItem, BudgetState } from "../types/budget";
import type { NudgeItem } from "../types/nudge";
import type { PlannerItem } from "../types/ready4Planner";
import type {
  HorizonDayGroup,
  HorizonEntry,
  HorizonFlexibility,
  HorizonMonthGroup,
  LaterHorizonView,
  MonthHorizonView,
  QuarterHorizonView,
  SimplifyMode,
  TodayHorizonView,
  WeekHorizonView,
  YearHorizonView
} from "../types/nudgeHorizon";
import { getPlannerConfig } from "./ready4PlannerConfigs";
import { activeItems, stillNeedThis } from "./ready4PlannerEngine";
import { getPrimaryDate, isReady4PackItem } from "./nudgeItems";
import { upcomingItems } from "./budgetEngine";

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function localDateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function endOfLocalMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, 1);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function dayLabel(dateKey: string, now: Date) {
  const today = localDateKey(now);
  const tomorrow = localDateKey(addDays(startOfLocalDay(now), 1));
  if (dateKey === today) {
    return "Today";
  }
  if (dateKey === tomorrow) {
    return "Tomorrow";
  }
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short"
  });
}

const FIXED_NUDGE_TYPES = new Set([
  "appointment",
  "event",
  "occasion",
  "special_day",
  "reminder"
]);

const FIXED_PLANNER_TYPES = new Set([
  "appointment",
  "event",
  "deadline",
  "class",
  "payment",
  "milestone"
]);

export function flexibilityForNudge(item: NudgeItem): HorizonFlexibility {
  if (FIXED_NUDGE_TYPES.has(item.type)) {
    return "fixed";
  }
  if (item.priority === "important" || item.priority === "needs_attention") {
    return "fixed";
  }
  return "flexible";
}

export function flexibilityForPlanner(item: PlannerItem): HorizonFlexibility {
  if (FIXED_PLANNER_TYPES.has(item.type)) {
    return "fixed";
  }
  if (item.priority === "important") {
    return "fixed";
  }
  return "flexible";
}

function packLabel(packId?: string | null) {
  if (!packId) {
    return "NUDGE";
  }
  return getPlannerConfig(packId)?.shortLabel ?? packId.replace(/^ready4-/, "").toUpperCase();
}

function intentLabel(intent?: string | null) {
  switch (intent) {
    case "plan":
      return "PLAN";
    case "remember":
      return "REMEMBER";
    case "do":
      return "DO";
    case "book_go":
      return "BOOK & GO";
    case "buy_pay":
      return "BUY & PAY";
    case "life_people":
      return "LIFE";
    default:
      return null;
  }
}

function nudgeLabel(item: NudgeItem) {
  if (item.sourcePackId) {
    return packLabel(item.sourcePackId);
  }
  return intentLabel(item.nudgeIntent) ?? item.type.toUpperCase();
}

/** Include dated pack items; skip undated unedited catalogue templates. */
export function shouldIncludeNudgeInHorizon(item: NudgeItem): boolean {
  if (item.status === "cancelled" || item.status === "done") {
    return false;
  }
  const dated = Boolean(getPrimaryDate(item));
  if (isReady4PackItem(item) && !dated && !item.userEdited) {
    return false;
  }
  return true;
}

export function entryFromNudge(item: NudgeItem): HorizonEntry {
  const at = getPrimaryDate(item)?.toISOString() ?? null;
  const leaveMinutes = item.eventTravelMinutes ?? item.eventReadyMinutes;
  let leaveByAt: string | null = null;
  if (at && leaveMinutes) {
    const leave = new Date(at);
    leave.setMinutes(leave.getMinutes() - leaveMinutes);
    leaveByAt = leave.toISOString();
  }
  return {
    id: `nudge:${item.id}`,
    sourceKind: "nudge",
    sourceId: item.id,
    title: item.title,
    at,
    endAt: item.endDate ?? null,
    flexibility: flexibilityForNudge(item),
    label: nudgeLabel(item),
    packId: item.sourcePackId ?? null,
    nudgeIntent: item.nudgeIntent ?? null,
    priority:
      item.priority === "important" || item.priority === "needs_attention"
        ? "important"
        : item.priority === "soon"
          ? "normal"
          : "low",
    leaveByAt,
    linkedNudgeId: item.id,
    alsoLinked: item.calendarEventId ? ["Calendar"] : undefined
  };
}

export function entryFromPlanner(item: PlannerItem): HorizonEntry {
  const at = item.startAt || item.dueAt || null;
  return {
    id: `planner:${item.id}`,
    sourceKind: "planner",
    sourceId: item.id,
    title: item.title,
    at,
    endAt: item.endAt ?? null,
    flexibility: flexibilityForPlanner(item),
    label: packLabel(item.ready4PackId),
    packId: item.ready4PackId,
    priority: item.priority === "important" ? "important" : item.priority === "normal" ? "normal" : "low",
    durationMinutes: item.durationMinutes ?? null,
    linkedNudgeId: item.nudgeItemId ?? null,
    alsoLinked: item.nudgeItemId ? ["Nudge"] : undefined
  };
}

export function entryFromBudget(item: BudgetItem): HorizonEntry {
  const due = item.nextDueDate || item.dueDate || null;
  return {
    id: `budget:${item.id}`,
    sourceKind: "budget",
    sourceId: item.id,
    title: item.name,
    at: due ? new Date(`${due}T09:00:00`).toISOString() : null,
    flexibility: "fixed",
    label: "MONEY",
    priority: "normal",
    linkedNudgeId: item.reminderItemId ?? null,
    alsoLinked: item.reminderItemId ? ["Nudge"] : undefined
  };
}

/**
 * Merge sources without duplicating linked records.
 * Planner with nudgeItemId → nudge wins.
 * Budget with reminderItemId → nudge wins.
 */
export function buildUnifiedHorizonEntries(input: {
  nudges: NudgeItem[];
  plannerItems: PlannerItem[];
  budgetState: BudgetState;
  coreBudgetId: string;
  now?: Date;
}): HorizonEntry[] {
  const now = input.now ?? new Date();
  const nudgeIds = new Set(input.nudges.map((item) => item.id));
  const entries: HorizonEntry[] = [];

  for (const nudge of input.nudges) {
    if (!shouldIncludeNudgeInHorizon(nudge)) {
      continue;
    }
    entries.push(entryFromNudge(nudge));
  }

  for (const planner of activeItems(input.plannerItems)) {
    if (planner.status === "done") {
      continue;
    }
    if (planner.nudgeItemId && nudgeIds.has(planner.nudgeItemId)) {
      continue;
    }
    entries.push(entryFromPlanner(planner));
  }

  for (const bill of upcomingItems(input.budgetState, input.coreBudgetId, 400)) {
    if (bill.reminderItemId && nudgeIds.has(bill.reminderItemId)) {
      continue;
    }
    entries.push(entryFromBudget(bill));
  }

  // Soft title+time dedupe (same commitment entered twice)
  return dedupeByTitleAndDay(entries, now).sort(compareHorizonEntries);
}

export function dedupeByTitleAndDay(entries: HorizonEntry[], _now = new Date()): HorizonEntry[] {
  const seen = new Map<string, HorizonEntry>();
  for (const entry of entries) {
    const day = entry.at ? localDateKey(new Date(entry.at)) : "undated";
    const key = `${entry.title.trim().toLowerCase()}|${day}`;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, entry);
      continue;
    }
    // Prefer nudge canonical, then merge provenance
    if (existing.sourceKind === "nudge") {
      const also = new Set([...(existing.alsoLinked ?? []), entry.label, entry.sourceKind]);
      seen.set(key, { ...existing, alsoLinked: [...also] });
      continue;
    }
    if (entry.sourceKind === "nudge") {
      const also = new Set([...(entry.alsoLinked ?? []), existing.label, existing.sourceKind]);
      seen.set(key, { ...entry, alsoLinked: [...also] });
      continue;
    }
    const also = new Set([...(existing.alsoLinked ?? []), entry.label]);
    seen.set(key, { ...existing, alsoLinked: [...also] });
  }
  return [...seen.values()];
}

export function compareHorizonEntries(a: HorizonEntry, b: HorizonEntry) {
  if (a.at && b.at) {
    return Date.parse(a.at) - Date.parse(b.at);
  }
  if (a.at && !b.at) {
    return -1;
  }
  if (!a.at && b.at) {
    return 1;
  }
  return a.title.localeCompare(b.title);
}

function hasClockTime(iso: string) {
  const date = new Date(iso);
  return date.getHours() !== 0 || date.getMinutes() !== 0;
}

function isSignificantFar(entry: HorizonEntry) {
  if (entry.flexibility === "fixed") {
    return true;
  }
  if (entry.priority === "important") {
    return true;
  }
  if (entry.sourceKind === "budget") {
    return true;
  }
  if (entry.packId && /moving|wedding|baby|party|travel|study/.test(entry.packId)) {
    return Boolean(entry.at);
  }
  return false;
}

export function applySimplify(entries: HorizonEntry[], mode: SimplifyMode): HorizonEntry[] {
  switch (mode) {
    case "essentials":
      return entries.filter(
        (entry) =>
          entry.flexibility === "fixed" ||
          entry.priority === "important" ||
          entry.sourceKind === "budget"
      );
    case "fixed_only":
      return entries.filter((entry) => entry.flexibility === "fixed");
    case "hide_optional":
      return entries.filter((entry) => entry.priority !== "low");
    default:
      return entries;
  }
}

export function buildTodayView(entries: HorizonEntry[], now = new Date()): TodayHorizonView {
  const todayKey = localDateKey(now);
  const tomorrowKey = localDateKey(addDays(startOfLocalDay(now), 1));
  const dayEntries = entries.filter((entry) => entry.at && localDateKey(new Date(entry.at)) === todayKey);
  const stillNeed = entries.filter((entry) => {
    if (!entry.at || entry.flexibility !== "flexible") {
      return false;
    }
    const ms = Date.parse(entry.at);
    return Number.isFinite(ms) && ms < startOfLocalDay(now).getTime();
  });

  const timed = dayEntries.filter((entry) => entry.at && hasClockTime(entry.at) && entry.flexibility === "fixed");
  const anytime = dayEntries.filter(
    (entry) =>
      !(entry.at && hasClockTime(entry.at) && entry.flexibility === "fixed") &&
      entry.priority !== "low" &&
      entry.flexibility === "flexible"
  );
  const dontForget = dayEntries.filter(
    (entry) =>
      entry.label.includes("REMEMBER") ||
      entry.priority === "important" ||
      (entry.flexibility === "fixed" && !(entry.at && hasClockTime(entry.at)))
  );
  const niceIf = dayEntries.filter((entry) => entry.priority === "low" && entry.flexibility === "flexible");

  // Deduplicate across bands — prefer next/timed
  const claimed = new Set<string>();
  const next = timed[0] ?? dayEntries.find((entry) => entry.flexibility === "fixed") ?? null;
  if (next) {
    claimed.add(next.id);
  }
  const take = (list: HorizonEntry[]) =>
    list.filter((entry) => {
      if (claimed.has(entry.id)) {
        return false;
      }
      claimed.add(entry.id);
      return true;
    });

  const timedRest = take(timed.filter((entry) => entry.id !== next?.id));
  const dontForgetRest = take(dontForget);
  const anytimeRest = take(anytime);
  const niceIfRest = take(niceIf);

  const fixedCount = dayEntries.filter((entry) => entry.flexibility === "fixed").length;
  const flexibleCount = dayEntries.filter((entry) => entry.flexibility === "flexible").length;
  const tomorrowCount = entries.filter(
    (entry) => entry.at && localDateKey(new Date(entry.at)) === tomorrowKey
  ).length;

  return {
    summary:
      dayEntries.length === 0
        ? "Nothing you need to think about here yet."
        : `You've got ${fixedCount} fixed thing${fixedCount === 1 ? "" : "s"} and ${flexibleCount} flexible thing${flexibleCount === 1 ? "" : "s"} today.`,
    next,
    timed: timedRest,
    anytime: anytimeRest,
    dontForget: dontForgetRest,
    niceIf: niceIfRest,
    stillNeed: stillNeed.slice(0, 5),
    tomorrowCount,
    totalCount: dayEntries.length,
    fixedCount,
    flexibleCount
  };
}

export function buildWeekView(entries: HorizonEntry[], now = new Date()): WeekHorizonView {
  const start = startOfLocalDay(now);
  const end = addDays(start, 7);
  const weekEntries = entries.filter((entry) => {
    if (!entry.at) {
      return false;
    }
    const ms = Date.parse(entry.at);
    return Number.isFinite(ms) && ms >= start.getTime() && ms < end.getTime();
  });

  const byDay = new Map<string, HorizonEntry[]>();
  for (const entry of weekEntries) {
    const key = localDateKey(new Date(entry.at!));
    const list = byDay.get(key) ?? [];
    list.push(entry);
    byDay.set(key, list);
  }

  const days: HorizonDayGroup[] = [];
  for (let i = 0; i < 7; i += 1) {
    const date = addDays(start, i);
    const key = localDateKey(date);
    const list = (byDay.get(key) ?? []).sort(compareHorizonEntries);
    days.push({
      dateKey: key,
      label: dayLabel(key, now),
      count: list.length,
      entries: list,
      collapsedDefault: i > 0 && list.length > 0
    });
  }

  let busiest: HorizonDayGroup | null = null;
  for (const day of days) {
    if (!busiest || day.count > busiest.count) {
      busiest = day;
    }
  }

  const overwhelm = weekEntries.length >= 10;
  const whatMattersMost = weekEntries
    .filter((entry) => entry.flexibility === "fixed" || entry.priority === "important")
    .slice(0, 3);
  const moreCount = Math.max(0, weekEntries.length - whatMattersMost.length);

  return {
    summary:
      weekEntries.length === 0
        ? "Nothing dated this week yet."
        : busiest && busiest.count > 0
          ? `${busiest.label} is your busiest day this week.`
          : `You've got ${weekEntries.length} things this week.`,
    days,
    totalCount: weekEntries.length,
    busiestDayLabel: busiest && busiest.count > 0 ? busiest.label : null,
    overwhelm,
    whatMattersMost,
    moreCount
  };
}

export function buildMonthView(entries: HorizonEntry[], now = new Date()): MonthHorizonView {
  const start = startOfLocalDay(now);
  const weekEnd = addDays(start, 7);
  const fortnightEnd = addDays(start, 14);
  const monthEnd = endOfLocalMonth(now);

  const inRange = (from: Date, to: Date, significantOnly = false) =>
    entries.filter((entry) => {
      if (!entry.at) {
        return false;
      }
      const ms = Date.parse(entry.at);
      if (!Number.isFinite(ms) || ms < from.getTime() || ms > to.getTime()) {
        return false;
      }
      if (significantOnly && !isSignificantFar(entry)) {
        return false;
      }
      return true;
    });

  const thisWeek = inRange(start, weekEnd);
  const nextWeek = inRange(weekEnd, fortnightEnd);
  const laterMonth = inRange(fortnightEnd, monthEnd, true);

  const total = thisWeek.length + nextWeek.length + laterMonth.length;
  return {
    summary:
      laterMonth.length > 0
        ? `You've got ${laterMonth.length} important date${laterMonth.length === 1 ? "" : "s"} later this month.`
        : total === 0
          ? "This month looks open so far."
          : `This week has the most detail; later dates stay lighter.`,
    thisWeek,
    nextWeek,
    laterMonth,
    totalCount: total
  };
}

export function buildQuarterView(entries: HorizonEntry[], now = new Date()): QuarterHorizonView {
  const start = addDays(startOfLocalDay(now), 14);
  const end = addDays(startOfLocalDay(now), 92);
  const list = entries.filter((entry) => {
    if (!entry.at || !isSignificantFar(entry)) {
      return false;
    }
    const ms = Date.parse(entry.at);
    return Number.isFinite(ms) && ms >= start.getTime() && ms < end.getTime();
  });
  return {
    summary:
      list.length === 0
        ? "No big things on the three-month horizon yet."
        : `${list.length} significant thing${list.length === 1 ? "" : "s"} in the next three months.`,
    entries: list,
    totalCount: list.length
  };
}

export function buildYearView(entries: HorizonEntry[], now = new Date()): YearHorizonView {
  const start = startOfLocalDay(now);
  const end = addDays(start, 366);
  const significant = entries.filter((entry) => {
    if (!entry.at || !isSignificantFar(entry)) {
      return false;
    }
    const ms = Date.parse(entry.at);
    return Number.isFinite(ms) && ms >= start.getTime() && ms < end.getTime();
  });

  const byMonth = new Map<string, HorizonEntry[]>();
  for (const entry of significant) {
    const key = monthKey(new Date(entry.at!));
    const list = byMonth.get(key) ?? [];
    list.push(entry);
    byMonth.set(key, list);
  }

  const months: HorizonMonthGroup[] = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, list]) => ({
      monthKey: key,
      label: monthLabel(key),
      count: list.length,
      entries: list.sort(compareHorizonEntries).slice(0, 6)
    }));

  const nextBig = significant[0] ?? null;
  return {
    summary: nextBig
      ? `Your next big event is “${nextBig.title}”.`
      : "Your year map is quiet for now.",
    months,
    nextBig,
    totalCount: significant.length
  };
}

export function buildLaterView(entries: HorizonEntry[]): LaterHorizonView {
  const list = entries.filter((entry) => !entry.at);
  return {
    summary:
      list.length === 0
        ? "Nowhere to park undated ideas yet — add something when it pops up."
        : `${list.length} undated thing${list.length === 1 ? "" : "s"} waiting for a date when you're ready.`,
    entries: list,
    totalCount: list.length
  };
}

/** Home peek — summary + next item only; full detail lives on Coming Up. */
export function buildHomeComingUpPeek(entries: HorizonEntry[], now = new Date()) {
  const today = buildTodayView(entries, now);
  return {
    todaySummary: today.summary,
    next: today.next
  };
}

/** Re-export for miss handling copy — never "OVERDUE". */
export function stillNeedCopy() {
  return "Still need this?";
}

export function plannerStillNeeds(item: PlannerItem, now = new Date()) {
  return stillNeedThis(item, now);
}
