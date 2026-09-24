import type { NudgeIntent } from "../types/nudgeIntents";
import type { PlannerItem, PlannerItemType } from "../types/ready4Planner";
import { getPlannerConfig } from "./ready4PlannerConfigs";
import { createPlannerId } from "./ready4PlannerEngine";

export type ParsedPlannerDraft = {
  title: string;
  type: PlannerItemType;
  ready4PackId: string;
  sectionId: string | null;
  startAt: string | null;
  dueAt: string | null;
  durationMinutes: number | null;
  rewardNote: string | null;
  raw: string;
};

const WEEKDAYS: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

function nextWeekday(name: string, now: Date) {
  const target = WEEKDAYS[name];
  if (target == null) {
    return null;
  }
  const date = new Date(now);
  const delta = (target - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + delta);
  return date;
}

function detectPack(text: string, preferredPackId?: string): string {
  if (preferredPackId) {
    return preferredPackId;
  }
  const lower = text.toLowerCase();
  if (/\b(revision|essay|exam|class|lecture|assignment|biology|study)\b/.test(lower)) {
    return "ready4-study";
  }
  if (/\b(meeting|deadline|report|work)\b/.test(lower)) {
    return "ready4-work";
  }
  if (/\b(bin|laundry|cleaning|home)\b/.test(lower)) {
    return "ready4-home";
  }
  if (/\b(wedding|venue|dress)\b/.test(lower)) {
    return "ready4-wedding";
  }
  if (/\b(mov(e|ing)|solicitor|pack(ing)?)\b/.test(lower)) {
    return "ready4-moving";
  }
  if (/\b(baby|scan|pram)\b/.test(lower)) {
    return "ready4-baby";
  }
  if (/\b(flight|hotel|trip|holiday)\b/.test(lower)) {
    return "ready4-travel";
  }
  if (/\b(pet|vet|dog|cat)\b/.test(lower)) {
    return "ready4-pets";
  }
  return "ready4-study";
}

function detectType(text: string, packId: string): PlannerItemType {
  const lower = text.toLowerCase();
  if (/\b(class|lecture|seminar)\b/.test(lower)) {
    return "class";
  }
  if (/\b(essay|assignment|coursework|dissertation)\b/.test(lower)) {
    return "assignment";
  }
  if (/\b(revision|revise|study)\b/.test(lower)) {
    return "revision";
  }
  if (/\b(appointment|scan|fitting)\b/.test(lower)) {
    return "appointment";
  }
  if (/\b(pay|deposit|£)\b/.test(lower)) {
    return "payment";
  }
  if (packId === "ready4-study") {
    return "study";
  }
  return "task";
}

function detectDateTime(text: string, now: Date): { startAt: string | null; dueAt: string | null } {
  const lower = text.toLowerCase();
  const timeMatch = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  let hours = 9;
  let minutes = 0;
  if (timeMatch) {
    hours = Number(timeMatch[1]);
    minutes = Number(timeMatch[2] ?? 0);
    const meridiem = timeMatch[3];
    if (meridiem === "pm" && hours < 12) {
      hours += 12;
    }
    if (meridiem === "am" && hours === 12) {
      hours = 0;
    }
  }

  for (const day of Object.keys(WEEKDAYS)) {
    if (lower.includes(day)) {
      const date = nextWeekday(day, now);
      if (date) {
        date.setHours(hours, minutes, 0, 0);
        return { startAt: date.toISOString(), dueAt: null };
      }
    }
  }

  const monthMatch = lower.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/
  );
  if (monthMatch) {
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december"
    ];
    const month = months.indexOf(monthMatch[2]);
    const day = Number(monthMatch[1]);
    let year = now.getFullYear();
    const candidate = new Date(year, month, day, hours, minutes, 0, 0);
    if (candidate.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
      year += 1;
    }
    const due = new Date(year, month, day, hours, minutes, 0, 0);
    return { startAt: null, dueAt: due.toISOString() };
  }

  return { startAt: null, dueAt: null };
}

function detectDuration(text: string): number | null {
  const match = text.toLowerCase().match(/\b(\d+)\s*mins?\b/) || text.toLowerCase().match(/\b(\d+)\s*minutes?\b/);
  if (match) {
    return Number(match[1]);
  }
  if (/\b30\s*min/.test(text.toLowerCase())) {
    return 30;
  }
  return null;
}

function extractTitle(text: string): string {
  const cleaned = text
    .replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, " ")
    .replace(/\b\d{1,2}(?::\d{2})?\s*(am|pm)?\b/gi, " ")
    .replace(/\b\d+\s*mins?\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "Planner item";
}

export function parsePlannerQuickAdd(raw: string, preferredPackId?: string, now = new Date()): ParsedPlannerDraft {
  const text = raw.trim();
  const ready4PackId = detectPack(text, preferredPackId);
  const type = detectType(text, ready4PackId);
  const { startAt, dueAt } = detectDateTime(text, now);
  const config = getPlannerConfig(ready4PackId);
  const section =
    config?.plannerSections.find((entry) => entry.suggestedItemTypes.includes(type)) ??
    config?.plannerSections[0] ??
    null;

  return {
    title: extractTitle(text),
    type,
    ready4PackId,
    sectionId: section?.id ?? null,
    startAt,
    dueAt,
    durationMinutes: detectDuration(text),
    rewardNote: /\breward|coffee|treat\b/i.test(text) ? "Optional reward" : null,
    raw: text
  };
}

export function draftToPlannerItem(draft: ParsedPlannerDraft): PlannerItem {
  const at = new Date().toISOString();
  return {
    id: createPlannerId(),
    ready4PackId: draft.ready4PackId,
    sectionId: draft.sectionId,
    type: draft.type,
    title: draft.title,
    description: null,
    startAt: draft.startAt,
    endAt: null,
    dueAt: draft.dueAt,
    durationMinutes: draft.durationMinutes,
    recurring: false,
    recurrenceLabel: null,
    subject: null,
    bringList: [],
    status: "planned",
    priority: "normal",
    notes: null,
    calendarEventId: null,
    nudgeItemId: null,
    rewardNote: draft.rewardNote,
    budgetItemId: null,
    crewMemberIds: [],
    archived: false,
    createdAt: at,
    updatedAt: at
  };
}

export function nudgeIntentForPlannerType(type: PlannerItemType): NudgeIntent {
  switch (type) {
    case "assignment":
    case "deadline":
    case "reminder":
      return "remember";
    case "class":
    case "appointment":
    case "event":
      return "book_go";
    case "payment":
      return "buy_pay";
    case "revision":
    case "study":
    case "task":
      return "do";
    case "milestone":
      return "plan";
    default:
      return "plan";
  }
}
