import { View } from "react-native";

import { BadgeShelf, RewardsSummaryCard } from "../components/GamificationComponents";
import { EmptyState, PageHeader, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { getNudgeRewards } from "../services/gamification";
import { formatDisplayDate } from "../services/reminderDates";
import type { NudgeItem, NudgeItemType } from "../types/nudge";

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
  const { items } = useNudgeItems();
  const completedItems = items.filter((item) => item.status === "done");
  const groupedItems = groupByDate(completedItems);
  const rewards = getNudgeRewards(items);

  return (
    <Screen>
      <PageHeader title="Completed" subtitle="A record of what you've finished." />
      <RewardsSummaryCard rewards={rewards} />
      <BadgeShelf rewards={rewards} />
      {groupedItems.map((group) => (
        <SoftCard key={group.date}>
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
        <EmptyState title="Nothing here yet." message="Completed items will rest here when they happen." />
      ) : null}
      <SoftCard>
        <AppText variant="heading">Progress recorded.</AppText>
        <AppText variant="muted">Each completed item stays here for reference.</AppText>
      </SoftCard>
    </Screen>
  );
}

function DoneTypeSection({ title, items }: { title: string; items: NudgeItem[] }) {
  if (!items.length) {
    return null;
  }
  return (
    <View>
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
  return groups.sort((first, second) => {
    const firstTime = new Date(first.items[0]?.updatedAt ?? 0).getTime();
    const secondTime = new Date(second.items[0]?.updatedAt ?? 0).getTime();
    return secondTime - firstTime;
  });
}
