import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import {
  getWhyHardReason,
  WHY_HARD_REASONS,
  type WhyHardAction,
  type WhyHardReasonId
} from "../services/whyHardToday";
import { colors, radii, spacing } from "../theme/theme";
import { AppText } from "./Text";

export function WhyIsThisHardCard({
  enabled = true,
  onAction
}: {
  enabled?: boolean;
  onAction?: (action: WhyHardAction, extraNote?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reasonId, setReasonId] = useState<WhyHardReasonId | null>(null);
  const [extraNote, setExtraNote] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const reason = reasonId ? getWhyHardReason(reasonId) : undefined;

  if (dismissed) {
    return null;
  }

  if (!open) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Why is this hard today?"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.closed, pressed && styles.pressed]}
      >
        <AppText style={styles.closedLabel}>Why is this hard today?</AppText>
      </Pressable>
    );
  }

  return (
    <View style={styles.card} accessibilityRole="summary">
      <AppText variant="caption" style={styles.kicker}>
        Why is this hard today?
      </AppText>
      <AppText variant="muted">Pick what fits. None of this is a problem to solve about you.</AppText>
      <View style={styles.row}>
        {WHY_HARD_REASONS.map((entry) => (
          <Pressable
            key={entry.id}
            accessibilityRole="button"
            accessibilityState={{ selected: reasonId === entry.id }}
            onPress={() => setReasonId(entry.id)}
            style={({ pressed }) => [
              styles.chip,
              reasonId === entry.id && styles.chipSelected,
              pressed && styles.pressed
            ]}
          >
            <AppText style={reasonId === entry.id ? styles.chipLabelOn : styles.chipLabel}>
              {entry.label}
            </AppText>
          </Pressable>
        ))}
      </View>
      {reason ? (
        <>
          <AppText variant="body" style={styles.message}>
            {reason.message}
          </AppText>
          {reasonId === "something_else" ? (
            <TextInput
              accessibilityLabel="Optional note about what's getting in the way"
              placeholder="Optional — what's getting in the way?"
              placeholderTextColor={colors.mutedText}
              value={extraNote}
              onChangeText={setExtraNote}
              style={styles.input}
              multiline
            />
          ) : null}
          {enabled ? (
            <View style={styles.row}>
              {reason.actions.map((action) => (
                <Pressable
                  key={action.id}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.btn, styles.primary, pressed && styles.pressed]}
                  onPress={() => onAction?.(action.id, extraNote.trim() || undefined)}
                >
                  <AppText style={styles.primaryLabel}>{action.label}</AppText>
                </Pressable>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setOpen(false);
          setReasonId(null);
          setDismissed(true);
        }}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      >
        <AppText style={styles.quietLabel}>Not now</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  closed: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.ivoryElevated,
    justifyContent: "center"
  },
  closedLabel: {
    color: colors.primaryDark,
    fontWeight: "700"
  },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.ivoryElevated
  },
  kicker: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  message: {
    color: colors.text,
    fontWeight: "600"
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center"
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  chipLabel: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  chipLabelOn: {
    color: colors.primaryDark,
    fontWeight: "700"
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.card
  },
  btn: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center"
  },
  primary: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  primaryLabel: {
    color: colors.primaryDark,
    fontWeight: "700"
  },
  quietLabel: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  pressed: {
    opacity: 0.86
  }
});
