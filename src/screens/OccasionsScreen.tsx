import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Field } from "../components/FormControls";
import { EmptyStateLight, NudgeListRow } from "../components/NudgeListRow";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { useNudgeActor } from "../hooks/useNudgeActor";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { createItem } from "../services/nudgeItems";
import { formatDisplayDate } from "../services/reminderDates";
import { spacing } from "../theme/theme";
import type { NudgeItem } from "../types/nudge";

function isOccasion(item: NudgeItem) {
  return item.type === "occasion" || item.type === "special_day";
}

export function OccasionsScreen() {
  const navigation = useNavigation<any>();
  const { items, saveItem } = useNudgeItems();
  const actor = useNudgeActor();
  const occasions = items.filter((item) => isOccasion(item) && item.status !== "done");
  const [isCreating, setIsCreating] = useState(false);
  const [newOccasionTitle, setNewOccasionTitle] = useState("");

  function openOccasion(occasion: NudgeItem) {
    navigation.navigate("ItemDetails", { draft: occasion });
  }

  function createNewOccasion() {
    const trimmedTitle = newOccasionTitle.trim();
    if (!trimmedTitle) {
      return;
    }
    const draft = createItem({
      type: "occasion",
      title: trimmedTitle,
      createdBy: actor,
      repeatRule: { frequency: "yearly" }
    });
    saveItem(draft);
    setNewOccasionTitle("");
    setIsCreating(false);
    openOccasion(draft);
  }

  return (
    <Screen>
      <PageHeader title="Occasions" subtitle="Birthdays, anniversaries and things worth remembering." />
      <View style={styles.list}>
        {occasions.map((occasion) => (
          <NudgeListRow
            key={occasion.id}
            title={occasion.title}
            type={occasion.type}
            meta={[occasion.dueDate ? countdownText(occasion.dueDate) : "", occasion.notes ?? ""].filter(Boolean)}
            onPress={() => openOccasion(occasion)}
          />
        ))}
      </View>
      {!occasions.length && !isCreating ? (
        <EmptyStateLight title="No occasions yet." message="Add one when a date matters." />
      ) : null}
      {isCreating ? (
        <SoftCard style={styles.createCard}>
          <Field
            label="Occasion"
            value={newOccasionTitle}
            onChangeText={setNewOccasionTitle}
            placeholder="Mum's birthday, wedding anniversary..."
            returnKeyType="done"
            blurOnSubmit={false}
            onSubmitEditing={createNewOccasion}
          />
          <PrimaryButton onPress={createNewOccasion}>Add occasion</PrimaryButton>
          <SecondaryButton
            onPress={() => {
              setIsCreating(false);
              setNewOccasionTitle("");
            }}
          >
            Cancel
          </SecondaryButton>
        </SoftCard>
      ) : (
        <PrimaryButton onPress={() => setIsCreating(true)}>Add Occasion</PrimaryButton>
      )}
    </Screen>
  );
}

function countdownText(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const today = new Date();
  const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff > 1) {
    return `${diff} days away`;
  }
  if (diff === 1) {
    return "Tomorrow";
  }
  if (diff === 0) {
    return "Today";
  }
  return formatDisplayDate(value);
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  createCard: { gap: spacing.sm }
});
