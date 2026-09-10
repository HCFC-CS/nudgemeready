import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { CrewSwitcher } from "../components/CrewSwitcher";
import { HelpTip } from "../components/HelpTip";
import { NudgeListRow, nudgeRowMeta } from "../components/NudgeListRow";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { RewardGlance } from "../components/RewardGlance";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { SearchBar } from "../components/ModernUI";
import type { IoniconName } from "../components/iconTypes";
import { getPack } from "../data/readyPacks/catalogue";
import { READY_4_LABEL, READY_4_PACKS_LABEL, READY_PACKS_SHOP_LABEL } from "../content/ready4Copy";
import { useCrew } from "../hooks/useCrew";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { useRewardBank } from "../hooks/useRewardBank";
import { compareNudgesByDate, getPrimaryDate, isReady4PackItem } from "../services/nudgeItems";
import { colors, radii, shadows, spacing } from "../theme/theme";
import type { NudgeItem, NudgeItemWithParent } from "../types/nudge";
import type { TabParamList } from "../types/navigation";
import type { RewardDifficulty } from "../types/rewards";

function difficultyForItem(item: NudgeItem): RewardDifficulty {
  if (item.estimatedEffort === "large") {
    return "really_hard";
  }
  if (item.estimatedEffort === "medium") {
    return "hard";
  }
  return "normal";
}

const STATUS_OPTIONS = [
  { value: "open", label: "Open", icon: "sunny-outline" as const },
  { value: "all", label: "All", icon: "apps-outline" as const },
  { value: "done", label: "Done", icon: "checkmark-circle-outline" as const }
] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number]["value"];

type ViewBucket = "everything" | "dates" | "tasks" | "lists";

const VIEW_BUCKET_OPTIONS = [
  { value: "everything", label: "All", icon: "grid-outline" as const },
  { value: "dates", label: "Dates", icon: "calendar-outline" as const },
  { value: "tasks", label: "To-dos", icon: "checkbox-outline" as const },
  { value: "lists", label: "Lists", icon: "list-outline" as const }
] as const;

const TODAY_HELP =
  `Your nudges are listed in date and time order. Tick Confirm when something is sorted — it leaves this open list. Use Show to narrow the list. ${READY_4_PACKS_LABEL} are optional templates.`;


function matchesViewBucket(item: NudgeItem, bucket: ViewBucket) {
  if (bucket === "everything") {
    return true;
  }
  if (bucket === "dates") {
    return (
      item.type === "appointment" ||
      item.type === "event" ||
      item.type === "occasion" ||
      item.type === "special_day" ||
      item.type === "reminder"
    );
  }
  if (bucket === "tasks") {
    return (
      item.type === "task" ||
      item.type === "project" ||
      item.type === "subtask" ||
      item.type === "chore" ||
      item.type === "routine"
    );
  }
  return item.type === "list" || item.type === "note";
}

function matchesSearch(item: NudgeItem, query: string) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return true;
  }
  return (
    item.title.toLowerCase().includes(trimmed) ||
    (item.notes?.toLowerCase().includes(trimmed) ?? false) ||
    (item.contactName?.toLowerCase().includes(trimmed) ?? false)
  );
}

export function TodayScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<TabParamList, "Today">>();
  const { activeProfile } = useCrew();
  const { items, setItemStatus, deleteNudgeItem, loadError, clearLoadError } = useNudgeItems();
  const { earn } = useRewardBank();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [viewBucket, setViewBucket] = useState<ViewBucket>("everything");
  const [searchQuery, setSearchQuery] = useState("");
  const [showReady4, setShowReady4] = useState(route.params?.typeFilter === "ready4");

  useEffect(() => {
    if (route.params?.typeFilter === "ready4") {
      setShowReady4(true);
    } else if (route.params?.typeFilter === "allTypes") {
      setShowReady4(false);
    }
  }, [route.params?.typeFilter]);

  function confirmDelete(item: NudgeItem) {
    Alert.alert(
      "Are you sure?",
      `Remove “${item.title}”? This takes it off this phone and cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteNudgeItem(item.id)
        }
      ]
    );
  }

  const ready4Count = useMemo(
    () => items.filter((item) => item.status !== "cancelled" && isReady4PackItem(item)).length,
    [items]
  );

  const allNudges = useMemo(() => {
    const openAndDone = items.filter((item) => item.status !== "cancelled");
    return withParents(items, openAndDone).sort(compareNudgesByDate);
  }, [items]);

  const visible = useMemo(() => {
    return allNudges.filter((item) => {
      if (statusFilter === "open" && item.status === "done") {
        return false;
      }
      if (statusFilter === "done" && item.status !== "done") {
        return false;
      }
      if (!matchesSearch(item, searchQuery)) {
        return false;
      }
      if (showReady4) {
        return isReady4PackItem(item);
      }
      if (isReady4PackItem(item)) {
        return false;
      }
      return matchesViewBucket(item, viewBucket);
    });
  }, [allNudges, searchQuery, showReady4, statusFilter, viewBucket]);

  const ready4Groups = useMemo(() => {
    if (!showReady4) {
      return null;
    }
    const groups = new Map<string, NudgeItemWithParent[]>();
    for (const item of visible) {
      const packId = item.sourcePackId ?? "ready4-unknown";
      const list = groups.get(packId) ?? [];
      list.push(item);
      groups.set(packId, list);
    }
    return [...groups.entries()]
      .map(([packId, packItems]) => ({
        packId,
        title: getPack(packId)?.title ?? packId.replace(/^ready4-/, `${READY_4_LABEL} `),
        items: packItems.sort(compareNudgesByDate)
      }))
      .sort((a, b) => {
        const aDate = a.items.map(getPrimaryDate).find(Boolean)?.getTime() ?? Number.POSITIVE_INFINITY;
        const bDate = b.items.map(getPrimaryDate).find(Boolean)?.getTime() ?? Number.POSITIVE_INFINITY;
        if (aDate !== bDate) {
          return aDate - bDate;
        }
        return a.title.localeCompare(b.title);
      });
  }, [showReady4, visible]);

  const openCount = allNudges.filter(
    (item) => item.status !== "done" && !isReady4PackItem(item)
  ).length;

  function markConfirmed(item: NudgeItem) {
    const nextStatus = item.status === "done" ? "open" : "done";
    setItemStatus(item.id, nextStatus);
    if (nextStatus === "done") {
      earn({
        difficulty: difficultyForItem(item),
        title: item.title,
        kind: "task",
        packId: item.sourcePackId,
        sourceItemId: item.id
      });
    }
  }

  return (
    <Screen>
      <CrewSwitcher />

      {loadError ? (
        <View style={styles.errorBanner}>
          <AppText variant="caption" style={styles.errorText}>
            {loadError}
          </AppText>
          <Pressable accessibilityRole="button" onPress={clearLoadError}>
            <AppText variant="caption" style={styles.errorDismiss}>
              Dismiss
            </AppText>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <AppText variant="caption" style={styles.dateLine}>
              {formatTodayLabel()}
            </AppText>
            <View style={styles.titleRow}>
              <AppText variant="title">
                {activeProfile.isSelf ? "Nudges" : `${activeProfile.name}'s nudges`}
              </AppText>
              <HelpTip title="Nudges" text={TODAY_HELP} />
            </View>
            <AppText variant="muted">{showReady4 ? `${ready4Count} ${READY_4_PACKS_LABEL}` : `${openCount} open`}</AppText>
          </View>
          <ProfileAvatar size={48} />
        </View>
      </View>

      <RewardGlance />

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search…" />

      <View style={styles.chipRow}>
        <CuteChip
          label={ready4Count ? `${READY_4_LABEL} · ${ready4Count}` : READY_4_LABEL}
          icon="cube-outline"
          selected={showReady4}
          onPress={() => setShowReady4((current) => !current)}
          accessibilityLabel={READY_4_PACKS_LABEL}
        />
      </View>

      <View style={styles.chipRow}>
        {STATUS_OPTIONS.map((option) => (
          <CuteChip
            key={option.value}
            label={option.label}
            icon={option.icon}
            selected={statusFilter === option.value}
            onPress={() => setStatusFilter(option.value)}
            accessibilityLabel={`Show ${option.label.toLowerCase()} nudges`}
          />
        ))}
      </View>

      {!showReady4 ? (
        <View style={styles.chipRow}>
          {VIEW_BUCKET_OPTIONS.map((option) => (
            <CuteChip
              key={option.value}
              label={option.label}
              icon={option.icon}
              selected={viewBucket === option.value}
              onPress={() => setViewBucket(option.value)}
              accessibilityLabel={`Show ${option.label}`}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.list}>
        {ready4Groups
          ? ready4Groups.map((group) => (
              <View key={group.packId} style={styles.packGroup}>
                <AppText variant="caption" style={styles.packGroupTitle}>
                  {group.title}
                </AppText>
                {group.items.map((item) => (
                  <NudgeListRow
                    key={item.id}
                    title={item.title}
                    type={item.type}
                    meta={nudgeRowMeta(item)}
                    isDone={item.status === "done"}
                    onPress={() => navigation.navigate("ItemDetails", { draft: item })}
                    onToggleDone={() => markConfirmed(item)}
                    onDelete={() => confirmDelete(item)}
                  />
                ))}
              </View>
            ))
          : visible.map((item) => (
              <NudgeListRow
                key={item.id}
                title={item.title}
                type={item.type}
                meta={nudgeRowMeta(item)}
                isDone={item.status === "done"}
                onPress={() => navigation.navigate("ItemDetails", { draft: item })}
                onToggleDone={() => markConfirmed(item)}
                onDelete={() => confirmDelete(item)}
              />
            ))}
      </View>

      {!visible.length ? (
        <View style={styles.empty}>
          <AppText variant="heading">
            {searchQuery.trim()
              ? "No matches"
              : showReady4
                ? ready4Count === 0
                  ? `No ${READY_4_LABEL} yet`
                  : "Nothing here"
                : statusFilter === "open"
                  ? "Nothing open"
                  : "Nothing here"}
          </AppText>
          {searchQuery.trim() ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setSearchQuery("")}
              style={styles.emptyAction}
            >
              <AppText style={styles.emptyActionLabel}>Clear search</AppText>
            </Pressable>
          ) : null}
          {showReady4 && ready4Count === 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("ReadyPacks")}
              style={styles.emptyAction}
            >
              <AppText style={styles.emptyActionLabel}>{READY_PACKS_SHOP_LABEL}</AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

function CuteChip({
  label,
  icon,
  selected,
  accent,
  onPress,
  accessibilityLabel
}: {
  label: string;
  icon: IoniconName;
  selected?: boolean;
  accent?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const active = Boolean(selected || accent);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(selected) }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        accent && !selected && styles.chipAccent,
        pressed && styles.pressed
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={active ? colors.onPrimary : colors.primaryDark}
      />
      <AppText style={active ? styles.chipLabelActive : styles.chipLabel}>{label}</AppText>
    </Pressable>
  );
}

function withParents(allItems: NudgeItem[], items: NudgeItem[]): NudgeItemWithParent[] {
  return items.map((item) => {
    if (!item.parentId) {
      return item;
    }
    const parent = allItems.find(
      (candidate) => candidate.id === item.parentId && candidate.type === "project"
    );
    return {
      ...item,
      parentProjectName: parent?.title
    };
  });
}

function formatTodayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

const styles = StyleSheet.create({
  errorBanner: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger
  },
  errorText: {
    color: colors.danger
  },
  errorDismiss: {
    color: colors.danger,
    fontWeight: "700"
  },
  hero: {
    gap: spacing.sm
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  heroCopy: {
    flex: 1,
    gap: 4
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap"
  },
  dateLine: {
    color: colors.accent,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xs
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.ivoryElevated,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    ...shadows.sm
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  chipAccent: {
    backgroundColor: colors.softGold,
    borderColor: colors.softGold
  },
  chipLabel: {
    color: colors.primaryDark,
    fontWeight: "700",
    fontSize: 13
  },
  chipLabelActive: {
    color: colors.onPrimary,
    fontWeight: "700",
    fontSize: 13
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }]
  },
  list: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  packGroup: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  packGroupTitle: {
    color: colors.mutedText,
    fontWeight: "700",
    paddingHorizontal: 2
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl
  },
  emptyAction: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft
  },
  emptyActionLabel: {
    color: colors.primaryDark,
    fontWeight: "700"
  }
});
