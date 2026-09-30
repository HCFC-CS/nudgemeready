import { getEncryptedItem, setEncryptedItem } from "./encryptedStorage";
import { payLaterCooldownKey } from "./payLaterPlaces";

const PAY_LATER_SETTINGS_KEY = "nudge-me:pay-later-settings-v1";

export type PayLaterSettings = {
  /**
   * When on, GPS near known tolls / zones / drive-away parking asks
   * “Did you use this?” — pay nudges arm only after Yes (never daily for unused places).
   */
  enabled: boolean;
  /** placeId (or shared cooldown key) → last time we armed pay reminders (ISO) */
  lastArmedAtByPlaceId: Record<string, string>;
  /** Last time we asked “did you use this?” (ISO) */
  lastPromptedAtByPlaceId: Record<string, string>;
  /** Last time the user said No (ISO) */
  lastDeclinedAtByPlaceId: Record<string, string>;
};

export const defaultPayLaterSettings: PayLaterSettings = {
  enabled: false,
  lastArmedAtByPlaceId: {},
  lastPromptedAtByPlaceId: {},
  lastDeclinedAtByPlaceId: {}
};

type PayLaterSettingsListener = (settings: PayLaterSettings) => void;
const listeners = new Set<PayLaterSettingsListener>();

export function subscribePayLaterSettings(listener: PayLaterSettingsListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(settings: PayLaterSettings) {
  for (const listener of listeners) {
    listener(settings);
  }
}

function normalizeIsoMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string"
    )
  );
}

function normalizeSettings(parsed: Partial<PayLaterSettings> | null | undefined): PayLaterSettings {
  return {
    enabled: Boolean(parsed?.enabled),
    lastArmedAtByPlaceId: normalizeIsoMap(parsed?.lastArmedAtByPlaceId),
    lastPromptedAtByPlaceId: normalizeIsoMap(parsed?.lastPromptedAtByPlaceId),
    lastDeclinedAtByPlaceId: normalizeIsoMap(parsed?.lastDeclinedAtByPlaceId)
  };
}

export async function loadPayLaterSettings(): Promise<PayLaterSettings> {
  const raw = await getEncryptedItem(PAY_LATER_SETTINGS_KEY);
  if (!raw) {
    return defaultPayLaterSettings;
  }
  try {
    return normalizeSettings(JSON.parse(raw) as Partial<PayLaterSettings>);
  } catch {
    return defaultPayLaterSettings;
  }
}

export async function savePayLaterSettings(settings: PayLaterSettings) {
  const normalized = normalizeSettings(settings);
  await setEncryptedItem(PAY_LATER_SETTINGS_KEY, JSON.stringify(normalized));
  notifyListeners(normalized);
}

export async function setPayLaterEnabled(enabled: boolean) {
  const current = await loadPayLaterSettings();
  const next = { ...current, enabled };
  await savePayLaterSettings(next);
  return next;
}

function withCooldownStamp(
  map: Record<string, string>,
  placeId: string,
  at: Date
): Record<string, string> {
  const key = payLaterCooldownKey(placeId);
  return {
    ...map,
    [key]: at.toISOString(),
    [placeId]: at.toISOString()
  };
}

export async function markPayLaterPlaceArmed(placeId: string, at = new Date()) {
  const current = await loadPayLaterSettings();
  const next: PayLaterSettings = {
    ...current,
    lastArmedAtByPlaceId: withCooldownStamp(current.lastArmedAtByPlaceId, placeId, at),
    lastPromptedAtByPlaceId: withCooldownStamp(current.lastPromptedAtByPlaceId, placeId, at)
  };
  await savePayLaterSettings(next);
  return next;
}

export async function markPayLaterPlacePrompted(placeId: string, at = new Date()) {
  const current = await loadPayLaterSettings();
  const next: PayLaterSettings = {
    ...current,
    lastPromptedAtByPlaceId: withCooldownStamp(current.lastPromptedAtByPlaceId, placeId, at)
  };
  await savePayLaterSettings(next);
  return next;
}

export async function markPayLaterPlaceDeclined(placeId: string, at = new Date()) {
  const current = await loadPayLaterSettings();
  const next: PayLaterSettings = {
    ...current,
    lastDeclinedAtByPlaceId: withCooldownStamp(current.lastDeclinedAtByPlaceId, placeId, at),
    lastPromptedAtByPlaceId: withCooldownStamp(current.lastPromptedAtByPlaceId, placeId, at)
  };
  await savePayLaterSettings(next);
  return next;
}
