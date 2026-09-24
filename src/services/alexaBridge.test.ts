import { describe, expect, it } from "vitest";

import { formatAlexaLinkCodeForSpeech, toAlexaNudgeSnapshot } from "./alexaBridge";
import type { NudgeItem } from "../types/nudge";

function item(partial: Partial<NudgeItem> & Pick<NudgeItem, "id" | "title" | "type" | "status">): NudgeItem {
  return {
    children: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    attachments: [],
    reminderNotificationIds: [],
    listItems: [],
    ...partial
  };
}

describe("alexaBridge helpers", () => {
  it("formats link codes for speech", () => {
    expect(formatAlexaLinkCodeForSpeech("123456")).toBe("1 2 3 4 5 6");
  });

  it("snapshots only open non-Ready4 nudges", () => {
    const snapshot = toAlexaNudgeSnapshot([
      item({ id: "1", title: "Buy milk", type: "reminder", status: "open" }),
      item({ id: "2", title: "Done one", type: "task", status: "done" }),
      item({
        id: "3",
        title: "Pack item",
        type: "task",
        status: "open",
        sourcePackId: "ready4-study"
      })
    ]);
    expect(snapshot).toEqual([{ id: "1", title: "Buy milk", type: "reminder", status: "open" }]);
  });
});
