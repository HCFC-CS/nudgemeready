import { describe, expect, it } from "vitest";

import { organisationalHealthNote } from "../data/readyPacks/packFactory";
import { ready4ContentPacks } from "../data/readyPacks/ready4";
import { canInstallPack, defaultEntitlementLedger, isPackFree } from "./readyPackEntitlements";
import { installPack, previewPack, uninstallPack } from "./readyPackInstall";
import type { ReadyPack } from "../types/readyPacks";
import type { ReadyPackInstallState } from "../types/readyPacks";

const emptyState = (): ReadyPackInstallState => ({ installed: {} });

const healthPacks = ready4ContentPacks.filter((pack) => Boolean(pack.healthDisclaimer));
const freePacks = ready4ContentPacks.filter((pack) => isPackFree(pack));
const paidPacks = ready4ContentPacks.filter((pack) => !isPackFree(pack));

const forbiddenCoachPatterns =
  /\b(prescribe|change (?:your |the )?medication|increase (?:your )?dose|decrease (?:your )?dose|stop taking|start taking)\b/i;

function assertCoachAvoidsMedicalActions(prompt: string): void {
  expect(prompt).not.toMatch(forbiddenCoachPatterns);
  const withoutAvoidance = prompt.replace(
    /\b(?:no|without|not a)\s+diagnos(?:e|is|ing)(?:\s+language)?\b/gi,
    ""
  );
  expect(withoutAvoidance).not.toMatch(/\bdiagnos(?:e|is|ing)\b/i);
}

describe("Ready4 Edition 1 catalogue", () => {
  it("has 18 content packs (Edition 1 + Baby, Moving, Wedding)", () => {
    expect(ready4ContentPacks).toHaveLength(18);
  });

  it("includes Home and Wellbeing as the two free packs", () => {
    expect(freePacks.map((pack) => pack.id).sort()).toEqual(["ready4-home", "ready4-wellbeing"]);
  });

  it("gives every paid pack a ready.pack.ready4_* product id", () => {
    for (const pack of paidPacks) {
      expect(pack.productId).toMatch(/^ready\.pack\.ready4_/);
    }
  });

  it.each(ready4ContentPacks.map((pack) => [pack.id, pack] as const))(
    "%s has lean templates and installs cleanly",
    (_id, pack) => {
      expect(pack.content.templates.length).toBeGreaterThanOrEqual(5);
      expect(pack.content.templates.length).toBeLessThanOrEqual(14);
      expect(canInstallPack(pack, defaultEntitlementLedger()).allowed).toBe(true);

      const preview = previewPack(pack, emptyState(), defaultEntitlementLedger());
      expect(preview.templateCount).toBe(pack.content.templates.length);

      const installed = installPack(pack, [], emptyState(), defaultEntitlementLedger());
      expect(installed.createdCount).toBe(pack.content.templates.length);
      expect(installed.items.every((item) => item.sourcePackId === pack.id)).toBe(true);

      const removed = uninstallPack(pack.id, installed.items, installed.state, "all_from_pack");
      expect(removed.removedCount).toBe(pack.content.templates.length);
      expect(removed.items).toHaveLength(0);
    }
  );
});

describe("Ready4 health disclaimers", () => {
  it("marks medication and emergencies with organisational health note", () => {
    expect(healthPacks.map((pack) => pack.id).sort()).toEqual([
      "ready4-baby",
      "ready4-emergencies",
      "ready4-medication"
    ]);
    for (const pack of healthPacks) {
      expect(pack.healthDisclaimer).toBe(organisationalHealthNote);
    }
  });

  it("keeps AI coach prompts free of prescribing language", () => {
    for (const pack of ready4ContentPacks) {
      for (const prompt of pack.content.aiCoachPrompts ?? []) {
        assertCoachAvoidsMedicalActions(prompt);
      }
    }
  });
});

describe("Ready4 pack modules", () => {
  function templateIds(pack: ReadyPack): string[] {
    return pack.content.templates.map((template) => template.id);
  }

  it("Ready4 Study covers assignment, exam, budget and overwhelm flow", () => {
    const pack = ready4ContentPacks.find((row) => row.id === "ready4-study")!;
    expect(templateIds(pack)).toEqual(
      expect.arrayContaining([
        "assignment-planner",
        "exam-countdown",
        "revision-planner",
        "weekly-budget",
        "overwhelm",
        "what-helps"
      ])
    );
  });

  it("Ready4 Moving covers search-to-settle stages", () => {
    const pack = ready4ContentPacks.find((row) => row.id === "ready4-moving")!;
    expect(templateIds(pack)).toEqual(
      expect.arrayContaining([
        "what-helps",
        "move-budget",
        "house-search",
        "viewing-prep",
        "offer-progress",
        "move-suppliers",
        "settle-in"
      ])
    );
  });

  it("Ready4 Wedding covers legal, venue and after-wedding stages", () => {
    const pack = ready4ContentPacks.find((row) => row.id === "ready4-wedding")!;
    expect(templateIds(pack)).toEqual(
      expect.arrayContaining(["legal-docs", "venue-shortlist", "outfits", "after-wedding", "what-helps"])
    );
  });

  it("Ready4 Work includes Top 3 focus", () => {
    const pack = ready4ContentPacks.find((row) => row.id === "ready4-work")!;
    expect(templateIds(pack)).toContain("top-3");
  });

  it("Ready4 Pets includes daily care and vet prep", () => {
    const pack = ready4ContentPacks.find((row) => row.id === "ready4-pets")!;
    expect(templateIds(pack)).toEqual(expect.arrayContaining(["daily-care", "vet-planner"]));
  });
});
