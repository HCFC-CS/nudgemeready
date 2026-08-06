import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useMemo, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, TextInput, View } from "react-native";

import { Field } from "./FormControls";
import { ContactSuggestionRow } from "./ContactSuggestionRow";
import { PrimaryButton, SecondaryButton, SoftCard } from "./NudgeComponents";
import { AppText } from "./Text";
import type { MockContact } from "../data/mockData";
import {
  applyFavoriteFlags,
  getFavoriteContacts,
  loadDeviceContacts,
  mergeContactSuggestions,
  type DeviceContact
} from "../services/deviceContacts";
import { contactFavoriteKey, toggleFavoriteContactKey } from "../services/favoriteContactsStorage";
import { colors, radii, spacing } from "../theme/theme";
import type { AppointmentGuest } from "../types/nudge";

function makeGuestId() {
  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function guestFromContact(contact: MockContact): AppointmentGuest {
  return {
    id: makeGuestId(),
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    source: "contact"
  };
}

function guestFromEmail(email: string, name?: string): AppointmentGuest {
  const trimmed = email.trim();
  return {
    id: makeGuestId(),
    name: name?.trim() || trimmed.split("@")[0] || "Guest",
    email: trimmed,
    source: "email"
  };
}

export function GuestsEditor({
  guests,
  onChange,
  editable = true,
  appointmentTitle
}: {
  guests: AppointmentGuest[];
  onChange: (guests: AppointmentGuest[]) => void;
  editable?: boolean;
  appointmentTitle?: string;
}) {
  const [emailDraft, setEmailDraft] = useState("");
  const [search, setSearch] = useState("");
  const [deviceContacts, setDeviceContacts] = useState<DeviceContact[]>([]);
  const [favorites, setFavorites] = useState<DeviceContact[]>([]);
  const [contactsNotice, setContactsNotice] = useState("");
  const [contactsReady, setContactsReady] = useState(false);

  useEffect(() => {
    let active = true;
    void loadDeviceContacts().then((result) => {
      if (!active) return;
      setDeviceContacts(result.contacts);
      setFavorites(result.favorites);
      setContactsNotice(result.message ?? "");
      setContactsReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const query = search.trim();
  const suggestions = useMemo(
    () => (query ? mergeContactSuggestions(query, deviceContacts, true).slice(0, 8) : []),
    [deviceContacts, query]
  );

  function addGuest(guest: AppointmentGuest) {
    const duplicate = guests.some(
      (existing) =>
        (guest.email && existing.email?.toLowerCase() === guest.email.toLowerCase()) ||
        (guest.phone && existing.phone && existing.phone === guest.phone && existing.name === guest.name)
    );
    if (duplicate) {
      setContactsNotice("That guest is already added.");
      return;
    }
    onChange([...guests, guest]);
    setEmailDraft("");
    setSearch("");
    setContactsNotice("");
  }

  function removeGuest(guestId: string) {
    onChange(guests.filter((guest) => guest.id !== guestId));
  }

  async function reloadContacts() {
    const result = await loadDeviceContacts();
    setDeviceContacts(result.contacts);
    setFavorites(result.favorites);
    setContactsNotice(result.message ?? "");
    setContactsReady(true);
  }

  async function handleToggleFavorite(contact: DeviceContact) {
    const keys = await toggleFavoriteContactKey(contactFavoriteKey(contact));
    const nextContacts = applyFavoriteFlags(deviceContacts, keys);
    setDeviceContacts(nextContacts);
    setFavorites(getFavoriteContacts(nextContacts, keys));
  }

  function inviteGuests() {
    const emails = guests.map((guest) => guest.email).filter(Boolean) as string[];
    if (!emails.length) {
      Alert.alert("Add an email", "Add at least one guest email before sending invites.");
      return;
    }
    const subject = encodeURIComponent(appointmentTitle ? `Invitation: ${appointmentTitle}` : "Appointment invitation");
    const body = encodeURIComponent(
      appointmentTitle
        ? `You're invited to ${appointmentTitle}.\n\nSent from Nudge me Ready.`
        : "You're invited to an appointment.\n\nSent from Nudge me Ready."
    );
    void Linking.openURL(`mailto:${emails.join(",")}?subject=${subject}&body=${body}`);
  }

  return (
    <View style={styles.wrap}>
      <AppText variant="small">Guests from phone contacts or email</AppText>
      {guests.length ? (
        <View style={styles.guestList}>
          {guests.map((guest) => (
            <SoftCard key={guest.id} style={styles.guestCard}>
              <View style={styles.guestRow}>
                <View style={styles.guestCopy}>
                  <AppText variant="heading">{guest.name}</AppText>
                  {guest.email ? <AppText variant="muted">{guest.email}</AppText> : null}
                  {guest.phone ? <AppText variant="muted">{guest.phone}</AppText> : null}
                </View>
                {editable ? (
                  <Pressable accessibilityRole="button" onPress={() => removeGuest(guest.id)} style={styles.removeBtn}>
                    <Ionicons name="close-circle" size={22} color={colors.mutedText} />
                  </Pressable>
                ) : null}
              </View>
            </SoftCard>
          ))}
        </View>
      ) : (
        <AppText variant="muted">Pick a favorite, start typing a name, or add a guest email.</AppText>
      )}

      {editable ? (
        <>
          <Field
            label="Guest email"
            value={emailDraft}
            onChangeText={setEmailDraft}
            placeholder="friend@email.com"
          />
          <PrimaryButton
            onPress={() => {
              const trimmed = emailDraft.trim();
              if (!trimmed.includes("@")) {
                setContactsNotice("Enter a valid email address.");
                return;
              }
              addGuest(guestFromEmail(trimmed));
            }}
          >
            Add guest by email
          </PrimaryButton>

          <View style={styles.searchRow}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Start typing a name…"
              placeholderTextColor={colors.mutedText}
              autoCorrect={false}
              autoCapitalize="words"
              style={styles.searchInput}
            />
            <SecondaryButton onPress={() => void reloadContacts()}>Refresh contacts</SecondaryButton>
          </View>
          <View style={styles.suggestions}>
            {!contactsReady ? (
              <AppText variant="muted">Loading phone contacts…</AppText>
            ) : !query ? (
              favorites.length ? (
                <>
                  <AppText variant="section">Favorites</AppText>
                  {favorites.map((contact) => (
                    <ContactSuggestionRow
                      key={contact.id}
                      contact={contact}
                      onSelect={() => addGuest(guestFromContact(contact))}
                      onToggleFavorite={() => void handleToggleFavorite(contact)}
                      isFavorite
                    />
                  ))}
                </>
              ) : (
                <AppText variant="muted">
                  Start typing to search, or tap the star on a contact to pin favorites here.
                </AppText>
              )
            ) : suggestions.length ? (
              suggestions.map((contact) => (
                <ContactSuggestionRow
                  key={contact.id}
                  contact={contact}
                  onSelect={() => addGuest(guestFromContact(contact))}
                  onToggleFavorite={() => void handleToggleFavorite(contact)}
                  isFavorite={Boolean(contact.appFavorite || contact.deviceFavorite)}
                />
              ))
            ) : (
              <AppText variant="muted">No matching contacts.</AppText>
            )}
          </View>

          {guests.some((guest) => guest.email) ? (
            <SecondaryButton onPress={inviteGuests}>Email invites</SecondaryButton>
          ) : null}
        </>
      ) : null}

      {contactsNotice && query ? <AppText variant="small">{contactsNotice}</AppText> : null}
      {contactsNotice && !query && (contactsNotice.includes("Allow") || contactsNotice.includes("turned off")) ? (
        <AppText variant="small">{contactsNotice}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  guestList: { gap: spacing.xs },
  guestCard: { paddingVertical: spacing.sm },
  guestRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  guestCopy: { flex: 1, gap: 2 },
  removeBtn: { padding: 4 },
  searchRow: { gap: spacing.sm },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.card
  },
  suggestions: { gap: spacing.xs },
  pressed: { opacity: 0.85 }
});
