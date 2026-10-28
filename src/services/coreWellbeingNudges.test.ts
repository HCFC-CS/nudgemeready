import { describe, expect, it } from "vitest";

import {
  CORE_WELLBEING_NUDGES,
  assertWellbeingCopyIsSupportive,
  matchCoreWellbeing
} from "../data/coreWellbeingNudges";
import { actionsForIntent } from "./nudgeIntentCatalog";
import { ready4WellbeingPack } from "../data/readyPacks/ready4/wellbeing";

describe("core wellbeing nudges", () => {
  it("are available in Do it with no Ready4 pack installed", () => {
    const doing = actionsForIntent("do", []);
    expect(doing.core.map((action) => action.id)).toEqual(
      expect.arrayContaining(["have-a-drink", "ate-something", "move-a-little"])
    );
    expect(doing.pack).toHaveLength(0);
    const drink = doing.core.find((action) => action.id === "have-a-drink");
    expect(drink?.itemType).toBe("list");
    expect(drink?.listItems?.length).toBeGreaterThanOrEqual(3);
    expect(drink?.source).toBe("core");
  });

  it("uses supportive copy with no calorie, weight, or deficit language", () => {
    const labels = CORE_WELLBEING_NUDGES.flatMap((entry) => [entry.title, entry.label, ...entry.listItems]).join(
      " "
    );
    expect(assertWellbeingCopyIsSupportive(labels)).toBe(true);
    expect(labels).toMatch(/skip|rest day|that's okay|that's fine/i);
    expect(CORE_WELLBEING_NUDGES.every((entry) => /not a |skip is fine|rest days/i.test(entry.notes))).toBe(
      true
    );
  });

  it("matches spoken check-ins without attaching a pack", () => {
    expect(matchCoreWellbeing("remind me to drink water")?.kind).toBe("hydration");
    expect(matchCoreWellbeing("I ate something")?.kind).toBe("meal");
    expect(matchCoreWellbeing("a short walk")?.kind).toBe("movement");
  });

  it("keeps the Ready4 Wellbeing pack as lists that reuse the same check-ins", () => {
    const ids = ready4WellbeingPack.content.templates.map((template) => template.id);
    expect(ids).toContain("meal-check");
    expect(ready4WellbeingPack.content.templates.find((template) => template.id === "hydration")?.type).toBe(
      "list"
    );
  });
});
