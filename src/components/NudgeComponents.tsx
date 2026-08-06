import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { Pressable, StyleSheet, TextInput, Vibration, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { type MockContact } from "../data/mockData";
import { useOptionalItemEdit } from "../hooks/useItemEdit";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { useOptionalVoiceCaptureSettings } from "../hooks/useVoiceCaptureSettings";
import {
  applyFavoriteFlags,
  getFavoriteContacts,
  loadDeviceContacts,
  mergeContactSuggestions,
  openContactCall,
  openContactEmail,
  openContactMaps,
  type DeviceContact
} from "../services/deviceContacts";
import { contactFavoriteKey, toggleFavoriteContactKey } from "../services/favoriteContactsStorage";
import { colors, radii, shadows, spacing } from "../theme/theme";
import type { TaskItem } from "../types/models";
import { Button } from "./Button";
import { Card } from "./Card";
import { ContactSuggestionRow } from "./ContactSuggestionRow";
import { ItemEditBanner } from "./ItemEditBanner";
import { HeroSurface, SearchBar } from "./ModernUI";
import { AppText } from "./Text";
import { VoiceFieldActions } from "./VoiceFieldActions";

export function BackButton({ onPress }: { onPress?: () => void }) {
  const navigation = useNavigation();

  if (!navigation.canGoBack() && !onPress) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress ?? (() => navigation.goBack())}
      style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
    >
      <AppText variant="small" style={styles.backLabel}>
        Back
      </AppText>
    </Pressable>
  );
}

export function PageHeader({
  title,
  subtitle,
  showBack = true
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}) {
  const navigation = useNavigation();
  const canShowBack = showBack && navigation.canGoBack();

  return (
    <View style={styles.header}>
      {canShowBack ? <BackButton /> : null}
      <AppText variant="title">{title}</AppText>
      {subtitle ? <AppText variant="muted">{subtitle}</AppText> : null}
    </View>
  );
}

export function PageHeaderWithEdit({
  title,
  subtitle,
  showBack = true
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}) {
  const navigation = useNavigation();
  const canShowBack = showBack && navigation.canGoBack();

  return (
    <View style={styles.header}>
      {canShowBack ? <BackButton /> : null}
      <AppText variant="title">{title}</AppText>
      {subtitle ? <AppText variant="muted">{subtitle}</AppText> : null}
      <ItemEditBanner />
    </View>
  );
}

export function SoftCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <Card style={[styles.softCard, style]}>{children}</Card>;
}

export function PrimaryButton(
  props: PropsWithChildren<Omit<PressableProps, "style"> & { style?: StyleProp<ViewStyle>; size?: "default" | "compact" }>
) {
  const edit = useOptionalItemEdit();
  const disabled = props.disabled ?? (edit ? !edit.editable : false);
  return <Button {...props} tone="primary" disabled={disabled} />;
}

export function SecondaryButton(
  props: PropsWithChildren<Omit<PressableProps, "style"> & { style?: StyleProp<ViewStyle>; size?: "default" | "compact" }>
) {
  const edit = useOptionalItemEdit();
  const disabled = props.disabled ?? (edit ? !edit.editable : false);
  return <Button {...props} tone="quiet" disabled={disabled} />;
}

export function CategoryChip({
  label,
  selected,
  onPress,
  disabled
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const edit = useOptionalItemEdit();
  const isDisabled = disabled ?? (edit ? !edit.editable : false);

  return (
    <Button tone={selected ? "primary" : "quiet"} style={styles.chip} onPress={onPress} disabled={isDisabled || !onPress}>
      {label}
    </Button>
  );
}

export function ItemCard({ item, onPress, onDone }: { item: TaskItem; onPress?: () => void; onDone?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <SoftCard>
        <View style={styles.itemRow}>
          <View style={styles.itemText}>
            <AppText variant="heading">{item.title}</AppText>
            <AppText variant="muted">
              {formatItemType(item.taskType)}
              {item.dueDate ? ` - ${item.dueDate}` : ""}
            </AppText>
          </View>
          <Pressable onPress={onDone} disabled={!onDone} style={[styles.doneDot, item.isCompleted && styles.doneDotActive]}>
            <AppText variant="small">{item.isCompleted ? "OK" : ""}</AppText>
          </Pressable>
        </View>
      </SoftCard>
    </Pressable>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.emptyState}>
      <AppText variant="heading">{title}</AppText>
      <AppText variant="muted">{message}</AppText>
    </View>
  );
}

export function ReminderPicker({ selected, onSelect }: { selected?: string; onSelect?: (value: string) => void }) {
  const options = ["10 mins before", "1 hour before", "1 day before", "1 week before"];
  return (
    <View style={styles.picker}>
      <AppText variant="small">Reminder</AppText>
      <View style={styles.chipRow}>
        {options.map((option) => (
          <CategoryChip key={option} label={option} selected={selected === option} onPress={() => onSelect?.(option)} />
        ))}
      </View>
    </View>
  );
}

export function ContactLink({
  searchHint,
  selectedContact,
  onSelect,
  onRemove
}: {
  searchHint?: string;
  selectedContact?: MockContact;
  onSelect: (contact: MockContact) => void;
  onRemove: () => void;
}) {
  const [search, setSearch] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [deviceContacts, setDeviceContacts] = useState<DeviceContact[]>([]);
  const [favorites, setFavorites] = useState<DeviceContact[]>([]);
  const [contactsReady, setContactsReady] = useState(false);
  const [contactsMessage, setContactsMessage] = useState("");

  async function refreshContacts() {
    const result = await loadDeviceContacts();
    setDeviceContacts(result.contacts);
    setFavorites(result.favorites);
    setContactsMessage(result.message ?? "");
    setContactsReady(true);
  }

  useEffect(() => {
    let active = true;
    void loadDeviceContacts().then((result) => {
      if (!active) return;
      setDeviceContacts(result.contacts);
      setFavorites(result.favorites);
      setContactsMessage(result.message ?? "");
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

  async function handleToggleFavorite(contact: DeviceContact) {
    const keys = await toggleFavoriteContactKey(contactFavoriteKey(contact));
    const nextContacts = applyFavoriteFlags(deviceContacts, keys);
    setDeviceContacts(nextContacts);
    setFavorites(getFavoriteContacts(nextContacts, keys));
  }

  return (
    <View style={styles.contactLink}>
      <View style={styles.contactSearchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={searchHint ? `Type to find “${searchHint}”…` : "Start typing a name…"}
          placeholderTextColor={colors.mutedText}
          autoCorrect={false}
          autoCapitalize="words"
          style={[styles.input, styles.contactSearchInput]}
        />
        <VoiceFieldActions value={search} onChangeText={setSearch} size={28} />
      </View>
      {selectedContact ? (
        <SoftCard>
          <AppText variant="heading">{selectedContact.name}</AppText>
          <AppText variant="muted">{selectedContact.role}</AppText>
          {selectedContact.phone ? <AppText>{selectedContact.phone}</AppText> : null}
          {selectedContact.email ? <AppText>{selectedContact.email}</AppText> : null}
          {selectedContact.address ? <AppText variant="muted">{selectedContact.address}</AppText> : null}
          <View style={styles.contactActions}>
            {selectedContact.phone ? (
              <SecondaryButton
                onPress={() => {
                  void openContactCall(selectedContact.phone);
                  setActionNotice(`Calling ${selectedContact.phone}`);
                }}
              >
                Call
              </SecondaryButton>
            ) : null}
            {selectedContact.email ? (
              <SecondaryButton
                onPress={() => {
                  void openContactEmail(selectedContact.email);
                  setActionNotice(`Emailing ${selectedContact.email}`);
                }}
              >
                Email
              </SecondaryButton>
            ) : null}
            {selectedContact.address ? (
              <SecondaryButton
                onPress={() => {
                  void openContactMaps(selectedContact.address);
                  setActionNotice(`Opening map for ${selectedContact.address}`);
                }}
              >
                Directions
              </SecondaryButton>
            ) : null}
            <SecondaryButton onPress={onRemove}>Remove contact</SecondaryButton>
          </View>
          {actionNotice ? <AppText variant="small">{actionNotice}</AppText> : null}
        </SoftCard>
      ) : (
        <View style={styles.contactSuggestions}>
          {!contactsReady ? (
            <AppText variant="muted">Loading phone contacts…</AppText>
          ) : !query ? (
            <>
              {favorites.length ? (
                <>
                  <AppText variant="section">Favorites</AppText>
                  {favorites.map((contact) => (
                    <ContactSuggestionRow
                      key={contact.id}
                      contact={contact}
                      onSelect={() => onSelect(contact)}
                      onToggleFavorite={() => void handleToggleFavorite(contact)}
                      isFavorite
                    />
                  ))}
                </>
              ) : (
                <AppText variant="muted">
                  Start typing to search, or tap the star on a contact to pin favorites here.
                </AppText>
              )}
            </>
          ) : suggestions.length ? (
            suggestions.map((contact) => (
              <ContactSuggestionRow
                key={contact.id}
                contact={contact}
                onSelect={() => onSelect(contact)}
                onToggleFavorite={() => void handleToggleFavorite(contact)}
                isFavorite={Boolean(contact.appFavorite || contact.deviceFavorite)}
              />
            ))
          ) : (
            <AppText variant="muted">
              {contactsMessage.includes("Allow") || contactsMessage.includes("turned off")
                ? contactsMessage
                : "No matching contacts."}
            </AppText>
          )}
          <SecondaryButton onPress={() => void refreshContacts()}>Refresh phone contacts</SecondaryButton>
        </View>
      )}
    </View>
  );
}

export function VoiceCaptureButton({
  onCaptured,
  placeholder = "What do you want to add?",
  idleLabel = "Tap to speak",
  idleTone = "secondary",
  compact = false,
  layout = "card"
}: {
  onCaptured?: (text: string, voiceNoteUrl: string) => void;
  placeholder?: string;
  idleLabel?: string;
  idleTone?: "primary" | "secondary";
  compact?: boolean;
  layout?: "card" | "heroMic";
}) {
  const [fallbackInput, setFallbackInput] = useState("");
  const [fallbackListening, setFallbackListening] = useState(false);
  const speech = useSpeechToText();
  const voiceSettings = useOptionalVoiceCaptureSettings();
  const edit = useOptionalItemEdit();
  const isEditable = edit?.editable ?? true;
  const voiceEnabled = voiceSettings?.enabled ?? true;
  const useSpeech = voiceEnabled && speech.isAvailable;
  const isListening = useSpeech ? speech.isListening : fallbackListening;
  const liveText = useSpeech ? speech.transcript : fallbackInput;

  async function startListening() {
    if (!isEditable) {
      return;
    }
    if (useSpeech) {
      const started = await speech.start();
      if (started) {
        Vibration.vibrate(100);
      }
      return;
    }
    setFallbackInput("");
    setFallbackListening(true);
    Vibration.vibrate(100);
  }

  function captureText() {
    if (useSpeech) {
      const { capturedText, voiceNoteUrl } = speech.finish();
      if (!capturedText) {
        return;
      }
      onCaptured?.(capturedText, voiceNoteUrl);
      Vibration.vibrate(160);
      return;
    }

    const capturedText = fallbackInput.trim();
    if (!capturedText) {
      return;
    }
    onCaptured?.(capturedText, `mock-voice-note://${Date.now()}`);
    setFallbackInput("");
    setFallbackListening(false);
    Vibration.vibrate(160);
  }

  function resetVoice() {
    if (useSpeech) {
      speech.reset();
      return;
    }
    setFallbackInput("");
    setFallbackListening(false);
  }

  const listeningCopy = useSpeech
    ? "Listening… tap done when finished."
    : "Type what you would say, then tap done.";

  if (compact) {
    return (
      <View style={styles.compactVoice}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isListening ? "Done speaking" : "Tap to speak"}
          onPress={isListening ? captureText : startListening}
          disabled={!isEditable}
          style={({ pressed }) => [
            styles.compactMic,
            isListening && styles.voiceIconActive,
            pressed && styles.compactMicPressed
          ]}
        >
          <Ionicons
            name={isListening ? "checkmark" : "mic"}
            size={22}
            color={isListening ? colors.onPrimary : colors.primaryDark}
          />
        </Pressable>
        {isListening ? (
          <TextInput
            value={liveText}
            onChangeText={useSpeech ? undefined : setFallbackInput}
            placeholder={placeholder}
            placeholderTextColor={colors.mutedText}
            style={styles.compactInput}
            autoFocus={!useSpeech}
            editable={!useSpeech}
            onSubmitEditing={captureText}
          />
        ) : null}
        {speech.error ? (
          <AppText variant="caption" style={styles.voiceError}>{speech.error}</AppText>
        ) : null}
      </View>
    );
  }

  if (layout === "heroMic") {
    return (
      <View style={styles.heroMicWrap}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isListening ? "Done speaking" : idleLabel}
          onPress={isListening ? captureText : startListening}
          disabled={!isEditable}
          style={({ pressed }) => [
            styles.heroMicButton,
            isListening && styles.heroMicListening,
            pressed && styles.compactMicPressed
          ]}
        >
          {isListening ? (
            <>
              <View style={[styles.heroRing, styles.heroRingOuter]} />
              <View style={[styles.heroRing, styles.heroRingMid]} />
            </>
          ) : null}
          <Ionicons name="mic" size={40} color={colors.primaryDark} />
        </Pressable>
        <AppText variant="heading" style={styles.heroMicLabel}>
          {isListening ? "Listening…" : idleLabel}
        </AppText>
        {isListening ? (
          <AppText variant="caption" style={styles.heroMicHint}>
            Tap to stop
          </AppText>
        ) : null}
        {isListening ? (
          <>
            <TextInput
              value={liveText}
              onChangeText={useSpeech ? undefined : setFallbackInput}
              placeholder={placeholder}
              placeholderTextColor={colors.mutedText}
              style={styles.input}
              autoFocus={!useSpeech}
              editable={!useSpeech}
            />
            <Button tone="quiet" onPress={resetVoice}>
              Cancel
            </Button>
          </>
        ) : null}
        {speech.error ? <AppText variant="caption" style={styles.voiceError}>{speech.error}</AppText> : null}
      </View>
    );
  }

  return (
    <HeroSurface>
      <View style={styles.voiceHero}>
        <View style={[styles.voiceIcon, isListening && styles.voiceIconActive]}>
          <Ionicons
            name={isListening ? "mic" : "mic-outline"}
            size={28}
            color={isListening ? "#FFFFFF" : colors.primaryDark}
          />
        </View>
        <View style={styles.voiceCopy}>
          <AppText variant="heading">{isListening ? "Listening…" : "Say it out loud"}</AppText>
          <AppText variant="caption">
            {isListening ? listeningCopy : "Tap to capture a nudge by voice."}
          </AppText>
        </View>
      </View>
      <Button
        tone={isListening ? "primary" : idleTone}
        onPress={isListening ? captureText : startListening}
        disabled={!isEditable}
      >
        {isListening ? "Done speaking" : idleLabel}
      </Button>
      {isListening ? (
        <>
          <TextInput
            value={liveText}
            onChangeText={useSpeech ? undefined : setFallbackInput}
            placeholder={placeholder}
            placeholderTextColor={colors.mutedText}
            style={styles.input}
            autoFocus={!useSpeech}
            editable={!useSpeech}
          />
          <Button tone="quiet" onPress={resetVoice}>
            Cancel
          </Button>
        </>
      ) : null}
      {speech.error ? <AppText variant="caption" style={styles.voiceError}>{speech.error}</AppText> : null}
    </HeroSurface>
  );
}

export function SoftTextInput({
  value,
  onChangeText,
  placeholder,
  multiline
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  if (multiline) {
    return (
      <View style={styles.softTextWrap}>
        <View style={styles.softTextHeader}>
          <VoiceFieldActions value={value} onChangeText={onChangeText} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedText}
          multiline
          style={[styles.input, styles.multiline]}
        />
      </View>
    );
  }
  return <SearchBar value={value} onChangeText={onChangeText} placeholder={placeholder} />;
}

function formatItemType(type: TaskItem["taskType"]) {
  if (type === "taskJob") {
    return "Task";
  }
  if (type === "chore") {
    return "Routine";
  }
  if (type === "occasion") {
    return "Occasion";
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    paddingBottom: spacing.sm
  },
  backButton: {
    alignSelf: "flex-start",
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted
  },
  backButtonPressed: {
    opacity: 0.82
  },
  backLabel: {
    color: colors.accent,
    fontWeight: "600"
  },
  softCard: {
    backgroundColor: colors.card
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: radii.pill
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  itemText: {
    flex: 1
  },
  doneDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center"
  },
  doneDotActive: {
    backgroundColor: colors.primary
  },
  picker: {
    gap: spacing.xs
  },
  contactLink: {
    gap: spacing.sm
  },
  contactSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  contactSearchInput: {
    flex: 1
  },
  softTextWrap: {
    gap: spacing.xs
  },
  softTextHeader: {
    alignItems: "flex-end"
  },
  contactSuggestions: {
    gap: spacing.sm
  },
  contactSuggestion: {
    minHeight: 56,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.md,
    justifyContent: "center"
  },
  contactActions: {
    gap: spacing.sm
  },
  emptyState: {
    gap: spacing.xs,
    paddingVertical: spacing.xl,
    alignItems: "center"
  },
  voiceHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  heroMicWrap: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md
  },
  heroMicButton: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm
  },
  heroMicListening: {
    backgroundColor: colors.primary
  },
  heroRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.primary
  },
  heroRingOuter: {
    width: 148,
    height: 148,
    opacity: 0.35
  },
  heroRingMid: {
    width: 130,
    height: 130,
    opacity: 0.55
  },
  heroMicLabel: {
    textAlign: "center",
    marginTop: spacing.xs
  },
  heroMicHint: {
    textAlign: "center"
  },
  voiceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  voiceIconActive: {
    backgroundColor: colors.primary
  },
  voiceCopy: {
    flex: 1,
    gap: 2
  },
  input: {
    minHeight: 48,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16
  },
  multiline: {
    minHeight: 132,
    paddingTop: spacing.md,
    textAlignVertical: "top"
  },
  compactVoice: {
    alignItems: "center",
    gap: spacing.xs
  },
  compactMic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  compactMicPressed: {
    opacity: 0.85
  },
  compactInput: {
    width: 160,
    minHeight: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    color: colors.text,
    fontSize: 14
  },
  voiceError: {
    color: "#B42318",
    textAlign: "center"
  }
});
