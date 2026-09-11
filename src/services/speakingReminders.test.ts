import { describe, expect, it } from "vitest";

import { getTimedNudgeAt, shouldScheduleTimedNudge } from "./timedNudge";
import type { NudgeItem } from "../types/nudge";

function item(overrides: Partial<NudgeItem> = {}): NudgeItem {
  const at = new Date().toISOString();
  return {
    id: "n1",
    title: "Dentist",
    type: "appointment",
    status: "open",
    children: [],
    createdAt: at,
    updatedAt: at,
    listItems: [],
    attachments: [],
    guests: [],
    reminderNotificationIds: [],
    nudgeEveryTenMinutesUntilDone: false,
    notifyNudgerIfNotDone: false,
    isLocked: false,
    progress: 0,
    createdBy: { id: "u1", displayName: "You", role: "owner" },
    ...overrides
  } as NudgeItem;
}

describe("timed nudges", () => {
  it("schedules appointments with a future start, not only reminder type", () => {
    const start = new Date();
    start.setHours(start.getHours() + 3);
    const appointment = item({ startDate: start.toISOString() });
    expect(shouldScheduleTimedNudge(appointment)).toBe(true);
    expect(getTimedNudgeAt(appointment)?.toISOString()).toBe(start.toISOString());
  });

  it("does not schedule done or undated items", () => {
    expect(shouldScheduleTimedNudge(item({ type: "reminder", reminderDate: undefined }))).toBe(false);
    const future = new Date();
    future.setDate(future.getDate() + 1);
    expect(
      shouldScheduleTimedNudge(item({ status: "done", reminderDate: future.toISOString(), type: "reminder" }))
    ).toBe(false);
  });
});
