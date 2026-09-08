import { describe, expect, it } from "vitest";

import {
  buildBreakdownListItems,
  buildStepReminderSchedule,
  findTaskBreakdowns,
  formatBreakdownNotes,
  taskBreakdownPlans
} from "./taskBreakdowns";

describe("findTaskBreakdowns", () => {
  it("matches kitchen clean to the kitchen plan", () => {
    const plans = findTaskBreakdowns("Clean the kitchen");
    expect(plans[0]?.id).toBe("kitchen");
    expect(plans[0]?.steps.map((step) => step.title)).toEqual([
      "Wipe the sides",
      "Clean the dishes",
      "Put the dishes away",
      "Clean the floor",
      "Change the bin"
    ]);
  });

  it("falls back to a gentle generic plan when nothing matches", () => {
    const plans = findTaskBreakdowns("something totally obscure xyz");
    expect(plans).toHaveLength(1);
    expect(plans[0]?.id).toBe("generic-overwhelm");
  });

  it("suggests popular plans when the title is empty", () => {
    const plans = findTaskBreakdowns("", 3);
    expect(plans).toHaveLength(3);
    expect(plans.every((plan) => plan.id !== "generic-overwhelm")).toBe(true);
  });
});

describe("buildStepReminderSchedule", () => {
  it("spaces kitchen steps across about 60 minutes with breaks between", () => {
    const kitchen = taskBreakdownPlans.find((plan) => plan.id === "kitchen")!;
    const start = new Date("2026-08-24T10:00:00.000Z");
    const schedule = buildStepReminderSchedule(kitchen, start);

    expect(schedule).toHaveLength(5);
    expect(schedule[0]?.at.toISOString()).toBe("2026-08-24T10:00:00.000Z");
    // 8 + 3 break → next at 10:11
    expect(schedule[1]?.at.toISOString()).toBe("2026-08-24T10:11:00.000Z");
    // last step starts after prior work+breaks; total window ~60 mins
    const last = schedule[schedule.length - 1]!;
    const elapsedMins = (last.at.getTime() - start.getTime()) / 60_000;
    expect(elapsedMins).toBeLessThan(kitchen.totalMinutes);
    expect(schedule[0]?.speakingReminderText).toContain("Wipe the sides");
    expect(schedule[1]?.speakingReminderText).toContain("Clean the dishes");
  });
});

describe("breakdown helpers", () => {
  it("builds checklist items and supportive notes", () => {
    const kitchen = taskBreakdownPlans.find((plan) => plan.id === "kitchen")!;
    const items = buildBreakdownListItems(kitchen, 1);
    expect(items).toHaveLength(5);
    expect(items[0]).toEqual({ id: "step-1-0", title: "1. Wipe the sides", status: "open" });
    expect(formatBreakdownNotes(kitchen)).toContain("~60 mins");
    expect(formatBreakdownNotes(kitchen)).toContain("short break");
  });
});
