import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  View
} from "react-native";

import { formatNudgeTypeLabel, getTypeAccent } from "../services/typeAccent";
import { formatWhenLabel } from "../services/reminderDates";
import { colors, radii, spacing } from "../theme/theme";
import type { NudgeItem, NudgeItemType } from "../types/nudge";
import { AppText } from "./Text";

const DELETE_WIDTH = 88;
const OPEN_THRESHOLD = 40;

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
  const accent = getTypeAccent(type);
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
  return [`When: ${formatWhenLabel(date)}`];
}

export function nudgeRowMeta(item: NudgeItem & { parentProjectName?: string }) {
  return [
    ...getDueMeta(item),
    item.parentProjectName ? `Project: ${item.parentProjectName}` : "",
    item.contactName ? item.contactName : ""
  ].filter(Boolean);
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
  swipeWrap: {
    position: "relative",
    overflow: "hidden",
    borderRadius: radii.md
  },
  swipeFront: {
    backgroundColor: colors.background
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
    borderRadius: radii.md
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
