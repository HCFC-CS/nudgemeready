import { getEncryptedItem, setEncryptedItem } from "./encryptedStorage";
import type { ReadyPack } from "../types/readyPacks";
import {
  isIapConfiguredForCurrentPlatform,
  purchaseRevenueCatProduct,
  restoreRevenueCatPurchases
} from "./iapRevenueCat";

const ENTITLEMENT_KEY = "nudge-me:ready-pack-entitlements-v1";

/**
 * Flip to true only when StoreKit / Play Billing (or RevenueCat) is wired
 * and real product IDs are live. Until then, packs install without charging,
 * and the UI must not claim a purchase happened.
 */
// RevenueCat / Store billing is considered enabled only when an API key
// is configured. That keeps the app honest in dev/test without native IAP calls.
export const READY_PACK_STORE_BILLING_ENABLED = isIapConfiguredForCurrentPlatform();

export type ReadyPackEntitlementLedger = {
  /** productId → purchased ISO timestamp */
  purchasedProductIds: Record<string, string>;
  /**
   * When true, all packs installable.
   * Production defaults to false. Dev builds default to true for local testing.
   */
  allowAll: boolean;
};

export function isDevBuild(): boolean {
  return typeof __DEV__ !== "undefined" && __DEV__;
}

export function defaultAllowAllEntitlements(): boolean {
  return isDevBuild();
}

export const defaultEntitlementLedger = (): ReadyPackEntitlementLedger => ({
  purchasedProductIds: {},
  allowAll: defaultAllowAllEntitlements()
});

export async function loadEntitlementLedger(): Promise<ReadyPackEntitlementLedger> {
  const raw = await getEncryptedItem(ENTITLEMENT_KEY);
  if (!raw) {
    return defaultEntitlementLedger();
  }
  try {
    const parsed = JSON.parse(raw) as Partial<ReadyPackEntitlementLedger>;
    const purchasedProductIds = parsed.purchasedProductIds ?? {};
    // Never keep allowAll sticky in production / release builds.
    const allowAll = isDevBuild() ? Boolean(parsed.allowAll ?? true) : false;
    const ledger: ReadyPackEntitlementLedger = { purchasedProductIds, allowAll };

    if (!isDevBuild() && parsed.allowAll === true) {
      await saveEntitlementLedger(ledger);
    }
    return ledger;
  } catch {
    return defaultEntitlementLedger();
  }
}

export async function saveEntitlementLedger(ledger: ReadyPackEntitlementLedger): Promise<void> {
  await setEncryptedItem(ENTITLEMENT_KEY, JSON.stringify(ledger));
}

export function isPackFree(pack: Pick<ReadyPack, "productId">): boolean {
  return !pack.productId;
}

/** True when a pack would normally need a store purchase. */
export function isPackPaidCatalog(pack: Pick<ReadyPack, "productId">): boolean {
  return Boolean(pack.productId);
}

/**
 * User-facing access label. Honest about complimentary pre-IAP access.
 */
export function getPackAccessLabel(
  pack: Pick<ReadyPack, "productId">,
  options: { canInstall: boolean; allowAll: boolean }
): string {
  if (isPackFree(pack)) {
    return "Free ReadyPack.";
  }
  if (!READY_PACK_STORE_BILLING_ENABLED) {
    return "Included in this version. App Store / Play purchases are not enabled yet — you will not be charged.";
  }
  if (options.allowAll) {
    return "Available with current developer access.";
  }
  if (options.canInstall) {
    return "Purchased — ready to install.";
  }
  return "Purchase required.";
}

export function canInstallPack(
  pack: Pick<ReadyPack, "id" | "productId">,
  ledger: ReadyPackEntitlementLedger
): { allowed: boolean; reason?: string } {
  if (ledger.allowAll || isPackFree(pack)) {
    return { allowed: true };
  }

  // Pre-IAP: do not block installs, and do not pretend a purchase occurred.
  if (!READY_PACK_STORE_BILLING_ENABLED) {
    return { allowed: true };
  }

  const productId = pack.productId!;
  if (ledger.purchasedProductIds[productId]) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: "This ReadyPack needs a purchase. Restore purchases in Settings if you already bought it."
  };
}

/**
 * Records a purchase in the local ledger.
 * Throws until real store billing is enabled — never grants a fake paid entitlement.
 */
export async function purchaseProduct(productId: string, now = new Date()): Promise<ReadyPackEntitlementLedger> {
  if (!READY_PACK_STORE_BILLING_ENABLED) {
    throw new Error("In-app purchases are not available in this version yet.");
  }
  const { purchasedProductIds } = await purchaseRevenueCatProduct(productId);
  const ledger = await loadEntitlementLedger();
  for (const id of purchasedProductIds) {
    if (!ledger.purchasedProductIds[id]) {
      ledger.purchasedProductIds[id] = now.toISOString();
    }
  }
  await saveEntitlementLedger(ledger);
  return ledger;
}

/**
 * Restore purchases from the store.
 * Without a store SDK this must not claim success for empty remote ids.
 */
export async function restorePurchases(
  remoteProductIds: string[] = [],
  now = new Date()
): Promise<{ ledger: ReadyPackEntitlementLedger; restoredCount: number }> {
  if (!READY_PACK_STORE_BILLING_ENABLED) {
    return { ledger: defaultEntitlementLedger(), restoredCount: 0 };
  }
  const { purchasedProductIds } = await restoreRevenueCatPurchases();
  const ids = new Set([...purchasedProductIds, ...remoteProductIds]);

  const ledger = await loadEntitlementLedger();
  let restoredCount = 0;
  for (const productId of ids) {
    if (!ledger.purchasedProductIds[productId]) {
      ledger.purchasedProductIds[productId] = now.toISOString();
      restoredCount += 1;
    }
  }
  await saveEntitlementLedger(ledger);
  return { ledger, restoredCount };
}

export async function setAllowAllEntitlements(allowAll: boolean): Promise<ReadyPackEntitlementLedger> {
  if (!isDevBuild() && allowAll) {
    throw new Error("Developer access mode is only available in development builds.");
  }
  const ledger = await loadEntitlementLedger();
  ledger.allowAll = allowAll;
  await saveEntitlementLedger(ledger);
  return ledger;
}
