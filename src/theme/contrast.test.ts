import { describe, expect, it } from "vitest";

import { actionChipColors, brand, colors } from "./theme";

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

describe("action chip contrast", () => {
  it("does not use washed-out baby blue for Save text or fill", () => {
    const save = actionChipColors.save;
    expect(save.color).toBe(brand.babyBlueInk);
    expect(save.color.toLowerCase()).not.toBe(brand.babyBlue.toLowerCase());
    expect(save.backgroundColor.toLowerCase()).not.toBe(brand.babyBlueSoft.toLowerCase());
  });

  it("keeps Save, Sorted, Later, Ask, and Remove readable on the chip and taupe", () => {
    for (const palette of Object.values(actionChipColors)) {
      expect(contrastRatio(palette.color, palette.backgroundColor)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(palette.color, colors.card)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
