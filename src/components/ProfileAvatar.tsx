import { Image, StyleSheet, View } from "react-native";

import { profileIcons, useProfile } from "../hooks/useProfile";
import { colors, radii, shadows } from "../theme/theme";
import { AppText } from "./Text";

export function ProfileAvatar({ size = 72 }: { size?: number }) {
  const { profile } = useProfile();
  const icon = profileIcons.find((entry) => entry.id === profile.icon) ?? profileIcons[0];
  const radius = size / 2;

  if (profile.avatarUri) {
    return (
      <Image
        source={{ uri: profile.avatarUri }}
        style={[styles.photo, { width: size, height: size, borderRadius: radius }]}
        accessibilityLabel="Profile photo"
      />
    );
  }

  return (
    <View style={[styles.symbolWrap, { width: size, height: size, borderRadius: radius }]}>
      <AppText variant="title" style={[styles.symbol, { fontSize: size * 0.42 }]}>
        {icon.symbol}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    backgroundColor: colors.surfaceMuted
  },
  symbolWrap: {
    backgroundColor: colors.fab,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm
  },
  symbol: {
    color: colors.card
  }
});
