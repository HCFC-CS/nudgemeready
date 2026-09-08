import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Field } from "../components/FormControls";
import { PageHeader, PrimaryButton, SecondaryButton, SectionHeading, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useBudget } from "../hooks/useBudget";
import { useReadyPacks } from "../hooks/useReadyPacks";
import {
  activeGoals,
  calmLeftMessage,
  categoryMonthlyTotal,
  goalProgress,
  suggestedMonthlyContribution,
  summariseProjectBudget,
  upcomingItems
} from "../services/budgetEngine";
import { formatMoneyMinor } from "../services/budgetMoney";
import { budgetExtensionsForInstalledPacks } from "../services/ready4BudgetExtensions";
import { colors, spacing } from "../theme/theme";

export function BudgetScreen() {
  const navigation = useNavigation<any>();
  const {
    isReady,
    summary,
    categories,
    items,
    state,
    coreBudgetId,
    addCategory,
    ensureProjectBudgetFromExtension
  } = useBudget();
  const { packs, isInstalled } = useReadyPacks();
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(items.length === 0);

  const installedPackIds = useMemo(
    () => packs.filter((pack) => pack.kind === "content" && isInstalled(pack.id)).map((pack) => pack.id),
    [packs, isInstalled]
  );
  const packBudgets = budgetExtensionsForInstalledPacks(installedPackIds);
  const upcoming = upcomingItems(state, coreBudgetId);
  const goals = activeGoals(state);

  if (!isReady) {
    return (
      <Screen showTabMenu={false}>
        <PageHeader title="My money" showBack />
        <AppText variant="muted">Loading…</AppText>
      </Screen>
    );
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title="My money"
        subtitle="What's coming in, going out, and left — no judgement."
        showBack
        helpText="This is your personal budget. Ready4 packs can add specialist project budgets only when installed. Nothing here requires a bank connection."
      />

      {showOnboarding && items.length === 0 ? (
        <SoftCard style={styles.card}>
          <SectionHeading
            title="Let's get a quick picture of your money"
            info="Start with what comes in, then regular bills, everyday spending, and savings if you want. You can leave and come back any time."
          />
          <PrimaryButton onPress={() => navigation.navigate("BudgetQuickAdd", { seed: "" })}>
            Just start adding things
          </PrimaryButton>
          <SecondaryButton onPress={() => navigation.navigate("BudgetQuickAdd", { seed: "Salary £" })}>
            Add money coming in
          </SecondaryButton>
          <SecondaryButton onPress={() => navigation.navigate("BudgetQuickAdd", { seed: "" })}>
            Add regular bills
          </SecondaryButton>
          <SecondaryButton onPress={() => setShowOnboarding(false)}>I'll do this later</SecondaryButton>
        </SoftCard>
      ) : null}

      <SoftCard style={styles.card}>
        <SummaryRow label="Money in" value={summary.moneyInMinor} tone="in" />
        <SummaryRow label="Going out" value={summary.goingOutMinor} tone="out" />
        <SummaryRow label="Saving" value={summary.savingMinor} tone="save" />
        <View style={styles.leftBlock}>
          <AppText variant="caption" style={styles.leftLabel}>
            Left
          </AppText>
          <AppText
            variant="title"
            style={[styles.leftValue, summary.leftMinor < 0 ? styles.leftShort : styles.leftOk]}
            accessibilityLabel={`Left ${formatMoneyMinor(summary.leftMinor)}`}
          >
            {formatMoneyMinor(summary.leftMinor)}
          </AppText>
          <AppText variant="muted">{calmLeftMessage(summary)}</AppText>
        </View>
      </SoftCard>

      <PrimaryButton onPress={() => navigation.navigate("BudgetQuickAdd", {})}>+ Add something</PrimaryButton>

      {upcoming.length ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Coming up</AppText>
          {upcoming.slice(0, 5).map((item) => (
            <Pressable
              key={item.id}
              onPress={() => navigation.navigate("BudgetItem", { itemId: item.id })}
              style={styles.row}
              accessibilityRole="button"
            >
              <View style={styles.flex}>
                <AppText style={styles.rowTitle}>{item.name}</AppText>
                <AppText variant="caption" style={styles.meta}>
                  {item.nextDueDate || item.dueDate}
                </AppText>
              </View>
              <AppText>{formatMoneyMinor(item.expectedAmountMinor ?? 0)}</AppText>
            </Pressable>
          ))}
        </SoftCard>
      ) : null}

      {goals.length ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Goals</AppText>
          {goals.map((goal) => {
            const progress = goalProgress(goal);
            const suggestion = suggestedMonthlyContribution(goal);
            return (
              <View key={goal.id} style={styles.goalBlock}>
                <AppText style={styles.rowTitle}>{goal.name}</AppText>
                <AppText variant="muted">
                  {formatMoneyMinor(goal.currentAmountMinor)} of {formatMoneyMinor(goal.targetAmountMinor)} ·{" "}
                  {formatMoneyMinor(progress.leftMinor)} left
                </AppText>
                {suggestion != null ? (
                  <AppText variant="caption" style={styles.meta}>
                    About {formatMoneyMinor(suggestion)} per month would get you there.
                  </AppText>
                ) : null}
              </View>
            );
          })}
          <SecondaryButton onPress={() => navigation.navigate("BudgetGoals")}>Manage goals</SecondaryButton>
        </SoftCard>
      ) : (
        <SecondaryButton onPress={() => navigation.navigate("BudgetGoals")}>Add a savings goal</SecondaryButton>
      )}

      <SoftCard style={styles.card}>
        <AppText variant="heading">Areas</AppText>
        {categories.map((category) => {
          const total = categoryMonthlyTotal(state, category);
          return (
            <Pressable
              key={category.id}
              accessibilityRole="button"
              accessibilityLabel={`${category.name}, ${formatMoneyMinor(total)} a month`}
              onPress={() => navigation.navigate("BudgetCategory", { categoryId: category.id })}
              style={styles.row}
            >
              <AppText style={styles.rowTitle}>{category.name}</AppText>
              <AppText variant="muted">{formatMoneyMinor(total)}</AppText>
            </Pressable>
          );
        })}
        <Field
          label="Add my own category"
          value={customCategoryName}
          onChangeText={setCustomCategoryName}
          placeholder="e.g. Horses"
        />
        <SecondaryButton
          disabled={!customCategoryName.trim()}
          onPress={() => {
            const created = addCategory(customCategoryName.trim(), "custom");
            setCustomCategoryName("");
            navigation.navigate("BudgetCategory", { categoryId: created.id });
          }}
        >
          + Add my own category
        </SecondaryButton>
      </SoftCard>

      {packBudgets.length ? (
        <SoftCard style={styles.card}>
          <SectionHeading
            title="Ready4 budgets"
            info="Project budgets stay separate from your monthly money-in / going-out picture."
          />
          {packBudgets.map((extension) => {
            const existing = state.budgets.find(
              (budget) => budget.type === "project" && budget.readyPackId === extension.packId
            );
            const rollup = existing ? summariseProjectBudget(state, existing.id) : null;
            return (
              <Pressable
                key={extension.packId}
                style={styles.row}
                onPress={() => {
                  const budgetId = ensureProjectBudgetFromExtension(extension);
                  navigation.navigate("BudgetProject", { budgetId });
                }}
              >
                <View style={styles.flex}>
                  <AppText style={styles.rowTitle}>{extension.budgetName}</AppText>
                  {rollup ? (
                    <AppText variant="caption" style={styles.meta}>
                      {formatMoneyMinor(rollup.spentMinor)} spent · {formatMoneyMinor(rollup.leftMinor)} left
                    </AppText>
                  ) : (
                    <AppText variant="caption" style={styles.meta}>
                      Tap to open
                    </AppText>
                  )}
                </View>
              </Pressable>
            );
          })}
        </SoftCard>
      ) : null}
    </Screen>
  );
}

function SummaryRow({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "in" | "out" | "save";
}) {
  return (
    <View style={styles.summaryRow} accessibilityLabel={`${label} ${formatMoneyMinor(value)}`}>
      <AppText variant="caption" style={styles.summaryLabel}>
        {label}
      </AppText>
      <AppText style={[styles.summaryValue, tone === "in" && styles.toneIn, tone === "save" && styles.toneSave]}>
        {formatMoneyMinor(value)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 44
  },
  summaryLabel: {
    color: colors.mutedText,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text
  },
  toneIn: {
    color: colors.primaryDark
  },
  toneSave: {
    color: colors.accent
  },
  leftBlock: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    gap: spacing.xs
  },
  leftLabel: {
    color: colors.mutedText,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  leftValue: {
    fontSize: 34,
    fontWeight: "700"
  },
  leftOk: {
    color: colors.primaryDark
  },
  leftShort: {
    color: colors.charcoal
  },
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight
  },
  rowTitle: {
    fontWeight: "600",
    color: colors.text
  },
  meta: {
    color: colors.mutedText
  },
  flex: {
    flex: 1
  },
  goalBlock: {
    gap: 2,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight
  }
});
