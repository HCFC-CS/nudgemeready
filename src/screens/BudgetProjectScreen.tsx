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
import { READY4_BUDGET_EXTENSIONS } from "../services/ready4BudgetExtensions";
import { colors, spacing } from "../theme/theme";

export function BudgetProjectScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const budgetId = String(route.params?.budgetId ?? "");
  const { state, addItem, addCategory, archiveCategory, updateBudget } = useBudget();
  const budget = state.budgets.find((entry) => entry.id === budgetId);
  const categories = useMemo(() => categoriesForBudget(state, budgetId), [state, budgetId]);
  const items = useMemo(() => itemsForBudget(state, budgetId), [state, budgetId]);
  const rollup = useMemo(() => summariseProjectBudget(state, budgetId), [state, budgetId]);
  const extension = READY4_BUDGET_EXTENSIONS.find((entry) => entry.packId === budget?.readyPackId);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [actual, setActual] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [envelope, setEnvelope] = useState(
    budget?.envelopeMinor != null ? (budget.envelopeMinor / 100).toFixed(2) : ""
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  if (!budget) {
    return (
      <Screen showTabMenu={false}>
        <PageHeader title="Project budget" showBack />
        <AppText>That budget isn't available.</AppText>
      </Screen>
    );
  }

  function saveEnvelope() {
    const parsed = parseMoneyToMinor(envelope);
    updateBudget(budgetId, { envelopeMinor: parsed });
  }

  const remainingCopy = rollup.overspent
    ? "This is a little over the overall budget. That's just information — nothing is wrong."
    : "Still inside the overall budget.";

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title={budget.name}
        subtitle="Project budget — separate from your monthly money overview."
        showBack
      />

      <SoftCard style={styles.card}>
        <Field
          label="Overall budget (£)"
          value={envelope}
          onChangeText={setEnvelope}
          placeholder="e.g. 5000"
          keyboardType="decimal-pad"
        />
        <SecondaryButton size="compact" onPress={saveEnvelope}>
          Save overall budget
        </SecondaryButton>
        <AppText variant="caption" style={styles.label}>
          Budget
        </AppText>
        <AppText style={styles.figure}>{formatMoneyMinor(rollup.totalBudgetMinor)}</AppText>
        <AppText variant="caption" style={styles.label}>
          Committed
        </AppText>
        <AppText style={styles.figure}>{formatMoneyMinor(rollup.committedMinor)}</AppText>
        <AppText variant="caption" style={styles.label}>
          Actual
        </AppText>
        <AppText style={styles.figure}>{formatMoneyMinor(rollup.spentMinor)}</AppText>
        <AppText variant="caption" style={styles.label}>
          Remaining
        </AppText>
        <AppText style={[styles.figure, rollup.overspent && styles.overspend]}>
          {formatMoneyMinor(rollup.leftMinor)}
        </AppText>
        <AppText variant="muted">{remainingCopy}</AppText>
      </SoftCard>

      <SoftCard style={styles.card}>
        <AppText variant="heading">Categories</AppText>
        {categories.length === 0 ? (
          <AppText variant="muted">No categories yet. Add a usual one or your own words.</AppText>
        ) : (
          categories.map((category) => (
            <View key={category.id} style={styles.row}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setSelectedCategoryId(category.id)}
                style={styles.flex}
              >
                <AppText style={selectedCategoryId === category.id ? styles.selectedTitle : styles.title}>
                  {category.name}
                </AppText>
              </Pressable>
              {!category.isSystemCategory ? (
                <SecondaryButton size="compact" onPress={() => archiveCategory(category.id)}>
                  Remove
                </SecondaryButton>
              ) : null}
            </View>
          ))
        )}
        {extension?.categories.map((template) => {
          const exists = categories.some(
            (category) => category.name.toLowerCase() === template.name.toLowerCase()
          );
          if (exists) {
            return null;
          }
          return (
            <SecondaryButton
              key={template.name}
              size="compact"
              onPress={() => addCategory(template.name, template.kind ?? "custom", budgetId)}
            >
              Add {template.name}
            </SecondaryButton>
          );
        })}
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
      </SoftCard>

      <SoftCard style={styles.card}>
        <AppText variant="heading">Items</AppText>
        {items.length === 0 ? (
          <AppText variant="muted">Nothing here yet. Add a cost when you know it.</AppText>
        ) : (
          items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.row}
              onPress={() => navigation.navigate("BudgetItem", { itemId: item.id })}
              accessibilityRole="button"
            >
              <View style={styles.flex}>
                <AppText style={styles.title}>{item.name}</AppText>
                <AppText variant="caption" style={styles.meta}>
                  Budget {formatMoneyMinor(item.expectedAmountMinor ?? 0)}
                  {item.actualAmountMinor != null
                    ? ` · actual ${formatMoneyMinor(item.actualAmountMinor)}`
                    : ""}
                </AppText>
              </View>
            </Pressable>
          ))
        )}
        <Field label="Add something" value={name} onChangeText={setName} placeholder="Photographer" />
        <Field
          label="Budget amount (£)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
        <Field
          label="Committed / actual (£)"
          value={actual}
          onChangeText={setActual}
          keyboardType="decimal-pad"
          placeholder="optional"
        />
        <PrimaryButton
          disabled={!name.trim()}
          onPress={() => {
            addItem({
              budgetId,
              name: name.trim(),
              itemType: "expense",
              expectedAmountMinor: parseMoneyToMinor(amount),
              actualAmountMinor: parseMoneyToMinor(actual),
              frequency: "one_off",
              categoryId: selectedCategoryId ?? categories[0]?.id ?? null,
              readyPackId: budget.readyPackId
            });
            setName("");
            setAmount("");
            setActual("");
          }}
        >
          + Add something
        </PrimaryButton>
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
  overspend: {
    color: colors.text
  },
  row: {
    minHeight: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm
  },
  flex: {
    flex: 1
  },
  title: {
    fontWeight: "600"
  },
  selectedTitle: {
    fontWeight: "700",
    color: colors.primaryDark
  },
  meta: {
    color: colors.mutedText
  }
});
