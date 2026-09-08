import { describe, expect, it } from "vitest";

import {
  ASSIGNMENT_BREAKDOWN_STEPS,
  activeItems,
  createDefaultPlannerState,
  groupItemsByDay,
  itemsForThisWeek,
  itemsForToday,
  plannerStatusLabel,
  resetFlexibleWeek,
  stillNeedCopy,
  stillNeedThis
} from "./ready4PlannerEngine";
import { draftToPlannerItem, parsePlannerQuickAdd, nudgeIntentForPlannerType } from "./ready4PlannerParse";
import { getPlannerConfig, plannerConfigsForInstalledPacks } from "./ready4PlannerConfigs";
import type { PlannerItem } from "../types/ready4Planner";

function sampleItem(overrides: Partial<PlannerItem> = {}): PlannerItem {
  const at = "2026-05-04T10:00:00.000Z";
  return {
    id: "plan_1",
    ready4PackId: "ready4-study",
    sectionId: "revision",
    type: "revision",
    title: "Biology revision",
    description: null,
    startAt: at,
    endAt: null,
    dueAt: null,
    durationMinutes: 30,
    recurring: false,
    recurrenceLabel: null,
    subject: "Biology",
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

describe("ready4PlannerEngine", () => {
  const now = new Date("2026-05-04T12:00:00");

  it("creates a default empty state", () => {
    const state = createDefaultPlannerState("2026-05-04T00:00:00.000Z");
    expect(state.version).toBe(1);
    expect(state.items).toEqual([]);
  });

  it("filters today and this week items", () => {
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0);
    const midWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 9, 0, 0, 0);
    const later = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 16, 9, 0, 0, 0);
    const items = [
      sampleItem({ id: "a", startAt: todayLocal.toISOString() }),
      sampleItem({ id: "b", startAt: midWeek.toISOString() }),
      sampleItem({ id: "c", startAt: later.toISOString() }),
      sampleItem({ id: "d", archived: true, startAt: todayLocal.toISOString() })
    ];
    expect(itemsForToday(items, undefined, now).map((item) => item.id)).toEqual(["a"]);
    expect(itemsForThisWeek(items, undefined, now).map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("groups by day with calm labels", () => {
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0);
    const tomorrowLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0, 0);
    const groups = groupItemsByDay(
      [
        sampleItem({ startAt: todayLocal.toISOString() }),
        sampleItem({ id: "x", startAt: tomorrowLocal.toISOString() })
      ],
      now
    );
    expect(groups[0]?.label).toBe("Today");
    expect(groups[1]?.label).toBe("Tomorrow");
  });

  it("never labels status as OVERDUE", () => {
    expect(plannerStatusLabel("planned")).toBe("Planned");
    expect(stillNeedCopy()).toBe("Still need this?");
    expect(stillNeedCopy().toLowerCase()).not.toContain("overdue");
    const past = sampleItem({ dueAt: "2026-05-01T09:00:00.000Z", startAt: null });
    expect(stillNeedThis(past, now)).toBe(true);
  });

  it("resetFlexibleWeek moves flexible items but keeps deadlines and classes", () => {
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 10, 0, 0, 0);
    const items = [
      sampleItem({
        id: "flex",
        type: "revision",
        startAt: yesterday.toISOString(),
        status: "planned"
      }),
      sampleItem({
        id: "fixed",
        type: "deadline",
        dueAt: yesterday.toISOString(),
        startAt: null,
        status: "planned"
      }),
      sampleItem({
        id: "class",
        type: "class",
        startAt: yesterday.toISOString(),
        status: "planned"
      })
    ];
    const next = resetFlexibleWeek(items, now);
    expect(next.find((item) => item.id === "flex")?.status).toBe("moved");
    expect(next.find((item) => item.id === "fixed")?.dueAt).toBe(yesterday.toISOString());
    expect(next.find((item) => item.id === "class")?.startAt).toBe(yesterday.toISOString());
  });

  it("exposes assignment breakdown steps", () => {
    expect(ASSIGNMENT_BREAKDOWN_STEPS).toContain("First draft");
    expect(ASSIGNMENT_BREAKDOWN_STEPS).toContain("Submit");
  });

  it("filters active items by pack", () => {
    const items = [
      sampleItem({ id: "1", ready4PackId: "ready4-study" }),
      sampleItem({ id: "2", ready4PackId: "ready4-home" })
    ];
    expect(activeItems(items, "ready4-study")).toHaveLength(1);
  });
});

describe("ready4PlannerParse", () => {
  const now = new Date("2026-05-04T12:00:00");

  it("parses a freeform study revision string", () => {
    const draft = parsePlannerQuickAdd("Revision for biology Monday at 7", "ready4-study", now);
    expect(draft.type).toBe("revision");
    expect(draft.ready4PackId).toBe("ready4-study");
    expect(draft.title.toLowerCase()).toContain("biology");
    expect(draft.startAt).toBeTruthy();
  });

  it("parses a dated payment-style item", () => {
    const draft = parsePlannerQuickAdd("Pay venue deposit £500 on 1 December", undefined, now);
    expect(draft.type).toBe("payment");
    expect(draft.dueAt).toBeTruthy();
  });

  it("builds a planner item from a draft", () => {
    const draft = parsePlannerQuickAdd("Call solicitor Friday", "ready4-moving", now);
    const item = draftToPlannerItem(draft);
    expect(item.id).toMatch(/^plan_/);
    expect(item.archived).toBe(false);
    expect(item.status).toBe("planned");
  });

  it("maps planner types to nudge intents", () => {
    expect(nudgeIntentForPlannerType("assignment")).toBe("remember");
    expect(nudgeIntentForPlannerType("revision")).toBe("do");
    expect(nudgeIntentForPlannerType("appointment")).toBe("book_go");
    expect(nudgeIntentForPlannerType("payment")).toBe("buy_pay");
  });
});

describe("ready4PlannerConfigs", () => {
  it("registers study as the rich reference planner", () => {
    const study = getPlannerConfig("ready4-study");
    expect(study?.plannerSections.map((section) => section.id)).toEqual(
      expect.arrayContaining(["classes", "assignments", "revision", "milestones", "custom"])
    );
  });

  it("only returns configs for installed packs", () => {
    const configs = plannerConfigsForInstalledPacks(["ready4-study", "ready4-home"]);
    expect(configs.map((config) => config.packId).sort()).toEqual(["ready4-home", "ready4-study"]);
    expect(plannerConfigsForInstalledPacks([])).toEqual([]);
  });
});
