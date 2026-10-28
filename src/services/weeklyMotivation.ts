import type { RewardEarnEvent } from "../types/rewards";

export const WEEKLY_REVIEW_MESSAGE = "You didn't need a perfect week. You still moved forward.";

export type WeeklyReview = {
  isoWeek: string;
  completions: number;
  points: number;
  madeSmallerCount: number;
  mostConsistentTitle?: string;
  biggestWinTitle?: string;
  pointsToNextReward: number;
  nextRewardTitle?: string;
  message: string;
};

/** ISO week key such as 2026-W37, from the local calendar date. */
export function isoWeekKey(date: Date): string {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function eventsThisWeek(ledger: RewardEarnEvent[], weekKey: string) {
  return ledger.filter((event) => {
    const at = new Date(event.earnedAt);
    if (Number.isNaN(at.getTime())) {
      return false;
    }
    return isoWeekKey(at) === weekKey;
  });
}

/**
 * Supportive weekly snapshot from the existing Reward Bank ledger.
 * Hidden when the week has no activity — never scolds a quiet week.
 */
export function buildWeeklyReview(input: {
  ledger: RewardEarnEvent[];
  now?: Date;
  pointsToNextReward: number;
  nextRewardTitle?: string;
}): WeeklyReview | null {
  const now = input.now ?? new Date();
  const weekKey = isoWeekKey(now);
  const events = eventsThisWeek(input.ledger, weekKey);
  if (!events.length) {
    return null;
  }

  const completions = events.filter(
    (event) => event.kind === "task" || event.kind === "did_something"
  ).length;
  const madeSmallerCount = events.filter((event) => event.kind === "tiny_step").length;
  const points = events.reduce((total, event) => total + event.points, 0);

  const counts = new Map<string, { title: string; count: number }>();
  for (const event of events) {
    const key = event.sourceItemId || event.title;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { title: event.title, count: 1 });
    }
  }
  const mostConsistent = [...counts.values()].sort((a, b) => b.count - a.count)[0];
  const biggest = [...events].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (a.kind === "task" && b.kind !== "task") {
      return -1;
    }
    if (b.kind === "task" && a.kind !== "task") {
      return 1;
    }
    return 0;
  })[0];

  return {
    isoWeek: weekKey,
    completions,
    points,
    madeSmallerCount,
    mostConsistentTitle: mostConsistent && mostConsistent.count >= 2 ? mostConsistent.title : undefined,
    biggestWinTitle: biggest?.title,
    pointsToNextReward: Math.max(0, input.pointsToNextReward),
    nextRewardTitle: input.nextRewardTitle,
    message: WEEKLY_REVIEW_MESSAGE
  };
}
