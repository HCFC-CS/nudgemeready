import { colors, taskTypeAccentColors } from "../theme/theme";
import type { NudgeItemType } from "../types/nudge";

export function getTypeAccent(type: NudgeItemType) {
  return taskTypeAccentColors[type] ?? taskTypeAccentColors.task;
}

/** Solid chip colours — no translucent wash that fades labels on taupe cards. */
export function getTypeChipColors(type: NudgeItemType) {
  const color = getTypeAccent(type);
  return {
    color,
    borderColor: color,
    backgroundColor: colors.ivoryElevated
  };
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
