import { describe, expect, it } from "vitest";

import {
  getScreenshotScreenId,
  isScreenshotMode,
  shouldUseScreenshotDemoProfile
} from "./screenshotState";

describe("screenshotState", () => {
  it("stays off in Node / native with no query string", () => {
    expect(getScreenshotScreenId()).toBeUndefined();
    expect(isScreenshotMode()).toBe(false);
    expect(shouldUseScreenshotDemoProfile()).toBe(false);
  });
});
