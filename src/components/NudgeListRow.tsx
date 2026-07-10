import { Pressable, StyleSheet, View } from "react-native";

import { formatNudgeTypeLabel, getTypeAccent } from "../services/typeAccent";
import { colors, radii, spacing } from "../theme/theme";
import type { NudgeItem, NudgeItemType } from "../types/nudge";
import { AppText } from "./Text";

export function TypePill({ type }: { type: NudgeItemType }) {
  const accent = getTypeAccent(type);
  return (
    <View style={[styles.pill, { backgroundColor: `${accent}18` }]}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <AppText variant="caption" style={[styles.label, { color: accent }]}>
        {formatNudgeTypeLabel(type)}
      </AppText>
    </View>
  );
}

export function NudgeListRow({
  title,
  type,
  meta,
  isDone,
  onPress,
  onToggleDone
}: {
  title: string;
  type: NudgeItemType;
  meta?: string[];
  isDone?: boolean;
  onPress?: () => void;
  onToggleDone?: () => void;
}) {
  const accent = getTypeAccent(type);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed]}
    >
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <View style={styles.main}>
        <AppText variant="body" style={[styles.title, isDone && styles.titleDone]}>
          {title}
        </AppText>
        <View style={styles.metaRow}>
          <TypePill type={type} />
          {meta?.filter(Boolean).map((line) => (
            <AppText key={line} variant="caption">
              {line}
            </AppText>
          ))}
        </View>
      </View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isDone }}
        onPress={onToggleDone}
        disabled={!onToggleDone}
        style={[styles.check, isDone && styles.checkDone]}
      >
        {isDone ? <AppText variant="small" style={styles.checkMark}>✓</AppText> : null}
      </Pressable>
    </Pressable>
  );
}

export function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="section">{title}</AppText>
      {count !== undefined ? <AppText variant="caption">{count}</AppText> : null}
    </View>
  );
}

export function EmptyStateLight({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.empty}>
      <AppText variant="heading">{title}</AppText>
      <AppText variant="muted">{message}</AppText>
    </View>
  );
}

function getDueMeta(item: NudgeItem) {
  const date = item.startDate ?? item.dueDate ?? item.reminderDate;
  if (!date) {
    return [];
  }
  return [`When: ${formatShortDate(date)}`];
}

export function nudgeRowMeta(item: NudgeItem & { parentProjectName?: string }) {
  return [
    ...getDueMeta(item),
    item.parentProjectName ? `Project: ${item.parentProjectName}` : "",
    item.contactName ? item.contactName : ""
  ].filter(Boolean);
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  label: {
    fontWeight: "600",
    textTransform: "none"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
    paddingLeft: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  rowPressed: {
    opacity: 0.92
  },
  accent: {
    width: 4,
    alignSelf: "stretch",
    borderTopLeftRadius: radii.md,
    borderBottomLeftRadius: radii.md
  },
  main: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    fontWeight: "600"
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: colors.mutedText
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm
  },
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  checkDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryPressed
  },
  checkMark: {
    color: colors.onPrimary,
    fontWeight: "700"
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs
  },
  empty: {
    gap: spacing.xs,
    paddingVertical: spacing.xl,
    alignItems: "center"
  }
});
