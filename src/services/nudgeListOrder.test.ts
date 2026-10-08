import { describe, expect, it } from "vitest";

import { compareNudgesByDate, isReady4PackItem } from "./nudgeItems";
import type { NudgeItem } from "../types/nudge";

function stub(partial: Partial<NudgeItem> & Pick<NudgeItem, "id" | "title">): NudgeItem {
  return {
    type: "task",
    status: "open",
    children: [],
    attachments: [],
    listItems: [],
    progress: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial
  };
}

describe("isReady4PackItem", () => {
  it("detects Ready4 pack provenance", () => {
    expect(isReady4PackItem(stub({ id: "1", title: "A", sourcePackId: "ready4-study" }))).toBe(true);
    expect(isReady4PackItem(stub({ id: "2", title: "B", sourcePackId: "holiday-planner" }))).toBe(false);
    expect(isReady4PackItem(stub({ id: "3", title: "C" }))).toBe(false);
  });
});

describe("compareNudgesByDate", () => {
  it("sorts scheduled items by date ascending", () => {
    const earlier = stub({ id: "1", title: "Later title", dueDate: "2026-03-01T10:00:00.000Z" });
    const later = stub({ id: "2", title: "Earlier title", dueDate: "2026-04-01T10:00:00.000Z" });
    expect([later, earlier].sort(compareNudgesByDate).map((item) => item.id)).toEqual(["1", "2"]);
  });

  it("puts undated after dated", () => {
    const dated = stub({ id: "1", title: "Z", dueDate: "2026-03-01T10:00:00.000Z" });
    const undated = stub({ id: "2", title: "A", createdAt: "2026-05-01T00:00:00.000Z" });
    expect([undated, dated].sort(compareNudgesByDate).map((item) => item.id)).toEqual(["1", "2"]);
  });

  it("orders lists by due date on Nudges", () => {
    const nightBefore = stub({
      id: "list-1",
      type: "list",
      title: "Night before exam",
      dueDate: "2026-06-14T09:00:00.000Z"
    });
    const examDay = stub({
      id: "list-2",
      type: "list",
      title: "Exam day checklist",
      dueDate: "2026-06-15T09:00:00.000Z"
    });
    const noDate = stub({ id: "list-3", type: "list", title: "Shopping" });
    expect([noDate, examDay, nightBefore].sort(compareNudgesByDate).map((item) => item.id)).toEqual([
      "list-1",
      "list-2",
      "list-3"
    ]);
  });
});
