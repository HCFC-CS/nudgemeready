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
import { spacing } from "../theme/theme";
import type { NudgeItem } from "../types/nudge";

export function ChoresScreen() {
  const navigation = useNavigation<any>();
  const { items, saveItem } = useNudgeItems();
  const actor = useNudgeActor();
  const chores = items.filter((item) => item.type === "chore" && item.status !== "done");
  const [isCreating, setIsCreating] = useState(false);
  const [newChoreTitle, setNewChoreTitle] = useState("");

  function openChore(chore: NudgeItem) {
    navigation.navigate("ItemDetails", { draft: chore });
  }

  function createNewChore() {
    const trimmedTitle = newChoreTitle.trim();
    if (!trimmedTitle) {
      return;
    }
    const draft = createItem({ type: "chore", title: trimmedTitle, createdBy: actor });
    saveItem(draft);
    setNewChoreTitle("");
    setIsCreating(false);
    openChore(draft);
  }

  return (
    <Screen>
      <PageHeader title="Chores" subtitle="House jobs, held simply." />
      <View style={styles.list}>
        {chores.map((chore) => (
          <NudgeListRow
            key={chore.id}
            title={chore.title}
            type="chore"
            meta={
              chore.repeatRule?.frequency && chore.repeatRule.frequency !== "none"
                ? [formatRepeat(chore.repeatRule.frequency)]
                : []
            }
            onPress={() => openChore(chore)}
          />
        ))}
      </View>
      {!chores.length && !isCreating ? (
        <EmptyStateLight title="No chores yet." message="Add one when something needs doing." />
      ) : null}
      {isCreating ? (
        <SoftCard style={styles.createCard}>
          <Field
            label="Chore"
            value={newChoreTitle}
            onChangeText={setNewChoreTitle}
            placeholder="Clean the kitchen, take bins out..."
            returnKeyType="done"
            blurOnSubmit={false}
            onSubmitEditing={createNewChore}
          />
          <PrimaryButton onPress={createNewChore}>Add chore</PrimaryButton>
          <SecondaryButton
            onPress={() => {
              setIsCreating(false);
              setNewChoreTitle("");
            }}
          >
            Cancel
          </SecondaryButton>
        </SoftCard>
      ) : (
        <PrimaryButton onPress={() => setIsCreating(true)}>Add Chore</PrimaryButton>
      )}
    </Screen>
  );
}

function formatRepeat(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  createCard: { gap: spacing.sm }
});
