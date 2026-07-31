import * as Contacts from "expo-contacts";
import { Linking } from "react-native";

import { mockContacts, type MockContact } from "../data/mockData";

export type DeviceContact = MockContact & {
  fromDevice?: boolean;
};

export async function ensureContactsPermission() {
  const current = await Contacts.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Contacts.requestPermissionsAsync();
  return requested.granted;
}

function mapDeviceContact(contact: Contacts.ExistingContact | Contacts.Contact, index: number): DeviceContact | undefined {
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
  return {
    id,
    name,
    role: "Phone contact",
    contact: email || phone || name,
    email,
    phone,
    address,
    fromDevice: true
  };
}

export async function loadDeviceContacts(limit = 250): Promise<{
  contacts: DeviceContact[];
  granted: boolean;
  message?: string;
}> {
  try {
    const { loadAppPreferences } = await import("./appPreferencesStorage");
    const prefs = await loadAppPreferences();
    if (!prefs.contactsEnabled) {
      return {
        contacts: [],
        granted: false,
        message: "Phone contacts are turned off in Settings."
      };
    }

    const granted = await ensureContactsPermission();
    if (!granted) {
      return {
        contacts: [],
        granted: false,
        message: "Allow contacts access in Settings to pick people from your phone."
      };
    }

    const result = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Emails,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Name,
        Contacts.Fields.Addresses
      ],
      pageSize: limit,
      sort: Contacts.SortTypes.FirstName
    });

    const contacts: DeviceContact[] = [];
    for (const [index, contact] of result.data.entries()) {
      const mapped = mapDeviceContact(contact, index);
      if (mapped) {
        contacts.push(mapped);
      }
    }

    return {
      contacts,
      granted: true,
      message: contacts.length
        ? `${contacts.length} contacts from your phone.`
        : "No contacts found on this phone."
    };
  } catch {
    return {
      contacts: [],
      granted: false,
      message: "Could not open phone contacts."
    };
  }
}

export function filterContacts(contacts: Array<Pick<DeviceContact, "name" | "role" | "contact" | "phone" | "email" | "address">>, search: string) {
  const query = search.trim().toLowerCase();
  if (!query) {
    return contacts;
  }
  const parts = query.split(/\s+/);
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
  const fromMock = includeMockFallback && !deviceContacts.length
    ? (filterContacts(mockContacts, search) as DeviceContact[])
    : [];
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
  await Linking.openURL(`https://maps.apple.com/?q=${encodeURIComponent(address)}`);
}
