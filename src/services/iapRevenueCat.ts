import Constants from "expo-constants";
import { Platform } from "react-native";
import { getEncryptedItem, setEncryptedItem } from "./encryptedStorage";

const IAP_CONFIG_KEY_IOS = "revenueCatApiKeyIOS";
const IAP_CONFIG_KEY_ANDROID = "revenueCatApiKeyAndroid";

const APP_USER_ID_KEY = "nudge-me:iap-app-user-id:v1";

let configurePromise: Promise<void> | null = null;

function getApiKey(): string | null {
  if (Platform.OS === "web") {
    return null;
  }
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  if (!extra) return null;

  const key =
    Platform.OS === "android" ? extra[IAP_CONFIG_KEY_ANDROID] : extra[IAP_CONFIG_KEY_IOS];
  return typeof key === "string" && key.trim().length > 0 ? key.trim() : null;
}

export function isIapConfiguredForCurrentPlatform(): boolean {
  return Boolean(getApiKey());
}

async function getOrCreateAppUserId(): Promise<string> {
  const existing = await getEncryptedItem(APP_USER_ID_KEY);
  if (existing) {
    return existing;
  }
  const next = `nudge-user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await setEncryptedItem(APP_USER_ID_KEY, next);
  return next;
}

function extractActiveProductIdentifiers(customerInfo: any): string[] {
  const activeEntitlements = customerInfo?.entitlements?.active;
  if (!activeEntitlements || typeof activeEntitlements !== "object") {
    return [];
  }

  const out = new Set<string>();
  for (const [entitlementId, info] of Object.entries(activeEntitlements)) {
    if (entitlementId) {
      out.add(entitlementId);
    }
    const productIdentifier =
      (info as any)?.productIdentifier ?? (info as any)?.productId ?? (info as any)?.identifier;
    if (typeof productIdentifier === "string" && productIdentifier.trim()) {
      out.add(productIdentifier.trim());
    }
  }
  return [...out];
}

async function getPurchasesSdk(): Promise<any> {
  // Dynamic import to avoid loading native modules during unit tests.
  const mod = await import("react-native-purchases");
  return mod.default ?? mod;
}

export async function ensureRevenueCatConfigured(): Promise<void> {
  if (!isIapConfiguredForCurrentPlatform()) {
    throw new Error("RevenueCat is not configured (missing API key).");
  }
  if (configurePromise) {
    return configurePromise;
  }

  configurePromise = (async () => {
    const Purchases = await getPurchasesSdk();
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("RevenueCat API key is empty.");
    }

    const appUserID = await getOrCreateAppUserId();

    await Purchases.configure({
      apiKey,
      appUserID
    });

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      try {
        Purchases.setDebugLogsEnabled(true);
      } catch {
        // Optional. Ignore if SDK signature changes.
      }
    }
  })();

  return configurePromise;
}

export async function purchaseRevenueCatProduct(
  productIdentifier: string
): Promise<{ purchasedProductIds: string[] }> {
  const Purchases = await getPurchasesSdk();
  await ensureRevenueCatConfigured();

  // ReadyPacks are one-time purchases (non-subscription products), so prefer INAPP.
  // The SDK's enum shape may evolve, so keep this defensive.
  const PURCHASE_TYPE = Purchases?.PURCHASE_TYPE as any | undefined;
  const inappType =
    PURCHASE_TYPE?.INAPP ?? PURCHASE_TYPE?.IN_APP ?? PURCHASE_TYPE?.NON_SUBS ?? PURCHASE_TYPE?.NON_SUBSCRIPTION;

  const customerInfo = await Purchases.purchaseProduct(productIdentifier, null, inappType);
  const active = extractActiveProductIdentifiers(customerInfo);
  // Ensure we always record the product the user just tried to buy.
  if (!active.includes(productIdentifier)) {
    active.push(productIdentifier);
  }
  return { purchasedProductIds: active };
}

export async function restoreRevenueCatPurchases(): Promise<{
  purchasedProductIds: string[];
}> {
  const Purchases = await getPurchasesSdk();
  await ensureRevenueCatConfigured();

  const customerInfo = await Purchases.restorePurchases();
  const active = extractActiveProductIdentifiers(customerInfo);
  return { purchasedProductIds: active };
}

