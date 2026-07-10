import Ionicons from "@expo/vector-icons/Ionicons";

import type { IoniconName } from "./iconTypes";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, radii, spacing } from "../theme/theme";
import { AppText } from "./Text";

export function QuickLinkGrid({
  links,
  onPress
}: {
  links: Array<{ label: string; route: string; icon?: IoniconName }>;
  onPress: (route: string) => void;
}) {
  return (
    <View style={styles.grid}>
      {links.map((link) => (
        <Pressable
          key={link.route}
          accessibilityRole="button"
          onPress={() => onPress(link.route)}
          style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
        >
          {link.icon ? (
            <View style={styles.iconBadge}>
              <Ionicons name={link.icon} size={18} color={colors.primaryDark} />
            </View>
          ) : null}
          <AppText variant="small" style={styles.tileLabel}>
            {link.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  tile: {
    width: "48%",
    flexGrow: 1,
    minWidth: "46%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  tilePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.primarySoft
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center"
  },
  tileLabel: {
    flex: 1,
    fontWeight: "600",
    color: colors.primaryDark
  }
});
