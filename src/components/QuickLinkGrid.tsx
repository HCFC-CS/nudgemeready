import Ionicons from "@expo/vector-icons/Ionicons";

import type { IoniconName } from "./iconTypes";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, radii, shadows, spacing } from "../theme/theme";
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
          {link.icon ? <Ionicons name={link.icon} size={26} color={colors.primaryDark} /> : null}
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
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  tile: {
    width: "48%",
    minHeight: 88,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.ivoryElevated,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm
  },
  tilePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.primarySoft
  },
  tileLabel: {
    fontWeight: "600",
    color: colors.primaryDark,
    textAlign: "center"
  }
});
