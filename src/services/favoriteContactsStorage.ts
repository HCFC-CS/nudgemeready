import { getEncryptedItem, setEncryptedItem } from "./encryptedStorage";

const FAVORITE_CONTACTS_KEY = "nudge-me:favorite-contacts";

export type FavoriteContactKey = string;

export async function loadFavoriteContactKeys(): Promise<FavoriteContactKey[]> {
  const raw = await getEncryptedItem(FAVORITE_CONTACTS_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
  } catch {
    return [];
  }
}

export async function saveFavoriteContactKeys(keys: FavoriteContactKey[]) {
  const unique = Array.from(new Set(keys.map((key) => key.trim()).filter(Boolean)));
  await setEncryptedItem(FAVORITE_CONTACTS_KEY, JSON.stringify(unique));
}

export async function toggleFavoriteContactKey(key: string): Promise<FavoriteContactKey[]> {
  const current = await loadFavoriteContactKeys();
  const next = current.includes(key) ? current.filter((entry) => entry !== key) : [key, ...current];
  await saveFavoriteContactKeys(next);
  return next;
}

export function contactFavoriteKey(contact: { id: string; email?: string; phone?: string; name: string }) {
  if (contact.id) {
    return contact.id;
  }
  return `${contact.name}|${contact.email ?? ""}|${contact.phone ?? ""}`;
}
