import { Alert, Pressable, StyleSheet, View } from "react-native";

import { useOptionalItemEdit } from "../hooks/useItemEdit";
import { colors, radii, spacing } from "../theme/theme";
import { AppText } from "./Text";

export function ItemEditBanner() {
  const edit = useOptionalItemEdit();
  if (!edit) {
    return null;
  }

  const { canToggleLock, isLocked, setLocked } = edit;

  if (!canToggleLock) {
    return null;
  }

  function chooseLocked() {
    Alert.alert("Locked", undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "No", onPress: () => setLocked(false) },
      { text: "Yes", onPress: () => setLocked(true) }
    ]);
  }

  return (
    <View style={styles.banner}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Locked ${isLocked ? "yes" : "no"}`}
        onPress={chooseLocked}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <AppText>Locked</AppText>
        <AppText style={styles.value}>{isLocked ? "Yes" : "No"}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignSelf: "flex-start"
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  value: {
    color: colors.primaryDark,
    fontWeight: "600"
  },
  pressed: {
    opacity: 0.75
  }
});
