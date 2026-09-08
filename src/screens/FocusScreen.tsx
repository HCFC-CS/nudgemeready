import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Vibration, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { CompletionRewardCard } from "../components/CompletionRewardCard";
import { MakeItSmallerCard } from "../components/MakeItSmallerCard";
import { CategoryChip, PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { useRewardBank } from "../hooks/useRewardBank";
import { loadAppPreferences } from "../services/appPreferencesStorage";
import { compareNudgesByDate, isReady4PackItem } from "../services/nudgeItems";
import { colors, spacing } from "../theme/theme";
import type { NudgeItem } from "../types/nudge";
import type { RewardDifficulty } from "../types/rewards";

function difficultyForItem(item: NudgeItem): RewardDifficulty {
  if (item.estimatedEffort === "large") {
    return "really_hard";
  }
  if (item.estimatedEffort === "medium") {
    return "hard";
  }
  return "normal";
}

type FocusMode = "Anything" | "Quick Win" | "Low Energy" | "Project Step";

const focusModes: FocusMode[] = ["Anything", "Quick Win", "Low Energy", "Project Step"];
const timerOptions = [15, 25, 45, 60];
const focusModeDetails: Record<FocusMode, string> = {
  Anything: "Any open nudge — start with what is in front of you.",
  "Quick Win": "Smaller things when you want a gentle start.",
  "Low Energy": "Softer choices for lower-energy days.",
  "Project Step": "One linked step from a bigger project."
};

export function FocusScreen() {
  const navigation = useNavigation<any>();
  const { items, completeNudgeItem } = useNudgeItems();
  const { earn } = useRewardBank();
  const [mode, setMode] = useState<FocusMode>("Anything");
  const [showAdjust, setShowAdjust] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [timerNotice, setTimerNotice] = useState("");
  const focusItems = useMemo(() => getFocusItems(items, mode), [items, mode]);
  const selectedItem = focusItems[selectedIndex % Math.max(focusItems.length, 1)];
  const timerText = formatTimer(remainingSeconds);

  useEffect(() => {
    let active = true;
    void loadAppPreferences().then((prefs) => {
      if (!active) return;
      const minutes = Number(prefs.focusTimer) || 25;
      setTimerMinutes(minutes);
      setRemainingSeconds(minutes * 60);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }
    const timer = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          setIsComplete(true);
          setTimerNotice("Focus timer finished. Rest is fine.");
          Vibration.vibrate([0, 350, 150, 350]);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  function chooseMode(nextMode: FocusMode) {
    setMode(nextMode);
    setSelectedIndex(0);
    resetTimer(timerMinutes);
  }

  function resetTimer(minutes: number) {
    setTimerMinutes(minutes);
    setRemainingSeconds(minutes * 60);
    setIsComplete(false);
    setIsRunning(false);
    setTimerNotice("");
  }

  function startTimer() {
    if (remainingSeconds <= 0) {
      setRemainingSeconds(timerMinutes * 60);
    }
    setIsComplete(false);
    setTimerNotice("");
    setIsRunning(true);
  }

  return (
    <Screen>
      <PageHeader
        title="Focus"
        showBack={false}
        helpText="One nudge at a time. Start when ready. Pause, Sorted, Break, or Next anytime — no penalty."
      />

      <SoftCard>
        {selectedItem ? (
          <>
            <AppText variant="caption" style={styles.eyebrow}>
              This session
            </AppText>
            <AppText variant="heading">{selectedItem.title}</AppText>
            <AppText variant="muted">{formatFocusContext(selectedItem)}</AppText>
          </>
        ) : (
          <>
            <AppText variant="heading">Nothing open right now</AppText>
            <AppText variant="muted">Add a nudge, or browse Ready 4 packs for a gentle start.</AppText>
            <SecondaryButton size="compact" onPress={() => navigation.navigate("Capture")}>
              Add a nudge
            </SecondaryButton>
          </>
        )}
      </SoftCard>

      {selectedItem ? (
        <MakeItSmallerCard
          title={selectedItem.title}
          onEarnTinyStep={(stepTitle) => {
            const points = earn({
              difficulty: "normal",
              title: stepTitle,
              kind: "tiny_step",
              packId: selectedItem.sourcePackId,
              sourceItemId: selectedItem.id
            });
            setTimerNotice(`Nice. “${stepTitle}” · +${points}`);
          }}
        />
      ) : null}

      <SoftCard style={styles.timerCard}>
        <AppText variant="timer" style={styles.timerText}>
          {timerText}
        </AppText>
        <AppText variant="caption" style={styles.timerHint}>
          {timerMinutes} minute session
        </AppText>
      </SoftCard>

      <PrimaryButton onPress={startTimer} disabled={(!selectedItem && !isRunning) || isRunning}>
        {isRunning ? "Focus running…" : "Start Focus"}
      </PrimaryButton>

      {isRunning || remainingSeconds < timerMinutes * 60 ? (
        <View style={styles.quickActions}>
          <SecondaryButton size="compact" style={styles.quickAction} onPress={() => setIsRunning(false)}>
            Pause
          </SecondaryButton>
          <SecondaryButton
            size="compact"
            style={styles.quickAction}
            onPress={() => {
              setIsRunning(false);
              setIsComplete(true);
              Vibration.vibrate(250);
              if (selectedItem) {
                completeNudgeItem(selectedItem.id);
                const points = earn({
                  difficulty: difficultyForItem(selectedItem),
                  title: selectedItem.title,
                  kind: "task",
                  packId: selectedItem.sourcePackId,
                  sourceItemId: selectedItem.id
                });
                setTimerNotice(`Marked sorted. +${points} — well done for starting.`);
              } else {
                setTimerNotice("Marked sorted. Well done for starting.");
              }
            }}
          >
            Sorted
          </SecondaryButton>
          <SecondaryButton
            size="compact"
            style={styles.quickAction}
            onPress={() => {
              setIsRunning(false);
              setTimerNotice("Break started. Come back when you are ready.");
              Vibration.vibrate(150);
            }}
          >
            Break
          </SecondaryButton>
          <SecondaryButton
            size="compact"
            style={styles.quickAction}
            onPress={() => {
              setSelectedIndex((current) => (focusItems.length ? (current + 1) % focusItems.length : 0));
              resetTimer(timerMinutes);
            }}
          >
            Next
          </SecondaryButton>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: showAdjust }}
        onPress={() => setShowAdjust((current) => !current)}
        style={styles.adjustToggle}
      >
        <AppText style={styles.adjustToggleLabel}>
          {showAdjust ? "Hide options" : "Adjust mode or timer"}
        </AppText>
      </Pressable>

      {showAdjust ? (
        <SoftCard>
          <AppText variant="heading">Mode</AppText>
          <View style={styles.chips}>
            {focusModes.map((option) => (
              <CategoryChip
                key={option}
                label={option}
                selected={mode === option}
                onPress={() => chooseMode(option)}
              />
            ))}
          </View>
          <AppText variant="muted">{focusModeDetails[mode]}</AppText>
          <AppText variant="heading">Timer</AppText>
          <View style={styles.chips}>
            {timerOptions.map((option) => (
              <CategoryChip
                key={option}
                label={`${option}m`}
                selected={timerMinutes === option}
                onPress={() => resetTimer(option)}
              />
            ))}
          </View>
        </SoftCard>
      ) : null}

      {timerNotice ? (
        <SoftCard>
          <AppText variant="muted">{timerNotice}</AppText>
        </SoftCard>
      ) : null}
      {isComplete ? (
        <>
          <SoftCard>
            <AppText variant="heading">Session complete</AppText>
            <AppText variant="muted">Saved quietly. Rest if you need to.</AppText>
          </SoftCard>
          {selectedItem ? (
            <CompletionRewardCard points={difficultyForItem(selectedItem) === "really_hard" ? 3 : difficultyForItem(selectedItem) === "hard" ? 2 : 1} />
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getFocusItems(items: NudgeItem[], mode: FocusMode) {
  const openItems = items
    .filter((item) => item.status === "open" && !isReady4PackItem(item))
    .sort(compareNudgesByDate);

  if (mode === "Quick Win") {
    const quick = openItems.filter(
      (item) => item.estimatedEffort === "tiny" || item.estimatedEffort === "small"
    );
    return quick.length ? quick : openItems;
  }
  if (mode === "Low Energy") {
    const low = openItems.filter((item) => item.energyLevel === "low");
    return low.length ? low : openItems;
  }
  if (mode === "Project Step") {
    const steps = openItems.filter((item) => item.type === "subtask" && item.parentId);
    return steps.length ? steps : openItems;
  }
  return openItems;
}

function formatFocusContext(item: NudgeItem) {
  if (item.parentId || item.type === "subtask") {
    return "Project step";
  }
  if (item.type === "routine") {
    return "Routine";
  }
  return formatType(item.type);
}

function formatType(type: string) {
  if (type === "task") {
    return "Task";
  }
  return type.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.accent,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  timerCard: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.borderLight,
    gap: spacing.xs
  },
  timerText: {
    color: colors.primaryDark
  },
  timerHint: {
    color: colors.primaryDark,
    opacity: 0.8
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  quickAction: {
    flexGrow: 1,
    minWidth: 72
  },
  adjustToggle: {
    alignSelf: "center",
    paddingVertical: spacing.sm
  },
  adjustToggleLabel: {
    color: colors.accent,
    fontWeight: "700"
  }
});
