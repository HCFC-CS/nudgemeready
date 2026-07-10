import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FixedScreen } from "../components/Screen";
import { BackButton } from "../components/NudgeComponents";
import { AppText } from "../components/Text";
import { useTasks } from "../hooks/useTasks";
import { getEncouragement } from "../services/encouragement";
import { colors, spacing } from "../theme/theme";
import type { TaskItem } from "../types/models";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "TaskBuddy">;

const fallbackTask: TaskItem = {
  id: "fallback",
  title: "Just start",
  classification: "clubs",
  taskType: "taskJob",
  durationMinutes: 15,
  usesTaskBuddy: true,
  workMinutes: 15,
  breakMinutes: 5,
  repeatRule: "none",
  encouragementStyle: "calm",
  isCompleted: false,
  createdAt: new Date().toISOString()
};

const cheerMessages = ["Great Job!!", "Well Done!", "Nice!!"];

export function TaskBuddyScreen({ navigation, route }: Props) {
  const { completeTask } = useTasks();
  const task = route.params?.task ?? fallbackTask;
  const steps = useMemo(() => buildSteps(task), [task]);
  const stepMinutes = useMemo(() => getStepMinutes(task, steps.length), [steps.length, task]);
  const [phase, setPhase] = useState<"focus" | "break" | "done">("focus");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(stepMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("Steps to take");

  useEffect(() => {
    setPhase("focus");
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setSecondsLeft(stepMinutes * 60);
    setIsRunning(false);
    setMessage("Steps to take");
  }, [stepMinutes, task.id]);

  useEffect(() => {
    if (!isRunning || phase === "done") {
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, phase]);

  useEffect(() => {
    if (secondsLeft > 0 || phase === "done") {
      return;
    }
    if (phase === "focus") {
      const breakMinutes = Math.max(1, task.breakMinutes || 5);
      setPhase("break");
      setMessage("Break time. Then we will take the next step.");
      setSecondsLeft(breakMinutes * 60);
      return;
    }
    completeCurrentStep();
  }, [secondsLeft, phase, task.breakMinutes]);

  const timeText = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const seconds = (secondsLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  const currentStep = steps[currentStepIndex] ?? "Nicely done";

  function completeCurrentStep() {
    const cheer = cheerMessages[currentStepIndex % cheerMessages.length];
    setCompletedSteps((current) =>
      current.includes(currentStepIndex) ? current : [...current, currentStepIndex]
    );
    if (currentStepIndex >= steps.length - 1) {
      completeTask(task.id);
      setPhase("done");
      setIsRunning(false);
      setMessage(`${cheer} You did the steps.`);
      return;
    }
    const nextIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextIndex);
    setPhase("focus");
    setSecondsLeft(stepMinutes * 60);
    setMessage(`${cheer} Next step.`);
  }

  function finishTask() {
    completeTask(task.id);
    setPhase("done");
    setIsRunning(false);
    setMessage(getEncouragement(task.encouragementStyle));
  }

  return (
    <FixedScreen showTabMenu>
      <BackButton />
      <Card style={styles.topCard}>
        <AppText variant="heading">{task.title}</AppText>
        <AppText variant="muted">Steps to take</AppText>
        <View style={styles.stepList}>
          {steps.map((step, index) => {
            const isCurrent = index === currentStepIndex && phase !== "done";
            const isComplete = completedSteps.includes(index) || phase === "done";
            return (
              <View
                key={`${step}-${index}`}
                style={[styles.stepRow, isCurrent && styles.currentStepRow, isComplete && styles.doneStepRow]}
              >
                <View style={[styles.stepDot, isComplete && styles.doneStepDot]}>
                  <AppText variant="small" style={styles.stepDotText}>
                    {isComplete ? "OK" : index + 1}
                  </AppText>
                </View>
                <AppText style={styles.stepText}>{step}</AppText>
              </View>
            );
          })}
        </View>
        <AppText variant="small" style={styles.stepTiming}>
          About {stepMinutes} min per step with {Math.max(1, task.breakMinutes || 5)} min breaks.
        </AppText>
      </Card>

      <View style={styles.timerArea}>
        <AppText variant="heading" style={styles.phase}>{phase === "focus" ? "Focus" : phase === "break" ? "Break" : "Nicely done"}</AppText>
        <AppText variant="timer">{timeText}</AppText>
        {phase !== "done" ? <AppText variant="heading" style={styles.center}>{currentStep}</AppText> : null}
        <AppText variant="muted" style={styles.center}>{message}</AppText>
      </View>

      <View style={styles.actions}>
        <Button onPress={() => setIsRunning(true)}>Start step</Button>
        <Button tone="secondary" onPress={completeCurrentStep}>Step complete</Button>
        <Button tone="secondary" onPress={() => setIsRunning((current) => !current)}>
          {isRunning ? "Pause" : "Resume"}
        </Button>
        <Button tone="quiet" onPress={() => navigation.navigate("Help")}>
          Need help
        </Button>
        <Button tone="quiet" onPress={finishTask}>Complete</Button>
      </View>
    </FixedScreen>
  );
}

function buildSteps(task: TaskItem) {
  const title = task.title.toLowerCase();
  if (task.taskType === "chore" && title.includes("deep clean") && title.includes("kitchen")) {
    return [
      "Let's take the first drawer.",
      "Make piles: keep, throw, rehome, replenish, return.",
      "Complete the steps, then move onto the next drawer.",
      "Then the cupboard.",
      "Then the fridge.",
      "Finish with clean the kitchen."
    ];
  }
  if (task.taskType === "chore" && title.includes("clean") && title.includes("kitchen")) {
    return [
      "OK, let's clean the sides.",
      "Let's do the dishes.",
      "Let's clean the floor.",
      "Let's do a final step."
    ];
  }
  if (task.taskType === "chore") {
    return [
      "Choose the first small area.",
      "Clear anything that does not belong.",
      "Do the main clean.",
      "Put things back.",
      "Do a final check."
    ];
  }
  return [
    "Choose the first tiny step.",
    "Work on the middle bit.",
    "Do a final check."
  ];
}

function getStepMinutes(task: TaskItem, stepCount: number) {
  const totalMinutes = task.durationMinutes || task.workMinutes || 15;
  return Math.max(1, Math.ceil(totalMinutes / Math.max(1, stepCount)));
}

const styles = StyleSheet.create({
  topCard: {
    gap: spacing.xs
  },
  stepList: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.card
  },
  currentStepRow: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.secondary
  },
  doneStepRow: {
    opacity: 0.72
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary
  },
  doneStepDot: {
    backgroundColor: colors.success
  },
  stepDotText: {
    color: colors.text,
    fontWeight: "800"
  },
  stepText: {
    flex: 1
  },
  stepTiming: {
    color: colors.mutedText
  },
  timerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md
  },
  phase: {
    color: colors.primaryDark
  },
  center: {
    textAlign: "center"
  },
  actions: {
    gap: spacing.sm
  }
});
