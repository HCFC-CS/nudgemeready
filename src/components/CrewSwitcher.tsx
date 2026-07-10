import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { useCrew } from "../hooks/useCrew";
import { colors, radii, shadows, spacing } from "../theme/theme";
import { AppText } from "./Text";

export function CrewSwitcher({ compact }: { compact?: boolean }) {
  const { activeProfile, profiles, crewsISupport, switchProfile } = useCrew();
  const [open, setOpen] = useState(false);

  const options = [
    ...profiles.filter((profile) => profile.isSelf),
    ...crewsISupport
  ];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Switch profile or Crew"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, compact && styles.triggerCompact, pressed && styles.pressed]}
      >
        <View style={styles.avatar}>
          <AppText variant="heading" style={styles.avatarSymbol}>
            {activeProfile.avatarSymbol ?? activeProfile.name.charAt(0)}
          </AppText>
        </View>
        <View style={styles.triggerText}>
          <AppText variant="caption" style={styles.triggerLabel}>
            Viewing
          </AppText>
          <AppText variant="body" style={styles.triggerName}>
            {activeProfile.isSelf ? "My nudges" : activeProfile.name}
          </AppText>
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.mutedText} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <AppText variant="heading" style={styles.sheetTitle}>
              Switch profile
            </AppText>
            <AppText variant="muted" style={styles.sheetSubtitle}>
              Move between your nudges and people you support.
            </AppText>
            <ScrollView style={styles.optionList} contentContainerStyle={styles.optionListContent}>
              {options.map((profile) => {
                const isActive = profile.id === activeProfile.id;
                return (
                  <Pressable
                    key={profile.id}
                    onPress={() => {
                      switchProfile(profile.id);
                      setOpen(false);
                    }}
                    style={[styles.option, isActive && styles.optionActive]}
                  >
                    <View style={styles.optionAvatar}>
                      <AppText variant="heading">{profile.avatarSymbol ?? profile.name.charAt(0)}</AppText>
                    </View>
                    <View style={styles.optionText}>
                      <AppText variant="body" style={styles.optionName}>
                        {profile.isSelf ? "My nudges" : profile.name}
                      </AppText>
                      <AppText variant="caption">
                        {profile.isSelf ? "Your own reminders and support" : `${profile.name}'s Crew`}
                      </AppText>
                    </View>
                    {isActive ? <Ionicons name="checkmark-circle" size={22} color={colors.primaryDark} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable onPress={() => setOpen(false)} style={styles.closeButton}>
              <AppText variant="body" style={styles.closeLabel}>
                Close
              </AppText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm
  },
  triggerCompact: {
    paddingVertical: spacing.xs
  },
  pressed: {
    opacity: 0.9
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarSymbol: {
    fontSize: 18
  },
  triggerText: {
    flex: 1,
    gap: 2
  },
  triggerLabel: {
    color: colors.mutedText,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4
  },
  triggerName: {
    fontWeight: "700",
    color: colors.text
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(74, 79, 85, 0.35)",
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: "78%",
    gap: spacing.sm,
    ...shadows.md
  },
  sheetTitle: {
    color: colors.text
  },
  sheetSubtitle: {
    lineHeight: 22
  },
  optionList: {
    marginTop: spacing.sm
  },
  optionListContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  optionActive: {
    borderColor: colors.babyBlue,
    backgroundColor: colors.primarySoft
  },
  optionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  optionText: {
    flex: 1,
    gap: 2
  },
  optionName: {
    fontWeight: "700"
  },
  closeButton: {
    alignItems: "center",
    paddingVertical: spacing.md
  },
  closeLabel: {
    color: colors.accent,
    fontWeight: "700"
  }
});
