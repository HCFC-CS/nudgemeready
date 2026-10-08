import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput } from "react-native";

import { PageHeader, PrimaryButton, SecondaryButton, SoftCard, VoiceCaptureButton } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useNudgeActor } from "../hooks/useNudgeActor";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { useProfile } from "../hooks/useProfile";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { loadAppPreferences, saveAppPreferences } from "../services/appPreferencesStorage";
import { buildCapturePreview, resolveCaptureSave } from "../services/capturePreview";
import { createItem } from "../services/nudgeItems";
import { enableGentleNudges, markGentleNudgeAskOffered } from "../services/notificationAsk";
import { colors, radii, spacing } from "../theme/theme";

type Step = "welcome" | "help" | "notify" | "firstNudge";

const HELP_OPTIONS = [
  { id: "remembering", label: "Remembering things" },
  { id: "getting_done", label: "Getting things done" },
  { id: "appointments", label: "Appointments" },
  { id: "planning", label: "Planning" },
  { id: "everything", label: "A bit of everything" }
] as const;

export function FirstRunScreen() {
  const navigation = useNavigation<any>();
  const actor = useNudgeActor();
  const { saveItem } = useNudgeItems();
  const { completeFirstRun } = useProfile();
  const speech = useSpeechToText();
  const [step, setStep] = useState<Step>("welcome");
  const [helpChoice, setHelpChoice] = useState<string | null>(null);
  const [composeText, setComposeText] = useState("");
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | undefined>();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const preview = useMemo(() => buildCapturePreview(composeText), [composeText]);
  const voiceAvailable = speech.isAvailable;

  async function rememberHelp(choice: string | null) {
    const prefs = await loadAppPreferences();
    await saveAppPreferences({
      ...prefs,
      firstRunFocus: choice ?? prefs.firstRunFocus
    });
  }

  function finishToHome() {
    completeFirstRun();
    navigation.reset({
      index: 0,
      routes: [{ name: "Tabs", params: { screen: "Home" } }]
    });
  }

  async function turnOnReminders() {
    setBusy(true);
    try {
      const granted = await enableGentleNudges();
      setNotice(
        granted
          ? "Reminders are on. You can change this in Settings."
          : "That's OK. You can turn reminders on later in Settings."
      );
    } finally {
      setBusy(false);
      setStep("firstNudge");
    }
  }

  async function skipReminders() {
    await markGentleNudgeAskOffered();
    setStep("firstNudge");
  }

  function saveFirstNudge() {
    const text = composeText.trim();
    if (!text) {
      setNotice("Type or tell us one thing, or skip for now.");
      return;
    }
    const resolved = resolveCaptureSave(text, preview.title || text);
    const saved = createItem({
      title: resolved.title,
      type: resolved.itemType,
      createdBy: actor,
      nudgeIntent: resolved.intent,
      sourcePackId: resolved.packId,
      dueDate: resolved.suggestedFields.dueDate,
      startDate: resolved.suggestedFields.startDate,
      reminderDate: resolved.suggestedFields.reminderDate,
      repeatRule: resolved.suggestedFields.repeatRule,
      speakingReminderText: resolved.title,
      notes: resolved.suggestedFields.notes || text,
      voiceNoteUrl
    });
    saveItem(saved);
    finishToHome();
  }

  return (
    <Screen showTabMenu={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        {step === "welcome" ? (
          <>
            <PageHeader title="Nudge Me Ready" showBack={false} />
            <SoftCard style={styles.card}>
              <AppText variant="title" style={styles.hero}>
                Get it out of your head.
              </AppText>
              <AppText variant="muted">We'll help you remember it.</AppText>
              <PrimaryButton onPress={() => setStep("help")}>Get started</PrimaryButton>
            </SoftCard>
          </>
        ) : null}

        {step === "help" ? (
          <>
            <PageHeader title="Nudge Me Ready" showBack={false} />
            <SoftCard style={styles.card}>
              <AppText variant="heading">What would help most?</AppText>
              <AppText variant="muted">You can change your mind later. This just helps us settle in.</AppText>
              {HELP_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: helpChoice === option.id }}
                  onPress={() => setHelpChoice(option.id)}
                  style={[styles.choice, helpChoice === option.id && styles.choiceOn]}
                >
                  <AppText style={styles.choiceLabel}>{option.label}</AppText>
                </Pressable>
              ))}
              <PrimaryButton
                disabled={!helpChoice}
                onPress={() => {
                  void rememberHelp(helpChoice);
                  setStep("notify");
                }}
              >
                Continue
              </PrimaryButton>
              <SecondaryButton
                onPress={() => {
                  void rememberHelp(null);
                  setStep("notify");
                }}
              >
                Skip
              </SecondaryButton>
            </SoftCard>
          </>
        ) : null}

        {step === "notify" ? (
          <>
            <PageHeader title="Notifications" showBack={false} />
            <SoftCard style={styles.card}>
              <AppText variant="heading">Want us to nudge you when something matters?</AppText>
              <AppText variant="muted">
                You can say not now. Nothing here is required to add your first reminder.
              </AppText>
              <PrimaryButton disabled={busy} onPress={() => void turnOnReminders()}>
                Turn on reminders
              </PrimaryButton>
              <SecondaryButton disabled={busy} onPress={() => void skipReminders()}>
                Not now
              </SecondaryButton>
            </SoftCard>
          </>
        ) : null}

        {step === "firstNudge" ? (
          <>
            <PageHeader title="Your first nudge" showBack={false} />
            <SoftCard style={styles.card}>
              <AppText variant="heading">What's one thing you don't want to forget?</AppText>
              {voiceAvailable ? (
                <VoiceCaptureButton
                  idleLabel="Tell me"
                  idleTone="primary"
                  layout="heroMic"
                  placeholder="Call the dentist tomorrow morning"
                  onCaptured={(text, capturedVoiceUrl) => {
                    setComposeText(text);
                    setVoiceNoteUrl(capturedVoiceUrl);
                    setNotice("");
                  }}
                />
              ) : (
                <AppText variant="muted">
                  Voice works on iPhone and iPad. On this device, type it instead.
                </AppText>
              )}
              <TextInput
                value={composeText}
                onChangeText={(value) => {
                  setComposeText(value);
                  setNotice("");
                }}
                placeholder="Type it"
                placeholderTextColor={colors.mutedText}
                style={styles.input}
                multiline
                accessibilityLabel="Type the thing you don't want to forget"
              />
              {composeText.trim() && preview.title ? (
                <AppText variant="muted">
                  We'll save “{preview.title}”
                  {preview.whenLabel ? ` · ${preview.whenLabel}` : ""}
                </AppText>
              ) : null}
              {notice ? <AppText variant="muted">{notice}</AppText> : null}
              <PrimaryButton onPress={saveFirstNudge}>Save</PrimaryButton>
              <SecondaryButton onPress={finishToHome}>I'll add something later</SecondaryButton>
            </SoftCard>
          </>
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  card: {
    gap: spacing.md
  },
  hero: {
    color: colors.primaryDark
  },
  choice: {
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.ivoryElevated,
    paddingHorizontal: spacing.md,
    justifyContent: "center"
  },
  choiceOn: {
    borderColor: colors.babyBlueInk,
    backgroundColor: colors.primarySoft
  },
  choiceLabel: {
    fontWeight: "600",
    color: colors.text
  },
  input: {
    minHeight: 88,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.ivoryElevated,
    padding: spacing.md,
    color: colors.text,
    textAlignVertical: "top"
  }
});
