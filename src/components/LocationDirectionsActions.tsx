import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";

import type { IoniconName } from "./iconTypes";
import { openDirections, openInMaps, openInWaze } from "../services/placeSearch";
import { colors, radii, spacing } from "../theme/theme";
import type { NudgeLocation } from "../types/nudge";
import { AppText } from "./Text";

type LocationDirectionsActionsProps = {
  location?: NudgeLocation;
  /** When false, hide the whole row (e.g. no venue yet). */
  visible?: boolean;
};

/**
 * Calm actions to open turn-by-turn directions in Maps or Waze.
 * Used on events once a venue is set.
 */
export function LocationDirectionsActions({
  location,
  visible = true
}: LocationDirectionsActionsProps) {
  const hasPlace = Boolean(location && (location.address || location.label));
  if (!visible || !hasPlace || !location) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <AppText variant="caption" style={styles.heading}>
        Get there
      </AppText>
      <View style={styles.row}>
        <DirectionChip
          icon="navigate-outline"
          label="Directions"
          onPress={() => void openDirections(location)}
        />
        <DirectionChip
          icon="map-outline"
          label="Maps"
          onPress={() => void openInMaps(location)}
        />
        <DirectionChip
          icon="car-outline"
          label="Waze"
          onPress={() => void openInWaze(location)}
        />
      </View>
    </View>
  );
}

function DirectionChip({
  icon,
  label,
  onPress
}: {
  icon: IoniconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label === "Directions" ? "Get directions" : `Open in ${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={18} color={colors.accent} />
      <AppText style={styles.chipLabel}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs
  },
  heading: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.secondary
  },
  chipLabel: {
    color: colors.accent,
    fontWeight: "700"
  },
  pressed: {
    opacity: 0.85
  }
});
