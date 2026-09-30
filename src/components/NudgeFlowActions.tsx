import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { actionChipColors, colors, radii, spacing } from "../theme/theme";
import { AppText } from "./Text";

/**
 * Shared Ready4 / nudge completion actions:
 * Save · Sorted · Later · Ask · Remove
 */
export function NudgeFlowActions({
  onSave,
  onSorted,
  onLater,
  onAskHelp,
  onRemove,
  editable = true,
  itemTitle
}: {
  onSave: () => void;
  onSorted: () => void;
  onLater: () => void;
  onAskHelp: () => void;
  onRemove: () => void;
  editable?: boolean;
  /** Used in the remove confirmation copy. */
  itemTitle?: string;
}) {
  function confirmRemove() {
    if (!editable) {
      return;
    }
    const name = itemTitle?.trim() || "this nudge";
    Alert.alert(
      "Are you sure?",
      `Remove “${name}”? This takes it off this phone and cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: onRemove
        }
      ]
    );
  }

  return (
    <View style={styles.wrap}>
      <AppText variant="caption" style={styles.label}>
        Finish this gently
      </AppText>
      <View style={styles.row}>
        <ActionChip
          icon="save-outline"
          label="Save"
          onPress={onSave}
          disabled={!editable}
          tone="save"
        />
        <ActionChip
          icon="checkmark-circle"
          label="Sorted"
          onPress={onSorted}
          disabled={!editable}
          tone="done"
        />
        <ActionChip
          icon="time-outline"
          label="Later"
          onPress={onLater}
          disabled={!editable}
          tone="quiet"
        />
        <ActionChip
          icon="people-outline"
          label="Ask"
          onPress={onAskHelp}
          disabled={false}
          tone="quiet"
        />
        <ActionChip
          icon="trash"
          label="Remove"
          onPress={confirmRemove}
          disabled={!editable}
          tone="danger"
        />
      </View>
    </View>
  );
}

function ActionChip({
  icon,
  label,
  onPress,
  disabled,
  tone
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone: "save" | "done" | "quiet" | "danger";
}) {
  const palette = actionChipColors[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { borderColor: palette.borderColor, backgroundColor: palette.backgroundColor },
        disabled && styles.chipDisabled,
        pressed && !disabled && styles.pressed
      ]}
    >
      <Ionicons name={icon} size={18} color={palette.color} />
      <AppText variant="caption" style={[styles.chipLabel, { color: palette.color }]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  label: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
    borderWidth: 1
  },
  chipDisabled: {
    opacity: 0.45
  },
  chipLabel: {
    fontWeight: "700"
  },
  pressed: {
    opacity: 0.88
  }
});
