import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Field } from "../components/FormControls";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { defaultItemTypeForCategory, suggestedItemsForKind, useBudget } from "../hooks/useBudget";
import { itemsForCategory } from "../services/budgetEngine";
import { formatMoneyMinor, frequencyLabel, toMonthlyEquivalentMinor } from "../services/budgetMoney";
import { parseMoneyToMinor } from "../services/budgetMoney";
import { colors, spacing } from "../theme/theme";

export function BudgetCategoryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const categoryId = String(route.params?.categoryId ?? "");
  const { state, categories, addItem, renameCategory, hideCategory, archiveCategory } = useBudget();
  const category = categories.find((entry) => entry.id === categoryId) ?? state.categories.find((entry) => entry.id === categoryId);
  const [rename, setRename] = useState(category?.name ?? "");
  const [quickName, setQuickName] = useState("");
  const [quickAmount, setQuickAmount] = useState("");

  const items = useMemo(
    () => (category ? itemsForCategory(state, category.id) : []),
    [state, category]
  );
  const suggestions = category ? suggestedItemsForKind(category.kind) : [];

  if (!category) {
    return (
      <Screen showTabMenu={false}>
        <PageHeader title="Category" showBack />
        <AppText>That category isn't available.</AppText>
      </Screen>
    );
  }

  function handleAddQuick() {
    const amount = parseMoneyToMinor(quickAmount);
    addItem({
      name: quickName.trim() || "Something",
      itemType: defaultItemTypeForCategory(category!.kind),
      expectedAmountMinor: amount,
      frequency: "monthly",
      categoryId: category!.id
    });
    setQuickName("");
    setQuickAmount("");
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader title={category.name} subtitle="Add, rename, or hide — make it yours." showBack />

      <SoftCard style={styles.card}>
        <Field label="Rename category" value={rename} onChangeText={setRename} />
        <SecondaryButton
          onPress={() => {
            renameCategory(category.id, rename);
          }}
        >
          Save name
        </SecondaryButton>
        <SecondaryButton onPress={() => hideCategory(category.id, true)}>Hide for now</SecondaryButton>
        {!category.isSystemCategory ? (
          <SecondaryButton onPress={() => archiveCategory(category.id)}>Archive category</SecondaryButton>
        ) : null}
      </SoftCard>

      <SoftCard style={styles.card}>
        <AppText variant="heading">Items</AppText>
        {items.length === 0 ? (
          <AppText variant="muted">Nothing here yet.</AppText>
        ) : (
          items.map((item) => {
            const monthly =
              item.expectedAmountMinor != null
                ? toMonthlyEquivalentMinor(item.expectedAmountMinor, item.frequency, item.customInterval)
                : 0;
            return (
              <Pressable
                key={item.id}
                style={styles.row}
                onPress={() => navigation.navigate("BudgetItem", { itemId: item.id })}
              >
                <View style={styles.flex}>
                  <AppText style={styles.title}>{item.name}</AppText>
                  <AppText variant="caption" style={styles.meta}>
                    {item.expectedAmountMinor != null ? formatMoneyMinor(item.expectedAmountMinor) : "No amount"} ·{" "}
                    {frequencyLabel(item.frequency, item.customInterval)}
                    {item.frequency !== "monthly" && item.expectedAmountMinor != null
                      ? ` · ~${formatMoneyMinor(monthly)}/mo`
                      : ""}
                  </AppText>
                </View>
              </Pressable>
            );
          })
        )}
      </SoftCard>

      <SoftCard style={styles.card}>
        <AppText variant="heading">+ Add something</AppText>
        <Field label="Name" value={quickName} onChangeText={setQuickName} placeholder="e.g. Livery" />
        <Field
          label="Amount (£)"
          value={quickAmount}
          onChangeText={setQuickAmount}
          placeholder="45"
          keyboardType="number-pad"
        />
        <PrimaryButton disabled={!quickName.trim()} onPress={handleAddQuick}>
          Add
        </PrimaryButton>
        <SecondaryButton onPress={() => navigation.navigate("BudgetQuickAdd", { seed: "" })}>
          Use freeform instead
        </SecondaryButton>
      </SoftCard>

      {suggestions.length ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Suggestions</AppText>
          {suggestions.map((label) => (
            <SecondaryButton
              key={label}
              onPress={() =>
                addItem({
                  name: label,
                  itemType: defaultItemTypeForCategory(category.kind),
                  categoryId: category.id,
                  frequency: "monthly"
                })
              }
            >
              {label}
            </SecondaryButton>
          ))}
        </SoftCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  row: {
    minHeight: 52,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight
  },
  title: {
    fontWeight: "600",
    color: colors.text
  },
  meta: {
    color: colors.mutedText
  },
  flex: {
    flex: 1
  }
});
