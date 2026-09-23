import { describe, expect, it } from "vitest";

import type { NudgeItem } from "../types/nudge";
import { countTodayProgress } from "./dailyControlCentre";

function item(overrides: Partial<NudgeItem>): NudgeItem {
  const at = new Date().toISOString();
  return {
    id: "n1",
    title: "Task",
    type: "task",
    status: "open",
    parentId: undefined,
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

describe("countTodayProgress", () => {
  const now = new Date(2026, 8, 23, 12, 0, 0, 0);

  it("counts done and left for today's dated nudges", () => {
    const result = countTodayProgress(
      [
        item({ id: "1", title: "Call", dueDate: new Date(2026, 8, 23, 10, 0, 0, 0).toISOString(), status: "done" }),
        item({ id: "2", title: "Bins", dueDate: new Date(2026, 8, 23, 19, 0, 0, 0).toISOString(), status: "open" }),
        item({ id: "3", title: "Tomorrow", dueDate: new Date(2026, 8, 24, 9, 0, 0, 0).toISOString(), status: "open" })
      ],
      now
    );
    expect(result).toEqual({ total: 2, done: 1, left: 1 });
  });
});
