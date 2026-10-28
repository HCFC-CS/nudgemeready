import { describe, expect, it } from "vitest";

import { brand, colors } from "../theme/theme";
import { formatNudgeTypeLabel, getTypeAccent, getTypeChipColors } from "./typeAccent";
import type { NudgeItemType } from "../types/nudge";

const paleBlueFamily: NudgeItemType[] = ["subtask", "task", "routine", "chore", "appointment"];
const washedOutOnTaupe = new Set([
  brand.babyBlue.toLowerCase(),
  brand.babyBlueSoft.toLowerCase(),
  brand.softTaupe.toLowerCase()
]);

function channelToLinear(value: number) {
  const srgb = value / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string) {
  const normalized = hex.replace("#", "");
  const r = channelToLinear(parseInt(normalized.slice(0, 2), 16));
  const g = channelToLinear(parseInt(normalized.slice(2, 4), 16));
  const b = channelToLinear(parseInt(normalized.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

describe("type labels", () => {
  it("calls a subtask a Small step", () => {
    expect(formatNudgeTypeLabel("subtask")).toBe("Small step");
  });
});

describe("type chip colours", () => {
  it("does not use washed-out baby blue or taupe as Small step / Task / Routine / Chore text", () => {
    for (const type of paleBlueFamily) {
      const chip = getTypeChipColors(type);
      expect(washedOutOnTaupe.has(chip.color.toLowerCase())).toBe(false);
      expect(chip.color).toBe(brand.babyBlueInk);
    }
  });

  it("keeps chip label contrast readable on the chip fill and taupe cards", () => {
    const types: NudgeItemType[] = [
      "subtask",
      "task",
      "routine",
      "chore",
      "list",
      "note",
      "appointment"
    ];
    for (const type of types) {
      const chip = getTypeChipColors(type);
      expect(contrastRatio(chip.color, chip.backgroundColor)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(chip.color, colors.card)).toBeGreaterThanOrEqual(4.5);
      expect(chip.borderColor).toBe(chip.color);
      expect(chip.borderColor.endsWith("55")).toBe(false);
    }
  });

  it("uses a darker ink than fill baby blue for type accents", () => {
    expect(getTypeAccent("subtask")).toBe(brand.babyBlueInk);
    expect(getTypeAccent("list")).toBe(brand.charcoal);
  });
});
