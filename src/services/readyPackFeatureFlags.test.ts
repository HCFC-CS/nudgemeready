import { describe, expect, it } from "vitest";

import {
  isCatalogueKindVisible,
  isCosmeticPackKind,
  READY_PACK_COSMETICS_ENABLED,
  READY_PACK_PREVIEW_EXTRAS_ENABLED
} from "./readyPackFeatureFlags";

describe("readyPackFeatureFlags", () => {
  it("keeps cosmetics and preview extras off until wired", () => {
    expect(READY_PACK_COSMETICS_ENABLED).toBe(false);
    expect(READY_PACK_PREVIEW_EXTRAS_ENABLED).toBe(false);
  });

  it("only shows content packs in the catalogue while cosmetics are disabled", () => {
    expect(isCatalogueKindVisible("content")).toBe(true);
    expect(isCatalogueKindVisible("theme")).toBe(false);
    expect(isCatalogueKindVisible("voice")).toBe(false);
    expect(isCatalogueKindVisible("character")).toBe(false);
  });

  it("recognises cosmetic pack kinds", () => {
    expect(isCosmeticPackKind("theme")).toBe(true);
    expect(isCosmeticPackKind("voice")).toBe(true);
    expect(isCosmeticPackKind("character")).toBe(true);
    expect(isCosmeticPackKind("content")).toBe(false);
  });
});
