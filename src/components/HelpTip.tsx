import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { announceVoiceReady, speakText as speakAloud, stopSpeaking } from "../services/textToSpeech";
import { colors, radii, spacing } from "../theme/theme";
import { AppText } from "./Text";

type HelpTipProps = {
  /** Short help shown in the bubble. */
  text: string;
  /** Optional title for the bubble. */
  title?: string;
  /** Spoken version; defaults to text. */
  spokenText?: string;
  size?: number;
};

/**
 * Quiet “i” information — keeps screens short; opens a bubble with Listen / Close.
 */
export function HelpTip({ text, title = "Information", spokenText, size = 36 }: HelpTipProps) {
  const [open, setOpen] = useState(false);
  const spoken = (spokenText ?? text).trim();

  async function handleListen() {
    stopSpeaking();
    await announceVoiceReady();
    await speakAloud(spoken);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Information: ${title}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.button,
          { width: size, height: size, borderRadius: size / 2 },
          pressed && styles.pressed
        ]}
      >
        <AppText style={styles.mark}>i</AppText>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
            <View style={styles.cardHeader}>
              <AppText variant="heading">{title}</AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close information"
                onPress={() => {
                  stopSpeaking();
                  setOpen(false);
                }}
                hitSlop={8}
              >
                <Ionicons name="close" size={22} color={colors.mutedText} />
              </Pressable>
            </View>
            <AppText variant="body">{text}</AppText>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Listen to information"
                onPress={() => void handleListen()}
                style={({ pressed }) => [styles.action, pressed && styles.pressed]}
              >
                <Ionicons name="volume-high" size={18} color={colors.primaryDark} />
                <AppText style={styles.actionLabel}>Listen</AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close information"
                onPress={() => {
                  stopSpeaking();
                  setOpen(false);
                }}
                style={({ pressed }) => [styles.action, pressed && styles.pressed]}
              >
                <AppText style={styles.actionLabel}>Close</AppText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  mark: {
    color: colors.primaryDark,
    fontWeight: "700",
    fontSize: 15,
    lineHeight: 17,
    fontStyle: "italic"
  },
  pressed: {
    opacity: 0.86
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(21, 32, 56, 0.35)",
    justifyContent: "center",
    padding: spacing.lg
  },
  card: {
    backgroundColor: colors.ivoryElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  action: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  actionLabel: {
    color: colors.primaryDark,
    fontWeight: "700"
  }
});
