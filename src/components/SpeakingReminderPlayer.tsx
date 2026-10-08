import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet } from "react-native";

import { SecondaryButton } from "./NudgeComponents";
import { colors, radii } from "../theme/theme";
import { hasSpeakingReminder, playSpeakingReminder } from "../services/speakingReminders";
import type { NudgeItem } from "../types/nudge";

export function SpeakingReminderPlayer({ item, compact }: { item: NudgeItem; compact?: boolean }) {
  if (!hasSpeakingReminder(item)) {
    return null;
  }

  if (compact) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Play reminder"
        onPress={() => playSpeakingReminder(item)}
        style={({ pressed }) => [styles.playBtn, pressed && styles.pressed]}
      >
        <Ionicons name="play" size={22} color={colors.onPrimary} />
      </Pressable>
    );
  }

  return <SecondaryButton onPress={() => playSpeakingReminder(item)}>Play</SecondaryButton>;
}

const styles = StyleSheet.create({
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center"
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }]
  }
});
