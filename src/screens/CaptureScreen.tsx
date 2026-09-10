import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";

import { BackButton, PageHeader, PrimaryButton, SecondaryButton, SoftCard, VoiceCaptureButton } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useNudgeActor } from "../hooks/useNudgeActor";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { useReadyPacks } from "../hooks/useReadyPacks";
import { NUDGE_INTENT_CATEGORIES } from "../services/coreNudgeActions";
import {
  actionsForIntent,
  resolveSomethingElse,
  type UnifiedNudgeAction
} from "../services/nudgeIntentCatalog";
import { createItem } from "../services/nudgeItems";
import {
  applyDefaultWhen,
  canQuickSave,
  formatNudgeWhen
} from "../services/quickCapture";
import {
  enableGentleNudges,
  markGentleNudgeAskOffered,
  shouldOfferGentleNudgeAsk
} from "../services/notificationAsk";
import { resyncTimedNudges } from "../services/speakingReminders";
import { colors, radii, spacing } from "../theme/theme";
import type { NudgeIntent } from "../types/nudgeIntents";
import type { NudgeItem } from "../types/nudge";

type Step = "home" | "intent" | "somethingElse";

export function CaptureScreen() {
  const navigation = useNavigation<any>();
  const actor = useNudgeActor();
  const { saveItem, items } = useNudgeItems();
  const { packs, isInstalled } = useReadyPacks();
  const [step, setStep] = useState<Step>("home");
  const [activeIntent, setActiveIntent] = useState<NudgeIntent | null>(null);
  const [somethingElseText, setSomethingElseText] = useState("");

  const installedPackIds = useMemo(
    () => packs.filter((pack) => pack.kind === "content" && isInstalled(pack.id)).map((pack) => pack.id),
    [packs, isInstalled]
  );

  const actions = useMemo(() => {
    if (!activeIntent) {
      return { core: [] as UnifiedNudgeAction[], pack: [] as UnifiedNudgeAction[] };
    }
    return actionsForIntent(activeIntent, installedPackIds);
  }, [activeIntent, installedPackIds]);

  const category = NUDGE_INTENT_CATEGORIES.find((entry) => entry.intent === activeIntent);

  function openIntent(intent: NudgeIntent) {
    setActiveIntent(intent);
    setStep("intent");
  }

  function goHome() {
    setStep("home");
    setActiveIntent(null);
    setSomethingElseText("");
  }

  function goToNudges() {
    navigation.navigate("Tabs", { screen: "Today" });
  }

  async function offerAfterSave(item: NudgeItem) {
    const when = formatNudgeWhen(item.reminderDate ?? item.startDate ?? item.dueDate);
    const ask = await shouldOfferGentleNudgeAsk();
    const change = {
      text: "Change",
      onPress: () => navigation.navigate("ItemDetails", { draft: item })
    };
    if (!ask) {
      Alert.alert("Saved", `“${item.title}” is on your list. We’ll nudge you ${when}.`, [
        change,
        { text: "OK" }
      ]);
      return;
    }
    Alert.alert(
      "Saved",
      `“${item.title}” is on your list. We’ll nudge you ${when}. Would you like a quiet reminder on this phone when it’s time?`,
      [
        change,
        {
          text: "Not now",
          style: "cancel",
          onPress: () => void markGentleNudgeAskOffered()
        },
        {
          text: "Yes, remind me",
          onPress: () => {
            void (async () => {
              const ok = await enableGentleNudges();
              if (ok) {
                await resyncTimedNudges(items.concat(item));
              }
            })();
          }
        }
      ]
    );
  }

  function finishDraft(draft: NudgeItem) {
    if (!canQuickSave(draft.title)) {
      navigation.navigate("ItemDetails", { draft });
      return;
    }
    saveItem(draft);
    goToNudges();
    void offerAfterSave(draft);
  }

  function handleAction(action: UnifiedNudgeAction) {
    if (action.kind === "route" || action.kind === "crew") {
      if (action.route === "Focus") {
        navigation.navigate("Tabs", { screen: "Focus" });
        return;
      }
      navigation.navigate(action.route ?? "Help");
      return;
    }

    const fields = applyDefaultWhen(
      {
        notes: action.notes,
        repeatRule: action.repeatRule
      },
      action.itemType ?? "task"
    );
    const draft = createItem({
      title: (action.defaultTitle ?? "").trim(),
      type: action.itemType ?? "task",
      createdBy: actor,
      nudgeIntent: action.intent,
      sourcePackId: action.packId,
      sourceTemplateId: action.templateId,
      notes: action.notes,
      repeatRule: action.repeatRule,
      dueDate: fields.dueDate,
      startDate: fields.startDate,
      reminderDate: fields.reminderDate,
      speakingReminderText: (action.defaultTitle ?? "").trim() || undefined,
      listItems: action.listItems?.map((title, index) => ({
        id: `wellbeing-${index}`,
        title,
        status: "open" as const
      }))
    });
    finishDraft(draft);
  }

  function createFromSomethingElse(rawText: string, voiceNoteUrl?: string) {
    const text = rawText.trim();
    if (!text) {
      return;
    }
    const resolved = resolveSomethingElse(text, installedPackIds);
    const draft = createItem({
      title: resolved.title,
      type: resolved.itemType,
      createdBy: actor,
      nudgeIntent: resolved.intent,
      sourcePackId: resolved.packId,
      dueDate: resolved.suggestedFields.dueDate,
      startDate: resolved.suggestedFields.startDate,
      reminderDate: resolved.suggestedFields.reminderDate,
      repeatRule: resolved.suggestedFields.repeatRule,
      contactName: resolved.suggestedFields.contactName,
      speakingReminderText: resolved.title,
      notes: resolved.suggestedFields.notes || text,
      voiceNoteUrl: voiceNoteUrl || undefined,
      listItems: resolved.suggestedFields.listItems?.map((title, index) => ({
        id: `list-${index}`,
        title,
        status: "open" as const
      }))
    });
    setSomethingElseText("");
    finishDraft(draft);
  }

  if (step === "somethingElse") {
    return (
      <Screen>
        <BackButton onPress={goHome} />
        <PageHeader title="Something else" subtitle="Tell me what you need…" showBack={false} />
        <SoftCard style={styles.card}>
          <TextInput
            style={styles.input}
            value={somethingElseText}
            onChangeText={setSomethingElseText}
            placeholder="e.g. Remember to call the solicitor about moving"
            placeholderTextColor={colors.mutedText}
            multiline
          />
          <VoiceCaptureButton
            idleLabel="Say it"
            onCaptured={(text, voiceNoteUrl) => createFromSomethingElse(text, voiceNoteUrl)}
          />
          <PrimaryButton
            disabled={!somethingElseText.trim()}
            onPress={() => createFromSomethingElse(somethingElseText)}
          >
            Save nudge
          </PrimaryButton>
          <AppText variant="caption" style={styles.hint}>
            If you say when, it is saved straight away. You can change it anytime.
          </AppText>
        </SoftCard>
      </Screen>
    );
  }

  if (step === "intent" && activeIntent && category) {
    return (
      <Screen>
        <BackButton onPress={goHome} />
        <PageHeader title={category.title} subtitle={category.subtitle} showBack={false} />
        <AppText variant="caption" style={styles.sectionLabel}>
          Everyday
        </AppText>
        <View style={styles.actionList}>
          {actions.core.map((action) => (
            <ActionRow key={action.id} label={action.label} onPress={() => handleAction(action)} />
          ))}
        </View>
        {actions.pack.length ? (
          <>
            <AppText variant="caption" style={styles.sectionLabel}>
              From your Ready4 packs
            </AppText>
            <View style={styles.actionList}>
              {actions.pack.map((action) => (
                <ActionRow
                  key={action.id}
                  label={action.label}
                  badge="Ready4"
                  onPress={() => handleAction(action)}
                />
              ))}
            </View>
          </>
        ) : null}
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader
        title="Add"
        showBack={false}
        helpText="Everyday support is ready straight away. Ready4 packs add extra options only when you install them."
      />
      <AppText variant="heading" style={styles.prompt}>
        What do you want to do?
      </AppText>
      <VoiceCaptureButton
        idleLabel="Say it"
        idleTone="primary"
        layout="heroMic"
        onCaptured={(text, voiceNoteUrl) => createFromSomethingElse(text, voiceNoteUrl)}
      />
      <View style={styles.categoryList}>
        {NUDGE_INTENT_CATEGORIES.map((entry) => (
          <Pressable
            key={entry.intent}
            accessibilityRole="button"
            accessibilityLabel={`${entry.title}. ${entry.subtitle}`}
            onPress={() => openIntent(entry.intent)}
            style={({ pressed }) => [styles.categoryRow, pressed && styles.pressed]}
          >
            <View style={styles.categoryIcon}>
              <Ionicons name={entry.icon} size={22} color={colors.primaryDark} />
            </View>
            <View style={styles.categoryCopy}>
              <AppText style={styles.categoryTitle}>{entry.title}</AppText>
              <AppText variant="caption" style={styles.categorySubtitle}>
                {entry.subtitle}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedText} />
          </Pressable>
        ))}
      </View>
      <SecondaryButton onPress={() => setStep("somethingElse")}>+ Something else</SecondaryButton>
    </Screen>
  );
}

function ActionRow({
  label,
  badge,
  onPress
}: {
  label: string;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
    >
      <AppText style={styles.actionLabel}>{label}</AppText>
      {badge ? (
        <AppText variant="caption" style={styles.badge}>
          {badge}
        </AppText>
      ) : null}
      <Ionicons name="add-circle-outline" size={20} color={colors.primaryDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  prompt: {
    color: colors.text,
    marginBottom: spacing.sm
  },
  categoryList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md
  },
  categoryRow: {
    minHeight: 72,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  categoryCopy: {
    flex: 1,
    gap: 2
  },
  categoryTitle: {
    fontWeight: "700",
    color: colors.primaryDark
  },
  categorySubtitle: {
    color: colors.mutedText
  },
  sectionLabel: {
    color: colors.mutedText,
    fontWeight: "700",
    marginBottom: spacing.xs,
    marginTop: spacing.sm
  },
  actionList: {
    gap: spacing.xs
  },
  actionRow: {
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.ivoryElevated,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  actionLabel: {
    flex: 1,
    color: colors.text,
    fontWeight: "600"
  },
  badge: {
    color: colors.accent,
    fontWeight: "700"
  },
  card: {
    gap: spacing.sm
  },
  input: {
    minHeight: 96,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: "top"
  },
  hint: {
    color: colors.mutedText
  },
  pressed: {
    opacity: 0.9
  }
});
