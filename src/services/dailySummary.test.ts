import { describe, expect, it } from "vitest";

import { buildDailySummaryBody, itemsDueToday } from "./dailySummaryCopy";
import type { NudgeItem } from "../types/nudge";

function item(title: string, when: Date, status: NudgeItem["status"] = "open"): NudgeItem {
  const at = when.toISOString();
  return {
    id: title,
    title,
    type: "reminder",
    status,
    children: [],
    createdAt: at,
    updatedAt: at,
    reminderDate: at,
    listItems: [],
    attachments: [],
    guests: [],
    reminderNotificationIds: [],
    nudgeEveryTenMinutesUntilDone: false,
    notifyNudgerIfNotDone: false,
    isLocked: false,
    progress: 0,
    createdBy: { id: "u1", displayName: "You", role: "owner" }
  } as NudgeItem;
}

describe("daily summary copy", () => {
  const now = new Date(2026, 8, 10, 8, 0, 0);

  it("stays silent when nothing is due today", () => {
    const tomorrow = new Date(2026, 8, 11, 9, 0, 0);
    expect(buildDailySummaryBody([item("Bins", tomorrow)], now)).toBeNull();
  });

  it("names today's open titles", () => {
    const today = new Date(2026, 8, 10, 19, 0, 0);
    const body = buildDailySummaryBody(
      [item("Bins", today), item("Call mum", today), item("Done already", today, "done")],
      now
    );
    expect(body).toBe("Today: Bins and Call mum.");
    expect(itemsDueToday([item("Bins", today), item("Done already", today, "done")], now)).toHaveLength(1);
  });
});
