import { taskTypeAccentColors } from "../theme/theme";
import type { NudgeItemType } from "../types/nudge";

export function getTypeAccent(type: NudgeItemType) {
  return taskTypeAccentColors[type] ?? taskTypeAccentColors.task;
}

export function formatNudgeTypeLabel(type: NudgeItemType) {
  if (type === "subtask") {
    return "Small step";
  }
  if (type === "special_day") {
    return "Occasion";
  }
  return type.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
