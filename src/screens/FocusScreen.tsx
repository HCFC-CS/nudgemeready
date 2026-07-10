import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Vibration, View } from "react-native";

import { CompletionRewardCard } from "../components/GamificationComponents";
import { CategoryChip, PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { getPointsForItem } from "../services/gamification";
import { colors, spacing } from "../theme/theme";
import type { NudgeItem } from "../types/nudge";

type FocusMode = "Quick Win" | "Low Energy" | "Deep Work" | "Project Step" | "Anything";

const focusModes: FocusMode[] = ["Quick Win", "Low Energy", "Deep Work", "Project Step", "Anything"];
const timerOptions = [15, 25, 45, 60];
const focusModeDetails: Record<FocusMode, string> = {
  "Quick Win": "Small things that should take under 15 minutes.",
  "Low Energy": "Gentle choices for days when energy is lower.",
  "Deep Work": "Bigger project work when you have more space.",
  "Project Step": "One linked step from a bigger project.",
  Anything: "Any open thing that could move forward."
};

export function FocusScreen() {
  const { items, completeNudgeItem } = useNudgeItems();
  const [mode, setMode] = useState<FocusMode>("Quick Win");
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
    if (!isRunning) {
      return undefined;
    }
    const timer = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          setIsComplete(true);
          setTimerNotice("Focus timer finished.");
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
      <PageHeader title="Focus" subtitle="One item, one session." />
      <SoftCard>
        <AppText variant="heading">Choose your focus</AppText>
        <View style={styles.chips}>
          {focusModes.map((option) => (
            <CategoryChip key={option} label={option} selected={mode === option} onPress={() => chooseMode(option)} />
          ))}
        </View>
        <AppText variant="muted">{focusModeDetails[mode]}</AppText>
      </SoftCard>
      <SoftCard>
        {selectedItem ? (
          <>
            <AppText variant="heading">{selectedItem.title}</AppText>
            <AppText variant="muted">{formatFocusContext(selectedItem)}</AppText>
          </>
        ) : (
          <>
            <AppText variant="heading">No items in this view.</AppText>
            <AppText variant="muted">Try a different focus mode or add something new.</AppText>
          </>
        )}
      </SoftCard>
      <SoftCard style={styles.timerCard}>
        <AppText variant="timer" style={styles.timerText}>{timerText}</AppText>
        <View style={styles.timerOptions}>
          {timerOptions.map((option) => (
            <CategoryChip
              key={option}
              label={`${option}`}
              selected={timerMinutes === option}
              onPress={() => resetTimer(option)}
            />
          ))}
        </View>
      </SoftCard>
      <PrimaryButton onPress={startTimer}>{isRunning ? "Focus running…" : "Start Focus"}</PrimaryButton>
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
            setTimerNotice("Marked complete.");
            Vibration.vibrate(250);
            if (selectedItem) {
              completeNudgeItem(selectedItem.id);
            }
          }}
        >
          Complete
        </SecondaryButton>
        <SecondaryButton
          size="compact"
          style={styles.quickAction}
          onPress={() => {
            setIsRunning(false);
            setTimerNotice("Break started. Come back when you're ready.");
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
          Skip
        </SecondaryButton>
      </View>
      {timerNotice ? (
        <SoftCard>
          <AppText variant="muted">{timerNotice}</AppText>
        </SoftCard>
      ) : null}
      {isComplete ? (
        <>
          <SoftCard>
            <AppText variant="heading">Session complete</AppText>
            <AppText variant="muted">Marked as complete and saved to your progress.</AppText>
          </SoftCard>
          {selectedItem ? <CompletionRewardCard points={getPointsForItem(selectedItem)} /> : null}
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
  const openItems = items.filter((item) => item.status === "open");
  if (mode === "Quick Win") {
    return openItems.filter((item) => item.estimatedEffort === "tiny" || item.estimatedEffort === "small");
  }
  if (mode === "Low Energy") {
    return openItems.filter((item) => item.energyLevel === "low");
  }
  if (mode === "Deep Work") {
    return openItems.filter((item) => item.parentId && item.estimatedEffort === "large");
  }
  if (mode === "Project Step") {
    return openItems.filter((item) => item.type === "subtask" && item.parentId);
  }
  return openItems.filter((item) => ["task", "subtask", "routine", "note"].includes(item.type));
}

function formatFocusContext(item: NudgeItem) {
  if (item.parentId) {
    return "Project step";
  }
  if (item.type === "subtask") {
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
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  timerCard: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.borderLight
  },
  timerText: {
    color: colors.primaryDark
  },
  timerOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  quickAction: {
    flexGrow: 1,
    minWidth: "22%"
  }
});
