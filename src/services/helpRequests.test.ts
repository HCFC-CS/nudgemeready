import { describe, expect, it } from "vitest";

import { buildHelpMessage } from "./helpRequests";

describe("help request copy", () => {
  it("includes the nudge title when asking from the list", () => {
    expect(buildHelpMessage("Sam", "Remind me", "Take the bins out")).toContain("Take the bins out");
  });

  it("still works without a nudge title", () => {
    expect(buildHelpMessage("Sam", "Encourage me")).toMatch(/encourage me/i);
    expect(buildHelpMessage("Sam", "Encourage me")).not.toContain("with “");
  });
});
