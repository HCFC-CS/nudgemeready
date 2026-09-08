import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Button } from "../components/Button";
import { ToggleRow } from "../components/FormControls";
import { HomeLocationPicker } from "../components/HomeLocationPicker";
import { PageHeader, PrimaryButton, SecondaryButton, SectionHeading, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { SecuritySettingsCard } from "../components/SecuritySettingsCard";
import { AppText } from "../components/Text";
import { useAlexaLink } from "../hooks/useAlexaLink";
import { useHomeSettings } from "../hooks/useHomeSettings";
import { persistPayLaterEnabled } from "../hooks/usePayLaterMonitor";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { useProfile } from "../hooks/useProfile";
import { useReadyPacks } from "../hooks/useReadyPacks";
import { READY_PACK_STORE_BILLING_ENABLED } from "../services/readyPackEntitlements";
import { useVoiceCaptureSettings } from "../hooks/useVoiceCaptureSettings";
import { formatAlexaLinkCodeForSpeech } from "../services/alexaBridge";
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
import { syncDailySummaryNotification } from "../services/dailySummary";
import { ensureContactsPermission } from "../services/deviceContacts";
import { hasReminderPlaces, saveHomeSettings } from "../services/homeSettingsStorage";
import { PAY_LATER_PLACES, payLaterKindLabel, type PayLaterPlaceKind } from "../services/payLaterPlaces";
import { cancelAllPayLaterReminders } from "../services/payLaterReminders";
import { loadPayLaterSettings } from "../services/payLaterReminderStorage";
import { colors, radii, spacing } from "../theme/theme";

const timerOptions = ["15", "25", "45", "60"];
const reminderOptions = ["No reminder", "Morning", "Afternoon", "Evening", "Custom"];
const PAY_LATER_KINDS: PayLaterPlaceKind[] = ["congestion_zone", "toll", "drive_away_parking"];

function clonePrefs(prefs: AppPreferences): AppPreferences {
  return { ...prefs };
}

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useProfile();
  const { homeSettings, setEnabled } = useHomeSettings();
  const { setEnabled: setVoiceCapture, setReadAloudEnabled } = useVoiceCaptureSettings();
  const { items, clearAllNudgeItems, clearCompletedNudgeItems, clearNudgeItemsByTypes } = useNudgeItems();
  const { restore } = useReadyPacks();
  const {
    linkState: alexaLink,
    busy: alexaBusy,
    bridgeConfigured: alexaBridgeConfigured,
    turnOn: turnAlexaOn,
    turnOff: turnAlexaOff,
    refreshCode: refreshAlexaCode
  } = useAlexaLink();
  const [isClearingNudges, setIsClearingNudges] = useState(false);
  const [isRestoringPurchases, setIsRestoringPurchases] = useState(false);

  const [prefsDraft, setPrefsDraft] = useState<AppPreferences>(defaultAppPreferences);
  const [savedPrefsSnapshot, setSavedPrefsSnapshot] = useState<AppPreferences>(defaultAppPreferences);
  const [prefsReady, setPrefsReady] = useState(false);
  const [leavingEnabled, setLeavingEnabled] = useState(homeSettings.enabled);
  const [payLaterEnabled, setPayLaterEnabled] = useState(false);
  const [savedPayLaterEnabled, setSavedPayLaterEnabled] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [payLaterMessage, setPayLaterMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [openPayLaterKind, setOpenPayLaterKind] = useState<PayLaterPlaceKind | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLeavingEnabled(homeSettings.enabled);
      setNotice("");
      setLocationMessage(null);
      setPayLaterMessage(null);
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
      loadPayLaterSettings().then((settings) => {
        if (!active) {
          return;
        }
        setPayLaterEnabled(settings.enabled);
        setSavedPayLaterEnabled(settings.enabled);
      });
      return () => {
        active = false;
      };
    }, [homeSettings.enabled])
  );

  const anythingDirty = useMemo(() => {
    if (!prefsReady) {
      return false;
    }
    const leavingChanged = leavingEnabled !== homeSettings.enabled;
    const prefsChanged = JSON.stringify(prefsDraft) !== JSON.stringify(savedPrefsSnapshot);
    const payLaterChanged = payLaterEnabled !== savedPayLaterEnabled;
    return leavingChanged || prefsChanged || payLaterChanged;
  }, [
    prefsReady,
    leavingEnabled,
    homeSettings.enabled,
    prefsDraft,
    savedPrefsSnapshot,
    payLaterEnabled,
    savedPayLaterEnabled
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

    setLocationMessage(
      "Leaving reminders are on. Each place uses its own checklist when GPS detects you leave — not a daily reminder."
    );
  }

  async function handlePayLaterReminders(value: boolean) {
    if (!value) {
      setPayLaterEnabled(false);
      setPayLaterMessage(null);
      return;
    }

    setPayLaterEnabled(true);

    const hasLocation = await requestLocationReminderPermission();
    await ensureNotificationPermission();
    await requestBackgroundLocationPermission();

    if (!prefsDraft.pushNotifications) {
      patchPrefs({ pushNotifications: true });
    }

    if (!hasLocation) {
      setPayLaterMessage(
        "Toll and parking pay nudges are on. Allow location access when prompted so GPS can notice nearby tolls and charge zones, then ask if you used them."
      );
      return;
    }

    setPayLaterMessage(
      "When GPS thinks you left a toll, congestion or clean-air zone, or drive-away car park, you’ll be asked “Did you use this?” Pay nudges only after Yes. Save settings to turn this on."
    );
  }

  async function handlePushNotifications(value: boolean) {
    patchPrefs({ pushNotifications: value });
    if (value) {
      await ensureNotificationPermission();
    }
    await syncDailySummaryNotification();
  }

  async function handleContacts(value: boolean) {
    patchPrefs({ contactsEnabled: value });
    if (value) {
      const granted = await ensureContactsPermission();
      if (!granted) {
        setNotice("Contacts permission wasn’t granted. You can allow it in iPhone Settings.");
      }
    }
  }

  async function handleImportFromPhoneCalendar(value: boolean) {
    patchPrefs({ importFromPhoneCalendar: value });
    if (value) {
      const { ensureCalendarPermission } = await import("../services/calendarSync");
      const granted = await ensureCalendarPermission();
      if (!granted) {
        setNotice("Calendar permission wasn’t granted. You can allow it in iPhone Settings.");
        return;
      }
      setNotice("Save settings, then phone calendar events will appear as appointments and events.");
    }
  }

  async function handleQuietHours(value: boolean) {
    patchPrefs({ quietHours: value });
  }

  async function handleDailySummary(value: boolean) {
    patchPrefs({ dailySummary: value });
    if (value && !prefsDraft.pushNotifications) {
      patchPrefs({ pushNotifications: true, dailySummary: true });
      await ensureNotificationPermission();
    }
    await syncDailySummaryNotification();
  }

  async function handleSaveAll() {
    const nextHome = {
      ...homeSettings,
      enabled: leavingEnabled
    };
    setEnabled(leavingEnabled);
    setVoiceCapture(prefsDraft.voiceCapture);
    setReadAloudEnabled(prefsDraft.readAloud);
    await saveAppPreferences(prefsDraft);
    await saveHomeSettings(nextHome);
    await persistPayLaterEnabled(payLaterEnabled);
    if (!payLaterEnabled) {
      await cancelAllPayLaterReminders();
    }
    setSavedPayLaterEnabled(payLaterEnabled);
    await syncDailySummaryNotification();
    setSavedPrefsSnapshot(clonePrefs(prefsDraft));
    setNotice("All settings saved.");
  }

  function handleDiscardAll() {
    setLeavingEnabled(homeSettings.enabled);
    setPayLaterEnabled(savedPayLaterEnabled);
    setPrefsDraft(clonePrefs(savedPrefsSnapshot));
    setNotice("Changes discarded.");
  }

  return (
    <Screen>
      <PageHeader title="Your Settings" subtitle="Reminders and preferences. Account details live in Profile." />

      <SoftCard>
        <AppText variant="heading">Account</AppText>
        <AppText variant="muted">
          {profile.name?.trim() ? profile.name : "Your profile"}
          {profile.email?.trim() ? ` · ${profile.email}` : ""}
        </AppText>
        <SecondaryButton size="compact" onPress={() => navigation.navigate("Profile")}>
          Edit profile
        </SecondaryButton>
      </SoftCard>

      <SoftCard>
        <SectionHeading
          title="Notifications"
          info="Push schedules gentle prompts on this device. Quiet hours hold alerts overnight (9pm–7am) and soften leaving-place and pay-later prompts. Daily summary is a small morning look at the day ahead — not a ‘forget something’ list — and needs Push on."
        />
        <ToggleRow
          label="Push"
          value={prefsDraft.pushNotifications}
          onValueChange={(value) => void handlePushNotifications(value)}
        />
        <ToggleRow
          label="Quiet hours"
          value={prefsDraft.quietHours}
          onValueChange={(value) => void handleQuietHours(value)}
        />
        <ToggleRow
          label="Daily summary"
          value={prefsDraft.dailySummary}
          onValueChange={(value) => void handleDailySummary(value)}
        />
      </SoftCard>

      <SoftCard>
        <SectionHeading title="Focus timer" info="Default length used on the Focus tab." />
        <OptionGrid
          options={timerOptions}
          selected={prefsDraft.focusTimer}
          onSelect={(focusTimer) => patchPrefs({ focusTimer })}
          suffix=" min"
        />
      </SoftCard>

      <SoftCard>
        <SectionHeading
          title="Leaving places"
          info="Four places — Home, Work, School, Safe place. Each has its own distance and checklist. Nudges only when GPS detects you leaving that place (not a daily reminder). Example: Work → laptop & notes; Home → keys, phone & wallet; School → homework & gym kit. These reminders depend on GPS, permissions, and your device. We are not responsible if a prompt does not fire because location was off, battery settings blocked background updates, or the phone was offline. See Terms of Use for the full caveat."
        />
        <ToggleRow
          label="Leaving reminders"
          value={leavingEnabled}
          onValueChange={(value) => void handleLeavingHomeReminder(value)}
          helpText="Needs location permission. Set each place below, then Save settings."
        />
        <HomeLocationPicker />
        {locationMessage ? <AppText variant="small">{locationMessage}</AppText> : null}
      </SoftCard>

      <SoftCard>
        <SectionHeading
          title="Tolls, zones & parking"
          info="GPS watches known tolls, congestion / clean-air zones, and barrierless car parks. When it thinks you left one, it asks “Were you there?” — pay reminders at 6, 12 and 18 hours only if you say Yes. No daily reminders for places you did not use. Nudge me Ready is not responsible if a pay or leaving reminder does not appear. These features only work when you keep location (GPS) on, allow background access, keep Push on, confirm prompts when asked, and have internet available when needed — including when the app is not open. Always check official payment channels yourself. Full details are in the Terms of Use."
        />
        <ToggleRow
          label="Pay-later reminders"
          value={payLaterEnabled}
          onValueChange={(value) => void handlePayLaterReminders(value)}
          helpText="Needs Push and location. Asks only after a GPS visit. Tap Yes for gentle pay nudges."
        />
        {payLaterMessage ? <AppText variant="small">{payLaterMessage}</AppText> : null}
        <AppText variant="caption" style={styles.placeListLabel}>
          Places watched
        </AppText>
        {PAY_LATER_KINDS.map((kind) => {
          const group = PAY_LATER_PLACES.filter((place) => place.kind === kind);
          if (!group.length) {
            return null;
          }
          const open = openPayLaterKind === kind;
          return (
            <View key={kind} style={styles.dropdown}>
              <Pressable
                onPress={() => setOpenPayLaterKind((current) => (current === kind ? null : kind))}
                style={({ pressed }) => [styles.dropdownHeader, pressed && styles.dropdownPressed]}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                accessibilityLabel={`${payLaterKindLabel(kind)}, ${group.length} places`}
              >
                <View style={styles.dropdownHeaderCopy}>
                  <AppText style={styles.dropdownTitle}>{payLaterKindLabel(kind)}</AppText>
                  <AppText variant="caption" style={styles.placeMeta}>
                    {group.length} place{group.length === 1 ? "" : "s"}
                  </AppText>
                </View>
                <Ionicons
                  name={open ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.mutedText}
                />
              </Pressable>
              {open
                ? group.map((place) => (
                    <Pressable
                      key={place.id}
                      accessibilityRole="link"
                      accessibilityLabel={`Open pay page for ${place.name}`}
                      onPress={() => void Linking.openURL(place.payUrl)}
                      style={styles.placeRow}
                    >
                      <View style={styles.placeCopy}>
                        <AppText style={styles.placeName}>{place.name}</AppText>
                        <AppText variant="caption" style={styles.placeMeta}>
                          Open pay page
                        </AppText>
                      </View>
                    </Pressable>
                  ))
                : null}
            </View>
          );
        })}
      </SoftCard>

      <SoftCard>
        <SectionHeading
          title="Alexa"
          info="Say “Alexa, open Nudge me Ready”, then “what are my nudges” or “add a nudge …”. Linking is optional and only syncs open nudge titles while Alexa is on. Needs the Alexa skill published to your Amazon account."
        />
        {!alexaBridgeConfigured ? (
          <AppText variant="small">Alexa is not connected yet.</AppText>
        ) : null}
        <ToggleRow
          label="Alexa voice"
          value={alexaLink.enabled}
          onValueChange={(value) => {
            void (async () => {
              if (value) {
                await turnAlexaOn();
              } else {
                await turnAlexaOff();
              }
            })();
          }}
          note={
            alexaBusy ? "Working…" : alexaLink.linkedToAlexa ? "Linked on this account." : undefined
          }
        />
        {alexaLink.enabled && alexaLink.linkCode && !alexaLink.linkedToAlexa ? (
          <View style={styles.alexaCodeBox}>
            <AppText variant="caption" style={styles.placeListLabel}>
              Link code
            </AppText>
            <AppText variant="title" style={styles.alexaCode}>
              {alexaLink.linkCode}
            </AppText>
            <AppText variant="muted">
              Say: Alexa, open Nudge me Ready. Then: link with code{" "}
              {formatAlexaLinkCodeForSpeech(alexaLink.linkCode)}.
            </AppText>
            <Button tone="quiet" onPress={() => void refreshAlexaCode()} disabled={alexaBusy}>
              New code
            </Button>
          </View>
        ) : null}
        {alexaLink.enabled && alexaLink.linkedToAlexa ? (
          <AppText variant="small">Connected.</AppText>
        ) : null}
        {alexaLink.lastError ? <AppText variant="small">{alexaLink.lastError}</AppText> : null}
      </SoftCard>

      <SoftCard>
        <SectionHeading
          title="Contacts & calendars"
          info="Phone contacts: search people from your Contacts by typing a name, and star favourites. Pull phone calendar: imports personal appointments and events into nudges — holidays, DST, and similar general calendar noise are skipped. Appointments and events can also sync back into any writable calendar on this phone (iCloud, Google, Outlook, or Exchange) when “Link to phone / email calendar” is on for that nudge. Contacts and calendars depend on your device permissions and third-party providers — see Terms of Use."
        />
        <ToggleRow
          label="Phone contacts"
          value={prefsDraft.contactsEnabled}
          onValueChange={(value) => void handleContacts(value)}
        />
        <ToggleRow
          label="Pull phone calendar into nudges"
          value={prefsDraft.importFromPhoneCalendar}
          onValueChange={(value) => void handleImportFromPhoneCalendar(value)}
        />
      </SoftCard>

      <SoftCard>
        <SectionHeading
          title="Voice"
          info="Voice to text shows the mic on fields (speech input needs a development or TestFlight build). Text to voice shows the speaker on fields to hear text read aloud."
        />
        <ToggleRow
          label="Voice to text"
          value={prefsDraft.voiceCapture}
          onValueChange={(value) => patchPrefs({ voiceCapture: value })}
        />
        <ToggleRow
          label="Text to voice"
          value={prefsDraft.readAloud}
          onValueChange={(value) => patchPrefs({ readAloud: value })}
        />
      </SoftCard>

      <SecuritySettingsCard />

      <SoftCard>
        <SectionHeading
          title="Privacy & support"
          info="Your data is encrypted on this phone. Open privacy & support for how app lock and permissions work, or help with sign-in, invites, or TestFlight. Terms of Use cover missed reminders and location features."
        />
        <Button tone="quiet" onPress={() => navigation.navigate("LegalInfo")}>
          Open privacy & support
        </Button>
        <Button tone="quiet" onPress={() => navigation.navigate("TermsOfUse")}>
          Terms of Use
        </Button>
      </SoftCard>

      <SoftCard>
        <SectionHeading
          title="Data and backup"
          info="Cloud backup is not available yet. Your data stays on this phone. Clearing nudges cannot be undone."
        />
        <ToggleRow
          label="Backup Nudge me Ready data"
          value={prefsDraft.cloudBackup}
          onValueChange={(value) => patchPrefs({ cloudBackup: value })}
          note="Not available yet"
          disabled
        />
        <AppText variant="caption" style={styles.placeMeta}>
          {items.length
            ? `${items.length} nudge${items.length === 1 ? "" : "s"} on this device`
            : "No nudges on this device"}
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
        <SectionHeading
          title="ReadyPack purchases"
          info={
            READY_PACK_STORE_BILLING_ENABLED
              ? "Restore ReadyPack purchases you already made on this Apple ID or Google account."
              : "App Store and Play Billing purchases are not enabled in this version. Included ReadyPacks install for free — you will not be charged. Restore purchases will appear here when store billing goes live."
          }
        />
        {READY_PACK_STORE_BILLING_ENABLED ? (
          <Button
            disabled={isRestoringPurchases}
            onPress={() => {
              void (async () => {
                setIsRestoringPurchases(true);
                try {
                  const result = await restore();
                  setNotice(
                    result.restoredCount > 0
                      ? `Restored access for ${result.restoredCount} purchase(s).`
                      : "No purchases to restore yet."
                  );
                } catch {
                  setNotice("Could not restore purchases right now.");
                } finally {
                  setIsRestoringPurchases(false);
                }
              })();
            }}
          >
            {isRestoringPurchases ? "Restoring…" : "Restore purchases"}
          </Button>
        ) : (
          <AppText variant="caption" style={styles.placeMeta}>
            Billing not enabled in this version
          </AppText>
        )}
      </SoftCard>

      <SoftCard>
        <SectionHeading title="Default reminder" info="Suggested time when you add a new reminder." />
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
  placeListLabel: {
    marginTop: spacing.sm,
    color: colors.mutedText,
    fontWeight: "700"
  },
  dropdown: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
    backgroundColor: colors.ivoryElevated,
    overflow: "hidden"
  },
  dropdownHeader: {
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  dropdownPressed: {
    opacity: 0.88
  },
  dropdownHeaderCopy: {
    flex: 1,
    gap: 2
  },
  dropdownTitle: {
    color: colors.primaryDark,
    fontWeight: "700"
  },
  placeRow: {
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight
  },
  placeCopy: {
    gap: 2
  },
  placeName: {
    color: colors.primaryDark,
    fontWeight: "600"
  },
  placeMeta: {
    color: colors.mutedText
  },
  alexaCodeBox: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  alexaCode: {
    letterSpacing: 4,
    color: colors.primaryDark
  }
});
