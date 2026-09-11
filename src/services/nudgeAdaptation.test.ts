import { describe, expect, it } from "vitest";

import {
  ADAPTATION_HEADLINE,
  frequencyReductionNotice,
  isStalledNudge,
  moveNudgeToTomorrow,
  pickStalledNudge,
  reduceNudgeFrequency
} from "./nudgeAdaptation";
import type { NudgeItem } from "../types/nudge";

function stub(partial: Partial<NudgeItem> & Pick<NudgeItem, "id" | "title">): NudgeItem {
  return {
    type: "task",
    status: "open",
    children: [],
    attachments: [],
    listItems: [],
    progress: 0,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    ...partial
  };
}

const now = new Date(2026, 8, 10, 12, 0, 0); // 10 Sep 2026 local

describe("isStalledNudge", () => {
  it("offers adaptation when an open dated item is at least two days past", () => {
    const stalled = stub({
      id: "1",
      title: "Post a letter",
      dueDate: new Date(2026, 8, 8, 9, 0, 0).toISOString()
    });
    expect(isStalledNudge(stalled, now)).toBe(true);
  });

  it("does not treat yesterday or undated items as stalled", () => {
    const yesterday = stub({
      id: "2",
      title: "Yesterday",
      dueDate: new Date(2026, 8, 9, 9, 0, 0).toISOString()
    });
    const undated = stub({ id: "3", title: "Someday" });
    const done = stub({
      id: "4",
      title: "Done",
      status: "done",
      dueDate: new Date(2026, 8, 1, 9, 0, 0).toISOString()
    });
    expect(isStalledNudge(yesterday, now)).toBe(false);
    expect(isStalledNudge(undated, now)).toBe(false);
    expect(isStalledNudge(done, now)).toBe(false);
  });

  it("waits before offering the same item again", () => {
    const recentlyOffered = stub({
      id: "5",
      title: "Call the dentist",
      dueDate: new Date(2026, 8, 1, 9, 0, 0).toISOString(),
      adaptationOfferedAt: new Date(2026, 8, 7, 12, 0, 0).toISOString()
    });
    const offeredLastWeek = stub({
      id: "6",
      title: "Call the dentist",
      dueDate: new Date(2026, 8, 1, 9, 0, 0).toISOString(),
      adaptationOfferedAt: new Date(2026, 8, 2, 12, 0, 0).toISOString()
    });
    expect(isStalledNudge(recentlyOffered, now)).toBe(false);
    expect(isStalledNudge(offeredLastWeek, now)).toBe(true);
  });
});

describe("pickStalledNudge", () => {
  it("returns the most stalled open item only", () => {
    const older = stub({
      id: "old",
      title: "Older",
      dueDate: new Date(2026, 8, 1, 9, 0, 0).toISOString()
    });
    const newer = stub({
      id: "new",
      title: "Newer",
      dueDate: new Date(2026, 8, 7, 9, 0, 0).toISOString()
    });
    expect(pickStalledNudge([newer, older], now)?.id).toBe("old");
  });
});

describe("moveNudgeToTomorrow", () => {
  it("parks dates at 9:00 tomorrow and stays open", () => {
    const item = stub({
      id: "move",
      title: "Move me",
      dueDate: new Date(2026, 8, 1, 15, 0, 0).toISOString(),
      startDate: new Date(2026, 8, 1, 15, 0, 0).toISOString()
    });
    const updates = moveNudgeToTomorrow(item, now);
    expect(updates.status).toBe("open");
    const moved = new Date(updates.dueDate!);
    expect(moved.getFullYear()).toBe(2026);
    expect(moved.getMonth()).toBe(8);
    expect(moved.getDate()).toBe(11);
    expect(moved.getHours()).toBe(9);
    expect(updates.startDate).toBe(updates.dueDate);
    expect(updates.adaptationOfferedAt).toBe(now.toISOString());
  });
});

describe("reduceNudgeFrequency", () => {
  it("steps daily to weekly, weekly to monthly, otherwise pauses", () => {
    const daily = reduceNudgeFrequency(
      stub({ id: "d", title: "Daily", repeatRule: { frequency: "daily" } }),
      now
    );
    const weekly = reduceNudgeFrequency(
      stub({ id: "w", title: "Weekly", repeatRule: { frequency: "weekly" } }),
      now
    );
    const once = reduceNudgeFrequency(stub({ id: "o", title: "Once" }), now);
    expect(daily.nextFrequency).toBe("weekly");
    expect(daily.paused).toBe(false);
    expect(weekly.nextFrequency).toBe("monthly");
    expect(once.paused).toBe(true);
    expect(once.updates.status).toBe("paused");
    expect(frequencyReductionNotice(once)).toContain("Paused");
    expect(frequencyReductionNotice(daily)).toContain("weekly");
  });
});

describe("adaptation copy", () => {
  it("never uses overdue or penalty language", () => {
    expect(ADAPTATION_HEADLINE).toBe("This one doesn't seem to be working for you.");
    expect(ADAPTATION_HEADLINE).not.toMatch(/overdue|missed|failed|penalty/i);
  });
});
