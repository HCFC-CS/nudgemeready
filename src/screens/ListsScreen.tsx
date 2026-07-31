import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useNudgeActor } from "../hooks/useNudgeActor";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { useCrew } from "../hooks/useCrew";
import { createItem } from "../services/nudgeItems";
import { getListSuggestions } from "../services/listSuggestions";
import { filterVisibleLists, formatSharedLabel } from "../services/listSharing";
import { colors, radii, shadows, spacing } from "../theme/theme";
import type { NudgeItem } from "../types/nudge";
import { VoiceFieldActions } from "../components/VoiceFieldActions";

export function ListsScreen() {
  const navigation = useNavigation<any>();
  const { items, saveItem } = useNudgeItems();
  const { activeProfile, myMembershipId } = useCrew();
  const actor = useNudgeActor();
  const lists = useMemo(
    () =>
      filterVisibleLists(
        items.filter((item) => item.type === "list" && item.status !== "done"),
        { isSelfProfile: activeProfile.isSelf, viewerMembershipId: myMembershipId }
      ),
    [activeProfile.isSelf, items, myMembershipId]
  );
  const [newName, setNewName] = useState("");
  const inputRef = useRef<TextInput>(null);
  const preview = useMemo(() => getListSuggestions(newName, []), [newName]);

  function openList(list: NudgeItem) {
    navigation.navigate("ItemDetails", { draft: list });
  }

  function quickCreate() {
    const name = newName.trim();
    if (!name) return;
    const draft = createItem({ type: "list", title: name, createdBy: actor });
    saveItem(draft);
    setNewName("");
    openList(draft);
  }

  return (
    <Screen>
      {/* Inline create — always visible, one tap */}
      <View style={s.createBar}>
        <TextInput
          ref={inputRef}
          style={s.createInput}
          value={newName}
          onChangeText={setNewName}
          placeholder="New list..."
          placeholderTextColor={colors.mutedText}
          returnKeyType="done"
          blurOnSubmit={false}
          onSubmitEditing={quickCreate}
        />
        <VoiceFieldActions value={newName} onChangeText={setNewName} size={28} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create list"
          onPress={quickCreate}
          style={({ pressed }) => [s.createBtn, pressed && s.pressed]}
        >
          <Ionicons name="add-circle" size={32} color={colors.accent} />
        </Pressable>
      </View>
      {preview ? (
        <AppText variant="caption" style={s.preview}>
          {preview.category}: {preview.items.slice(0, 4).join(" · ")}
        </AppText>
      ) : null}

      {/* List grid */}
      {lists.length === 0 && (
        <View style={s.empty}>
          <Ionicons name="list-outline" size={36} color={colors.mutedText} />
          <AppText variant="muted">No lists yet</AppText>
        </View>
      )}

      <View style={s.grid}>
        {lists.map((list) => {
          const total = list.listItems.length;
          const done = list.listItems.filter((li) => li.status === "done").length;
          const pct = total ? Math.round((done / total) * 100) : 0;

          return (
            <Pressable
              key={list.id}
              accessibilityRole="button"
              onPress={() => openList(list)}
              style={({ pressed }) => [s.card, pressed && s.pressed]}
            >
              <View style={s.cardRow}>
                <AppText variant="heading" numberOfLines={1} style={s.cardTitle}>
                  {list.title}
                </AppText>
                <View style={s.cardMeta}>
                  {list.sharedWith?.length ? (
                    <View style={s.sharedPill}>
                      <Ionicons name="people-outline" size={12} color={colors.accent} />
                      <AppText variant="caption" style={s.sharedText}>
                        {formatSharedLabel(list.sharedWith)}
                      </AppText>
                    </View>
                  ) : null}
                  {total > 0 && (
                    <AppText variant="caption" style={s.badge}>
                      {done}/{total}
                    </AppText>
                  )}
                </View>
              </View>
              {total > 0 ? (
                <View style={s.track}>
                  <View style={[s.fill, { width: `${pct}%` }]} />
                </View>
              ) : (
                <AppText variant="caption" style={s.dim}>Empty</AppText>
              )}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  createBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    minHeight: 52,
    ...shadows.sm
  },
  createInput: {
    flex: 1,
    fontSize: 17,
    color: colors.text,
    paddingVertical: spacing.sm
  },
  createBtn: {
    padding: 6
  },
  preview: {
    color: colors.mutedText,
    lineHeight: 18
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }]
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl
  },
  grid: {
    gap: spacing.sm
  },
  card: {
    flexDirection: "column",
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardTitle: {
    flex: 1
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  sharedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: `${colors.accent}14`
  },
  sharedText: {
    color: colors.accent,
    fontWeight: "600"
  },
  badge: {
    color: colors.accent,
    fontWeight: "700"
  },
  dim: {
    color: colors.mutedText
  },
  track: {
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden"
  },
  fill: {
    height: "100%",
    borderRadius: radii.pill,
    backgroundColor: colors.progress
  }
});
