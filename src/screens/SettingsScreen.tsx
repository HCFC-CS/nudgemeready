import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "../components/Button";
import { Field, ToggleRow } from "../components/FormControls";
import { PageHeader, SoftCard } from "../components/NudgeComponents";
import { ProfileAvatarPicker } from "../components/ProfileAvatarPicker";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useHomeSettings } from "../hooks/useHomeSettings";
import { useProfile } from "../hooks/useProfile";
import { useVoiceCaptureSettings } from "../hooks/useVoiceCaptureSettings";
import {
  getCurrentCoordinates,
  requestBackgroundLocationPermission,
  requestLocationReminderPermission
} from "../services/locationReminders";
import { ensureNotificationPermission } from "../services/notifications";
import {
  buildLeavingHomeSpeechText,
  hasHomeCoordinates,
  HOME_THRESHOLD_OPTIONS
} from "../services/homeSettingsStorage";
import { colors, spacing } from "../theme/theme";

const toneOptions = ["Gentle", "Cheerful", "Straightforward", "Minimal"];
const appearanceOptions = ["Light", "Dark", "System"];
const timerOptions = ["15", "25", "45", "60"];
const reminderOptions = ["No reminder", "Morning", "Afternoon", "Evening", "Custom"];
const categoryOptions = ["Home", "Work", "School", "Health", "Clubs"];

export function SettingsScreen() {
  const { profile, updateName, updateEmail, updatePhone } = useProfile();
  const {
    homeSettings,
    setEnabled,
    setLabel,
    setCoordinates,
    clearCoordinates,
    setThresholdMeters,
    updateChecklistItem,
    addChecklistItem,
    removeChecklistItem
  } = useHomeSettings();
  const [isLocatingHome, setIsLocatingHome] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [quietHours, setQuietHours] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [contactsEnabled, setContactsEnabled] = useState(true);
  const { enabled: voiceCapture, setEnabled: setVoiceCapture } = useVoiceCaptureSettings();
  const [cloudBackup, setCloudBackup] = useState(false);
  const [tone, setTone] = useState("Gentle");
  const [appearance, setAppearance] = useState("System");
  const [focusTimer, setFocusTimer] = useState("25");
  const [defaultReminder, setDefaultReminder] = useState("Morning");

  async function handlePushNotifications(value: boolean) {
    setPushNotifications(value);
    if (value) {
      await ensureNotificationPermission();
    }
  }

  async function handleContacts(value: boolean) {
    setContactsEnabled(value);
    if (value) {
      await requestLocationReminderPermission();
    }
  }

  async function handleLeavingHomeReminder(value: boolean) {
    if (!value) {
      setEnabled(false);
      setLocationMessage(null);
      return;
    }

    const hasLocation = await requestLocationReminderPermission();
    if (!hasLocation) {
      setLocationMessage("Location access is needed to know when you leave home.");
      return;
    }

    await ensureNotificationPermission();
    await requestBackgroundLocationPermission();

    if (!hasHomeCoordinates(homeSettings)) {
      setLocationMessage("Set your home location below, then turn this on again.");
      return;
    }

    setEnabled(true);
    setLocationMessage(null);
  }

  async function handleUseCurrentLocation() {
    setIsLocatingHome(true);
    setLocationMessage(null);
    try {
      const coordinates = await getCurrentCoordinates();
      if (!coordinates) {
        setLocationMessage("Location access is needed to save where home is.");
        return;
      }
      setCoordinates(coordinates.latitude, coordinates.longitude);
      setLocationMessage("Saved your current location as home.");
    } catch {
      setLocationMessage("Could not read your current location. Try again in a moment.");
    } finally {
      setIsLocatingHome(false);
    }
  }

  const homePreview = buildLeavingHomeSpeechText(homeSettings.checklistItems);

  return (
    <Screen>
      <PageHeader title="Make Nudge me Ready yours." />

      <SoftCard>
        <AppText variant="heading">Notifications</AppText>
        <ToggleRow
          label="Push"
          value={pushNotifications}
          onValueChange={handlePushNotifications}
          note="Gentle prompts on this device."
        />
        <ToggleRow
          label="Email"
          value={emailNotifications}
          onValueChange={setEmailNotifications}
          note="Useful for backup nudges."
        />
        <ToggleRow
          label="Quiet hours"
          value={quietHours}
          onValueChange={setQuietHours}
          note="Keep evenings softer."
        />
        <ToggleRow
          label="Daily summary"
          value={dailySummary}
          onValueChange={setDailySummary}
          note="A small look at the day ahead."
        />
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Appearance</AppText>
        <OptionGrid options={appearanceOptions} selected={appearance} onSelect={setAppearance} />
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Tone</AppText>
        <OptionGrid options={toneOptions} selected={tone} onSelect={setTone} />
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Focus timer</AppText>
        <AppText variant="muted">Default focus timer</AppText>
        <OptionGrid options={timerOptions} selected={focusTimer} onSelect={setFocusTimer} suffix=" min" />
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Categories</AppText>
        <View style={styles.categoryList}>
          {categoryOptions.map((category) => (
            <View key={category} style={styles.categoryRow}>
              <View style={styles.categoryDot} />
              <AppText>{category}</AppText>
            </View>
          ))}
        </View>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Leaving home</AppText>
        <AppText variant="muted">
          A gentle spoken checklist when you step beyond your home radius.
        </AppText>
        <ToggleRow
          label="Leaving-home reminder"
          value={homeSettings.enabled}
          onValueChange={handleLeavingHomeReminder}
          note="Speaks once each time you leave home."
        />
        <Field
          label="Home label"
          value={homeSettings.label}
          onChangeText={setLabel}
          placeholder="Home, flat, parents' house…"
        />
        <View style={styles.homeActions}>
          <Button tone="secondary" onPress={handleUseCurrentLocation} disabled={isLocatingHome}>
            {isLocatingHome ? "Getting location…" : "Use current location"}
          </Button>
          {hasHomeCoordinates(homeSettings) ? (
            <Button tone="quiet" onPress={clearCoordinates}>
              Clear coordinates
            </Button>
          ) : null}
        </View>
        {hasHomeCoordinates(homeSettings) ? (
          <AppText variant="small" style={{ color: colors.mutedText }}>
            {homeSettings.latitude!.toFixed(5)}, {homeSettings.longitude!.toFixed(5)}
          </AppText>
        ) : (
          <AppText variant="small" style={{ color: colors.mutedText }}>
            No coordinates saved yet.
          </AppText>
        )}
        {locationMessage ? <AppText variant="small">{locationMessage}</AppText> : null}
        <AppText variant="small">Distance before reminder</AppText>
        <View style={styles.options}>
          {HOME_THRESHOLD_OPTIONS.map((option) => (
            <Button
              key={option}
              tone={homeSettings.thresholdMeters === option ? "primary" : "quiet"}
              style={styles.option}
              onPress={() => setThresholdMeters(option)}
            >
              {option} m
            </Button>
          ))}
        </View>
        <AppText variant="small">Checklist items</AppText>
        {homeSettings.checklistItems.map((item, index) => (
          <View key={`checklist-${index}`} style={styles.checklistRow}>
            <View style={styles.checklistField}>
              <Field
                label={`Item ${index + 1}`}
                value={item}
                onChangeText={(value) => updateChecklistItem(index, value)}
                placeholder="phone, wallet, keys…"
              />
            </View>
            {homeSettings.checklistItems.length > 1 ? (
              <Button tone="quiet" style={styles.removeButton} onPress={() => removeChecklistItem(index)}>
                Remove
              </Button>
            ) : null}
          </View>
        ))}
        <Button tone="quiet" onPress={addChecklistItem}>
          Add item
        </Button>
        <AppText variant="muted">Preview: {homePreview}</AppText>
        <AppText variant="small" style={{ color: colors.mutedText }}>
          Location and notification permissions are requested when you turn this on. Background location
          helps reminders fire when the app is not open; iOS may limit this between app sessions.
        </AppText>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Contacts</AppText>
        <ToggleRow
          label="Contact linking"
          value={contactsEnabled}
          onValueChange={handleContacts}
          note="Suggest people and places when they fit."
        />
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Voice capture</AppText>
        <ToggleRow
          label="Tap to speak"
          value={voiceCapture}
          onValueChange={setVoiceCapture}
          note="Use voice as a quick way to get things down."
        />
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Data and backup</AppText>
        <ToggleRow
          label="Backup Nudge me Ready data"
          value={cloudBackup}
          onValueChange={setCloudBackup}
          note="Mock setting for now."
        />
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Account</AppText>
        <Field label="Name" value={profile.name} onChangeText={updateName} placeholder="Your name" />
        <Field label="Email" value={profile.email} onChangeText={updateEmail} placeholder="you@example.com" />
        <Field label="Phone" value={profile.phone} onChangeText={updatePhone} placeholder="Optional" />
        <ProfileAvatarPicker />
        <AppText variant="muted">Default reminder preference</AppText>
        <OptionGrid options={reminderOptions} selected={defaultReminder} onSelect={setDefaultReminder} />
      </SoftCard>
    </Screen>
  );
}

function OptionGrid({
  options,
  selected,
  onSelect,
  suffix = ""
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  suffix?: string;
}) {
  return (
    <View style={styles.options}>
      {options.map((option) => (
        <Button
          key={option}
          tone={selected === option ? "primary" : "quiet"}
          style={styles.option}
          onPress={() => onSelect(option)}
        >
          {option}
          {suffix}
        </Button>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  option: {
    minHeight: 46,
    flexGrow: 1
  },
  categoryList: {
    gap: spacing.sm
  },
  categoryRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  categoryDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary
  },
  homeActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm
  },
  checklistField: {
    flex: 1
  },
  removeButton: {
    minHeight: 52,
    marginBottom: spacing.xs
  }
});
