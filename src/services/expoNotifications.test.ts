import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));

describe("waitForSplashNative", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not resolve until splash has had time to paint", async () => {
    const { waitForSplashNative } = await import("./expoNotifications");
    let done = false;
    void waitForSplashNative().then(() => {
      done = true;
    });
    await vi.advanceTimersByTimeAsync(2499);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toBe(true);
  });

  it("shares one timer so later callers are not delayed twice", async () => {
    const { waitForSplashNative } = await import("./expoNotifications");
    let first = false;
    let second = false;
    void waitForSplashNative().then(() => {
      first = true;
    });
    await vi.advanceTimersByTimeAsync(1000);
    void waitForSplashNative().then(() => {
      second = true;
    });
    await vi.advanceTimersByTimeAsync(1500);
    expect(first).toBe(true);
    expect(second).toBe(true);
  });
});

describe("startup files do not statically import expo-notifications", () => {
  const files = [
    "notifications.ts",
    "speakingReminders.ts",
    "dailySummary.ts",
    "captainAlerts.ts",
    "payLaterReminders.ts",
    "leavingHomeGeofence.ts",
    join("..", "hooks", "useSpeakingReminderNotifications.ts")
  ];

  it.each(files)("%s loads the native module only after splash", (file) => {
    const src = readFileSync(join(here, file), "utf8");
    expect(src).not.toMatch(/from ["']expo-notifications["']/);
    expect(src).toContain("loadExpoNotifications");
  });
});
