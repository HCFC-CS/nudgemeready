import Ionicons from "@expo/vector-icons/Ionicons";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import type { CrewMember } from "../types/crew";
import { colors, radii, spacing } from "../theme/theme";
import type { ListShare } from "../types/nudge";
import { AppText } from "./Text";

export function ListShareSheet({
  visible,
  listTitle,
  sharedWith,
  availableMembers,
  onShare,
  onUnshare,
  onClose
}: {
  visible: boolean;
  listTitle: string;
  sharedWith: ListShare[];
  availableMembers: CrewMember[];
  onShare: (member: CrewMember) => void;
  onUnshare: (membershipId: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <AppText variant="heading">Share list</AppText>
            <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.mutedText} />
            </Pressable>
          </View>
          <AppText variant="muted" numberOfLines={1}>{listTitle}</AppText>
          <AppText variant="caption" style={styles.note}>
            Pick one Crew member at a time. They only see this list.
          </AppText>

          {sharedWith.length > 0 ? (
            <View style={styles.section}>
              <AppText variant="caption" style={styles.label}>Shared with</AppText>
              {sharedWith.map((entry) => (
                <View key={entry.membershipId} style={styles.sharedRow}>
                  <View style={styles.avatar}>
                    <AppText variant="small">{entry.memberName.charAt(0)}</AppText>
                  </View>
                  <AppText style={styles.name}>{entry.memberName}</AppText>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Stop sharing with ${entry.memberName}`}
                    onPress={() => onUnshare(entry.membershipId)}
                    hitSlop={8}
                  >
                    <Ionicons name="person-remove-outline" size={20} color={colors.mutedText} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.section}>
            <AppText variant="caption" style={styles.label}>
              {sharedWith.length ? "Share with someone else" : "Share with"}
            </AppText>
            {availableMembers.length === 0 ? (
              <AppText variant="muted" style={styles.empty}>
                {sharedWith.length ? "Everyone in your Crew already has this list." : "No Crew members to share with yet."}
              </AppText>
            ) : (
              <ScrollView style={styles.memberList} nestedScrollEnabled>
                {availableMembers.map((member) => (
                  <Pressable
                    key={member.membershipId}
                    accessibilityRole="button"
                    onPress={() => onShare(member)}
                    style={({ pressed }) => [styles.memberRow, pressed && styles.pressed]}
                  >
                    <View style={styles.avatar}>
                      <AppText variant="small">{member.name.charAt(0)}</AppText>
                    </View>
                    <View style={styles.memberCopy}>
                      <AppText variant="body">{member.name}</AppText>
                      <AppText variant="caption">{member.relationship}</AppText>
                    </View>
                    <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(26, 39, 68, 0.45)",
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    maxHeight: "78%"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  note: {
    color: colors.mutedText,
    lineHeight: 16
  },
  section: {
    gap: spacing.sm,
    paddingTop: spacing.xs
  },
  label: {
    color: colors.accent,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4
  },
  sharedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.sm
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.xs
  },
  pressed: {
    opacity: 0.85
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  name: {
    flex: 1,
    fontWeight: "600"
  },
  memberCopy: {
    flex: 1,
    gap: 2
  },
  memberList: {
    maxHeight: 220
  },
  empty: {
    paddingVertical: spacing.sm
  }
});
