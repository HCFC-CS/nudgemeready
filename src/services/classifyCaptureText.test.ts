import { describe, expect, it } from "vitest";

import { classifyCaptureText } from "./classifyCaptureText";

describe("classifyCaptureText", () => {
  it("turns remind me + tomorrow evening into a dated reminder", () => {
    const result = classifyCaptureText("remind me to take the bins out tomorrow evening");
    expect(result.type).toBe("reminder");
    expect(result.title.toLowerCase()).toMatch(/bins/);
    expect(result.suggestedFields.reminderDate).toBeTruthy();
    const at = new Date(result.suggestedFields.reminderDate!);
    expect(at.getHours()).toBe(19);
  });

  it("files call mum Thursday 4pm as a reminder with that clock time", () => {
    const result = classifyCaptureText("Remind me to call mum Thursday 4pm");
    expect(result.title.toLowerCase()).toMatch(/call mum/);
    expect(result.suggestedFields.reminderDate).toBeTruthy();
    const at = new Date(result.suggestedFields.reminderDate!);
    expect(at.getHours()).toBe(16);
    expect(at.getTime()).toBeGreaterThan(Date.now() - 1000);
  });
});
