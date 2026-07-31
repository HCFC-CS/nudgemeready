import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, TextInput, View } from "react-native";

import type { IoniconName } from "../components/iconTypes";
import { SpeakingReminderPlayer } from "../components/SpeakingReminderPlayer";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { useNudgeActor } from "../hooks/useNudgeActor";
import { canEditItem } from "../services/itemPermissions";
import { hasSpeakingReminder } from "../services/speakingReminders";
import { createItem } from "../services/nudgeItems";
import { formatWhenLabel } from "../services/reminderDates";
import { colors, radii, shadows, spacing } from "../theme/theme";
import type { NudgeItem } from "../types/nudge";
import { VoiceFieldActions } from "../components/VoiceFieldActions";

export function RemindersScreen() {
  const navigation = useNavigation<any>();
  const { items, saveItem, completeNudgeItem } = useNudgeItems();
  const actor = useNudgeActor();
  const [offIds, setOffIds] = useState<string[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const reminders = items.filter((item) => item.type === "reminder" && item.status !== "done");

  function openReminder(reminder: NudgeItem) {
    navigation.navigate("ItemDetails", { draft: reminder });
  }

  function quickCreate() {
    const title = newTitle.trim();
    if (!title) return;
    const draft = createItem({
      type: "reminder",
      title,
      createdBy: actor,
      nudgeEveryTenMinutesUntilDone: true,
      notifyNudgerIfNotDone: true
    });
    saveItem(draft);
    setNewTitle("");
    openReminder(draft);
  }

  return (
    <Screen>
      <View style={s.createBar}>
        <TextInput
          style={s.createInput}
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder="New reminder..."
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

      {reminders.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="notifications-outline" size={36} color={colors.mutedText} />
          <AppText variant="muted">No reminders</AppText>
        </View>
      ) : (
        <View style={s.stack}>
          {reminders.map((reminder) => {
            const isOn = !offIds.includes(reminder.id);
            const canEdit = canEditItem(reminder, actor);

            return (
              <View key={reminder.id} style={s.card}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openReminder(reminder)}
                  style={({ pressed }) => [s.cardBody, pressed && s.pressed]}
                >
                  <AppText variant="heading" numberOfLines={2}>{reminder.title}</AppText>
                  {reminder.speakingReminderText ? (
                    <AppText variant="muted" numberOfLines={1}>{reminder.speakingReminderText}</AppText>
                  ) : null}
                  <View style={s.metaRow}>
                    {reminder.reminderDate ? (
                      <MetaPill icon="calendar-outline" label={formatWhenLabel(reminder.reminderDate)} />
                    ) : null}
                    {hasSpeakingReminder(reminder) ? <MetaPill icon="volume-medium-outline" label="Speak" /> : null}
                    {reminder.nudgeEveryTenMinutesUntilDone ? <MetaPill icon="repeat-outline" label="10 min" /> : null}
                    {reminder.notifyNudgerIfNotDone ? <MetaPill icon="person-outline" label="Nudger" /> : null}
                  </View>
                </Pressable>

                {hasSpeakingReminder(reminder) ? <SpeakingReminderPlayer item={reminder} /> : null}

                <View style={s.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Complete"
                    onPress={() => completeNudgeItem(reminder.id)}
                    style={({ pressed }) => [s.doneBtn, pressed && s.pressed]}
                  >
                    <Ionicons name="checkmark-circle" size={18} color={colors.onPrimary} />
                  </Pressable>
                  <View style={s.toggle}>
                    <AppText variant="small" style={s.toggleLabel}>On</AppText>
                    <Switch
                      value={isOn}
                      disabled={!canEdit}
                      onValueChange={(value) =>
                        setOffIds((current) =>
                          value ? current.filter((id) => id !== reminder.id) : [...current, reminder.id]
                        )
                      }
                      trackColor={{ true: colors.primary, false: colors.border }}
                      thumbColor={colors.card}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

function MetaPill({ icon, label }: { icon: IoniconName; label: string }) {
  return (
    <View style={s.pill}>
      <Ionicons name={icon} size={12} color={colors.accent} />
      <AppText variant="caption" style={s.pillText}>{label}</AppText>
    </View>
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
  iconBtn: { padding: 6 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl
  },
  stack: { gap: spacing.sm },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm
  },
  cardBody: { gap: spacing.xs },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingTop: spacing.xs
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: `${colors.accent}14`
  },
  pillText: {
    color: colors.accent,
    fontWeight: "600"
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  doneBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    borderRadius: radii.sm
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  toggleLabel: {
    color: colors.mutedText,
    fontWeight: "600"
  }
});
