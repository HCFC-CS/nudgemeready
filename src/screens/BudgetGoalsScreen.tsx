import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Field } from "../components/FormControls";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useBudget } from "../hooks/useBudget";
import { activeGoals, goalProgress, suggestedMonthlyContribution } from "../services/budgetEngine";
import { formatMoneyMinor, parseMoneyToMinor } from "../services/budgetMoney";
import { colors, spacing } from "../theme/theme";

export function BudgetGoalsScreen() {
  const { state, addGoal, updateGoal } = useBudget();
  const goals = activeGoals(state);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [date, setDate] = useState("");

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title="Savings goals"
        subtitle="Gentle targets — suggestions, not instructions."
        showBack
      />

      <SoftCard style={styles.card}>
        <AppText variant="heading">New goal</AppText>
        <Field label="Name" value={name} onChangeText={setName} placeholder="Holiday" />
        <Field label="Target (£)" value={target} onChangeText={setTarget} keyboardType="number-pad" />
        <Field label="Already saved (£)" value={saved} onChangeText={setSaved} keyboardType="number-pad" />
        <Field label="Target date (optional)" value={date} onChangeText={setDate} placeholder="2026-12-01" />
        <PrimaryButton
          disabled={!name.trim() || parseMoneyToMinor(target) == null}
          onPress={() => {
            addGoal({
              name: name.trim(),
              targetAmountMinor: parseMoneyToMinor(target) ?? 0,
              currentAmountMinor: parseMoneyToMinor(saved) ?? 0,
              targetDate: date.trim() || null
            });
            setName("");
            setTarget("");
            setSaved("");
            setDate("");
          }}
        >
          Save goal
        </PrimaryButton>
      </SoftCard>

      {goals.map((goal) => {
        const progress = goalProgress(goal);
        const suggestion = suggestedMonthlyContribution(goal);
        return (
          <SoftCard key={goal.id} style={styles.card}>
            <AppText variant="heading">{goal.name}</AppText>
            <AppText>
              Saved {formatMoneyMinor(goal.currentAmountMinor)} · Target{" "}
              {formatMoneyMinor(goal.targetAmountMinor)}
            </AppText>
            <AppText variant="muted">{formatMoneyMinor(progress.leftMinor)} left</AppText>
            {suggestion != null ? (
              <AppText variant="caption" style={styles.meta}>
                About {formatMoneyMinor(suggestion)} per month would get you there.
              </AppText>
            ) : null}
            <View style={styles.row}>
              <SecondaryButton
                onPress={() =>
                  updateGoal(goal.id, {
                    currentAmountMinor: goal.currentAmountMinor + 1000
                  })
                }
              >
                + £10
              </SecondaryButton>
              <SecondaryButton onPress={() => updateGoal(goal.id, { paused: !goal.paused })}>
                {goal.paused ? "Resume" : "Pause"}
              </SecondaryButton>
              <SecondaryButton onPress={() => updateGoal(goal.id, { completed: true })}>
                Complete
              </SecondaryButton>
            </View>
          </SoftCard>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  meta: {
    color: colors.mutedText
  },
  row: {
    gap: spacing.xs
  }
});
