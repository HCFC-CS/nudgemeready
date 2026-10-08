import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, radii, spacing } from "../theme/theme";
import type { DeviceContact } from "../services/deviceContacts";
import { AppText } from "./Text";

export function ContactSuggestionRow({
  contact,
  onSelect,
  onToggleFavorite,
  isFavorite
}: {
  contact: DeviceContact;
  onSelect: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}) {
  const favored = Boolean(isFavorite ?? contact.appFavorite ?? contact.deviceFavorite);

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Select ${contact.name}`}
        onPress={onSelect}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <AppText>{contact.name}</AppText>
        <AppText variant="small" style={styles.meta}>
          {contact.email || contact.phone || contact.role}
        </AppText>
      </Pressable>
      {onToggleFavorite ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={favored ? `Remove ${contact.name} from favorites` : `Add ${contact.name} to favorites`}
          onPress={onToggleFavorite}
          style={({ pressed }) => [styles.starBtn, pressed && styles.pressed]}
        >
          <Ionicons name={favored ? "star" : "star-outline"} size={20} color={colors.accent} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
    backgroundColor: colors.ivoryElevated ?? colors.card,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs
  },
  main: {
    flex: 1,
    gap: 2,
    paddingVertical: 2
  },
  meta: {
    color: colors.mutedText
  },
  starBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  pressed: {
    opacity: 0.85
  }
});
