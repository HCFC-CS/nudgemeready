import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { SoftCard } from "./NudgeComponents";
import { AppText } from "./Text";
import {
  accentColor,
  plannerStatusLabel,
  stillNeedCopy,
  stillNeedThis
} from "../services/ready4PlannerEngine";
import { getPlannerConfig } from "../services/ready4PlannerConfigs";
import { colors, spacing } from "../theme/theme";
import type { PlannerItem } from "../types/ready4Planner";

type Props = {
  item: PlannerItem;
  onDone?: () => void;
  onMove?: () => void;
  onNotNeeded?: () => void;
  onStart?: () => void;
  onOpen?: () => void;
  onLinkNudge?: () => void;
  compact?: boolean;
};

function formatWhen(item: PlannerItem) {
  const raw = item.startAt || item.dueAt;
  if (!raw) {
    return null;
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function PlannerItemCard({
  item,
  onDone,
  onMove,
  onNotNeeded,
  onStart,
  onOpen,
  onLinkNudge,
  compact
}: Props) {
  const [showMore, setShowMore] = useState(false);
  const config = getPlannerConfig(item.ready4PackId);
  const section = config?.plannerSections.find((entry) => entry.id === item.sectionId);
  const accent = accentColor(section?.accent ?? "grey");
  const when = formatWhen(item);
  const needsAttention = stillNeedThis(item);
  const statusText = needsAttention ? stillNeedCopy() : plannerStatusLabel(item.status);

  return (
    <SoftCard style={[styles.card, { borderLeftColor: accent }]}>
      <Pressable
        onPress={onOpen}
        accessibilityRole={onOpen ? "button" : undefined}
        accessibilityLabel={`${item.title}. ${statusText}. ${config?.shortLabel ?? "Pack"}`}
      >
        <View style={styles.topRow}>
          <AppText variant="caption" style={[styles.packLabel, { color: accent }]}>
            {config?.shortLabel ?? "PACK"}
          </AppText>
          <AppText variant="caption" style={styles.status}>
            {statusText}
          </AppText>
        </View>
        <AppText style={styles.title}>{item.title}</AppText>
        {item.subject ? (
          <AppText variant="muted" numberOfLines={1}>
            {item.subject}
          </AppText>
        ) : null}
        {when ? <AppText variant="caption">{when}</AppText> : null}
        {item.durationMinutes ? (
          <AppText variant="caption">{item.durationMinutes} mins</AppText>
        ) : null}
        {item.rewardNote ? (
          <AppText variant="caption" style={styles.reward}>
            Reward: {item.rewardNote}
          </AppText>
        ) : null}
      </Pressable>

      {!compact ? (
        <View style={styles.actions}>
          {onStart && (item.type === "revision" || item.type === "study" || item.type === "task") ? (
            <ActionChip label="Start" onPress={onStart} />
          ) : null}
          {onDone ? <ActionChip label="Done" onPress={onDone} /> : null}
          {onMove ? <ActionChip label="Move" onPress={onMove} /> : null}
          <ActionChip label={showMore ? "Less" : "More"} onPress={() => setShowMore((value) => !value)} />
        </View>
      ) : null}

      {showMore ? (
        <View style={styles.more}>
          {item.notes ? <AppText variant="muted">{item.notes}</AppText> : null}
          {item.bringList?.length ? (
            <AppText variant="muted">Bring: {item.bringList.join(", ")}</AppText>
          ) : null}
          <AppText variant="caption">
            {item.type} · {plannerStatusLabel(item.status)}
          </AppText>
          {onNotNeeded ? <ActionChip label="Not needed" onPress={onNotNeeded} /> : null}
          {onLinkNudge && !item.nudgeItemId ? (
            <ActionChip label="Add nudge + calendar" onPress={onLinkNudge} />
          ) : null}
          {item.nudgeItemId ? <AppText variant="caption">Linked to a nudge</AppText> : null}
        </View>
      ) : null}
    </SoftCard>
  );
}

function ActionChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <AppText variant="caption" style={styles.chipLabel}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    paddingLeft: spacing.sm
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  packLabel: {
    fontWeight: "700",
    letterSpacing: 0.6
  },
  status: {
    color: colors.mutedText
  },
  title: {
    fontWeight: "600",
    color: colors.text
  },
  reward: {
    color: colors.softGold
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  chip: {
    backgroundColor: colors.ivoryElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8
  },
  chipLabel: {
    color: colors.text
  },
  pressed: {
    opacity: 0.75
  },
  more: {
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight
  }
});
