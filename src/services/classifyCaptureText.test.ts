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

  it("treats Friday afternoon as a dated reminder at 14:00", () => {
    const result = classifyCaptureText("Remind me Friday afternoon to order prescription");
    expect(result.title.toLowerCase()).toMatch(/order prescription/);
    expect(result.extractedTime).toBe("14:00");
    expect(result.suggestedFields.reminderDate).toBeTruthy();
  });

  it("treats standalone morning as 09:00", () => {
    const result = classifyCaptureText("Call the dentist tomorrow morning");
    expect(result.extractedTime).toBe("09:00");
    expect(result.title.toLowerCase()).toMatch(/call the dentist/);
  });

  it("reads a day and month name such as 1 October", () => {
    const result = classifyCaptureText("Book removals 1 October");
    expect(result.extractedDate).toMatch(/-10-01$/);
    expect(result.title.toLowerCase()).toMatch(/book removals/);
  });
});
