import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { CrewSwitcher } from "../components/CrewSwitcher";
import type { IoniconName } from "../components/iconTypes";
import { NudgeListRow, nudgeRowMeta } from "../components/NudgeListRow";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { FilterScroll, StatPill } from "../components/ModernUI";
import { useCrew } from "../hooks/useCrew";
import { useProfile } from "../hooks/useProfile";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { getItemsForToday } from "../services/nudgeItems";
import { colors, radii, shadows, spacing, taskTypeAccentColors } from "../theme/theme";
import type { NudgeItem, NudgeItemWithParent } from "../types/nudge";

type TodaySection = {
  title: string;
  items: NudgeItemWithParent[];
  icon: IoniconName;
  accent: string;
};

const ALL_FILTER = "All";

export function TodayScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useProfile();
  const { activeProfile } = useCrew();
  const { items, setItemStatus } = useNudgeItems();
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);
  const todayItems = getItemsForToday(items);
  const suggestedProjectSteps = getSuggestedProjectSteps(items, todayItems);

  const sections = useMemo(
    () =>
      (
        [
          { title: "Appointments", items: todayItems.filter((item) => item.type === "appointment"), icon: "calendar-outline", accent: taskTypeAccentColors.appointment },
          { title: "Small Wins", items: todayItems.filter((item) => isSmallWin(item)), icon: "sparkles-outline", accent: taskTypeAccentColors.subtask },
          { title: "Reminders", items: todayItems.filter((item) => item.type === "reminder"), icon: "notifications-outline", accent: taskTypeAccentColors.reminder },
          { title: "Events", items: todayItems.filter((item) => item.type === "event"), icon: "calendar-number-outline", accent: taskTypeAccentColors.event },
          {
            title: "Occasions",
            items: todayItems.filter((item) => item.type === "occasion" || item.type === "special_day"),
            icon: "gift-outline",
            accent: taskTypeAccentColors.occasion
          },
          { title: "Project Steps", items: suggestedProjectSteps, icon: "git-branch-outline", accent: taskTypeAccentColors.project },
          { title: "Routines", items: todayItems.filter((item) => item.type === "routine"), icon: "repeat-outline", accent: taskTypeAccentColors.routine },
          { title: "Waiting For", items: todayItems.filter((item) => item.status === "waiting"), icon: "hourglass-outline", accent: colors.softGrey }
        ] satisfies TodaySection[]
      ).filter((section) => section.items.length),
    [todayItems, suggestedProjectSteps]
  );

  const visibleSections = activeFilter === ALL_FILTER ? sections : sections.filter((section) => section.title === activeFilter);
  const filterOptions = [ALL_FILTER, ...sections.map((section) => section.title)];
  const totalCount = sections.reduce((sum, section) => sum + section.items.length, 0);
  const doneCount = sections.reduce((sum, section) => sum + section.items.filter((item) => item.status === "done").length, 0);
  const progress = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const hasItems = sections.length > 0;
  const profileName = profile.name.trim();
  const todayLabel = formatTodayLabel();

  return (
    <Screen>
      <CrewSwitcher />
      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <AppText variant="caption" style={styles.dateLine}>
              {todayLabel}
            </AppText>
            <AppText variant="title" style={styles.heroTitle}>
              {activeProfile.isSelf ? "Nudges ready" : `${activeProfile.name}'s nudges`}
            </AppText>
            <AppText variant="muted" style={styles.heroSubtitle}>
              {profileName ? `Hi ${profileName} — one gentle nudge at a time...` : "What you can, when you can."}
            </AppText>
          </View>
          <ProfileAvatar size={56} />
        </View>

        {hasItems ? (
          <>
            <View style={styles.statsRow}>
              <StatPill label="Ready" value={totalCount - doneCount} />
              <StatPill label="Complete" value={doneCount} />
              <StatPill label="Sections" value={sections.length} />
            </View>
            <View style={styles.progressBlock}>
              <View style={styles.progressMeta}>
                <AppText variant="small" style={styles.progressLabel}>
                  Today's progress
                </AppText>
                <AppText variant="small" style={styles.progressValue}>
                  {progress}%
                </AppText>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
          </>
        ) : null}
      </View>

      {hasItems ? (
        <FilterScroll options={filterOptions} selected={activeFilter} onSelect={setActiveFilter} />
      ) : null}

      {visibleSections.map((section) => (
        <View key={section.title} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: `${section.accent}18` }]}>
              <Ionicons name={section.icon} size={18} color={section.accent} />
            </View>
            <View style={styles.sectionTitleWrap}>
              <AppText variant="heading">{section.title}</AppText>
              <AppText variant="caption">{section.items.length} nudge{section.items.length === 1 ? "" : "s"}</AppText>
            </View>
            <View style={[styles.sectionBadge, { backgroundColor: `${section.accent}14` }]}>
              <AppText variant="caption" style={{ color: section.accent, fontWeight: "700" }}>
                {section.items.filter((item) => item.status === "done").length}/{section.items.length}
              </AppText>
            </View>
          </View>
          <View style={styles.list}>
            {section.items.map((item) => (
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
        </View>
      ))}

      {!hasItems ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons name="sunny-outline" size={32} color={colors.primaryDark} />
          </View>
          <AppText variant="heading" style={styles.emptyTitle}>
            Nothing planned today
          </AppText>
          <AppText variant="muted" style={styles.emptyMessage}>
            Enjoy the space — or add a gentle nudge when you're ready.
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("Capture")}
            style={({ pressed }) => [styles.emptyAction, pressed && styles.emptyActionPressed]}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <AppText style={styles.emptyActionLabel}>Add a nudge</AppText>
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}

function getSuggestedProjectSteps(allItems: NudgeItem[], todayItems: NudgeItemWithParent[]): NudgeItemWithParent[] {
  const todayStepIds = new Set(todayItems.filter((item) => item.type === "subtask").map((item) => item.id));
  const datedSteps = todayItems.filter((item) => item.type === "subtask");
  const nextSteps = allItems
    .filter((item) => item.type === "subtask" && item.status !== "done" && !todayStepIds.has(item.id))
    .slice(0, 2)
    .map((item) => ({
      ...item,
      parentProjectName: allItems.find((candidate) => candidate.id === item.parentId)?.title
    }));
  return [...datedSteps, ...nextSteps];
}

function isSmallWin(item: NudgeItem) {
  return (
    (item.type === "task" || item.type === "subtask") &&
    (item.estimatedEffort === "tiny" || item.estimatedEffort === "small")
  );
}

function formatTodayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...shadows.md
  },
  heroGlow: {
    position: "absolute",
    top: -48,
    right: -32,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primarySoft,
    opacity: 0.7
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs
  },
  dateLine: {
    color: colors.accent,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  heroTitle: {
    color: colors.text
  },
  heroSubtitle: {
    lineHeight: 22
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  progressBlock: {
    gap: spacing.xs
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  progressLabel: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  progressValue: {
    color: colors.accent,
    fontWeight: "700"
  },
  progressTrack: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.pill,
    backgroundColor: colors.progress
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingBottom: spacing.xs
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center"
  },
  sectionTitleWrap: {
    flex: 1,
    gap: 2
  },
  sectionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill
  },
  list: {
    gap: spacing.sm
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs
  },
  emptyTitle: {
    textAlign: "center"
  },
  emptyMessage: {
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280
  },
  emptyAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    ...shadows.sm
  },
  emptyActionPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }]
  },
  emptyActionLabel: {
    color: colors.onPrimary,
    fontWeight: "700",
    fontSize: 16
  }
});
