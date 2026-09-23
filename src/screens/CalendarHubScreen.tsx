import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";

import { HorizonEntryCard } from "../components/HorizonEntryCard";
import { PageHeader, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { openHorizonEntry } from "../components/HorizonTimeline";
import { useNudgeHorizon } from "../hooks/useNudgeHorizon";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { localDateKey } from "../services/nudgeHorizonEngine";
import {
  addMonths,
  buildMonthCells,
  buildWeekDateKeys,
  buildYearMonths,
  calendarWeekdayLabels,
  countByDateKey,
  entriesForDateKey,
  formatDateKeyLong,
  formatMonthTitle,
  type CalendarViewId
} from "../services/calendarGrid";
import { colors, radii, spacing } from "../theme/theme";
import type { RootStackParamList } from "../types/navigation";

const VIEW_TABS: { id: CalendarViewId; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" }
];

export function CalendarHubScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, "CalendarHub">>();
  const { entries, isReady } = useNudgeHorizon();
  const { items: nudges } = useNudgeItems();
  const today = new Date();
  const [view, setView] = useState<CalendarViewId>(route.params?.view ?? "month");
  const [viewDate, setViewDate] = useState(() => {
    if (route.params?.dateKey) {
      const [year, month] = route.params.dateKey.split("-").map(Number);
      return new Date(year, (month ?? 1) - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedKey, setSelectedKey] = useState(route.params?.dateKey ?? localDateKey(today));

  const counts = useMemo(() => countByDateKey(entries), [entries]);
  const cells = useMemo(
    () => buildMonthCells(viewDate, selectedKey, counts, today),
    [viewDate, selectedKey, counts, today]
  );
  const weekKeys = useMemo(() => {
    const [year, month, day] = selectedKey.split("-").map(Number);
    return buildWeekDateKeys(new Date(year, (month ?? 1) - 1, day ?? 1));
  }, [selectedKey]);
  const yearMonths = useMemo(() => buildYearMonths(viewDate, counts), [viewDate, counts]);
  const selectedEntries = useMemo(() => entriesForDateKey(entries, selectedKey), [entries, selectedKey]);
  const weekdayLabels = calendarWeekdayLabels();

  function goToday() {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedKey(localDateKey(now));
    setView("month");
  }

  function shiftMonth(delta: number) {
    const next = addMonths(viewDate, delta);
    setViewDate(next);
    setSelectedKey(localDateKey(new Date(next.getFullYear(), next.getMonth(), 1)));
  }

  function shiftYear(delta: number) {
    const next = new Date(viewDate.getFullYear() + delta, viewDate.getMonth(), 1);
    setViewDate(next);
  }

  if (!isReady) {
    return (
      <Screen showTabMenu={false}>
        <PageHeader title="Calendar" showBack />
        <AppText variant="muted">Loading…</AppText>
      </Screen>
    );
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title="Calendar"
        showBack
        helpText="The same life timeline as Nudges. Phone calendar sync still lives on each appointment."
      />

      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous"
          onPress={() => (view === "year" ? shiftYear(-1) : shiftMonth(-1))}
          style={styles.navBtn}
        >
          <AppText style={styles.navLabel}>‹</AppText>
        </Pressable>
        <AppText variant="heading">{formatMonthTitle(viewDate)}</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next"
          onPress={() => (view === "year" ? shiftYear(1) : shiftMonth(1))}
          style={styles.navBtn}
        >
          <AppText style={styles.navLabel}>›</AppText>
        </Pressable>
      </View>

      <SecondaryButton size="compact" onPress={goToday}>
        Today
      </SecondaryButton>

      <View style={styles.tabs}>
        {VIEW_TABS.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setView(tab.id)}
            style={[styles.tab, view === tab.id && styles.tabActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: view === tab.id }}
            accessibilityLabel={tab.label}
          >
            <AppText variant="caption" style={view === tab.id ? styles.tabTextActive : styles.tabText}>
              {tab.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      {view === "month" || view === "day" ? (
        <View style={styles.grid}>
          {weekdayLabels.map((label) => (
            <AppText key={label} variant="caption" style={styles.weekday}>
              {label}
            </AppText>
          ))}
          {cells.map((cell) => (
            <Pressable
              key={cell.dateKey}
              accessibilityRole="button"
              accessibilityLabel={`${cell.dateKey}${cell.count ? `, ${cell.count} items` : ""}`}
              onPress={() => {
                setSelectedKey(cell.dateKey);
                setView("day");
              }}
              style={[
                styles.cell,
                !cell.inMonth && styles.cellMuted,
                cell.isToday && styles.cellToday,
                cell.isSelected && styles.cellSelected
              ]}
            >
              <AppText style={[styles.cellDay, cell.isSelected && styles.cellDaySelected]}>{cell.day}</AppText>
              {cell.count > 0 ? (
                <View style={styles.dots}>
                  {Array.from({ length: Math.min(cell.count, 3) }).map((_, index) => (
                    <View key={index} style={styles.dot} />
                  ))}
                </View>
              ) : (
                <View style={styles.dots} />
              )}
            </Pressable>
          ))}
        </View>
      ) : null}

      {view === "week" ? (
        <SoftCard style={styles.card}>
          {weekKeys.map((key) => {
            const dayEntries = entriesForDateKey(entries, key);
            return (
              <Pressable
                key={key}
                onPress={() => setSelectedKey(key)}
                accessibilityRole="button"
                style={styles.weekRow}
              >
                <AppText variant="heading">{formatDateKeyLong(key)}</AppText>
                {dayEntries.length === 0 ? (
                  <AppText variant="muted">Nothing planned for this day.</AppText>
                ) : (
                  dayEntries.map((entry) => (
                    <HorizonEntryCard
                      key={entry.id}
                      entry={entry}
                      compact
                      onPress={() => openHorizonEntry(navigation, entry, nudges)}
                    />
                  ))
                )}
              </Pressable>
            );
          })}
        </SoftCard>
      ) : null}

      {view === "year" ? (
        <View style={styles.yearGrid}>
          {yearMonths.map((month) => (
            <Pressable
              key={month.monthKey}
              accessibilityRole="button"
              accessibilityLabel={`${month.label}, ${month.count} items`}
              onPress={() => {
                const [year, monthNum] = month.monthKey.split("-").map(Number);
                setViewDate(new Date(year, (monthNum ?? 1) - 1, 1));
                setSelectedKey(`${month.monthKey}-01`);
                setView("month");
              }}
              style={styles.yearCell}
            >
              <AppText style={styles.yearLabel}>{month.label}</AppText>
              <AppText variant="caption" style={styles.yearCount}>
                {month.count ? `${month.count}` : "—"}
              </AppText>
            </Pressable>
          ))}
        </View>
      ) : null}

      {view !== "year" && view !== "week" ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">{formatDateKeyLong(selectedKey)}</AppText>
          {selectedEntries.length === 0 ? (
            <>
              <AppText variant="muted">Nothing planned for this day.</AppText>
              <SecondaryButton size="compact" onPress={() => navigation.navigate("Tabs", { screen: "Capture" })}>
                Add something
              </SecondaryButton>
            </>
          ) : (
            selectedEntries.map((entry) => (
              <HorizonEntryCard
                key={entry.id}
                entry={entry}
                onPress={() => openHorizonEntry(navigation, entry, nudges)}
              />
            ))
          )}
        </SoftCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  navBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  navLabel: {
    fontSize: 28,
    color: colors.primaryDark,
    fontWeight: "600"
  },
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  weekday: {
    width: "14.28%",
    textAlign: "center",
    color: colors.mutedText,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  cell: {
    width: "14.28%",
    minHeight: 52,
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderRadius: radii.md
  },
  cellMuted: {
    opacity: 0.45
  },
  cellToday: {
    backgroundColor: colors.primarySoft
  },
  cellSelected: {
    backgroundColor: colors.ivoryElevated,
    borderWidth: 1,
    borderColor: colors.babyBlueInk
  },
  cellDay: {
    color: colors.text,
    fontWeight: "600"
  },
  cellDaySelected: {
    color: colors.babyBlueInk
  },
  dots: {
    flexDirection: "row",
    gap: 3,
    minHeight: 6,
    marginTop: 2
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.babyBlueInk
  },
  card: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  weekRow: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight
  },
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  yearCell: {
    width: "30%",
    minHeight: 64,
    borderRadius: radii.md,
    backgroundColor: colors.ivoryElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    justifyContent: "center"
  },
  yearLabel: {
    fontWeight: "700",
    color: colors.text
  },
  yearCount: {
    color: colors.mutedText
  }
});
