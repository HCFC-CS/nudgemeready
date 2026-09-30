import { Pressable, StyleSheet, View } from "react-native";

import {
  findTaskBreakdowns,
  type TaskBreakdownPlan
} from "../services/taskBreakdowns";
import { colors, radii, spacing } from "../theme/theme";
import { SoftCard } from "./NudgeComponents";
import { AppText } from "./Text";

/** Calm suggested step-by-step plans for chores and tasks. */
export function TaskBreakdownSuggestions({
  title,
  onApply
}: {
  title: string;
  onApply: (plan: TaskBreakdownPlan) => void;
}) {
  const plans = findTaskBreakdowns(title, 3);
  if (!plans.length) {
    return null;
  }

  return (
    <SoftCard>
      <AppText variant="heading">Break it down</AppText>
      <AppText variant="muted">
        Small steps with short rests — so the job feels startable, not huge.
      </AppText>
      {plans.map((plan) => (
        <Pressable
          key={plan.id}
          accessibilityRole="button"
          accessibilityLabel={`Use gentle plan: ${plan.label}`}
          onPress={() => onApply(plan)}
          style={({ pressed }) => [styles.plan, pressed && styles.pressed]}
        >
          <AppText style={styles.planTitle}>{plan.label}</AppText>
          <AppText variant="caption" style={styles.planMeta}>
            {plan.steps.length} steps · ~{plan.totalMinutes} mins · {plan.breakMinutes}-min breaks
          </AppText>
          <AppText variant="caption" style={styles.planSteps}>
            {plan.steps.map((step) => step.title).join(" → ")}
          </AppText>
          <AppText style={styles.apply}>Use this gentle plan</AppText>
        </Pressable>
      ))}
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  plan: {
    gap: 4,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.ivoryElevated,
    marginTop: spacing.xs
  },
  planTitle: {
    color: colors.primaryDark,
    fontWeight: "700"
  },
  planMeta: {
    color: colors.mutedText
  },
  planSteps: {
    color: colors.charcoal
  },
  apply: {
    marginTop: 4,
    color: colors.babyBlue,
    fontWeight: "700"
  },
  pressed: {
    opacity: 0.88
  }
});
