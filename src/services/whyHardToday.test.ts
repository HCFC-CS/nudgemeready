import { describe, expect, it } from "vitest";

import { getWhyHardReason, WHY_HARD_REASONS, whyHardActionNotice } from "./whyHardToday";

describe("whyHardToday", () => {
  it("covers the supportive friction reasons without diagnosis", () => {
    expect(WHY_HARD_REASONS.map((reason) => reason.id)).toEqual([
      "tired",
      "hungry",
      "stressed",
      "overwhelmed",
      "in_pain",
      "forgot",
      "no_time",
      "missing_what_i_need",
      "not_feeling_well",
      "struggling_to_start",
      "dont_want_to",
      "something_else"
    ]);
    const copy = WHY_HARD_REASONS.map((reason) => `${reason.label} ${reason.message}`).join(" ");
    expect(copy).not.toMatch(/overdue|failed|guilt|diagnos|ADHD|depress|disorder/i);
    expect(getWhyHardReason("overwhelmed")?.actions.map((action) => action.id)).toEqual(["make_smaller"]);
    expect(getWhyHardReason("forgot")?.actions.map((action) => action.id)).toEqual(["later"]);
    expect(getWhyHardReason("no_time")?.actions.some((action) => action.id === "five_minute")).toBe(true);
    expect(getWhyHardReason("dont_want_to")?.message).toContain("None of those is failure");
  });

  it("uses calm notices for next steps", () => {
    expect(whyHardActionNotice("make_smaller")).toContain("tiny step");
    expect(whyHardActionNotice("skip_today")).toContain("tomorrow");
    expect(whyHardActionNotice("later")).not.toMatch(/overdue|penalty/i);
  });
});
