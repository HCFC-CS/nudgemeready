import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { colors, radii, spacing } from "../theme/theme";
import { AppText } from "./Text";

/**
 * Shared Ready 4 / nudge completion actions:
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
  const iconColor =
    tone === "save"
      ? colors.babyBlue
      : tone === "done"
        ? colors.done
        : tone === "danger"
          ? colors.danger
          : colors.accent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        tone === "save" && styles.chipSave,
        tone === "done" && styles.chipDone,
        tone === "danger" && styles.chipDanger,
        disabled && styles.chipDisabled,
        pressed && !disabled && styles.pressed
      ]}
    >
      <Ionicons name={icon} size={18} color={iconColor} />
      <AppText
        variant="caption"
        style={[
          styles.chipLabel,
          tone === "save" && styles.chipLabelSave,
          tone === "done" && styles.chipLabelDone,
          tone === "danger" && styles.chipLabelDanger
        ]}
      >
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
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card
  },
  chipSave: {
    borderColor: colors.babyBlue,
    backgroundColor: colors.primarySoft
  },
  chipDone: {
    borderColor: colors.done,
    backgroundColor: colors.doneSoft
  },
  chipDanger: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft
  },
  chipDisabled: {
    opacity: 0.45
  },
  chipLabel: {
    color: colors.primaryDark,
    fontWeight: "700"
  },
  chipLabelSave: {
    color: colors.babyBlue
  },
  chipLabelDone: {
    color: colors.done
  },
  chipLabelDanger: {
    color: colors.danger
  },
  pressed: {
    opacity: 0.88
  }
});
