import type { NudgeItem } from "../types/nudge";

export type NudgeBadge = {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
};

export type NudgeRewards = {
  kindnessPoints: number;
  completedCount: number;
  levelTitle: string;
  nextGentleGoal: string;
  progressToNextLevel: number;
  badges: NudgeBadge[];
};

export function getNudgeRewards(items: NudgeItem[]): NudgeRewards {
  const completedItems = items.filter((item) => item.status === "done");
  const completedCount = completedItems.length;
  const kindnessPoints = completedItems.reduce((total, item) => total + getPointsForItem(item), 0);
  const hasProjectStep = completedItems.some((item) => item.type === "subtask" || item.type === "project");
  const hasRoutine = completedItems.some((item) => item.type === "routine");
  const hasReminder = completedItems.some((item) => item.type === "reminder");

  return {
    kindnessPoints,
    completedCount,
    levelTitle: getLevelTitle(kindnessPoints),
    nextGentleGoal: getNextGentleGoal(kindnessPoints),
    progressToNextLevel: getProgressToNextLevel(kindnessPoints),
    badges: [
      {
        id: "first-step",
        title: "First item",
        description: "One task completed.",
        isUnlocked: completedCount >= 1
      },
      {
        id: "small-wins",
        title: "Steady progress",
        description: "Three items completed.",
        isUnlocked: completedCount >= 3
      },
      {
        id: "project-helper",
        title: "Project step",
        description: "A project step was finished.",
        isUnlocked: hasProjectStep
      },
      {
        id: "routine-kindness",
        title: "Routine kept",
        description: "A routine was completed.",
        isUnlocked: hasRoutine
      },
      {
        id: "lighter-mind",
        title: "Reminder handled",
        description: "A reminder was cleared.",
        isUnlocked: hasReminder
      }
    ]
  };
}

export function getPointsForItem(item: NudgeItem) {
  if (item.type === "project") {
    return 25;
  }
  if (item.type === "subtask") {
    return 15;
  }
  if (item.type === "routine") {
    return 10;
  }
  return 10;
}

function getLevelTitle(points: number) {
  if (points >= 100) {
    return "Consistent";
  }
  if (points >= 50) {
    return "Building momentum";
  }
  if (points >= 10) {
    return "Moving along nicely";
  }
  return "Getting started";
}

function getNextGentleGoal(points: number) {
  if (points >= 100) {
    return "Keep going at your own pace.";
  }
  if (points >= 50) {
    return "A few more completions to reach Consistent.";
  }
  if (points >= 10) {
    return "A few more completions to reach Building momentum.";
  }
  return "Complete one item to reach your first milestone.";
}

function getProgressToNextLevel(points: number) {
  if (points >= 100) {
    return 100;
  }
  if (points >= 50) {
    return Math.round(((points - 50) / 50) * 100);
  }
  if (points >= 10) {
    return Math.round(((points - 10) / 40) * 100);
  }
  return Math.round((points / 10) * 100);
}
