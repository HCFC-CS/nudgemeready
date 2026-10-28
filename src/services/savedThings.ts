import { getEncryptedItem, setEncryptedItem } from "./encryptedStorage";
import { findAffiliatePartner } from "./affiliateLinks";
import {
  SAVED_THINGS_COMPARE_LIMIT,
  type SavedThing,
  type SavedThingsState
} from "../types/savedThings";

const SAVED_THINGS_KEY = "nudge-me:saved-things-v1";

export function emptySavedThings(): SavedThingsState {
  return { items: [], compareIds: [], alreadyHaveKeys: [] };
}

export function normalizeSavedThings(raw: Partial<SavedThingsState> | null | undefined): SavedThingsState {
  const items = Array.isArray(raw?.items)
    ? raw.items.filter((item): item is SavedThing => Boolean(item && item.id && item.title && item.url))
    : [];
  const knownIds = new Set(items.map((item) => item.id));
  const compareIds = Array.isArray(raw?.compareIds)
    ? raw.compareIds.filter((id) => knownIds.has(id)).slice(0, SAVED_THINGS_COMPARE_LIMIT)
    : [];
  const alreadyHaveKeys = Array.isArray(raw?.alreadyHaveKeys)
    ? [...new Set(raw.alreadyHaveKeys.filter((key) => typeof key === "string" && key.trim()))]
    : [];
  return { items, compareIds, alreadyHaveKeys };
}

export async function loadSavedThings(): Promise<SavedThingsState> {
  const raw = await getEncryptedItem(SAVED_THINGS_KEY);
  if (!raw) {
    return emptySavedThings();
  }
  try {
    return normalizeSavedThings(JSON.parse(raw) as Partial<SavedThingsState>);
  } catch {
    return emptySavedThings();
  }
}

export async function persistSavedThings(state: SavedThingsState) {
  await setEncryptedItem(SAVED_THINGS_KEY, JSON.stringify(normalizeSavedThings(state)));
}

export function saveThing(
  state: SavedThingsState,
  input: Omit<SavedThing, "id" | "savedAt" | "partnerId" | "partnerLabel"> &
    Partial<Pick<SavedThing, "id" | "savedAt" | "partnerId" | "partnerLabel">>,
  now = new Date()
): SavedThingsState {
  const existing = state.items.find((item) => item.url === input.url);
  if (existing) {
    return state;
  }
  const partner = findAffiliatePartner(input.url);
  const next: SavedThing = {
    id: input.id ?? `saved-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title.trim(),
    url: input.url,
    partnerId: input.partnerId ?? partner?.id,
    partnerLabel: input.partnerLabel ?? partner?.label,
    sourcePackId: input.sourcePackId,
    savedAt: input.savedAt ?? now.toISOString()
  };
  return {
    ...state,
    items: [next, ...state.items]
  };
}

export function removeThing(state: SavedThingsState, id: string): SavedThingsState {
  return {
    items: state.items.filter((item) => item.id !== id),
    compareIds: state.compareIds.filter((compareId) => compareId !== id),
    alreadyHaveKeys: state.alreadyHaveKeys
  };
}

export function isThingSaved(state: SavedThingsState, url: string): boolean {
  return state.items.some((item) => item.url === url);
}

export function toggleCompare(state: SavedThingsState, id: string): SavedThingsState {
  const exists = state.items.some((item) => item.id === id);
  if (!exists) {
    return state;
  }
  if (state.compareIds.includes(id)) {
    return {
      ...state,
      compareIds: state.compareIds.filter((compareId) => compareId !== id)
    };
  }
  if (state.compareIds.length >= SAVED_THINGS_COMPARE_LIMIT) {
    return state;
  }
  return {
    ...state,
    compareIds: [...state.compareIds, id]
  };
}

export function compareThings(state: SavedThingsState): SavedThing[] {
  return state.compareIds
    .map((id) => state.items.find((item) => item.id === id))
    .filter((item): item is SavedThing => Boolean(item));
}

export function hideShopIdeas(state: SavedThingsState, key: string): SavedThingsState {
  const trimmed = key.trim();
  if (!trimmed || state.alreadyHaveKeys.includes(trimmed)) {
    return state;
  }
  return {
    ...state,
    alreadyHaveKeys: [...state.alreadyHaveKeys, trimmed]
  };
}

export function isShopHidden(state: SavedThingsState, key?: string): boolean {
  if (!key) {
    return false;
  }
  return state.alreadyHaveKeys.includes(key);
}

export function clearHiddenShopIdeas(state: SavedThingsState): SavedThingsState {
  if (!state.alreadyHaveKeys.length) {
    return state;
  }
  return { ...state, alreadyHaveKeys: [] };
}
