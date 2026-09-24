import { describe, expect, it } from "vitest";

import {
  datedPlannerItemsForPack,
  listDueDateFromPlannerAnchor,
  listPlannerOffsetLabel,
  plannerItemAnchorIso
} from "./listPlannerAnchor";
import type { PlannerItem } from "../types/ready4Planner";

function planner(partial: Partial<PlannerItem> & Pick<PlannerItem, "id" | "title">): PlannerItem {
  return {
    ready4PackId: "ready4-study",
    sectionId: "milestones",
    type: "deadline",
    status: "planned",
    priority: "normal",
    archived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial
  };
}

describe("listPlannerAnchor", () => {
  it("prefers dueAt over startAt", () => {
    expect(
      plannerItemAnchorIso({
        dueAt: "2026-06-15T09:00:00.000Z",
        startAt: "2026-06-14T09:00:00.000Z"
      })
    ).toBe("2026-06-15T09:00:00.000Z");
  });

  it("sets night-before list to the evening before the exam", () => {
    const due = listDueDateFromPlannerAnchor("2026-06-15T09:30:00.000Z", 1);
    expect(due).toBeTruthy();
    const date = new Date(due!);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(5);
    expect(date.getDate()).toBe(14);
    expect(date.getHours()).toBe(20);
  });

  it("sets exam-day list to the same calendar day", () => {
    const due = listDueDateFromPlannerAnchor("2026-06-15T14:00:00.000Z", 0);
    expect(due).toBeTruthy();
    const date = new Date(due!);
    expect(date.getDate()).toBe(15);
    expect(date.getMonth()).toBe(5);
  });

  it("lists only dated active items for a pack", () => {
    const items = [
      planner({ id: "a", title: "Exam", dueAt: "2026-06-15T09:00:00.000Z" }),
      planner({ id: "b", title: "No date" }),
      planner({ id: "c", title: "Done", dueAt: "2026-06-10T09:00:00.000Z", status: "done" }),
      planner({ id: "d", title: "Other pack", ready4PackId: "ready4-work", dueAt: "2026-06-12T09:00:00.000Z" })
    ];
    expect(datedPlannerItemsForPack(items, "ready4-study").map((item) => item.id)).toEqual(["a"]);
  });

  it("labels night-before offset", () => {
    expect(listPlannerOffsetLabel(0)).toBe("On the day");
    expect(listPlannerOffsetLabel(1)).toBe("Night before");
    expect(listPlannerOffsetLabel(3)).toBe("3 days before");
  });
});
