import { describe, expect, it, vi } from "vitest";

import { withTimeout } from "./withTimeout";

describe("withTimeout", () => {
  it("returns the fallback when the work never settles", async () => {
    vi.useFakeTimers();
    const hung = new Promise<string>(() => undefined);
    const result = withTimeout(hung, "fallback", 1500);
    await vi.advanceTimersByTimeAsync(1500);
    await expect(result).resolves.toBe("fallback");
    vi.useRealTimers();
  });

  it("returns the work value when it finishes in time", async () => {
    await expect(withTimeout(Promise.resolve("ok"), "fallback", 1500)).resolves.toBe("ok");
  });

  it("returns the fallback when the work rejects", async () => {
    await expect(withTimeout(Promise.reject(new Error("no")), null, 1500)).resolves.toBeNull();
  });
});
