import { useNavigation } from "@react-navigation/native";
import { Alert, StyleSheet, View } from "react-native";

import { PlannerItemCard } from "../components/PlannerItemCard";
import { PageHeader, PrimaryButton, SecondaryButton, SectionHeading, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useReady4Planner } from "../hooks/useReady4Planner";
import { groupItemsByDay } from "../services/ready4PlannerEngine";
import { colors, spacing } from "../theme/theme";

export function PlannerHubScreen() {
  const navigation = useNavigation<any>();
  const {
    isReady,
    todayItems,
    weekItems,
    installedConfigs,
    setStatus,
    resetWeek,
    linkNudge,
    updateItem
  } = useReady4Planner();

  const weekGroups = groupItemsByDay(weekItems);

  function moveToTomorrow(itemId: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0);
    updateItem(itemId, { startAt: tomorrow.toISOString(), status: "moved" });
  }

  function confirmResetWeek() {
    Alert.alert(
      "Reset my week?",
      "Flexible unfinished items can move to tomorrow. Fixed appointments and deadlines stay put.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset week", onPress: () => resetWeek() }
      ]
    );
  }

  if (!isReady) {
    return (
      <Screen showTabMenu={false}>
        <PageHeader title="Planner" showBack />
        <AppText variant="muted">Loading…</AppText>
      </Screen>
    );
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title="Today & this week"
        subtitle="What you actually need to do — across your Ready4 planners."
        showBack
        helpText="Pack planners hold the detail. This view pulls today's and this week's items together. Nothing here shames you for moving things."
      />

      <PrimaryButton onPress={() => navigation.navigate("PlannerQuickAdd", {})}>+ Add something</PrimaryButton>

      {installedConfigs.length === 0 ? (
        <SoftCard style={styles.card}>
          <SectionHeading
            title="No Ready4 planners yet"
            info="Install a Ready4 pack to open its specialist planner. You can still browse ReadyPacks anytime."
          />
          <SecondaryButton onPress={() => navigation.navigate("ReadyPacks")}>Browse ReadyPacks</SecondaryButton>
        </SoftCard>
      ) : (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Open a pack planner</AppText>
          <View style={styles.packRow}>
            {installedConfigs.map((config) => (
              <SecondaryButton
                key={config.packId}
                size="compact"
                onPress={() => navigation.navigate("PackPlanner", { packId: config.packId })}
              >
                {config.shortLabel}
              </SecondaryButton>
            ))}
          </View>
        </SoftCard>
      )}

      <SoftCard style={styles.card}>
        <AppText variant="heading">Today</AppText>
        {todayItems.length === 0 ? (
          <AppText variant="muted">Nothing planned for today. That can be enough.</AppText>
        ) : (
          todayItems.map((item) => (
            <PlannerItemCard
              key={item.id}
              item={item}
              onDone={() => setStatus(item.id, "done")}
              onMove={() => moveToTomorrow(item.id)}
              onNotNeeded={() => setStatus(item.id, "not_needed")}
              onStart={() => navigation.navigate("Tabs", { screen: "Focus" })}
              onLinkNudge={() => linkNudge(item.id)}
              onOpen={() => navigation.navigate("PackPlanner", { packId: item.ready4PackId })}
            />
          ))
        )}
      </SoftCard>

      <SoftCard style={styles.card}>
        <View style={styles.headerRow}>
          <AppText variant="heading">This week</AppText>
          <SecondaryButton size="compact" onPress={confirmResetWeek}>
            Reset my week
          </SecondaryButton>
        </View>
        {weekGroups.length === 0 ? (
          <AppText variant="muted">No dated items this week yet.</AppText>
        ) : (
          weekGroups.map((group) => (
            <View key={group.dateKey} style={styles.dayBlock}>
              <AppText variant="caption" style={styles.dayLabel}>
                {group.label}
              </AppText>
              {group.items.map((item) => (
                <PlannerItemCard
                  key={item.id}
                  item={item}
                  onDone={() => setStatus(item.id, "done")}
                  onMove={() => moveToTomorrow(item.id)}
                  onNotNeeded={() => setStatus(item.id, "not_needed")}
                  onStart={() => navigation.navigate("Tabs", { screen: "Focus" })}
                  onLinkNudge={() => linkNudge(item.id)}
                  onOpen={() => navigation.navigate("PackPlanner", { packId: item.ready4PackId })}
                />
              ))}
            </View>
          ))
        )}
      </SoftCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.sm
  },
  packRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap"
  },
  dayBlock: {
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  dayLabel: {
    color: colors.mutedText,
    fontWeight: "600",
    marginBottom: spacing.xs
  }
});
