import { afterEach, describe, expect, it, vi } from "vitest";

const { notificationAsync, impactAsync } = vi.hoisted(() => ({
  notificationAsync: vi.fn(),
  impactAsync: vi.fn()
}));

vi.mock("expo-haptics", () => ({
  notificationAsync: (...args: unknown[]) => notificationAsync(...args),
  impactAsync: (...args: unknown[]) => impactAsync(...args),
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error"
  },
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy"
  }
}));

import { playConfirmHaptic } from "./confirmHaptic";

afterEach(() => {
  notificationAsync.mockReset();
  impactAsync.mockReset();
});

describe("playConfirmHaptic", () => {
  it("plays a short success haptic and does not add a second impact", async () => {
    notificationAsync.mockResolvedValue(undefined);

    playConfirmHaptic();
    await Promise.resolve();

    expect(notificationAsync).toHaveBeenCalledTimes(1);
    expect(notificationAsync).toHaveBeenCalledWith("success");
    expect(impactAsync).not.toHaveBeenCalled();
  });

  it("never uses a warning or error pattern", async () => {
    notificationAsync.mockResolvedValue(undefined);

    playConfirmHaptic();
    await Promise.resolve();

    expect(notificationAsync.mock.calls.flat()).not.toContain("warning");
    expect(notificationAsync.mock.calls.flat()).not.toContain("error");
    expect(impactAsync).not.toHaveBeenCalled();
  });

  it("uses a light impact when success feedback is unavailable", async () => {
    notificationAsync.mockRejectedValue(new Error("unavailable"));
    impactAsync.mockResolvedValue(undefined);

    expect(() => playConfirmHaptic()).not.toThrow();
    await Promise.resolve();
    await Promise.resolve();

    expect(impactAsync).toHaveBeenCalledTimes(1);
    expect(impactAsync).toHaveBeenCalledWith("light");
  });

  it("stays quiet when the haptic API is missing or rejects", async () => {
    notificationAsync.mockRejectedValue(new Error("Cannot find native module 'ExpoHaptics'"));
    impactAsync.mockRejectedValue(new Error("haptics off"));

    expect(() => playConfirmHaptic()).not.toThrow();
    await Promise.resolve();
    await Promise.resolve();

    expect(notificationAsync).toHaveBeenCalledWith("success");
    expect(impactAsync).toHaveBeenCalledWith("light");
  });

  it("stays quiet when the haptic call throws before returning a promise", () => {
    notificationAsync.mockImplementation(() => {
      throw new Error("native module missing");
    });
    impactAsync.mockImplementation(() => {
      throw new Error("native module missing");
    });

    expect(() => playConfirmHaptic()).not.toThrow();
    expect(impactAsync).toHaveBeenCalledWith("light");
  });
});
