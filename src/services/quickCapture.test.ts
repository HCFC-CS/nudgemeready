import { describe, expect, it } from "vitest";

import { CORE_NUDGE_ACTIONS } from "./coreNudgeActions";
import { applyDefaultWhen, canQuickSave, defaultWhenIso, ensureFutureWhen } from "./quickCapture";

describe("quickCapture", () => {
  it("saves when there is a title", () => {
    expect(canQuickSave("Take the bins out")).toBe(true);
    expect(canQuickSave("   ")).toBe(false);
  });

  it("opens details for Prepare for something instead of jumping to Nudges", () => {
    expect(canQuickSave("Prepare for ", "Prepare for ")).toBe(false);
    expect(canQuickSave("Prepare for", "Prepare for ")).toBe(false);
    expect(canQuickSave("Prepare for the dentist", "Prepare for ")).toBe(true);
  });

  it("treats other unfinished action prefixes the same way", () => {
    const prefixes = CORE_NUDGE_ACTIONS.filter(
      (action) => action.defaultTitle && /[\s:]$/.test(action.defaultTitle)
    );
    expect(prefixes.some((action) => action.id === "prepare-something")).toBe(true);
    for (const action of prefixes) {
      expect(canQuickSave(action.defaultTitle ?? "", action.defaultTitle)).toBe(false);
    }
  });

  it("picks later today before evening", () => {
    const morning = new Date(2026, 8, 10, 10, 0, 0);
    const iso = defaultWhenIso(morning);
    const at = new Date(iso);
    expect(at.getHours()).toBe(18);
    expect(at.getDate()).toBe(10);
  });

  it("picks tomorrow morning late at night", () => {
    const late = new Date(2026, 8, 10, 22, 0, 0);
    const at = new Date(defaultWhenIso(late));
    expect(at.getDate()).toBe(11);
    expect(at.getHours()).toBe(9);
  });

  it("fills a reminder when no date was given", () => {
    const now = new Date(2026, 8, 10, 11, 0, 0);
    const fields = applyDefaultWhen({}, "reminder", now);
    expect(fields.reminderDate).toBeTruthy();
    expect(new Date(fields.reminderDate!).getTime()).toBeGreaterThan(now.getTime());
  });

  it("keeps a future time", () => {
    const now = new Date(2026, 8, 10, 11, 0, 0);
    const future = new Date(2026, 8, 11, 19, 0, 0).toISOString();
    expect(ensureFutureWhen(future, now)).toBe(future);
  });
});
