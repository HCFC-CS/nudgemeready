import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Field } from "../components/FormControls";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useBudget } from "../hooks/useBudget";
import { frequencyLabel, formatMoneyMinor } from "../services/budgetMoney";
import { parseBudgetQuickAdd } from "../services/budgetParse";
import { colors, spacing } from "../theme/theme";
import type { BudgetCategoryKind } from "../types/budget";

export function BudgetQuickAddScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const seed = typeof route.params?.seed === "string" ? route.params.seed : "";
  const { categories, addItemFromDraft, addCategory } = useBudget();
  const [raw, setRaw] = useState(seed);
  const [categoryOverride, setCategoryOverride] = useState<string | null>(null);

  const draft = useMemo(() => parseBudgetQuickAdd(raw || " "), [raw]);
  const matchedCategory =
    categories.find((category) => category.id === categoryOverride) ??
    categories.find((category) => category.kind === draft.suggestedCategoryKind);

  function handleSave() {
    if (!raw.trim()) {
      return;
    }
    addItemFromDraft(parseBudgetQuickAdd(raw), matchedCategory?.id ?? null);
    navigation.goBack();
  }

  function ensureCustomCategory(kind: BudgetCategoryKind = "custom") {
    if (matchedCategory) {
      setCategoryOverride(matchedCategory.id);
      return;
    }
    const created = addCategory("My category", kind);
    setCategoryOverride(created.id);
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title="Add something"
        subtitle="Type it in your own words. We'll show what we understood before saving."
        showBack
      />

      <SoftCard style={styles.card}>
        <Field
          label="Tell me what to add"
          value={raw}
          onChangeText={setRaw}
          placeholder="e.g. £45 a month for dog grooming"
          multiline
        />
      </SoftCard>

      {raw.trim() ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">{draft.name}</AppText>
          <AppText style={styles.amount}>
            {draft.amountMinor != null ? formatMoneyMinor(draft.amountMinor) : "Amount not spotted"}
          </AppText>
          <AppText variant="muted">{frequencyLabel(draft.frequency, draft.customInterval)}</AppText>
          {draft.dueDate ? <AppText variant="muted">Due: {draft.dueDate}</AppText> : null}
          <AppText variant="caption" style={styles.meta}>
            Suggested category: {matchedCategory?.name ?? draft.suggestedCategoryKind}
          </AppText>
          <AppText variant="caption" style={styles.meta}>
            Type: {draft.itemType}
            {draft.isSubscription ? " · looks like a subscription" : ""}
          </AppText>

          <View style={styles.chipRow}>
            {categories.slice(0, 8).map((category) => (
              <SecondaryButton
                key={category.id}
                onPress={() => setCategoryOverride(category.id)}
              >
                {category.name}
              </SecondaryButton>
            ))}
            <SecondaryButton onPress={() => ensureCustomCategory()}>+ Own category</SecondaryButton>
          </View>

          <PrimaryButton onPress={handleSave}>Save</PrimaryButton>
          <SecondaryButton onPress={() => navigation.goBack()}>Cancel</SecondaryButton>
        </SoftCard>
      ) : (
        <SoftCard style={styles.card}>
          <AppText variant="muted">Try:</AppText>
          <AppText variant="small">“Salary £3,200”</AppText>
          <AppText variant="small">“Netflix £12.99 every month”</AppText>
          <AppText variant="small">“Car insurance £620 due in November”</AppText>
          <AppText variant="small">“£45 a month for dog grooming”</AppText>
        </SoftCard>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  amount: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primaryDark
  },
  meta: {
    color: colors.mutedText
  },
  chipRow: {
    gap: spacing.xs
  }
});
