import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { CrewSwitcher } from "../components/CrewSwitcher";
import { NudgeListRow, nudgeRowMeta } from "../components/NudgeListRow";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { FilterScroll } from "../components/ModernUI";
import { useCrew } from "../hooks/useCrew";
import { useProfile } from "../hooks/useProfile";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { formatNudgeTypeLabel } from "../services/typeAccent";
import { colors, radii, spacing } from "../theme/theme";
import type { NudgeItem, NudgeItemType, NudgeItemWithParent } from "../types/nudge";

const STATUS_FILTERS = ["open", "all", "done"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];
type TypeFilter = NudgeItemType | "allTypes";

const TYPE_FILTERS: TypeFilter[] = [
  "allTypes",
  "appointment",
  "event",
  "occasion",
  "reminder",
  "task",
  "project",
  "routine",
  "chore",
  "list",
  "note"
];

export function TodayScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useProfile();
  const { activeProfile } = useCrew();
  const { items, setItemStatus, deleteNudgeItem } = useNudgeItems();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("allTypes");

  const allNudges = useMemo(() => {
    const openAndDone = items.filter((item) => item.status !== "cancelled");
    return withParents(items, openAndDone).sort((a, b) => {
      const aDone = a.status === "done" ? 1 : 0;
      const bDone = b.status === "done" ? 1 : 0;
      if (aDone !== bDone) {
        return aDone - bDone;
      }
      return a.title.localeCompare(b.title);
    });
  }, [items]);

  const visible = useMemo(() => {
    return allNudges.filter((item) => {
      if (statusFilter === "open" && item.status === "done") {
        return false;
      }
      if (statusFilter === "done" && item.status !== "done") {
        return false;
      }
      if (typeFilter === "allTypes") {
        return true;
      }
      if (typeFilter === "occasion") {
        return item.type === "occasion" || item.type === "special_day";
      }
      if (typeFilter === "project") {
        return item.type === "project" || item.type === "subtask";
      }
      return item.type === typeFilter;
    });
  }, [allNudges, statusFilter, typeFilter]);

  const statusLabels = STATUS_FILTERS.map((value) =>
    value === "open" ? "Open" : value === "all" ? "All" : "Completed"
  );
  const selectedStatusLabel =
    statusFilter === "open" ? "Open" : statusFilter === "all" ? "All" : "Completed";

  const typeLabels = TYPE_FILTERS.map((value) =>
    value === "allTypes" ? "Every type" : formatNudgeTypeLabel(value)
  );
  const selectedTypeLabel =
    typeFilter === "allTypes" ? "Every type" : formatNudgeTypeLabel(typeFilter);

  const openCount = allNudges.filter((item) => item.status !== "done").length;
  const profileName = profile.name.trim();

  return (
    <Screen>
      <CrewSwitcher />

      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <AppText variant="caption" style={styles.dateLine}>
              {formatTodayLabel()}
            </AppText>
            <AppText variant="title">
              {activeProfile.isSelf ? "My Nudges" : `${activeProfile.name}'s nudges`}
            </AppText>
            <AppText variant="muted">
              {`${openCount} open · ${allNudges.length} total`}
              {profileName ? ` · Hi ${profileName}` : ""}
            </AppText>
          </View>
          <ProfileAvatar size={48} />
        </View>
      </View>

      <FilterScroll
        options={statusLabels}
        selected={selectedStatusLabel}
        onSelect={(label) => {
          if (label === "Open") {
            setStatusFilter("open");
            return;
          }
          if (label === "Completed") {
            setStatusFilter("done");
            return;
          }
          setStatusFilter("all");
        }}
      />

      <FilterScroll
        options={typeLabels}
        selected={selectedTypeLabel}
        onSelect={(label) => {
          if (label === "Every type") {
            setTypeFilter("allTypes");
            return;
          }
          const match = TYPE_FILTERS.find(
            (value) => value !== "allTypes" && formatNudgeTypeLabel(value) === label
          );
          if (match) {
            setTypeFilter(match);
          }
        }}
      />

      <View style={styles.list}>
        {visible.map((item) => (
          <NudgeListRow
            key={item.id}
            title={item.title}
            type={item.type}
            meta={nudgeRowMeta(item)}
            isDone={item.status === "done"}
            onPress={() => navigation.navigate("ItemDetails", { draft: item })}
            onToggleDone={() => setItemStatus(item.id, item.status === "done" ? "open" : "done")}
            onDelete={() => deleteNudgeItem(item.id)}
          />
        ))}
      </View>

      {!visible.length ? (
        <View style={styles.empty}>
          <AppText variant="heading">
            {statusFilter === "open" ? "No open nudges" : "Nothing in this filter"}
          </AppText>
          <AppText variant="muted">
            {statusFilter === "open"
              ? "Completed ones are hidden. Tap All or Completed to see them."
              : "Try another filter, or add a nudge."}
          </AppText>
          {statusFilter === "open" ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setStatusFilter("all")}
              style={styles.emptyAction}
            >
              <AppText style={styles.emptyActionLabel}>Show all</AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate("Capture")}
        style={styles.addRow}
      >
        <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
        <AppText style={styles.addLabel}>Add a nudge</AppText>
      </Pressable>
    </Screen>
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
  dateLine: {
    color: colors.accent,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  list: {
    gap: spacing.sm
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
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md
  },
  addLabel: {
    color: colors.accent,
    fontWeight: "700"
  }
});
