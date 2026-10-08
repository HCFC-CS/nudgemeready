import * as Contacts from "expo-contacts";
import { Linking, Platform } from "react-native";

import { mockContacts, type MockContact } from "../data/mockData";
import { contactFavoriteKey, loadFavoriteContactKeys } from "./favoriteContactsStorage";

export type DeviceContact = MockContact & {
  fromDevice?: boolean;
  /** Starred in the phone Contacts app (Android when available). */
  deviceFavorite?: boolean;
  /** Starred in Nudge me Ready. */
  appFavorite?: boolean;
};

export async function ensureContactsPermission() {
  const current = await Contacts.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Contacts.requestPermissionsAsync();
  return requested.granted;
}

function mapDeviceContact(
  contact: Contacts.ExistingContact | Contacts.Contact,
  index: number,
  favoriteKeys: Set<string>
): DeviceContact | undefined {
  const email = contact.emails?.find((entry) => entry.email)?.email;
  const phone = contact.phoneNumbers?.find((entry) => entry.number)?.number;
  const addressParts = contact.addresses?.[0];
  const address = addressParts
    ? [addressParts.street, addressParts.city, addressParts.region, addressParts.postalCode, addressParts.country]
        .filter(Boolean)
        .join(", ")
    : undefined;
  const name = contact.name || email || phone;
  if (!name) {
    return undefined;
  }
  const id = "id" in contact && contact.id ? contact.id : `device-${index}`;
  const deviceFavorite = Boolean((contact as { isFavorite?: boolean }).isFavorite);
  const mapped: DeviceContact = {
    id,
    name,
    role: deviceFavorite ? "Favorite · Phone contact" : "Phone contact",
    contact: email || phone || name,
    email,
    phone,
    address,
    fromDevice: true,
    deviceFavorite,
    appFavorite: favoriteKeys.has(id)
  };
  return mapped;
}

export async function loadDeviceContacts(limit = 250): Promise<{
  contacts: DeviceContact[];
  favorites: DeviceContact[];
  granted: boolean;
  message?: string;
}> {
  try {
    const { loadAppPreferences } = await import("./appPreferencesStorage");
    const prefs = await loadAppPreferences();
    if (!prefs.contactsEnabled) {
      return {
        contacts: [],
        favorites: [],
        granted: false,
        message: "Phone contacts are turned off in Settings."
      };
    }

    const granted = await ensureContactsPermission();
    if (!granted) {
      return {
        contacts: [],
        favorites: [],
        granted: false,
        message: "Allow contacts access in Settings to pick people from your phone."
      };
    }

    const favoriteKeys = new Set(await loadFavoriteContactKeys());
    const fields: Contacts.FieldType[] = [
      Contacts.Fields.Emails,
      Contacts.Fields.PhoneNumbers,
      Contacts.Fields.Name,
      Contacts.Fields.Addresses
    ];
    // Android can expose phone-starred contacts when this field exists.
    const maybeFavorite = (Contacts.Fields as Record<string, string | undefined>).IsFavorite;
    if (maybeFavorite) {
      fields.push(maybeFavorite as Contacts.FieldType);
    }

    const result = await Contacts.getContactsAsync({
      fields,
      pageSize: limit,
      sort: Contacts.SortTypes.FirstName
    });

    const contacts: DeviceContact[] = [];
    for (const [index, contact] of result.data.entries()) {
      const mapped = mapDeviceContact(contact, index, favoriteKeys);
      if (mapped) {
        contacts.push(mapped);
      }
    }

    return {
      contacts,
      favorites: getFavoriteContacts(contacts, favoriteKeys),
      granted: true,
      message: contacts.length
        ? `${contacts.length} contacts from your phone.`
        : "No contacts found on this phone."
    };
  } catch {
    return {
      contacts: [],
      favorites: [],
      granted: false,
      message: "Could not open phone contacts."
    };
  }
}

export function getFavoriteContacts(contacts: DeviceContact[], favoriteKeys?: Set<string> | string[]) {
  const keys = favoriteKeys instanceof Set ? favoriteKeys : new Set(favoriteKeys ?? []);
  const favorites = contacts.filter((contact) => {
    const key = contactFavoriteKey(contact);
    return contact.deviceFavorite || contact.appFavorite || keys.has(key) || keys.has(contact.id);
  });
  // App favorites first, then phone-starred, then name.
  return favorites
    .sort((a, b) => {
      const aApp = a.appFavorite ? 1 : 0;
      const bApp = b.appFavorite ? 1 : 0;
      if (aApp !== bApp) return bApp - aApp;
      const aDev = a.deviceFavorite ? 1 : 0;
      const bDev = b.deviceFavorite ? 1 : 0;
      if (aDev !== bDev) return bDev - aDev;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 8);
}

export function filterContacts(
  contacts: Array<Pick<DeviceContact, "name" | "role" | "contact" | "phone" | "email" | "address">>,
  search: string
) {
  const query = search.trim().toLowerCase();
  // Don't dump the whole address book — wait until the user starts typing.
  if (!query) {
    return [];
  }
  const parts = query.split(/\s+/).filter(Boolean);
  return contacts.filter((contact) => {
    const haystack = [contact.name, contact.role, contact.contact, contact.phone, contact.email, contact.address]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return parts.every((part) => haystack.includes(part));
  });
}

export function mergeContactSuggestions(search: string, deviceContacts: DeviceContact[], includeMockFallback = false) {
  const fromDevice = filterContacts(deviceContacts, search) as DeviceContact[];
  const fromMock =
    includeMockFallback && !deviceContacts.length ? (filterContacts(mockContacts, search) as DeviceContact[]) : [];
  const merged = [...fromDevice, ...fromMock];
  const seen = new Set<string>();
  return merged.filter((contact) => {
    const key = `${contact.name}|${contact.email ?? ""}|${contact.phone ?? ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function applyFavoriteFlags(contacts: DeviceContact[], favoriteKeys: string[]): DeviceContact[] {
  const keys = new Set(favoriteKeys);
  return contacts.map((contact) => {
    const appFavorite = keys.has(contactFavoriteKey(contact)) || keys.has(contact.id);
    let role = contact.fromDevice ? "Phone contact" : contact.role;
    if (appFavorite && contact.deviceFavorite) {
      role = "Favorite · Phone star";
    } else if (appFavorite) {
      role = "Favorite";
    } else if (contact.deviceFavorite) {
      role = "Phone favorite";
    }
    return {
      ...contact,
      appFavorite,
      role
    };
  });
}

export async function openContactCall(phone?: string) {
  if (!phone) return;
  await Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`);
}

export async function openContactEmail(email?: string, subject?: string) {
  if (!email) return;
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  await Linking.openURL(`mailto:${email}${query}`);
}

export async function openContactMaps(address?: string) {
  if (!address) return;
  const mapsUrl =
    Platform.OS === "android"
      ? `geo:0,0?q=${encodeURIComponent(address)}`
      : `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
  await Linking.openURL(mapsUrl);
}
