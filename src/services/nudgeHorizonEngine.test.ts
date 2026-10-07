import { describe, expect, it } from "vitest";

import type { BudgetState } from "../types/budget";
import type { NudgeItem } from "../types/nudge";
import type { PlannerItem } from "../types/ready4Planner";
import { createDefaultBudgetState } from "./budgetStorage";
import {
  applySimplify,
  buildLaterView,
  buildMonthView,
  buildQuarterView,
  buildTodayView,
  buildUnifiedHorizonEntries,
  buildWeekView,
  buildYearView,
  dedupeByTitleAndDay,
  flexibilityForNudge,
  flexibilityForPlanner,
  shouldIncludeNudgeInHorizon,
  stillNeedCopy
} from "./nudgeHorizonEngine";

function nudge(overrides: Partial<NudgeItem> = {}): NudgeItem {
  const at = new Date().toISOString();
  return {
    id: "n1",
    title: "Dentist",
    type: "appointment",
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

function planner(overrides: Partial<PlannerItem> = {}): PlannerItem {
  const at = new Date().toISOString();
  return {
    id: "p1",
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

describe("nudgeHorizonEngine", () => {
  const now = new Date(2026, 4, 4, 12, 0, 0, 0);

  it("marks appointments fixed and revision flexible", () => {
    expect(flexibilityForNudge(nudge({ type: "appointment" }))).toBe("fixed");
    expect(flexibilityForPlanner(planner({ type: "revision" }))).toBe("flexible");
    expect(flexibilityForPlanner(planner({ type: "deadline" }))).toBe("fixed");
  });

  it("skips undated unedited Ready4 catalogue templates", () => {
    expect(
      shouldIncludeNudgeInHorizon(
        nudge({
          id: "pack",
          sourcePackId: "ready4-study",
          userEdited: false,
          startDate: undefined,
          dueDate: undefined,
          reminderDate: undefined,
          endDate: undefined,
          type: "list"
        })
      )
    ).toBe(false);
    expect(
      shouldIncludeNudgeInHorizon(
        nudge({
          id: "pack2",
          sourcePackId: "ready4-study",
          userEdited: true,
          type: "list"
        })
      )
    ).toBe(true);
  });

  it("dedupes planner when linked to a nudge", () => {
    const start = new Date(2026, 4, 4, 10, 30, 0, 0).toISOString();
    const entries = buildUnifiedHorizonEntries({
      nudges: [nudge({ id: "n-dentist", title: "Dentist", startDate: start })],
      plannerItems: [
        planner({
          id: "p-dentist",
          title: "Dentist",
          type: "appointment",
          startAt: start,
          nudgeItemId: "n-dentist"
        })
      ],
      budgetState: createDefaultBudgetState(),
      coreBudgetId: createDefaultBudgetState().budgets[0]!.id,
      now
    });
    expect(entries.filter((entry) => entry.title === "Dentist")).toHaveLength(1);
    expect(entries[0]?.sourceKind).toBe("nudge");
  });

  it("dedupes same title on same day across sources", () => {
    const start = new Date(2026, 4, 4, 10, 30, 0, 0).toISOString();
    const merged = dedupeByTitleAndDay([
      {
        id: "nudge:1",
        sourceKind: "nudge",
        sourceId: "1",
        title: "Dentist",
        at: start,
        flexibility: "fixed",
        label: "BOOK & GO"
      },
      {
        id: "planner:2",
        sourceKind: "planner",
        sourceId: "2",
        title: "Dentist",
        at: start,
        flexibility: "fixed",
        label: "APPOINTMENT"
      }
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.sourceKind).toBe("nudge");
  });

  it("builds today with calm summary and never says overdue", () => {
    const start = new Date(2026, 4, 4, 10, 30, 0, 0).toISOString();
    const entries = buildUnifiedHorizonEntries({
      nudges: [nudge({ id: "a", title: "Dentist", startDate: start, type: "appointment" })],
      plannerItems: [
        planner({
          id: "b",
          title: "Revision",
          startAt: new Date(2026, 4, 4, 18, 0, 0, 0).toISOString(),
          type: "revision"
        })
      ],
      budgetState: createDefaultBudgetState(),
      coreBudgetId: createDefaultBudgetState().budgets[0]!.id,
      now
    });
    const today = buildTodayView(entries, now);
    expect(today.fixedCount).toBeGreaterThanOrEqual(1);
    expect(today.summary.toLowerCase()).not.toContain("overdue");
    expect(stillNeedCopy()).toBe("Still need this?");
  });

  it("builds week month quarter year and later horizons", () => {
    const budget = createDefaultBudgetState() as BudgetState;
    const coreId = budget.budgets[0]!.id;
    const entries = buildUnifiedHorizonEntries({
      nudges: [
        nudge({
          id: "a",
          title: "Meeting",
          type: "event",
          startDate: new Date(2026, 4, 5, 9, 0, 0, 0).toISOString()
        }),
        nudge({
          id: "b",
          title: "Holiday",
          type: "event",
          startDate: new Date(2026, 6, 1, 9, 0, 0, 0).toISOString()
        }),
        nudge({
          id: "c",
          title: "Sort photos",
          type: "task",
          startDate: undefined,
          dueDate: undefined
        })
      ],
      plannerItems: [],
      budgetState: budget,
      coreBudgetId: coreId,
      now
    });

    expect(buildWeekView(entries, now).totalCount).toBeGreaterThanOrEqual(1);
    expect(buildMonthView(entries, now).summary.length).toBeGreaterThan(0);
    expect(buildQuarterView(entries, now).entries.some((entry) => entry.title === "Holiday")).toBe(true);
    expect(buildYearView(entries, now).months.length).toBeGreaterThan(0);
    expect(buildLaterView(entries).entries.some((entry) => entry.title === "Sort photos")).toBe(true);
  });

  it("simplify modes hide optional and keep fixed", () => {
    const start = new Date(2026, 4, 4, 10, 0, 0, 0).toISOString();
    const entries = [
      {
        id: "1",
        sourceKind: "nudge" as const,
        sourceId: "1",
        title: "Appt",
        at: start,
        flexibility: "fixed" as const,
        label: "BOOK & GO",
        priority: "important" as const
      },
      {
        id: "2",
        sourceKind: "planner" as const,
        sourceId: "2",
        title: "Tidy desk",
        at: start,
        flexibility: "flexible" as const,
        label: "DO",
        priority: "low" as const
      }
    ];
    expect(applySimplify(entries, "fixed_only")).toHaveLength(1);
    expect(applySimplify(entries, "hide_optional")).toHaveLength(1);
    expect(applySimplify(entries, "as_is")).toHaveLength(2);
  });

  it("week overwhelm surfaces what matters most", () => {
    const entries = Array.from({ length: 12 }, (_, index) => ({
      id: `e${index}`,
      sourceKind: "nudge" as const,
      sourceId: `e${index}`,
      title: `Thing ${index}`,
      at: new Date(2026, 4, 4 + (index % 5), 10, 0, 0, 0).toISOString(),
      flexibility: (index < 3 ? "fixed" : "flexible") as const,
      label: "DO",
      priority: (index < 3 ? "important" : "normal") as const
    }));
    const week = buildWeekView(entries, now);
    expect(week.overwhelm).toBe(true);
    expect(week.whatMattersMost.length).toBeLessThanOrEqual(3);
  });
});
