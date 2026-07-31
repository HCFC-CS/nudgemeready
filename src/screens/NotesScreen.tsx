import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { VoiceFieldActions } from "../components/VoiceFieldActions";
import { useNudgeActor } from "../hooks/useNudgeActor";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { createItem } from "../services/nudgeItems";
import { colors, radii, shadows, spacing } from "../theme/theme";
import type { NudgeItem } from "../types/nudge";

export function NotesScreen() {
  const navigation = useNavigation<any>();
  const { items, saveItem } = useNudgeItems();
  const actor = useNudgeActor();
  const [newTitle, setNewTitle] = useState("");
  const notes = items.filter((item) => item.type === "note" && item.status !== "done");

  function openNote(note: NudgeItem) {
    navigation.navigate("ItemDetails", { draft: note });
  }

  function quickCreate() {
    const title = newTitle.trim();
    if (!title) return;
    const draft = createItem({
      type: "note",
      title,
      notes: title,
      createdBy: actor
    });
    saveItem(draft);
    setNewTitle("");
    openNote(draft);
  }

  return (
    <Screen>
      <View style={s.createBar}>
        <TextInput
          style={s.createInput}
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder="New note..."
          placeholderTextColor={colors.mutedText}
          returnKeyType="done"
          blurOnSubmit={false}
          onSubmitEditing={quickCreate}
        />
        <VoiceFieldActions value={newTitle} onChangeText={setNewTitle} size={28} />
        <Pressable accessibilityRole="button" onPress={quickCreate} style={s.iconBtn}>
          <Ionicons name="add-circle" size={32} color={colors.accent} />
        </Pressable>
      </View>

      {notes.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="document-text-outline" size={36} color={colors.mutedText} />
          <AppText variant="muted">No notes yet</AppText>
        </View>
      ) : (
        <View style={s.stack}>
          {notes.map((note) => (
            <Pressable
              key={note.id}
              accessibilityRole="button"
              onPress={() => openNote(note)}
              style={({ pressed }) => [s.card, pressed && s.pressed]}
            >
              <AppText variant="heading" numberOfLines={2}>
                {note.title}
              </AppText>
              {note.notes && note.notes !== note.title ? (
                <AppText variant="muted" numberOfLines={3}>
                  {note.notes}
                </AppText>
              ) : null}
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  createBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md
  },
  createInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.card,
    ...shadows.sm
  },
  iconBtn: { padding: 2 },
  empty: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xl },
  stack: { gap: spacing.sm },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadows.sm
  },
  pressed: { opacity: 0.88 }
});
