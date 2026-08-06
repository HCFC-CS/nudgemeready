import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  View
} from "react-native";

import { formatNudgeTypeLabel } from "../services/typeAccent";
import { formatWhenLabel } from "../services/reminderDates";
import { colors, radii, shadows, spacing } from "../theme/theme";
import type { NudgeItem, NudgeItemType } from "../types/nudge";
import type { IoniconName } from "./iconTypes";
import { AppText } from "./Text";

const DELETE_WIDTH = 88;
const OPEN_THRESHOLD = 40;

const typeIcons: Partial<Record<NudgeItemType, IoniconName>> = {
  appointment: "calendar-outline",
  event: "ticket-outline",
  occasion: "balloon-outline",
  special_day: "balloon-outline",
  reminder: "notifications-outline",
  task: "checkbox-outline",
  project: "folder-outline",
  routine: "refresh-outline",
  chore: "brush-outline",
  list: "list-outline",
  note: "document-text-outline",
  subtask: "git-commit-outline"
};

export function TypePill({ type }: { type: NudgeItemType }) {
  return (
    <AppText variant="caption" style={styles.typeLabel}>
      {formatNudgeTypeLabel(type).toUpperCase()}
    </AppText>
  );
}

export function NudgeListRow({
  title,
  type,
  meta,
  isDone,
  onPress,
  onToggleDone,
  onDelete
}: {
  title: string;
  type: NudgeItemType;
  meta?: string[];
  isDone?: boolean;
  onPress?: () => void;
  onToggleDone?: () => void;
  onDelete?: () => void;
}) {
  const icon = typeIcons[type] ?? "ellipse-outline";
  const translateX = useRef(new Animated.Value(0)).current;
  const openRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) =>
        Boolean(onDelete) && Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_event, gesture) => {
        if (!onDelete) {
          return;
        }
        const next = openRef.current
          ? Math.min(0, Math.max(-DELETE_WIDTH, -DELETE_WIDTH + gesture.dx))
          : Math.min(0, Math.max(-DELETE_WIDTH, gesture.dx));
        translateX.setValue(next);
      },
      onPanResponderRelease: (_event, gesture) => {
        if (!onDelete) {
          return;
        }
        const shouldOpen = openRef.current ? gesture.dx < 20 : gesture.dx < -OPEN_THRESHOLD;
        openRef.current = shouldOpen;
        Animated.spring(translateX, {
          toValue: shouldOpen ? -DELETE_WIDTH : 0,
          useNativeDriver: true,
          bounciness: 0
        }).start();
      },
      onPanResponderTerminate: () => {
        openRef.current = false;
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 0
        }).start();
      }
    })
  ).current;

  const row = (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed]}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isDone }}
        onPress={onToggleDone}
        disabled={!onToggleDone}
        style={[styles.check, isDone && styles.checkDone]}
      >
        {isDone ? <Ionicons name="checkmark" size={16} color={colors.onPrimary} /> : null}
      </Pressable>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={colors.accent} />
      </View>
      <View style={styles.main}>
        <TypePill type={type} />
        <AppText variant="heading" style={[styles.title, isDone && styles.titleDone]}>
          {title}
        </AppText>
        {meta?.filter(Boolean).length ? (
          <AppText variant="caption" style={styles.meta}>
            {meta.filter(Boolean).join(" · ")}
          </AppText>
        ) : null}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.accent} /> : null}
    </Pressable>
  );

  if (!onDelete) {
    return row;
  }

  return (
    <View style={styles.swipeWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Delete"
        onPress={onDelete}
        style={({ pressed }) => [styles.deleteAction, pressed && styles.deleteActionPressed]}
      >
        <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
        <AppText style={styles.deleteLabel}>Delete</AppText>
      </Pressable>
      <Animated.View
        style={[styles.swipeFront, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {row}
      </Animated.View>
    </View>
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
  return [formatWhenLabel(date)];
}

export function nudgeRowMeta(item: NudgeItem & { parentProjectName?: string }) {
  return [
    ...getDueMeta(item),
    item.parentProjectName ? item.parentProjectName : "",
    item.contactName ? item.contactName : ""
  ].filter(Boolean);
}

const styles = StyleSheet.create({
  typeLabel: {
    fontWeight: "700",
    letterSpacing: 0.6,
    color: colors.accent,
    textTransform: "uppercase"
  },
  swipeWrap: {
    position: "relative",
    overflow: "hidden",
    borderRadius: radii.lg
  },
  swipeFront: {
    backgroundColor: colors.background
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.ivoryElevated,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm
  },
  rowPressed: {
    opacity: 0.92
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  main: {
    flex: 1,
    gap: 2
  },
  title: {
    fontFamily: "Georgia",
    fontWeight: "600"
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: colors.mutedText
  },
  meta: {
    marginTop: 1
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center"
  },
  checkDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  deleteAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_WIDTH,
    backgroundColor: "#B42318",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: radii.lg
  },
  deleteActionPressed: {
    opacity: 0.88
  },
  deleteLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12
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
