import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { EmptyStateLight, NudgeListRow, SectionHeader, nudgeRowMeta } from "../components/NudgeListRow";
import { FilterScroll, SearchBar, StatPill } from "../components/ModernUI";
import { PageHeader } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { spacing } from "../theme/theme";
import type { NudgeItem, NudgeItemType } from "../types/nudge";

type WorldFilter =
  | "All"
  | "Tasks"
  | "Projects"
  | "Appointments"
  | "Lists"
  | "Reminders"
  | "Routines"
  | "Events"
  | "Occasions"
  | "Completed";

const filters: WorldFilter[] = [
  "All",
  "Tasks",
  "Projects",
  "Appointments",
  "Lists",
  "Reminders",
  "Routines",
  "Events",
  "Occasions",
  "Completed"
];

export function MyWorldScreen() {
  const navigation = useNavigation<any>();
  const { items, setItemStatus } = useNudgeItems();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<WorldFilter>("All");
  const itemsWithParents = useMemo(() => addParentProjectNames(items), [items]);
  const filteredItems = itemsWithParents.filter((item) => matchesFilter(item, filter) && matchesSearch(item, search));
  const openCount = filteredItems.filter((item) => item.status !== "done").length;

  return (
    <Screen>
      <PageHeader title="Everything" subtitle="Search, filter, and open anything." />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search anything..." />
      <FilterScroll options={filters} selected={filter} onSelect={(value) => setFilter(value as WorldFilter)} />
      <View style={styles.stats}>
        <StatPill label="Showing" value={filteredItems.length} />
        <StatPill label="Open" value={openCount} />
      </View>
      <View style={styles.list}>
        {filteredItems.map((item) => (
          <NudgeListRow
            key={item.id}
            title={item.title}
            type={item.type}
            meta={nudgeRowMeta(item)}
            isDone={item.status === "done"}
            onPress={() => navigation.navigate("ItemDetails", { draft: item })}
            onToggleDone={() =>
              setItemStatus(item.id, item.status === "done" ? "open" : item.status === "paused" ? "open" : "done")
            }
          />
        ))}
      </View>
      {!filteredItems.length ? (
        <EmptyStateLight title="Nothing here right now." message="Try a softer search or another filter." />
      ) : null}
    </Screen>
  );
}

type WorldItem = NudgeItem & { parentProjectName?: string };

function addParentProjectNames(items: NudgeItem[]): WorldItem[] {
  return items.map((item) => {
    if (!item.parentId) {
      return item;
    }
    return {
      ...item,
      parentProjectName: items.find((candidate) => candidate.id === item.parentId)?.title
    };
  });
}

function matchesFilter(item: NudgeItem, filter: WorldFilter) {
  if (filter === "All") {
    return item.status !== "done";
  }
  if (filter === "Completed") {
    return item.status === "done";
  }
  const typeMap: Record<WorldFilter, NudgeItemType[]> = {
    All: [],
    Tasks: ["task", "subtask", "chore"],
    Projects: ["project"],
    Appointments: ["appointment"],
    Lists: ["list"],
    Reminders: ["reminder"],
    Routines: ["routine"],
    Events: ["event"],
    Occasions: ["occasion", "special_day"],
    Completed: []
  };
  return typeMap[filter].includes(item.type);
}

function matchesSearch(item: NudgeItem, search: string) {
  const query = search.trim().toLowerCase();
  if (!query) {
    return true;
  }
  return [item.title, item.notes, item.contactName, item.type].filter(Boolean).join(" ").toLowerCase().includes(query);
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: "row",
    gap: spacing.sm
  },
  list: {
    gap: spacing.sm
  }
});
