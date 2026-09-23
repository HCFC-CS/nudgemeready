import { describe, expect, it } from "vitest";

import type { NudgeItem } from "../types/nudge";
import type { PlannerItem } from "../types/ready4Planner";
import {
  buildLinkedNudgeFromPlanner,
  findLinkedNudge,
  mapPlannerTypeToNudge,
  plannerNeedsNudgeSync,
  plannerPatchFromNudge
} from "./plannerNudgeLink";

const actor: NudgeItem["createdBy"] = { id: "u1", displayName: "You", role: "owner" };

function planner(overrides: Partial<PlannerItem> = {}): PlannerItem {
  const at = "2026-09-24T09:00:00.000Z";
  return {
    id: "plan_move",
    ready4PackId: "ready4-moving",
    sectionId: "before",
    type: "task",
    title: "Book removals",
    description: null,
    startAt: at,
    endAt: null,
    dueAt: at,
    durationMinutes: null,
    recurring: false,
    recurrenceLabel: null,
    subject: null,
    bringList: [],
    status: "planned",
    priority: "normal",
    notes: null,
    calendarEventId: null,
    nudgeItemId: null,
    rewardNote: null,
    budgetItemId: null,
    crewMemberIds: [],
    archived: false,
    createdAt: at,
    updatedAt: at,
    ...overrides
  };
}

function nudge(overrides: Partial<NudgeItem> = {}): NudgeItem {
  const at = "2026-09-24T09:00:00.000Z";
  return {
    id: "n1",
    title: "Book removals",
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
    createdBy: actor,
    dueDate: at,
    startDate: at,
    sourcePackId: "ready4-moving",
    anchorPlannerItemId: "plan_move",
    ...overrides
  } as NudgeItem;
}

describe("plannerNudgeLink", () => {
  it("maps planner types onto existing nudge types", () => {
    expect(mapPlannerTypeToNudge("appointment")).toBe("appointment");
    expect(mapPlannerTypeToNudge("deadline")).toBe("reminder");
    expect(mapPlannerTypeToNudge("assignment")).toBe("project");
    expect(mapPlannerTypeToNudge("task")).toBe("task");
  });

  it("reuses an existing linked nudge instead of minting a new id", () => {
    const item = planner({ nudgeItemId: "n1" });
    const existing = nudge();
    const found = findLinkedNudge([existing], item);
    expect(found?.id).toBe("n1");
    const next = buildLinkedNudgeFromPlanner(
      { ...item, dueAt: "2026-10-01T09:00:00.000Z", title: "Book van" },
      actor,
      found
    );
    expect(next.id).toBe("n1");
    expect(next.title).toBe("Book van");
    expect(next.dueDate).toBe("2026-10-01T09:00:00.000Z");
  });

  it("finds a linked nudge by planner anchor when the id was not stored", () => {
    const item = planner({ nudgeItemId: null });
    expect(findLinkedNudge([nudge()], item)?.id).toBe("n1");
  });

  it("flags date and title drift so an edit updates the winning nudge", () => {
    const item = planner({ title: "Book van", dueAt: "2026-10-02T10:00:00.000Z" });
    expect(plannerNeedsNudgeSync(item, nudge())).toBe(true);
    expect(plannerNeedsNudgeSync(planner(), nudge())).toBe(false);
  });

  it("mirrors completion and cancel onto the planner source", () => {
    expect(plannerPatchFromNudge(nudge({ status: "done" })).status).toBe("done");
    expect(plannerPatchFromNudge(nudge({ status: "cancelled" })).archived).toBe(true);
  });
});
