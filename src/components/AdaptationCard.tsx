import { Pressable, StyleSheet, View } from "react-native";

import { ADAPTATION_HEADLINE } from "../services/nudgeAdaptation";
import { colors, radii, spacing } from "../theme/theme";
import { AppText } from "./Text";

export function AdaptationCard({
  itemTitle,
  enabled = true,
  onMakeSmaller,
  onMove,
  onLessOften,
  onChange,
  onRemove,
  onDismiss
}: {
  itemTitle: string;
  enabled?: boolean;
  onMakeSmaller: () => void;
  onMove: () => void;
  onLessOften: () => void;
  onChange: () => void;
  onRemove: () => void;
  onDismiss: () => void;
}) {
  return (
    <View style={styles.card} accessibilityRole="summary">
      <AppText variant="caption" style={styles.kicker}>
        A gentle check-in
      </AppText>
      <AppText variant="body" style={styles.title}>
        {ADAPTATION_HEADLINE}
      </AppText>
      <AppText variant="muted">“{itemTitle}”</AppText>
      {enabled ? (
        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.btn, styles.primary, pressed && styles.pressed]}
            onPress={onMakeSmaller}
          >
            <AppText style={styles.primaryLabel}>Make it smaller</AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            onPress={onMove}
          >
            <AppText style={styles.quietLabel}>Move it</AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            onPress={onLessOften}
          >
            <AppText style={styles.quietLabel}>Do it less often</AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            onPress={onChange}
          >
            <AppText style={styles.quietLabel}>Change it</AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            onPress={onRemove}
          >
            <AppText style={styles.quietLabel}>Remove</AppText>
          </Pressable>
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={onDismiss}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      >
        <AppText style={styles.quietLabel}>Not now</AppText>
      </Pressable>
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
  title: {
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
