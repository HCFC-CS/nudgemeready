import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { HorizonEntryCard } from "../components/HorizonEntryCard";
import { PageHeader, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useNudgeHorizon } from "../hooks/useNudgeHorizon";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { useReady4Planner } from "../hooks/useReady4Planner";
import { stillNeedCopy } from "../services/nudgeHorizonEngine";
import { colors, spacing } from "../theme/theme";
import type { HorizonEntry, NudgeHorizonId, SimplifyMode } from "../types/nudgeHorizon";

const HORIZON_TABS: { id: NudgeHorizonId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "7 days" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "3 months" },
  { id: "year", label: "Year" },
  { id: "later", label: "Later" }
];

export function ComingUpScreen() {
  const navigation = useNavigation<any>();
  const {
    isReady,
    horizon,
    setHorizon,
    simplifyMode,
    setSimplifyMode,
    today,
    week,
    month,
    quarter,
    year,
    later
  } = useNudgeHorizon();
  const { items: nudges } = useNudgeItems();
  const { updateItem, setStatus } = useReady4Planner();
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [showAllWeek, setShowAllWeek] = useState(false);

  function openEntry(entry: HorizonEntry) {
    if (entry.sourceKind === "nudge") {
      const draft = nudges.find((item) => item.id === entry.sourceId);
      if (draft) {
        navigation.navigate("ItemDetails", { draft });
        return;
      }
    }
    if (entry.sourceKind === "planner") {
      navigation.navigate("PackPlanner", { packId: entry.packId ?? "ready4-study" });
      return;
    }
    if (entry.sourceKind === "budget") {
      navigation.navigate("BudgetItem", { itemId: entry.sourceId });
    }
  }

  function confirmSimplify() {
    Alert.alert("Simplify my week", "Choose how much to show. Fixed appointments stay put.", [
      { text: "Leave it as it is", onPress: () => setSimplifyMode("as_is") },
      { text: "Essentials only", onPress: () => setSimplifyMode("essentials") },
      { text: "Fixed things only", onPress: () => setSimplifyMode("fixed_only") },
      { text: "Hide optional", onPress: () => setSimplifyMode("hide_optional") },
      { text: "Cancel", style: "cancel" }
    ]);
  }

  const simplifyLabel = useMemo(() => {
    const map: Record<SimplifyMode, string> = {
      as_is: "Showing everything",
      essentials: "Essentials only",
      fixed_only: "Fixed only",
      hide_optional: "Optional hidden"
    };
    return map[simplifyMode];
  }, [simplifyMode]);

  if (!isReady) {
    return (
      <Screen showTabMenu={false}>
        <PageHeader title="What's coming up" showBack />
        <AppText variant="muted">Loading…</AppText>
      </Screen>
    );
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title="What's coming up"
        subtitle="One life view — near = detail, far = overview."
        showBack
        helpText="This pulls together your nudges, Ready4 planner items, and money dates without duplicating them. Ready4 packs add context; they do not create a second calendar."
      />

      <View style={styles.tabs}>
        {HORIZON_TABS.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setHorizon(tab.id)}
            style={[styles.tab, horizon === tab.id && styles.tabActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: horizon === tab.id }}
            accessibilityLabel={tab.label}
          >
            <AppText variant="caption" style={horizon === tab.id ? styles.tabTextActive : styles.tabText}>
              {tab.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      <View style={styles.toolbar}>
        <SecondaryButton size="compact" onPress={confirmSimplify}>
          Simplify
        </SecondaryButton>
        <AppText variant="caption" style={styles.simplifyHint}>
          {simplifyLabel}
        </AppText>
      </View>

      <SecondaryButton size="compact" onPress={() => navigation.navigate("Tabs", { screen: "Capture" })}>
        Add something
      </SecondaryButton>

      {horizon === "today" ? (
        <TodayBody
          today={today}
          onOpen={openEntry}
          onMovePlanner={(id) => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(15, 0, 0, 0);
            updateItem(id, { startAt: tomorrow.toISOString(), status: "moved" });
          }}
          onDonePlanner={(id) => setStatus(id, "done")}
        />
      ) : null}

      {horizon === "week" ? (
        <WeekBody
          week={week}
          showAll={showAllWeek}
          expandedDays={expandedDays}
          onToggleDay={(key) => setExpandedDays((current) => ({ ...current, [key]: !current[key] }))}
          onShowAll={() => setShowAllWeek(true)}
          onSimplify={confirmSimplify}
          onOpen={openEntry}
        />
      ) : null}

      {horizon === "month" ? (
        <SoftCard style={styles.card}>
          <AppText variant="muted">{month.summary}</AppText>
          <Section title="This week" entries={month.thisWeek} onOpen={openEntry} />
          <Section title="Next week" entries={month.nextWeek} onOpen={openEntry} />
          <Section title="Later this month" entries={month.laterMonth} onOpen={openEntry} empty="Important dates only here." />
          <SecondaryButton size="compact" onPress={() => navigation.navigate("Tabs", { screen: "Today" })}>
            Show full nudge list
          </SecondaryButton>
        </SoftCard>
      ) : null}

      {horizon === "quarter" ? (
        <SoftCard style={styles.card}>
          <AppText variant="muted">{quarter.summary}</AppText>
          <Section title="Significant" entries={quarter.entries} onOpen={openEntry} empty="No big things yet." />
        </SoftCard>
      ) : null}

      {horizon === "year" ? (
        <SoftCard style={styles.card}>
          <AppText variant="muted">{year.summary}</AppText>
          {year.months.length === 0 ? (
            <AppText variant="muted">Nothing on the year map yet.</AppText>
          ) : (
            year.months.map((group) => {
              const open = expandedMonths[group.monthKey] ?? false;
              return (
                <View key={group.monthKey} style={styles.dayBlock}>
                  <Pressable
                    onPress={() =>
                      setExpandedMonths((current) => ({ ...current, [group.monthKey]: !open }))
                    }
                    accessibilityRole="button"
                  >
                    <AppText variant="heading">
                      {group.label} · {group.count}
                    </AppText>
                  </Pressable>
                  {open
                    ? group.entries.map((entry) => (
                        <HorizonEntryCard key={entry.id} entry={entry} onPress={() => openEntry(entry)} compact />
                      ))
                    : group.entries.slice(0, 2).map((entry) => (
                        <AppText key={entry.id} variant="muted">
                          · {entry.title}
                        </AppText>
                      ))}
                </View>
              );
            })
          )}
        </SoftCard>
      ) : null}

      {horizon === "later" ? (
        <SoftCard style={styles.card}>
          <AppText variant="muted">{later.summary}</AppText>
          <Section
            title="Someday"
            entries={later.entries}
            onOpen={openEntry}
            empty="Nothing you need to think about here yet."
          />
        </SoftCard>
      ) : null}
    </Screen>
  );
}

function TodayBody({
  today,
  onOpen,
  onMovePlanner,
  onDonePlanner
}: {
  today: ReturnType<typeof useNudgeHorizon>["today"];
  onOpen: (entry: HorizonEntry) => void;
  onMovePlanner: (id: string) => void;
  onDonePlanner: (id: string) => void;
}) {
  return (
    <SoftCard style={styles.card}>
      <AppText variant="muted">{today.summary}</AppText>

      {today.next ? (
        <View style={styles.section}>
          <AppText variant="heading">Next</AppText>
          <HorizonEntryCard entry={today.next} onPress={() => onOpen(today.next!)} showLeaveBy />
        </View>
      ) : null}

      <Section title="Today" entries={today.timed} onOpen={onOpen} />
      <Section title="Anytime today" entries={today.anytime} onOpen={onOpen} />
      <Section title="Don't forget" entries={today.dontForget} onOpen={onOpen} />
      <Section title="Nice if I can" entries={today.niceIf} onOpen={onOpen} />

      {today.stillNeed.length ? (
        <View style={styles.section}>
          <AppText variant="heading">{stillNeedCopy()}</AppText>
          {today.stillNeed.map((entry) => (
            <View key={entry.id}>
              <HorizonEntryCard entry={entry} onPress={() => onOpen(entry)} compact />
              {entry.sourceKind === "planner" ? (
                <View style={styles.inlineActions}>
                  <SecondaryButton size="compact" onPress={() => onDonePlanner(entry.sourceId)}>
                    Done already
                  </SecondaryButton>
                  <SecondaryButton size="compact" onPress={() => onMovePlanner(entry.sourceId)}>
                    Move it
                  </SecondaryButton>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {today.totalCount === 0 ? (
        <AppText variant="muted">Nothing you need to think about here yet.</AppText>
      ) : null}

      <AppText variant="caption" style={styles.tomorrow}>
        Tomorrow: {today.tomorrowCount} thing{today.tomorrowCount === 1 ? "" : "s"} coming up
      </AppText>
    </SoftCard>
  );
}

function WeekBody({
  week,
  showAll,
  expandedDays,
  onToggleDay,
  onShowAll,
  onSimplify,
  onOpen
}: {
  week: ReturnType<typeof useNudgeHorizon>["week"];
  showAll: boolean;
  expandedDays: Record<string, boolean>;
  onToggleDay: (key: string) => void;
  onShowAll: () => void;
  onSimplify: () => void;
  onOpen: (entry: HorizonEntry) => void;
}) {
  return (
    <SoftCard style={styles.card}>
      <AppText variant="muted">{week.summary}</AppText>

      {week.overwhelm && !showAll ? (
        <View style={styles.section}>
          <AppText variant="heading">You've got {week.totalCount} things this week.</AppText>
          <AppText variant="heading">What matters most</AppText>
          {week.whatMattersMost.map((entry) => (
            <HorizonEntryCard key={entry.id} entry={entry} onPress={() => onOpen(entry)} compact />
          ))}
          {week.moreCount > 0 ? (
            <SecondaryButton size="compact" onPress={onShowAll}>
              + {week.moreCount} more
            </SecondaryButton>
          ) : null}
          <SecondaryButton size="compact" onPress={onSimplify}>
            Simplify my week
          </SecondaryButton>
        </View>
      ) : (
        week.days.map((day) => {
          const expanded = expandedDays[day.dateKey] ?? day.dateKey === week.days[0]?.dateKey;
          return (
            <View key={day.dateKey} style={styles.dayBlock}>
              <Pressable onPress={() => onToggleDay(day.dateKey)} accessibilityRole="button">
                <AppText variant="heading">
                  {day.label}
                  {day.count ? ` · ${day.count}` : ""}
                </AppText>
              </Pressable>
              {expanded ? (
                day.count === 0 ? (
                  <AppText variant="muted">Clear</AppText>
                ) : (
                  day.entries.map((entry) => (
                    <HorizonEntryCard key={entry.id} entry={entry} onPress={() => onOpen(entry)} compact />
                  ))
                )
              ) : day.count > 0 ? (
                <AppText variant="muted">{day.count} coming up</AppText>
              ) : null}
            </View>
          );
        })
      )}
    </SoftCard>
  );
}

function Section({
  title,
  entries,
  onOpen,
  empty
}: {
  title: string;
  entries: HorizonEntry[];
  onOpen: (entry: HorizonEntry) => void;
  empty?: string;
}) {
  if (!entries.length) {
    return empty ? (
      <View style={styles.section}>
        <AppText variant="heading">{title}</AppText>
        <AppText variant="muted">{empty}</AppText>
      </View>
    ) : null;
  }
  return (
    <View style={styles.section}>
      <AppText variant="heading">{title}</AppText>
      {entries.map((entry) => (
        <HorizonEntryCard key={entry.id} entry={entry} onPress={() => onOpen(entry)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  tab: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.ivoryElevated,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  tabActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  tabText: {
    color: colors.mutedText
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: "700"
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  simplifyHint: {
    color: colors.mutedText
  },
  card: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm
  },
  section: {
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  dayBlock: {
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight
  },
  tomorrow: {
    marginTop: spacing.sm,
    color: colors.mutedText
  },
  inlineActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm
  }
});
