import { describe, expect, it } from "vitest";

import type { NudgeItem } from "../types/nudge";
import { createItem, getChildrenForParent, linkChildToParent, upsertNudgeItem } from "./nudgeItems";

function project(partial: Partial<NudgeItem> = {}): NudgeItem {
  return createItem({
    id: "project-1",
    title: "Kitchen",
    type: "project",
    ...partial
  });
}

describe("project child linking", () => {
  it("keeps the project when a task is saved onto it", () => {
    const parent = project();
    const task = createItem({
      title: "Buy paint",
      type: "task",
      parentId: parent.id
    });

    const next = upsertNudgeItem([parent], task);
    const savedProject = next.find((item) => item.id === parent.id);
    const savedTask = next.find((item) => item.id === task.id);

    expect(savedProject).toBeTruthy();
    expect(savedTask?.parentId).toBe(parent.id);
    expect(savedProject?.children).toContain(task.id);
    expect(getChildrenForParent(next, parent.id).map((item) => item.title)).toEqual(["Buy paint"]);
  });

  it("lets more items be added onto the same project", () => {
    const parent = project();
    const first = createItem({ title: "Buy paint", type: "task", parentId: parent.id });
    const second = createItem({ title: "Call builder", type: "reminder", parentId: parent.id });

    const afterFirst = upsertNudgeItem([parent], first);
    const afterSecond = upsertNudgeItem(afterFirst, second);
    const savedProject = afterSecond.find((item) => item.id === parent.id);

    expect(getChildrenForParent(afterSecond, parent.id).map((item) => item.id).sort()).toEqual(
      [first.id, second.id].sort()
    );
    expect(savedProject?.children).toEqual([first.id, second.id]);
  });

  it("does not drop a project that is not in the list yet", () => {
    const task = createItem({ title: "Buy paint", type: "task", parentId: "missing-project" });
    const next = upsertNudgeItem([], task);
    expect(next.map((item) => item.id)).toEqual([task.id]);
    expect(linkChildToParent(next, task).map((item) => item.id)).toEqual([task.id]);
  });
});
