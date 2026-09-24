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

describe("splash JS does not pull calendar, location, or sign-in native modules", () => {
  const root = join(here, "..", "..");

  it("App.tsx does not import geofences or calendar monitors at load", () => {
    const src = readFileSync(join(root, "App.tsx"), "utf8");
    expect(src).not.toMatch(/from ["']\.\/src\/services\/leavingHomeGeofence["']/);
    expect(src).not.toMatch(/from ["']\.\/src\/hooks\/useLeavingHomeMonitor["']/);
    expect(src).not.toMatch(/from ["']\.\/src\/hooks\/usePhoneCalendarImport["']/);
    expect(src).toContain("NativeMonitors");
    expect(src).toContain("waitForSplashNative");
  });

  it("RootNavigator only eagerly loads Splash", () => {
    const src = readFileSync(join(here, "..", "navigation", "RootNavigator.tsx"), "utf8");
    expect(src).toContain('from "../screens/SplashScreen"');
    expect(src).not.toContain('from "../screens/HomeScreen"');
    expect(src).not.toContain("calendarSync");
    expect(src).toContain("getComponent");
  });

  it("socialSignIn does not call WebBrowser during module load", () => {
    const src = readFileSync(join(here, "socialSignIn.ts"), "utf8");
    expect(src).not.toMatch(/from ["']expo-web-browser["']/);
    expect(src).not.toMatch(/from ["']expo-apple-authentication["']/);
    expect(src).toContain("completeAuthSessionAfterSplash");
  });

  it("appSecurity does not import Face ID at module load", () => {
    const src = readFileSync(join(here, "appSecurity.ts"), "utf8");
    expect(src).not.toMatch(/from ["']expo-local-authentication["']/);
    expect(src).toContain('import("expo-local-authentication")');
  });
});
