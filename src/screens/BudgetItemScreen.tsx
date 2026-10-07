import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Field } from "../components/FormControls";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useBudget } from "../hooks/useBudget";
import { createItem } from "../services/nudgeItems";
import { useNudgeActor } from "../hooks/useNudgeActor";
import {
  annualEquivalentMinor,
  formatMoneyMinor,
  frequencyLabel,
  parseMoneyToMinor,
  toMonthlyEquivalentMinor
} from "../services/budgetMoney";
import { colors, spacing } from "../theme/theme";
import type { BudgetFrequency } from "../types/budget";

const FREQUENCIES: BudgetFrequency[] = [
  "one_off",
  "weekly",
  "fortnightly",
  "every_4_weeks",
  "monthly",
  "quarterly",
  "six_monthly",
  "annually"
];

export function BudgetItemScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const itemId = String(route.params?.itemId ?? "");
  const actor = useNudgeActor();
  const { state, updateItem, archiveItem } = useBudget();
  const item = state.items.find((entry) => entry.id === itemId);

  const [name, setName] = useState(item?.name ?? "");
  const [expected, setExpected] = useState(
    item?.expectedAmountMinor != null ? (item.expectedAmountMinor / 100).toFixed(2) : ""
  );
  const [actual, setActual] = useState(
    item?.actualAmountMinor != null ? (item.actualAmountMinor / 100).toFixed(2) : ""
  );
  const [frequency, setFrequency] = useState<BudgetFrequency>(item?.frequency ?? "monthly");
  const [dueDate, setDueDate] = useState(item?.dueDate ?? "");

  const monthly = useMemo(() => {
    const amount = parseMoneyToMinor(expected);
    if (amount == null) {
      return 0;
    }
    return toMonthlyEquivalentMinor(amount, frequency, item?.customInterval ?? null);
  }, [expected, frequency, item?.customInterval]);

  if (!item) {
    return (
      <Screen showTabMenu={false}>
        <PageHeader title="Item" showBack />
        <AppText>That item isn't available.</AppText>
      </Screen>
    );
  }

  function handleSave() {
    updateItem(item!.id, {
      name: name.trim() || item!.name,
      expectedAmountMinor: parseMoneyToMinor(expected),
      actualAmountMinor: parseMoneyToMinor(actual),
      frequency,
      dueDate: dueDate.trim() || null,
      nextDueDate: dueDate.trim() || null
    });
    navigation.goBack();
  }

  function handleReminder() {
    const draft = createItem({
      title: `Pay ${name.trim() || item!.name}`,
      type: "reminder",
      createdBy: actor,
      dueDate: dueDate.trim() || undefined,
      nudgeIntent: "buy_pay",
      notes: item!.expectedAmountMinor != null ? `Budget: ${formatMoneyMinor(item!.expectedAmountMinor)}` : undefined
    });
    updateItem(item!.id, { reminderItemId: draft.id });
    navigation.navigate("ItemDetails", { draft });
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader title={item.name} subtitle="Your original amount stays — monthly is just for the overview." showBack />

      <SoftCard style={styles.card}>
        <Field label="Name" value={name} onChangeText={setName} />
        <Field
          label="Budget amount (£)"
          value={expected}
          onChangeText={setExpected}
          keyboardType="number-pad"
        />
        <Field
          label="Actual amount (£) — optional"
          value={actual}
          onChangeText={setActual}
          keyboardType="number-pad"
        />
        <Field label="Due date (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} placeholder="2026-11-15" />

        <AppText variant="caption" style={styles.meta}>
          Frequency
        </AppText>
        <View style={styles.freqWrap}>
          {FREQUENCIES.map((entry) => (
            <SecondaryButton key={entry} onPress={() => setFrequency(entry)}>
              {frequency === entry ? `✓ ${frequencyLabel(entry)}` : frequencyLabel(entry)}
            </SecondaryButton>
          ))}
        </View>

        <AppText variant="muted">
          {frequencyLabel(frequency)}
          {parseMoneyToMinor(expected) != null
            ? ` · ${formatMoneyMinor(parseMoneyToMinor(expected)!)}`
            : ""}
        </AppText>
        {frequency !== "monthly" && parseMoneyToMinor(expected) != null ? (
          <AppText variant="caption" style={styles.meta}>
            About {formatMoneyMinor(monthly)} per month for your overview
            {frequency === "annually" || frequency === "six_monthly" || frequency === "quarterly"
              ? ` · ~${formatMoneyMinor(annualEquivalentMinor(parseMoneyToMinor(expected)!, frequency))} / year`
              : ""}
          </AppText>
        ) : null}

        <PrimaryButton onPress={handleSave}>Save</PrimaryButton>
        <SecondaryButton onPress={handleReminder}>Want a reminder?</SecondaryButton>
        <SecondaryButton
          onPress={() => {
            archiveItem(item.id);
            navigation.goBack();
          }}
        >
          Remove from budget
        </SecondaryButton>
      </SoftCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm
  },
  meta: {
    color: colors.mutedText,
    fontWeight: "700"
  },
  freqWrap: {
    gap: spacing.xs
  }
});
