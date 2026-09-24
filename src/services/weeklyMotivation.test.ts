import { describe, expect, it } from "vitest";

import { buildWeeklyReview, isoWeekKey, WEEKLY_REVIEW_MESSAGE } from "./weeklyMotivation";
import type { RewardEarnEvent } from "../types/rewards";

function event(partial: Partial<RewardEarnEvent> & Pick<RewardEarnEvent, "id" | "title" | "kind">): RewardEarnEvent {
  return {
    points: 1,
    difficulty: "normal",
    earnedAt: "2026-09-10T10:00:00.000Z",
    ...partial
  };
}

const thisWeek = new Date(2026, 8, 10, 12, 0, 0);
const thisWeekIso = new Date(2026, 8, 10, 10, 0, 0).toISOString();

describe("isoWeekKey", () => {
  it("uses the ISO week of the local calendar date", () => {
    expect(isoWeekKey(new Date(2026, 8, 10))).toBe("2026-W37");
  });
});

describe("buildWeeklyReview", () => {
  it("returns null when the week has no ledger activity", () => {
    expect(
      buildWeeklyReview({
        ledger: [event({ id: "old", title: "Last month", kind: "task", earnedAt: "2026-08-01T10:00:00.000Z" })],
        now: thisWeek,
        pointsToNextReward: 4
      })
    ).toBeNull();
  });

  it("summarises completions, tiny steps, and a bigger win without shame copy", () => {
    const review = buildWeeklyReview({
      ledger: [
        event({ id: "1", title: "Open curtains", kind: "task", sourceItemId: "a", earnedAt: thisWeekIso }),
        event({ id: "2", title: "Open curtains", kind: "tiny_step", sourceItemId: "a", earnedAt: thisWeekIso }),
        event({
          id: "3",
          title: "Hard phone call",
          kind: "task",
          points: 3,
          difficulty: "really_hard",
          sourceItemId: "b",
          earnedAt: thisWeekIso
        }),
        event({ id: "4", title: "Tea break", kind: "did_something", earnedAt: thisWeekIso })
      ],
      now: thisWeek,
      pointsToNextReward: 2,
      nextRewardTitle: "Favourite coffee"
    });

    expect(review).not.toBeNull();
    expect(review?.isoWeek).toBe("2026-W37");
    expect(review?.completions).toBe(3);
    expect(review?.madeSmallerCount).toBe(1);
    expect(review?.points).toBe(6);
    expect(review?.mostConsistentTitle).toBe("Open curtains");
    expect(review?.biggestWinTitle).toBe("Hard phone call");
    expect(review?.pointsToNextReward).toBe(2);
    expect(review?.nextRewardTitle).toBe("Favourite coffee");
    expect(review?.message).toBe(WEEKLY_REVIEW_MESSAGE);
    expect(review?.message).not.toMatch(/perfect streak|you failed|overdue|missed/i);
  });
});
