import { useNavigation } from "@react-navigation/native";

import { PageHeader, PrimaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { useRewardBank } from "../hooks/useRewardBank";
import { formatDisplayDate } from "../services/reminderDates";
import { spacing } from "../theme/theme";
import type { NudgeItem, NudgeItemType } from "../types/nudge";
import { StyleSheet, View } from "react-native";

const doneSections: Array<{ title: string; types: NudgeItemType[] }> = [
  { title: "Completed tasks", types: ["task"] },
  { title: "Completed subtasks", types: ["subtask"] },
  { title: "Completed projects", types: ["project"] },
  { title: "Completed reminders", types: ["reminder"] },
  { title: "Completed events", types: ["event"] },
  { title: "Completed routines", types: ["routine"] },
  { title: "Completed chores", types: ["chore"] },
  { title: "Completed lists", types: ["list"] },
  { title: "Completed notes", types: ["note"] },
  { title: "Completed occasions", types: ["occasion", "special_day"] }
];

export function DoneScreen() {
  const navigation = useNavigation<any>();
  const { items } = useNudgeItems();
  const { wallet, nextReward, pointsToNext } = useRewardBank();
  const completedItems = items.filter((item) => item.status === "done");
  const groupedItems = groupByDate(completedItems);

  return (
    <Screen>
      <PageHeader title="Completed" subtitle="A record of what you've finished." />
      <SoftCard style={styles.card}>
        <AppText variant="heading">{wallet.availablePoints} points ready</AppText>
        <AppText variant="muted">
          {completedItems.length} completed · points live in Reward Bank and are never taken away.
        </AppText>
        {nextReward ? (
          <AppText variant="small" style={styles.next}>
            {pointsToNext > 0
              ? `${pointsToNext} to go for “${nextReward.title}”`
              : `You can claim “${nextReward.title}” when you like`}
          </AppText>
        ) : null}
        <PrimaryButton size="compact" onPress={() => navigation.navigate("RewardBank")}>
          Open Reward Bank
        </PrimaryButton>
      </SoftCard>
      {groupedItems.map((group) => (
        <SoftCard key={group.date} style={styles.card}>
          <AppText variant="heading">{group.date}</AppText>
          {doneSections.map((section) => (
            <DoneTypeSection
              key={section.title}
              title={section.title}
              items={group.items.filter((item) => section.types.includes(item.type))}
            />
          ))}
        </SoftCard>
      ))}
      {!completedItems.length ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Nothing here yet</AppText>
          <AppText variant="muted">Completed items will rest here when they happen.</AppText>
        </SoftCard>
      ) : null}
    </Screen>
  );
}

function DoneTypeSection({ title, items }: { title: string; items: NudgeItem[] }) {
  if (!items.length) {
    return null;
  }
  return (
    <View style={styles.section}>
      <AppText variant="small">{title}</AppText>
      {items.map((item) => (
        <AppText key={item.id}>{item.title}</AppText>
      ))}
    </View>
  );
}

function groupByDate(items: NudgeItem[]) {
  const groups = items.reduce<Array<{ date: string; items: NudgeItem[] }>>((current, item) => {
    const date = formatDisplayDate(item.updatedAt);
    const existingGroup = current.find((group) => group.date === date);
    if (existingGroup) {
      existingGroup.items.push(item);
      return current;
    }
    return [...current, { date, items: [item] }];
  }, []);
  return groups;
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  next: {
    fontWeight: "600"
  },
  section: {
    gap: spacing.xs,
    marginTop: spacing.xs
  }
});
