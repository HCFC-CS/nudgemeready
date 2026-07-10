import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";

import { FixedScreen } from "../components/Screen";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { AppText } from "../components/Text";
import { useProfile } from "../hooks/useProfile";
import { colors, radii, shadows, spacing } from "../theme/theme";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export function SplashScreen({ navigation }: Props) {
  const { profile } = useProfile();
  const profileName = profile.name.trim();

  return (
    <FixedScreen>
      <View style={styles.hero}>
        <View style={styles.glow} />
        <ProfileAvatar size={88} />
        <AppText variant="title" style={styles.title}>
          Nudge me Ready
        </AppText>
        {profileName ? (
          <AppText variant="body" style={styles.profileName}>
            Hi, {profileName}
          </AppText>
        ) : null}
        <AppText variant="muted" style={styles.subtitle}>
          One gentle nudge at a time...
        </AppText>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("Tabs", { screen: "Today" })}
          style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
        >
          <Ionicons name="sunny-outline" size={22} color={colors.onPrimary} />
          <AppText style={styles.primaryLabel}>Nudges ready</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("Tabs", { screen: "Capture" })}
          style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
        >
          <Ionicons name="add-circle-outline" size={22} color={colors.primaryDark} />
          <AppText style={styles.secondaryLabel}>Add a nudge</AppText>
        </Pressable>
      </View>
    </FixedScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primarySoft,
    opacity: 0.7
  },
  title: {
    textAlign: "center",
    letterSpacing: -0.6
  },
  profileName: {
    textAlign: "center",
    color: colors.accent,
    fontWeight: "600"
  },
  subtitle: {
    textAlign: "center",
    maxWidth: 280
  },
  actions: {
    gap: spacing.sm,
    paddingBottom: spacing.md
  },
  primaryAction: {
    minHeight: 54,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadows.sm
  },
  secondaryAction: {
    minHeight: 54,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }]
  },
  primaryLabel: {
    color: colors.onPrimary,
    fontWeight: "700",
    fontSize: 16
  },
  secondaryLabel: {
    color: colors.primaryDark,
    fontWeight: "600",
    fontSize: 16
  }
});
