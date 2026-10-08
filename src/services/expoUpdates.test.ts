import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { syncRemoteUpdate, type RemoteUpdateClient } from "./expoUpdates";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");

function client(overrides: Partial<RemoteUpdateClient> = {}): RemoteUpdateClient {
  return {
    isEnabled: true,
    checkForUpdateAsync: async () => ({ isAvailable: false }),
    fetchUpdateAsync: async () => ({ isNew: false }),
    ...overrides
  };
}

describe("syncRemoteUpdate", () => {
  it("skips when the native client is disabled", async () => {
    expect(await syncRemoteUpdate(client({ isEnabled: false }))).toBe("skipped");
  });

  it("does nothing when no update is published", async () => {
    expect(await syncRemoteUpdate(client())).toBe("none");
  });

  it("downloads a published JS bundle without reloading", async () => {
    const fetchUpdateAsync = vi.fn(async () => ({ isNew: true }));
    expect(
      await syncRemoteUpdate(
        client({
          checkForUpdateAsync: async () => ({ isAvailable: true }),
          fetchUpdateAsync
        })
      )
    ).toBe("downloaded");
    expect(fetchUpdateAsync).toHaveBeenCalledOnce();
  });

  it("swallows native failures so launch still works", async () => {
    expect(
      await syncRemoteUpdate(
        client({
          checkForUpdateAsync: async () => {
            throw new Error("native");
          }
        })
      )
    ).toBe("failed");
  });
});

describe("OTA stays off the splash path", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("App.tsx does not statically import expo-updates", () => {
    const src = readFileSync(join(root, "App.tsx"), "utf8");
    expect(src).not.toMatch(/from ["']expo-updates["']/);
    expect(src).toContain("installOtaUpdateSync");
  });

  it("expoUpdates does not statically import the native module or reload", () => {
    const src = readFileSync(join(here, "expoUpdates.ts"), "utf8");
    expect(src).not.toMatch(/from ["']expo-updates["']/);
    expect(src).toContain('import("expo-updates")');
    expect(src).not.toContain("reloadAsync");
    expect(src).toContain("waitAfterPaint");
  });

  it("release config points at EAS Update and does not wait on launch", () => {
    const appJson = JSON.parse(readFileSync(join(root, "app.json"), "utf8"));
    expect(appJson.expo.updates.url).toBe("https://u.expo.dev/6ca4ec88-2487-43ae-a858-5c3d96abf41e");
    expect(appJson.expo.updates.checkAutomatically).toBe("NEVER");
    expect(appJson.expo.updates.fallbackToCacheTimeout).toBe(0);
    expect(appJson.expo.runtimeVersion).toEqual({ policy: "appVersion" });
  });

  it("app.config.js declares EAS Update so eas build does not rewrite it", () => {
    const src = readFileSync(join(root, "app.config.js"), "utf8");
    expect(src).toContain("runtimeVersion");
    expect(src).toContain('policy: "appVersion"');
    expect(src).toContain("https://u.expo.dev/6ca4ec88-2487-43ae-a858-5c3d96abf41e");
    expect(src).toContain('checkAutomatically: "NEVER"');
  });

  it("v4 EAS profile publishes to its own update channel", () => {
    const eas = JSON.parse(readFileSync(join(root, "eas.json"), "utf8"));
    expect(eas.build.v4.channel).toBe("v4");
    expect(eas.build.v3.channel).toBe("v3");
    expect(eas.build.production.channel).toBe("production");
    expect(eas.build.v4.cache.key).toBe("v4-updates-sdk54-devclient6");
    expect(eas.build.v4.ios.image).toBe("sdk-54");
  });

  it("pins expo-dev-client to the SDK 54 release so pods can install with expo-updates", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    expect(pkg.dependencies["expo-dev-client"]).toMatch(/^~6\./);
    expect(pkg.dependencies["expo-updates"]).toMatch(/^~29\./);
  });
});
