import { Image, StyleSheet, View } from "react-native";

import { profileIcons, type ProfileIcon, useProfile } from "../hooks/useProfile";
import { colors, shadows } from "../theme/theme";
import { AppText } from "./Text";

export function ProfileAvatar({
  size = 72,
  icon: iconOverride,
  avatarUri: avatarUriOverride,
  name
}: {
  size?: number;
  icon?: ProfileIcon;
  avatarUri?: string;
  name?: string;
}) {
  const { profile } = useProfile();
  const iconId = iconOverride ?? profile.icon;
  const avatarUri = avatarUriOverride !== undefined ? avatarUriOverride : profile.avatarUri;
  const icon = profileIcons.find((entry) => entry.id === iconId) ?? profileIcons[0];
  const radius = size / 2;

  if (avatarUri) {
    return (
      <Image
        source={{ uri: avatarUri }}
        style={[styles.photo, { width: size, height: size, borderRadius: radius }]}
        accessibilityLabel={name ? `${name} profile photo` : "Profile photo"}
      />
    );
  }

  return (
    <View style={[styles.symbolWrap, { width: size, height: size, borderRadius: radius }]}>
      <AppText style={[styles.symbol, { fontSize: size * 0.48 }]}>{icon.symbol}</AppText>
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
    textAlign: "center"
  }
});
