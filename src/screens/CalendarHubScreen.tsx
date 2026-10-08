import { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";

import { PageHeader, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { NudgeListRow, nudgeRowMeta } from "../components/NudgeListRow";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { compareNudgesByDate } from "../services/nudgeItems";
import { spacing } from "../theme/theme";

/** Thin Calendar hub — phone calendar sync stays on items; this surfaces linked nudges. */
export function CalendarHubScreen() {
  const navigation = useNavigation<any>();
  const { items, setItemStatus } = useNudgeItems();

  const linked = useMemo(
    () =>
      items
        .filter(
          (item) =>
            Boolean(item.calendarEventId) ||
            Boolean(item.syncToCalendar) ||
            item.type === "appointment" ||
            item.type === "event"
        )
        .filter((item) => item.status !== "done")
        .sort(compareNudgesByDate),
    [items]
  );

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title="Calendar"
        showBack
        helpText="Appointments and events can sync to your phone calendar from each nudge. What's coming up is your life timeline."
      />
      <SecondaryButton size="compact" onPress={() => navigation.navigate("ComingUp")}>
        See what's coming up
      </SecondaryButton>
      {linked.length === 0 ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Nothing calendar-linked yet</AppText>
          <AppText variant="muted">
            Add an appointment or event, then turn on calendar sync on that card when you want it on your phone.
          </AppText>
          <SecondaryButton size="compact" onPress={() => navigation.navigate("Tabs", { screen: "Capture" })}>
            Add something
          </SecondaryButton>
        </SoftCard>
      ) : (
        <View style={styles.list}>
          {linked.map((item) => (
            <NudgeListRow
              key={item.id}
              title={item.title}
              type={item.type}
              meta={nudgeRowMeta(item)}
              isDone={item.status === "done"}
              onPress={() => navigation.navigate("ItemDetails", { draft: item })}
              onToggleDone={() => setItemStatus(item.id, item.status === "done" ? "open" : "done")}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  list: {
    gap: spacing.sm,
    marginTop: spacing.sm
  }
});
