import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { findTaskBreakdowns } from "../services/taskBreakdowns";
import { colors, radii, spacing } from "../theme/theme";
import { AppText } from "./Text";

/**
 * Quiet “make it smaller” prompt — one tiny step at a time.
 */
export function MakeItSmallerCard({
  title,
  onAcceptStep,
  onEarnTinyStep
}: {
  title: string;
  onAcceptStep?: (stepTitle: string) => void;
  onEarnTinyStep?: (stepTitle: string) => void;
}) {
  const steps = useMemo(() => {
    const plan = findTaskBreakdowns(title, 1)[0];
    return plan?.steps.map((step) => step.title) ?? [];
  }, [title]);
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || steps.length < 2) {
    return null;
  }

  const step = steps[Math.min(index, steps.length - 1)]!;

  return (
    <View style={styles.card} accessibilityRole="summary">
      <AppText variant="caption" style={styles.kicker}>
        That feels like too much right now?
      </AppText>
      <AppText variant="body" style={styles.step}>
        How about: “{step}”
      </AppText>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.btn, styles.primary, pressed && styles.pressed]}
          onPress={() => {
            onAcceptStep?.(step);
            onEarnTinyStep?.(step);
          }}
        >
          <AppText style={styles.primaryLabel}>I’ll do that</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          onPress={() => setIndex((current) => (current + 1) % steps.length)}
        >
          <AppText style={styles.quietLabel}>Another</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          onPress={() => setDismissed(true)}
        >
          <AppText style={styles.quietLabel}>Not now</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  step: {
    color: colors.text,
    fontWeight: "600"
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
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
