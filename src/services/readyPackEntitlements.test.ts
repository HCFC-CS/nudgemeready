import { describe, expect, it } from "vitest";

import { getPack } from "../data/readyPacks/catalogue";
import {
  canInstallPack,
  defaultAllowAllEntitlements,
  defaultEntitlementLedger,
  getPackAccessLabel,
  isPackFree,
  purchaseProduct,
  READY_PACK_STORE_BILLING_ENABLED,
  restorePurchases
} from "./readyPackEntitlements";

describe("readyPackEntitlements store honesty", () => {
  it("defaults allowAll only in development builds", () => {
    expect(defaultAllowAllEntitlements()).toBe(Boolean(__DEV__));
    expect(defaultEntitlementLedger().allowAll).toBe(Boolean(__DEV__));
  });

  it("keeps store billing disabled until IAP is wired", () => {
    expect(READY_PACK_STORE_BILLING_ENABLED).toBe(false);
  });

  it("allows complimentary install when billing is disabled even without purchase", () => {
    const pack = getPack("ready4-study")!;
    expect(isPackFree(pack)).toBe(false);
    const result = canInstallPack(pack, { purchasedProductIds: {}, allowAll: false });
    expect(result.allowed).toBe(true);
  });

  it("labels paid catalogue packs as included while billing is off", () => {
    const pack = getPack("ready4-study")!;
    expect(
      getPackAccessLabel(pack, { canInstall: true, allowAll: false })
    ).toMatch(/Included in this version|not enabled|will not be charged/i);
  });

  it("labels packs without productId as free", () => {
    const pack = getPack("ready4-home")!;
    expect(isPackFree(pack)).toBe(true);
    expect(getPackAccessLabel(pack, { canInstall: true, allowAll: false })).toMatch(/Free ReadyPack/i);
  });

  it("refuses fake local purchases while billing is disabled", async () => {
    await expect(purchaseProduct("ready.pack.ready4_study")).rejects.toThrow(/not available/i);
  });

  it("restore does not invent entitlements while billing is disabled", async () => {
    const result = await restorePurchases([]);
    expect(result.restoredCount).toBe(0);
  });

  it("still documents that billing is off so paid gating is not active yet", () => {
    expect(READY_PACK_STORE_BILLING_ENABLED).toBe(false);
  });
});
