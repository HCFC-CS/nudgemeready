import { describe, expect, it } from "vitest";

import { CORE_NUDGE_ACTIONS, NUDGE_INTENT_CATEGORIES } from "./coreNudgeActions";
import { actionsForIntent, resolveSomethingElse } from "./nudgeIntentCatalog";
import { extensionsForInstalledPacks, READY4_NUDGE_EXTENSION_PACKS } from "./ready4NudgeExtensions";

describe("core nudge intents", () => {
  it("exposes six categories", () => {
    expect(NUDGE_INTENT_CATEGORIES).toHaveLength(6);
    expect(CORE_NUDGE_ACTIONS.every((action) => action.intent)).toBe(true);
  });

  it("shows only core actions when no packs are installed", () => {
    const plan = actionsForIntent("plan", []);
    expect(plan.pack).toHaveLength(0);
    expect(plan.core.some((action) => /wedding|moving|baby/i.test(action.label))).toBe(false);
    expect(plan.core.length).toBeGreaterThan(0);
  });

  it("adds Ready4Moving extensions only when installed", () => {
    const without = actionsForIntent("plan", []);
    const withMoving = actionsForIntent("plan", ["ready4-moving"]);
    expect(without.pack).toHaveLength(0);
    expect(withMoving.pack.some((action) => action.packId === "ready4-moving")).toBe(true);
    expect(withMoving.pack.some((action) => /Plan my move/i.test(action.label))).toBe(true);
  });

  it("registers extensions for major packs without changing core", () => {
    const packIds = READY4_NUDGE_EXTENSION_PACKS.map((pack) => pack.packId);
    expect(packIds).toContain("ready4-moving");
    expect(packIds).toContain("ready4-baby");
    expect(packIds).toContain("ready4-finance");
    expect(packIds).toContain("ready4-pets");
    expect(packIds).toContain("ready4-digital-life");
    expect(packIds).toContain("ready4-life-admin");
    expect(packIds).toContain("ready4-emergencies");
    const loaded = extensionsForInstalledPacks(["ready4-baby", "ready4-unknown"]);
    expect(loaded.every((entry) => entry.packId === "ready4-baby")).toBe(true);
  });

  it("gates newest pack Capture extensions behind install", () => {
    expect(actionsForIntent("do", []).pack).toHaveLength(0);
    const withPets = actionsForIntent("do", ["ready4-pets"]);
    expect(withPets.pack.some((action) => action.packId === "ready4-pets")).toBe(true);
    expect(actionsForIntent("plan", ["ready4-life-admin"]).pack.some((a) => /documents/i.test(a.label))).toBe(
      true
    );
  });

  it("routes Ask Crew actions to Help", () => {
    const askCrew = CORE_NUDGE_ACTIONS.find((action) => action.id === "ask-crew");
    expect(askCrew?.route).toBe("Help");
    const babyCrew = extensionsForInstalledPacks(["ready4-baby"]).find((entry) =>
      /Ask Crew/i.test(entry.label)
    );
    expect(babyCrew?.route).toBe("Help");
  });
});

describe("resolveSomethingElse", () => {
  it("creates a remember nudge for solicitor/moving without requiring the pack", () => {
    const result = resolveSomethingElse(
      "I need to remember to call the solicitor about moving house",
      []
    );
    expect(result.intent).toBe("remember");
    expect(result.packId).toBeUndefined();
    expect(result.title.toLowerCase()).toMatch(/solicitor|moving|call/);
  });

  it("links Ready4Moving only when that pack is installed", () => {
    const without = resolveSomethingElse("Call solicitor about moving house", []);
    const withPack = resolveSomethingElse("Call solicitor about moving house", ["ready4-moving"]);
    expect(without.packId).toBeUndefined();
    expect(withPack.packId).toBe("ready4-moving");
  });

  it("turns a drink-of-water phrase into a core list, not a diet log", () => {
    const result = resolveSomethingElse("remind me to drink water", []);
    expect(result.packId).toBeUndefined();
    expect(result.itemType).toBe("list");
    expect(result.title).toMatch(/drink of water/i);
    expect(result.suggestedFields.listItems?.some((item) => /skip today/i.test(item))).toBe(true);
    expect(`${result.title} ${result.suggestedFields.notes}`).not.toMatch(/calorie|deficit|weight loss/i);
  });
});
