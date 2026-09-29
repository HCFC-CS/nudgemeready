import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

describe("waitForNativeModules", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits for splash plus a settle window before native modules run", async () => {
    const { waitForNativeModules } = await import("./expoNotifications");
    let done = false;
    void waitForNativeModules().then(() => {
      done = true;
    });
    await vi.advanceTimersByTimeAsync(2500);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(1999);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toBe(true);
  });

  it("shares one settle timer", async () => {
    const { waitForNativeModules } = await import("./expoNotifications");
    let first = false;
    let second = false;
    void waitForNativeModules().then(() => {
      first = true;
    });
    await vi.advanceTimersByTimeAsync(3000);
    void waitForNativeModules().then(() => {
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

  it("App.tsx is a plain RN shell until after splash delay", () => {
    const src = readFileSync(join(root, "App.tsx"), "utf8");
    expect(src).not.toContain("react-native-gesture-handler");
    expect(src).not.toContain("expo-linking");
    expect(src).not.toContain("NativeMonitors");
    expect(src).toContain("waitForSplashNative");
    expect(src).not.toContain("waitForNativeModules");
    expect(src).toContain("./src/NudgeApp");
  });

  it("NudgeApp still delays calendar and location monitors", () => {
    const src = readFileSync(join(here, "..", "NudgeApp.tsx"), "utf8");
    expect(src).not.toMatch(/from ["']\.\/services\/leavingHomeGeofence["']/);
    expect(src).not.toMatch(/from ["']\.\/hooks\/useLeavingHomeMonitor["']/);
    expect(src).toContain("NativeMonitors");
    expect(src).toContain("waitForNativeModules");
    expect(src).not.toContain("waitForSplashNative");
  });

  it("NudgeApp does not load expo-linking at import time", () => {
    const src = readFileSync(join(here, "..", "NudgeApp.tsx"), "utf8");
    expect(src).not.toContain("expo-linking");
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
    expect(src).toContain("waitForNativeModules");
  });

  it("appSecurity does not import Face ID at module load", () => {
    const src = readFileSync(join(here, "appSecurity.ts"), "utf8");
    expect(src).not.toMatch(/from ["']expo-local-authentication["']/);
    expect(src).toContain('import("expo-local-authentication")');
  });

  it("secureStore does not statically import expo-secure-store", () => {
    const src = readFileSync(join(here, "secureStore.ts"), "utf8");
    expect(src).not.toMatch(/from ["']expo-secure-store["']/);
    expect(src).toContain('import("expo-secure-store")');
    expect(src).toContain("keychainService");
  });
});
