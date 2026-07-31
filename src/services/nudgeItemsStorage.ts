import { mockNudgeItems } from "../data/mockData";
import type { NudgeItem } from "../types/nudge";
import { getEncryptedItemStrict, removeEncryptedItem, setEncryptedItem, StorageDecryptError } from "./encryptedStorage";

const NUDGE_ITEMS_KEY = "nudge-me:nudge-items-v2";
const LEGACY_NUDGE_ITEMS_KEY = "nudge-me:nudge-items-v1";

function isNudgeItemArray(value: unknown): value is NudgeItem[] {
  return Array.isArray(value);
}

export type LoadNudgeItemsResult = {
  items: NudgeItem[];
  error?: string;
};

/**
 * Load persisted nudges.
 * Fresh installs start empty (no demo kitchen/chore seed).
 */
export async function loadNudgeItems(): Promise<LoadNudgeItemsResult> {
  try {
    const raw = await getEncryptedItemStrict(NUDGE_ITEMS_KEY);
    if (raw == null) {
      await removeEncryptedItem(LEGACY_NUDGE_ITEMS_KEY).catch(() => undefined);
      return { items: [] };
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!isNudgeItemArray(parsed)) {
        return { items: [], error: "Saved nudges look damaged. Nothing was loaded." };
      }
      return {
        items: parsed.map((item) => ({
          ...item,
          guests: item.guests ?? [],
          syncToCalendar:
            item.syncToCalendar ??
            (item.type === "appointment" || item.type === "event" ? false : undefined)
        }))
      };
    } catch {
      return { items: [], error: "Saved nudges could not be read. Nothing was loaded." };
    }
  } catch (caught) {
    if (caught instanceof StorageDecryptError) {
      return {
        items: [],
        error: "Your saved nudges could not be unlocked. Try restarting the app, or contact support if this continues."
      };
    }
    return {
      items: [],
      error: caught instanceof Error ? caught.message : "Could not load nudges."
    };
  }
}

export async function saveNudgeItems(items: NudgeItem[]) {
  await setEncryptedItem(NUDGE_ITEMS_KEY, JSON.stringify(items));
}

export async function clearNudgeItemsStorage() {
  await removeEncryptedItem(NUDGE_ITEMS_KEY);
}

/** Demo fixtures for screenshots / tests only. */
export function getDemoNudgeItems() {
  return mockNudgeItems.map((item) => ({ ...item }));
}
