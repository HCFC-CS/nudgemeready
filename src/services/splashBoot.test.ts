import { describe, expect, it } from "vitest";

import { nextSplashBootStep, shouldShowSplashRegister, shouldShowSplashWelcome } from "./splashBoot";

const base = {
  bootReady: false,
  needsUnlock: false,
  needsRegistration: false,
  needsSecuritySetup: false,
  hasCredential: false,
  current: "welcome" as const,
  hasRecoverToken: false
};

describe("nextSplashBootStep", () => {
  it("opens registration even when security boot is not ready", () => {
    expect(nextSplashBootStep({ ...base, needsRegistration: true })).toBe("register");
  });

  it("keeps welcome while boot is still running and no registration is needed", () => {
    expect(nextSplashBootStep(base)).toBe("welcome");
  });

  it("opens unlock before registration", () => {
    expect(nextSplashBootStep({ ...base, needsUnlock: true, needsRegistration: true })).toBe("unlock");
  });

  it("moves from registration to PIN setup when the profile is saved", () => {
    expect(
      nextSplashBootStep({
        ...base,
        current: "register",
        needsRegistration: false,
        hasCredential: false
      })
    ).toBe("setup");
  });
});

describe("splash panels", () => {
  it("does not leave a title-only welcome when registration is required", () => {
    expect(shouldShowSplashWelcome("welcome", true, false)).toBe(false);
    expect(shouldShowSplashRegister("welcome", true, false)).toBe(true);
  });

  it("shows welcome actions when registration is not required", () => {
    expect(shouldShowSplashWelcome("welcome", false, false)).toBe(true);
    expect(shouldShowSplashRegister("welcome", false, false)).toBe(false);
  });
});
