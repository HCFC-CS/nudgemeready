import type { NudgeItem, NudgeRepeatRule } from "../types/nudge";
import { getPrimaryDate } from "./nudgeItems";

export const ADAPTATION_HEADLINE = "This one doesn't seem to be working for you.";

const STALL_AFTER_DAYS = 2;
const REOFFER_AFTER_DAYS = 7;

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetweenLocalDays(later: Date, earlier: Date) {
  return Math.round(
    (startOfLocalDay(later).getTime() - startOfLocalDay(earlier).getTime()) / 86_400_000
  );
}

export function tomorrowMorningIso(now = new Date()) {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow.toISOString();
}

export function markAdaptationOffered(now = new Date()): Pick<NudgeItem, "adaptationOfferedAt"> {
  return { adaptationOfferedAt: now.toISOString() };
}

export function daysPastPrimaryDate(item: Pick<NudgeItem, "startDate" | "dueDate" | "reminderDate" | "endDate">, now = new Date()) {
  const primary = getPrimaryDate(item as NudgeItem);
  if (!primary) {
    return 0;
  }
  return daysBetweenLocalDays(now, primary);
}

export function isStalledNudge(item: NudgeItem, now = new Date()): boolean {
  if (item.status !== "open") {
    return false;
  }
  const primary = getPrimaryDate(item);
  if (!primary) {
    return false;
  }
  if (daysBetweenLocalDays(now, primary) < STALL_AFTER_DAYS) {
    return false;
  }
  if (item.adaptationOfferedAt) {
    const offered = new Date(item.adaptationOfferedAt);
    if (!Number.isNaN(offered.getTime()) && daysBetweenLocalDays(now, offered) < REOFFER_AFTER_DAYS) {
      return false;
    }
  }
  return true;
}

/** Oldest stalled dated item — one prompt at a time. */
export function pickStalledNudge(items: NudgeItem[], now = new Date()): NudgeItem | undefined {
  const stalled = items.filter((item) => isStalledNudge(item, now));
  stalled.sort((first, second) => {
    const byDays = daysPastPrimaryDate(second, now) - daysPastPrimaryDate(first, now);
    if (byDays !== 0) {
      return byDays;
    }
    const firstDate = getPrimaryDate(first)?.getTime() ?? 0;
    const secondDate = getPrimaryDate(second)?.getTime() ?? 0;
    if (firstDate !== secondDate) {
      return firstDate - secondDate;
    }
    return first.id.localeCompare(second.id);
  });
  return stalled[0];
}

/**
 * Park the nudge at 9:00 tomorrow. Stays open. No extra reminders, no penalty.
 */
export function moveNudgeToTomorrow(item: NudgeItem, now = new Date()): Partial<NudgeItem> {
  const iso = tomorrowMorningIso(now);
  const updates: Partial<NudgeItem> = {
    status: "open",
    dueDate: iso,
    reminderDate: iso,
    ...markAdaptationOffered(now)
  };
  if (item.startDate) {
    updates.startDate = iso;
  }
  if (item.endDate) {
    updates.endDate = iso;
  }
  return updates;
}

export type FrequencyReduction = {
  nextFrequency: NudgeRepeatRule["frequency"];
  paused: boolean;
  updates: Partial<NudgeItem>;
};

export function reduceNudgeFrequency(item: NudgeItem, now = new Date()): FrequencyReduction {
  const current = item.repeatRule?.frequency ?? "none";
  if (current === "daily") {
    return {
      nextFrequency: "weekly",
      paused: false,
      updates: {
        repeatRule: { ...item.repeatRule, frequency: "weekly" },
        ...markAdaptationOffered(now)
      }
    };
  }
  if (current === "weekly") {
    return {
      nextFrequency: "monthly",
      paused: false,
      updates: {
        repeatRule: { ...item.repeatRule, frequency: "monthly" },
        ...markAdaptationOffered(now)
      }
    };
  }
  return {
    nextFrequency: current,
    paused: true,
    updates: {
      status: "paused",
      ...markAdaptationOffered(now)
    }
  };
}

export function frequencyReductionNotice(result: FrequencyReduction): string {
  if (result.paused) {
    return "Paused for now. You can open it again whenever you like.";
  }
  if (result.nextFrequency === "weekly") {
    return "We'll keep this on a weekly rhythm.";
  }
  if (result.nextFrequency === "monthly") {
    return "We'll keep this on a monthly rhythm.";
  }
  return "We'll check in less often.";
}
