import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Field } from "../components/FormControls";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useBudget } from "../hooks/useBudget";
import {
  categoriesForBudget,
  itemsForBudget,
  summariseProjectBudget
} from "../services/budgetEngine";
import { formatMoneyMinor, parseMoneyToMinor } from "../services/budgetMoney";
import { colors, spacing } from "../theme/theme";

export function BudgetProjectScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const budgetId = String(route.params?.budgetId ?? "");
  const { state, addItem, addCategory } = useBudget();
  const budget = state.budgets.find((entry) => entry.id === budgetId);
  const categories = useMemo(() => categoriesForBudget(state, budgetId), [state, budgetId]);
  const items = useMemo(() => itemsForBudget(state, budgetId), [state, budgetId]);
  const rollup = useMemo(() => summariseProjectBudget(state, budgetId), [state, budgetId]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryName, setCategoryName] = useState("");

  if (!budget) {
    return (
      <Screen showTabMenu={false}>
        <PageHeader title="Project budget" showBack />
        <AppText>That budget isn't available.</AppText>
      </Screen>
    );
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title={budget.name}
        subtitle="Project budget — separate from your monthly money overview."
        showBack
      />

      <SoftCard style={styles.card}>
        <AppText variant="caption" style={styles.label}>
          Total budget
        </AppText>
        <AppText style={styles.figure}>{formatMoneyMinor(rollup.totalBudgetMinor)}</AppText>
        <AppText variant="caption" style={styles.label}>
          Spent
        </AppText>
        <AppText style={styles.figure}>{formatMoneyMinor(rollup.spentMinor)}</AppText>
        <AppText variant="caption" style={styles.label}>
          Committed
        </AppText>
        <AppText style={styles.figure}>{formatMoneyMinor(rollup.committedMinor)}</AppText>
        <AppText variant="caption" style={styles.label}>
          Left
        </AppText>
        <AppText style={styles.figure}>{formatMoneyMinor(rollup.leftMinor)}</AppText>
      </SoftCard>

      <SoftCard style={styles.card}>
        <AppText variant="heading">Items</AppText>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.row}
            onPress={() => navigation.navigate("BudgetItem", { itemId: item.id })}
          >
            <AppText style={styles.title}>{item.name}</AppText>
            <AppText>{formatMoneyMinor(item.expectedAmountMinor ?? 0)}</AppText>
          </Pressable>
        ))}
        <Field label="Add something" value={name} onChangeText={setName} placeholder="Photographer" />
        <Field label="Amount (£)" value={amount} onChangeText={setAmount} keyboardType="number-pad" />
        <PrimaryButton
          disabled={!name.trim()}
          onPress={() => {
            addItem({
              budgetId,
              name: name.trim(),
              itemType: "expense",
              expectedAmountMinor: parseMoneyToMinor(amount),
              frequency: "one_off",
              categoryId: categories[0]?.id ?? null,
              readyPackId: budget.readyPackId
            });
            setName("");
            setAmount("");
          }}
        >
          + Add something
        </PrimaryButton>
      </SoftCard>

      <SoftCard style={styles.card}>
        <Field
          label="Add my own category"
          value={categoryName}
          onChangeText={setCategoryName}
          placeholder="e.g. Dog wedding chaperone"
        />
        <SecondaryButton
          disabled={!categoryName.trim()}
          onPress={() => {
            addCategory(categoryName.trim(), "custom", budgetId);
            setCategoryName("");
          }}
        >
          + Add my own category
        </SecondaryButton>
        <AppText variant="caption" style={styles.meta}>
          Custom categories work just like the suggested ones.
        </AppText>
      </SoftCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  label: {
    color: colors.mutedText,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  figure: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primaryDark
  },
  row: {
    minHeight: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight
  },
  title: {
    fontWeight: "600"
  },
  meta: {
    color: colors.mutedText
  }
});
