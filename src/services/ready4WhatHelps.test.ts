import { describe, expect, it } from "vitest";

import {
  isWhatHelpsTemplate,
  resolveWhatHelpsItemId,
  resolveWhatHelpsTemplateIds
} from "./ready4WhatHelps";

describe("ready4WhatHelps", () => {
  it("detects what-helps templates", () => {
    expect(isWhatHelpsTemplate("what-helps")).toBe(true);
    expect(isWhatHelpsTemplate("assignment-planner")).toBe(false);
  });

  it("routes Study assignment rows to step tools", () => {
    expect(resolveWhatHelpsTemplateIds("ready4-study", "Break one assignment into steps")).toEqual([
      "assignment-steps",
      "assignment-planner"
    ]);
  });

  it("treats rest as a valid stop", () => {
    expect(resolveWhatHelpsTemplateIds("ready4-study", "Rest — also valid")).toEqual([]);
    expect(
      resolveWhatHelpsItemId("ready4-study", "Rest — also valid", { "assignment-steps": "1" }).restOutcome
    ).toBe(true);
  });

  it("resolves installed sibling item ids", () => {
    const result = resolveWhatHelpsItemId(
      "ready4-moving",
      "Pack one room",
      { packing: "pack-1", documents: "doc-1" }
    );
    expect(result.itemId).toBe("pack-1");
    expect(result.templateId).toBe("packing");
  });
});
