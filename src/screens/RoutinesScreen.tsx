import { useNavigation } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";

import { EmptyStateLight, NudgeListRow } from "../components/NudgeListRow";
import { PageHeader, PrimaryButton } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { spacing } from "../theme/theme";

export function RoutinesScreen() {
  const navigation = useNavigation<any>();
  const { items } = useNudgeItems();
  const routines = items.filter((item) => item.type === "routine" && item.status !== "done");

  return (
    <Screen>
      <PageHeader title="Routines" subtitle="Regular things, held gently." />
      <View style={styles.list}>
        {routines.map((routine) => (
          <NudgeListRow
            key={routine.id}
            title={routine.title}
            type="routine"
            meta={[
              routine.repeatRule?.frequency && routine.repeatRule.frequency !== "none"
                ? formatRepeat(routine.repeatRule.frequency)
                : "Repeating",
              routine.reminderDate ? formatDate(routine.reminderDate) : ""
            ].filter(Boolean)}
            onPress={() => navigation.navigate("ItemDetails", { draft: routine })}
          />
        ))}
      </View>
      {!routines.length ? (
        <EmptyStateLight title="No routines yet." message="Start one when something repeats." />
      ) : null}
      <PrimaryButton onPress={() => navigation.navigate("Capture")}>Add Routine</PrimaryButton>
    </Screen>
  );
}

function formatRepeat(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm }
});
