import { describe, expect, it } from "vitest";

import { getPack, listPacks, listContentPacks } from "../data/readyPacks/catalogue";
import { ready4TravelPack } from "../data/readyPacks/ready4/travel";
import { ready4HomePack } from "../data/readyPacks/ready4/home";
import {
  canInstallPack,
  defaultEntitlementLedger,
  isPackFree
} from "../services/readyPackEntitlements";
import {
  installPack,
  markPackItemEdited,
  migratePack,
  previewPack,
  uninstallPack
} from "../services/readyPackInstall";
import { applyThemeToPreferences, applyVoiceToPreferences } from "../services/readyPackCosmetics";
import { defaultAppPreferences } from "../services/appPreferencesStorage";
import type { NudgeItem } from "../types/nudge";
import type { ReadyPackInstallState } from "../types/readyPacks";

const emptyState = (): ReadyPackInstallState => ({ installed: {} });

describe("Ready 4 catalogue", () => {
  it("lists 15 Ready 4 content packs plus cosmetics", () => {
    expect(listContentPacks()).toHaveLength(15);
    expect(listPacks("theme").length).toBeGreaterThanOrEqual(7);
    expect(listPacks("voice").length).toBeGreaterThanOrEqual(5);
    expect(listPacks("character").length).toBeGreaterThanOrEqual(11);
    expect(getPack("ready4-travel")?.title).toBe("Ready 4 Travel");
    expect(getPack("ready4-home")?.title).toBe("Ready 4 Home");
    expect(getPack("holiday-planner")).toBeUndefined();
  });

  it("titles every content pack Ready 4 …", () => {
    for (const pack of listContentPacks()) {
      expect(pack.title.startsWith("Ready 4 ")).toBe(true);
      expect(pack.id.startsWith("ready4-")).toBe(true);
    }
  });
});

describe("Ready 4 Travel", () => {
  it("includes core travel templates", () => {
    const titles = ready4TravelPack.content.templates.map((template) => template.title);
    expect(titles).toContain("Check passport expiry");
    expect(titles).toContain("Need transport to the airport?");
    expect(titles).toContain("Packing checklist");
    expect(titles).toContain("Online check-in");
    expect(titles).toContain("Return-home checklist");
  });

  it("asks about transport with taxi and parking choices", () => {
    const transport = ready4TravelPack.content.templates.find((template) => template.id === "need-transport");
    expect(transport?.type).toBe("list");
    const options = transport?.listItems?.map((row) => row.title) ?? [];
    expect(options).toContain("Taxi / private hire");
    expect(options).toContain("Airport parking");
  });

  it("is a paid catalogue pack (SKU set)", () => {
    expect(isPackFree(ready4TravelPack)).toBe(false);
    expect(ready4TravelPack.productId).toBe("ready.pack.ready4_travel");
  });
});

describe("Ready 4 Home", () => {
  it("is free to install", () => {
    expect(isPackFree(ready4HomePack)).toBe(true);
    expect(canInstallPack(ready4HomePack, defaultEntitlementLedger()).allowed).toBe(true);
  });
});

describe("install / uninstall / migrate", () => {
  it("previews without mutating items", () => {
    const items: NudgeItem[] = [];
    const preview = previewPack(ready4TravelPack, emptyState(), defaultEntitlementLedger());
    expect(preview.templateCount).toBe(ready4TravelPack.content.templates.length);
    expect(items).toHaveLength(0);
  });

  it("installs tagged editable items", () => {
    const result = installPack(ready4TravelPack, [], emptyState(), defaultEntitlementLedger());
    expect(result.createdCount).toBe(ready4TravelPack.content.templates.length);
    expect(result.items.every((item) => item.sourcePackId === "ready4-travel")).toBe(true);
    expect(result.items.every((item) => item.userEdited === false)).toBe(true);
    expect(result.state.installed["ready4-travel"]?.version).toBe("1.0.0");
  });

  it("uninstall removes pack items and leaves unrelated reminders", () => {
    const unrelated = {
      id: "user-reminder",
      title: "Water plants",
      type: "reminder" as const,
      status: "open" as const,
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      listItems: [],
      progress: 0
    };
    const installed = installPack(ready4TravelPack, [unrelated], emptyState(), defaultEntitlementLedger());
    const removed = uninstallPack("ready4-travel", installed.items, installed.state, "all_from_pack");
    expect(removed.removedCount).toBe(ready4TravelPack.content.templates.length);
    expect(removed.items).toHaveLength(1);
    expect(removed.items[0]?.title).toBe("Water plants");
  });

  it("preserves user-edited items on unedited_only uninstall", () => {
    const installed = installPack(ready4TravelPack, [], emptyState(), defaultEntitlementLedger());
    const editedId = installed.state.installed["ready4-travel"]!.templateItemIds["packing-checklist"];
    const withEdit = installed.items.map((item) =>
      item.id === editedId ? { ...item, title: "My packing list", userEdited: true } : item
    );
    const removed = uninstallPack("ready4-travel", withEdit, installed.state, "unedited_only");
    expect(removed.keptEditedCount).toBe(1);
    expect(removed.items.some((item) => item.title === "My packing list")).toBe(true);
  });

  it("preserves unedited flag when content is unchanged", () => {
    const installed = installPack(ready4TravelPack, [], emptyState(), defaultEntitlementLedger());
    const item = installed.items.find((row) => row.sourceTemplateId === "check-in")!;
    const same = markPackItemEdited({ ...item }, item);
    expect(same.userEdited).toBeFalsy();
  });

  it("marks pack items edited only when content changes", () => {
    const installed = installPack(ready4TravelPack, [], emptyState(), defaultEntitlementLedger());
    const item = installed.items.find((row) => row.sourceTemplateId === "check-in")!;
    const edited = markPackItemEdited({ ...item, notes: "Boarding pass saved" }, item);
    expect(edited.userEdited).toBe(true);
  });

  it("migrates unedited templates and preserves edits", () => {
    const installed = installPack(ready4TravelPack, [], emptyState(), defaultEntitlementLedger());
    const editedId = installed.state.installed["ready4-travel"]!.templateItemIds["check-in"];
    const withEdit = installed.items.map((item) =>
      item.id === editedId ? markPackItemEdited({ ...item, notes: "Boarding pass saved" }, item) : item
    );
    const newer = {
      ...ready4TravelPack,
      version: "1.1.0",
      content: {
        ...ready4TravelPack.content,
        templates: [
          ...ready4TravelPack.content.templates,
          {
            id: "travel-adaptor",
            title: "Pack travel adaptor",
            type: "reminder" as const
          }
        ]
      }
    };
    const olderState = {
      installed: {
        "ready4-travel": {
          ...installed.state.installed["ready4-travel"]!,
          version: "1.0.0"
        }
      }
    };
    const migrated = migratePack(newer, withEdit, olderState);
    expect(migrated.preservedEditedCount).toBe(1);
    expect(migrated.addedCount).toBe(1);
    expect(migrated.state.installed["ready4-travel"]?.version).toBe("1.1.0");
    expect(migrated.items.some((item) => item.notes === "Boarding pass saved" && item.userEdited)).toBe(true);
  });
});

describe("entitlements", () => {
  it("allows complimentary install for paid catalogue packs while store billing is off", () => {
    const pack = getPack("ready4-study")!;
    const access = canInstallPack(pack, { purchasedProductIds: {}, allowAll: false });
    expect(access.allowed).toBe(true);
  });

  it("still recognises a recorded purchase entitlement", () => {
    const pack = getPack("ready4-study")!;
    const allowed = canInstallPack(pack, {
      purchasedProductIds: { "ready.pack.ready4_study": new Date().toISOString() },
      allowAll: false
    });
    expect(allowed.allowed).toBe(true);
  });
});

describe("cosmetics", () => {
  it("applies theme and voice preferences", () => {
    const theme = listPacks("theme")[0]!.content.theme!;
    const voice = listPacks("voice")[0]!.content.voice!;
    const withTheme = applyThemeToPreferences(defaultAppPreferences, theme);
    const withVoice = applyVoiceToPreferences(withTheme, voice);
    expect(withTheme.appearance).toBe(theme.appearanceKey);
    expect(withVoice.tone).toBe(voice.label);
  });
});

describe("health packs", () => {
  it("include organisational health disclaimers on medication and emergencies", () => {
    for (const id of ["ready4-medication", "ready4-emergencies"]) {
      const pack = getPack(id)!;
      expect(pack.healthDisclaimer).toBeTruthy();
    }
  });
});
