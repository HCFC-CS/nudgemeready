import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { Button } from "../components/Button";
import { Field, ToggleRow } from "../components/FormControls";
import { HearButton } from "../components/HearButton";
import { HomeLocationPicker } from "../components/HomeLocationPicker";
import { PageHeader, PrimaryButton, SoftCard } from "../components/NudgeComponents";
import { ProfileAvatarPicker } from "../components/ProfileAvatarPicker";
import { Screen } from "../components/Screen";
import { SecuritySettingsCard } from "../components/SecuritySettingsCard";
import { AppText } from "../components/Text";
import { useHomeSettings } from "../hooks/useHomeSettings";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { type ProfileDraft, useProfile } from "../hooks/useProfile";
import { useVoiceCaptureSettings } from "../hooks/useVoiceCaptureSettings";
import {
  defaultAppPreferences,
  loadAppPreferences,
  saveAppPreferences,
  type AppPreferences
} from "../services/appPreferencesStorage";
import {
  requestBackgroundLocationPermission,
  requestLocationReminderPermission
} from "../services/locationReminders";
import { ensureNotificationPermission } from "../services/notifications";
import {
  buildLeavingHomeSpeechText,
  hasReminderPlaces,
  HOME_THRESHOLD_OPTIONS,
  saveHomeSettings,
  type HomeThresholdMeters
} from "../services/homeSettingsStorage";
import { colors, spacing } from "../theme/theme";

const toneOptions = ["Gentle", "Cheerful", "Straightforward", "Minimal"];
const appearanceOptions = ["Light", "Dark", "System"];
const timerOptions = ["15", "25", "45", "60"];
const reminderOptions = ["No reminder", "Morning", "Afternoon", "Evening", "Custom"];
const categoryOptions = ["Home", "Work", "School", "Health", "Clubs"];

function cloneProfile(profile: ProfileDraft): ProfileDraft {
  return {
    name: profile.name,
    icon: profile.icon,
    avatarUri: profile.avatarUri,
    email: profile.email,
    phone: profile.phone
  };
}

function clonePrefs(prefs: AppPreferences): AppPreferences {
  return { ...prefs };
}

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { profile, saveProfile } = useProfile();
  const { homeSettings, setEnabled, setThresholdMeters, setChecklistItems } = useHomeSettings();
  const { setEnabled: setVoiceCapture, setReadAloudEnabled } = useVoiceCaptureSettings();
  const { items, clearAllNudgeItems, clearCompletedNudgeItems, clearNudgeItemsByTypes } = useNudgeItems();
  const [isClearingNudges, setIsClearingNudges] = useState(false);

  const [profileDraft, setProfileDraft] = useState<ProfileDraft>(() => cloneProfile(profile));
  const [prefsDraft, setPrefsDraft] = useState<AppPreferences>(defaultAppPreferences);
  const [savedPrefsSnapshot, setSavedPrefsSnapshot] = useState<AppPreferences>(defaultAppPreferences);
  const [prefsReady, setPrefsReady] = useState(false);
  const [leavingEnabled, setLeavingEnabled] = useState(homeSettings.enabled);
  const [thresholdDraft, setThresholdDraft] = useState<HomeThresholdMeters>(homeSettings.thresholdMeters);
  const [checklistDraft, setChecklistDraft] = useState<string[]>([...homeSettings.checklistItems]);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useFocusEffect(
    useCallback(() => {
      setProfileDraft(cloneProfile(profile));
      setLeavingEnabled(homeSettings.enabled);
      setThresholdDraft(homeSettings.thresholdMeters);
      setChecklistDraft([...homeSettings.checklistItems]);
      setNotice("");
      setLocationMessage(null);
      let active = true;
      loadAppPreferences().then((prefs) => {
        if (!active) {
          return;
        }
        const next = clonePrefs(prefs);
        setPrefsDraft(next);
        setSavedPrefsSnapshot(next);
        setPrefsReady(true);
      });
      return () => {
        active = false;
      };
    }, [profile, homeSettings.enabled, homeSettings.thresholdMeters, homeSettings.checklistItems])
  );

  const anythingDirty = useMemo(() => {
    if (!prefsReady) {
      return false;
    }
    const profileChanged =
      profileDraft.name !== profile.name ||
      profileDraft.email !== profile.email ||
      profileDraft.phone !== profile.phone ||
      profileDraft.icon !== profile.icon ||
      profileDraft.avatarUri !== profile.avatarUri;
    const leavingChanged =
      leavingEnabled !== homeSettings.enabled ||
      thresholdDraft !== homeSettings.thresholdMeters ||
      checklistDraft.join("\n") !== homeSettings.checklistItems.join("\n");
    const prefsChanged = JSON.stringify(prefsDraft) !== JSON.stringify(savedPrefsSnapshot);
    return profileChanged || leavingChanged || prefsChanged;
  }, [
    prefsReady,
    profile,
    profileDraft,
    leavingEnabled,
    thresholdDraft,
    checklistDraft,
    homeSettings.enabled,
    homeSettings.thresholdMeters,
    homeSettings.checklistItems,
    prefsDraft,
    savedPrefsSnapshot
  ]);

  function patchPrefs(patch: Partial<AppPreferences>) {
    setPrefsDraft((current) => ({ ...current, ...patch }));
    setNotice("");
  }

  async function handleLeavingHomeReminder(value: boolean) {
    if (!value) {
      setLeavingEnabled(false);
      setLocationMessage(null);
      return;
    }

    setLeavingEnabled(true);

    const hasLocation = await requestLocationReminderPermission();
    await ensureNotificationPermission();
    await requestBackgroundLocationPermission();

    if (!hasLocation) {
      setLocationMessage(
        "Leaving reminders are on. Allow location access when prompted so they can work on this device."
      );
      return;
    }

    if (!hasReminderPlaces(homeSettings)) {
      setLocationMessage(
        "Leaving reminders are on. Add a place below and keep “Remind when leaving” enabled so they can fire."
      );
      return;
    }

    setLocationMessage(null);
  }

  async function handlePushNotifications(value: boolean) {
    patchPrefs({ pushNotifications: value });
    if (value) {
      await ensureNotificationPermission();
    }
  }

  async function handleContacts(value: boolean) {
    patchPrefs({ contactsEnabled: value });
    if (value) {
      await requestLocationReminderPermission();
    }
  }

  async function handleSaveAll() {
    const nextHome = {
      ...homeSettings,
      enabled: leavingEnabled,
      thresholdMeters: thresholdDraft,
      checklistItems: checklistDraft
    };
    saveProfile(profileDraft);
    setEnabled(leavingEnabled);
    setThresholdMeters(thresholdDraft);
    setChecklistItems(checklistDraft);
    setVoiceCapture(prefsDraft.voiceCapture);
    setReadAloudEnabled(prefsDraft.readAloud);
    await saveAppPreferences(prefsDraft);
    await saveHomeSettings(nextHome);
    setSavedPrefsSnapshot(clonePrefs(prefsDraft));
    setNotice("All settings saved.");
  }

  function handleDiscardAll() {
    setProfileDraft(cloneProfile(profile));
    setLeavingEnabled(homeSettings.enabled);
    setThresholdDraft(homeSettings.thresholdMeters);
    setChecklistDraft([...homeSettings.checklistItems]);
    setPrefsDraft(clonePrefs(savedPrefsSnapshot));
    setNotice("Changes discarded.");
  }

  const homePreview = buildLeavingHomeSpeechText(checklistDraft);

  return (
    <Screen>
      <PageHeader title="Make Nudge me Ready yours." />

      <SoftCard>
        <AppText variant="heading">Notifications</AppText>
        <ToggleRow
          label="Push"
          value={prefsDraft.pushNotifications}
          onValueChange={(value) => void handlePushNotifications(value)}
          note="Gentle prompts on this device."
        />
        <ToggleRow
          label="Email"
          value={prefsDraft.emailNotifications}
          onValueChange={(value) => patchPrefs({ emailNotifications: value })}
          note="Useful for backup nudges."
        />
        <ToggleRow
          label="Quiet hours"
          value={prefsDraft.quietHours}
          onValueChange={(value) => patchPrefs({ quietHours: value })}
          note="Keep evenings softer."
        />
        <ToggleRow
          label="Daily summary"
          value={prefsDraft.dailySummary}
          onValueChange={(value) => patchPrefs({ dailySummary: value })}
          note="A small look at the day ahead."
        />
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Appearance</AppText>
        <OptionGrid
          options={appearanceOptions}
          selected={prefsDraft.appearance}
          onSelect={(appearance) => patchPrefs({ appearance })}
        />
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Tone</AppText>
        <OptionGrid options={toneOptions} selected={prefsDraft.tone} onSelect={(tone) => patchPrefs({ tone })} />
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Focus timer</AppText>
        <OptionGrid
          options={timerOptions}
          selected={prefsDraft.focusTimer}
          onSelect={(focusTimer) => patchPrefs({ focusTimer })}
          suffix=" min"
        />
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
        <AppText variant="heading">Leaving places</AppText>
        <ToggleRow
          label="Leaving reminders"
          value={leavingEnabled}
          onValueChange={(value) => void handleLeavingHomeReminder(value)}
        />
        <HomeLocationPicker />
        {locationMessage ? <AppText variant="small">{locationMessage}</AppText> : null}
        <AppText variant="caption">Distance</AppText>
        <View style={styles.options}>
          {HOME_THRESHOLD_OPTIONS.map((option) => (
            <Button
              key={option}
              tone={thresholdDraft === option ? "primary" : "quiet"}
              style={styles.option}
              onPress={() => setThresholdDraft(option)}
            >
              {option} m
            </Button>
          ))}
        </View>
        <AppText variant="caption">Checklist</AppText>
        {checklistDraft.map((item, index) => (
          <View key={`checklist-${index}`} style={styles.checklistRow}>
            <View style={styles.checklistField}>
              <Field
                label={`Item ${index + 1}`}
                value={item}
                onChangeText={(value) =>
                  setChecklistDraft((current) => current.map((entry, itemIndex) => (itemIndex === index ? value : entry)))
                }
                placeholder="phone, keys…"
              />
            </View>
            {checklistDraft.length > 1 ? (
              <Button
                tone="quiet"
                style={styles.removeButton}
                onPress={() => setChecklistDraft((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              >
                Remove
              </Button>
            ) : null}
          </View>
        ))}
        <Button tone="quiet" onPress={() => setChecklistDraft((current) => [...current, ""])}>
          Add item
        </Button>
        <View style={styles.previewRow}>
          <AppText variant="caption" style={{ color: colors.mutedText, flex: 1 }}>
            Preview: {homePreview}
          </AppText>
          <HearButton text={homePreview} />
        </View>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Contacts & calendars</AppText>
        <ToggleRow
          label="Phone contacts"
          value={prefsDraft.contactsEnabled}
          onValueChange={(value) => void handleContacts(value)}
          note="Use people from your phone Contacts app when linking contacts or adding guests."
        />
        <AppText variant="muted">
          Appointments and events can sync into any writable calendar on this phone — iCloud, Google, Outlook, or Exchange — when “Link to phone / email calendar” is on.
        </AppText>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Voice</AppText>
        <ToggleRow
          label="Voice to text"
          value={prefsDraft.voiceCapture}
          onValueChange={(value) => patchPrefs({ voiceCapture: value })}
          note="Show the mic on fields. Speech input needs a development or TestFlight build."
        />
        <ToggleRow
          label="Text to voice"
          value={prefsDraft.readAloud}
          onValueChange={(value) => patchPrefs({ readAloud: value })}
          note="Show the speaker on fields to hear text read aloud."
        />
      </SoftCard>

      <SecuritySettingsCard />

      <SoftCard>
        <AppText variant="heading">Privacy & support</AppText>
        <AppText variant="muted">
          Your data is encrypted on this phone. Read how app lock and permissions work, or get help with
          sign-in, invites, or TestFlight.
        </AppText>
        <Button tone="quiet" onPress={() => navigation.navigate("LegalInfo")}>
          Open privacy & support
        </Button>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Data and backup</AppText>
        <ToggleRow
          label="Backup Nudge me Ready data"
          value={prefsDraft.cloudBackup}
          onValueChange={(value) => patchPrefs({ cloudBackup: value })}
          note="Cloud backup is not available yet. Your data stays on this phone."
          disabled
        />
        <AppText variant="muted">
          {items.length
            ? `${items.length} nudge${items.length === 1 ? "" : "s"} saved on this device.`
            : "No nudges saved on this device."}
        </AppText>
        <Button
          tone="quiet"
          disabled={isClearingNudges || items.every((item) => item.status !== "done")}
          onPress={() => {
            const completedCount = items.filter((item) => item.status === "done").length;
            Alert.alert(
              "Clear completed nudges?",
              `This removes ${completedCount} completed nudge${completedCount === 1 ? "" : "s"}. It cannot be undone.`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Clear completed",
                  style: "destructive",
                  onPress: () => {
                    void (async () => {
                      setIsClearingNudges(true);
                      try {
                        const removed = await clearCompletedNudgeItems();
                        setNotice(
                          removed
                            ? `Cleared ${removed} completed nudge${removed === 1 ? "" : "s"}.`
                            : "No completed nudges to clear."
                        );
                      } finally {
                        setIsClearingNudges(false);
                      }
                    })();
                  }
                }
              ]
            );
          }}
        >
          Clear completed nudges
        </Button>
        <Button
          tone="quiet"
          disabled={isClearingNudges || items.length === 0}
          onPress={() => {
            Alert.alert("Clear nudges by type", "Choose which kind of nudges to remove.", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Reminders",
                onPress: () => {
                  Alert.alert(
                    "Clear all reminders?",
                    "This removes every reminder on this device. It cannot be undone.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Clear reminders",
                        style: "destructive",
                        onPress: () => {
                          void (async () => {
                            setIsClearingNudges(true);
                            try {
                              const removed = await clearNudgeItemsByTypes(["reminder"]);
                              setNotice(
                                removed
                                  ? `Cleared ${removed} reminder${removed === 1 ? "" : "s"}.`
                                  : "No reminders to clear."
                              );
                            } finally {
                              setIsClearingNudges(false);
                            }
                          })();
                        }
                      }
                    ]
                  );
                }
              },
              {
                text: "Notes",
                onPress: () => {
                  Alert.alert("Clear all notes?", "This removes every note on this device. It cannot be undone.", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear notes",
                      style: "destructive",
                      onPress: () => {
                        void (async () => {
                          setIsClearingNudges(true);
                          try {
                            const removed = await clearNudgeItemsByTypes(["note"]);
                            setNotice(
                              removed ? `Cleared ${removed} note${removed === 1 ? "" : "s"}.` : "No notes to clear."
                            );
                          } finally {
                            setIsClearingNudges(false);
                          }
                        })();
                      }
                    }
                  ]);
                }
              },
              {
                text: "Appointments & events",
                onPress: () => {
                  Alert.alert(
                    "Clear appointments & events?",
                    "This removes every appointment and event on this device. It cannot be undone.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Clear them",
                        style: "destructive",
                        onPress: () => {
                          void (async () => {
                            setIsClearingNudges(true);
                            try {
                              const removed = await clearNudgeItemsByTypes(["appointment", "event"]);
                              setNotice(
                                removed
                                  ? `Cleared ${removed} appointment${removed === 1 ? "" : "s"}/event${removed === 1 ? "" : "s"}.`
                                  : "No appointments or events to clear."
                              );
                            } finally {
                              setIsClearingNudges(false);
                            }
                          })();
                        }
                      }
                    ]
                  );
                }
              },
              {
                text: "Tasks & chores",
                onPress: () => {
                  Alert.alert(
                    "Clear tasks & chores?",
                    "This removes every task, subtask, and chore on this device. It cannot be undone.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Clear them",
                        style: "destructive",
                        onPress: () => {
                          void (async () => {
                            setIsClearingNudges(true);
                            try {
                              const removed = await clearNudgeItemsByTypes(["task", "subtask", "chore"]);
                              setNotice(
                                removed
                                  ? `Cleared ${removed} item${removed === 1 ? "" : "s"}.`
                                  : "No tasks or chores to clear."
                              );
                            } finally {
                              setIsClearingNudges(false);
                            }
                          })();
                        }
                      }
                    ]
                  );
                }
              }
            ]);
          }}
        >
          Clear certain types…
        </Button>
        <Button
          tone="warning"
          disabled={isClearingNudges || items.length === 0}
          onPress={() => {
            Alert.alert(
              "Clear all nudges?",
              "This removes every reminder, task, list, and other nudge on this device. It cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Clear all",
                  style: "destructive",
                  onPress: () => {
                    void (async () => {
                      setIsClearingNudges(true);
                      try {
                        await clearAllNudgeItems();
                        setNotice("All nudges cleared.");
                      } finally {
                        setIsClearingNudges(false);
                      }
                    })();
                  }
                }
              ]
            );
          }}
        >
          {isClearingNudges ? "Clearing…" : "Clear all nudges"}
        </Button>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Account</AppText>
        <Field
          label="Name"
          value={profileDraft.name}
          onChangeText={(name) => setProfileDraft((current) => ({ ...current, name }))}
          placeholder="Your name"
        />
        <Field
          label="Email"
          value={profileDraft.email}
          onChangeText={(email) => setProfileDraft((current) => ({ ...current, email }))}
          placeholder="you@example.com"
        />
        <Field
          label="Phone"
          value={profileDraft.phone}
          onChangeText={(phone) => setProfileDraft((current) => ({ ...current, phone }))}
          placeholder="Optional"
        />
        <ProfileAvatarPicker
          name={profileDraft.name}
          icon={profileDraft.icon}
          avatarUri={profileDraft.avatarUri}
          onIconChange={(icon) => setProfileDraft((current) => ({ ...current, icon, avatarUri: undefined }))}
          onAvatarChange={(avatarUri) => setProfileDraft((current) => ({ ...current, avatarUri }))}
        />
        <AppText variant="muted">Default reminder preference</AppText>
        <OptionGrid
          options={reminderOptions}
          selected={prefsDraft.defaultReminder}
          onSelect={(defaultReminder) => patchPrefs({ defaultReminder })}
        />
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Save</AppText>
        <AppText variant="muted">
          {anythingDirty ? "You have unsaved settings changes." : "All settings are up to date."}
        </AppText>
        <View style={styles.saveRow}>
          <PrimaryButton onPress={() => void handleSaveAll()}>Save settings</PrimaryButton>
          {anythingDirty ? (
            <Button tone="quiet" onPress={handleDiscardAll}>
              Discard
            </Button>
          ) : null}
        </View>
        {notice ? <AppText variant="small">{notice}</AppText> : null}
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
  saveRow: {
    gap: spacing.sm,
    marginTop: spacing.xs
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
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  }
});
