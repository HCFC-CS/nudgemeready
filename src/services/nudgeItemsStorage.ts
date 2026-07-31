import { mockNudgeItems } from "../data/mockData";
import type { NudgeItem } from "../types/nudge";
import { getEncryptedItem, removeEncryptedItem, setEncryptedItem } from "./encryptedStorage";

const NUDGE_ITEMS_KEY = "nudge-me:nudge-items-v2";
const LEGACY_NUDGE_ITEMS_KEY = "nudge-me:nudge-items-v1";

function isNudgeItemArray(value: unknown): value is NudgeItem[] {
  return Array.isArray(value);
}

/**
 * Load persisted nudges.
 * Fresh installs start empty (no demo kitchen/chore seed).
 * Screenshot / web tooling can still import mockNudgeItems directly.
 */
export async function loadNudgeItems(): Promise<NudgeItem[]> {
  const raw = await getEncryptedItem(NUDGE_ITEMS_KEY);
  if (raw == null) {
    // Drop legacy seeded demo data once when moving to the empty-first schema.
    await removeEncryptedItem(LEGACY_NUDGE_ITEMS_KEY).catch(() => undefined);
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isNudgeItemArray(parsed)) {
      return [];
    }
    return parsed.map((item) => ({
      ...item,
      guests: item.guests ?? [],
      syncToCalendar: item.syncToCalendar ?? (item.type === "appointment" || item.type === "event" ? false : undefined)
    }));
  } catch {
    return [];
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
