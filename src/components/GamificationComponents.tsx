import { ScrollView, StyleSheet, View } from "react-native";

import { colors, radii, spacing } from "../theme/theme";
import type { NudgeRewards } from "../services/gamification";
import { AppText } from "./Text";
import { SoftCard } from "./NudgeComponents";

export function RewardsSummaryCard({ rewards }: { rewards: NudgeRewards }) {
  const unlockedCount = rewards.badges.filter((badge) => badge.isUnlocked).length;

  return (
    <SoftCard style={styles.summaryCard}>
      <View style={styles.summaryTop}>
        <View>
          <AppText variant="heading">{rewards.levelTitle}</AppText>
        </View>
        <View style={styles.statPill}>
          <AppText variant="small">{rewards.completedCount} completed</AppText>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${rewards.progressToNextLevel}%` }]} />
      </View>
      <AppText variant="muted">
        {unlockedCount} milestone{unlockedCount === 1 ? "" : "s"} reached
      </AppText>
      <AppText variant="small" style={styles.nextGoal}>{rewards.nextGentleGoal}</AppText>
    </SoftCard>
  );
}

export function BadgeShelf({ rewards }: { rewards: NudgeRewards }) {
  return (
    <SoftCard style={styles.summaryCard}>
      <AppText variant="heading">Milestones</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeRow}>
        {rewards.badges.map((badge) => (
          <View key={badge.id} style={[styles.badge, badge.isUnlocked && styles.badgeUnlocked]}>
            <AppText variant="small" style={badge.isUnlocked ? styles.badgeTitleUnlocked : styles.badgeTitle}>
              {badge.title}
            </AppText>
            <AppText variant="small" style={styles.badgeDescription}>{badge.description}</AppText>
          </View>
        ))}
      </ScrollView>
    </SoftCard>
  );
}

export function CompletionRewardCard(_props: { points: number }) {
  return (
    <SoftCard style={styles.completionCard}>
      <View style={{ flex: 1 }}>
        <AppText variant="heading">Completed</AppText>
        <AppText variant="muted">Marked complete and recorded in your progress.</AppText>
      </View>
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    gap: spacing.sm
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  statPill: {
    minHeight: 32,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: colors.primaryDark
  },
  nextGoal: {
    color: colors.mutedText
  },
  badgeRow: {
    paddingRight: spacing.md,
    gap: spacing.sm
  },
  badge: {
    width: 154,
    minHeight: 88,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    gap: spacing.xs
  },
  badgeUnlocked: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.secondary
  },
  badgeTitle: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  badgeTitleUnlocked: {
    color: colors.primaryDark,
    fontWeight: "600"
  },
  badgeDescription: {
    color: colors.mutedText
  },
  completionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  }
});
