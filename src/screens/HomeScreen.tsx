import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, View } from "react-native";

import { PageHeader } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { colors, radii, shadows, spacing } from "../theme/theme";

const cards = [
  { title: "Focus", copy: "One thing at a time.", route: "Focus", icon: "timer-outline" as const, accent: colors.charcoal },
  { title: "My Nudges", copy: "Nudges ready.", route: "Today", icon: "sunny-outline" as const, accent: colors.softGold },
  { title: "My Crew", copy: "People supporting you.", route: "MyCrew", icon: "people-outline" as const, accent: colors.babyBlue },
  { title: "Completed", copy: "What's finished.", route: "Done", icon: "checkmark-done-outline" as const, accent: colors.softGold }
];

export function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <Screen>
      <PageHeader title="Home" subtitle="Your calm starting point." />
      <View style={styles.grid}>
        {cards.map((item) => (
          <Pressable
            key={item.title}
            onPress={() => navigation.navigate(item.route)}
            style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${item.accent}18` }]}>
              <Ionicons name={item.icon} size={22} color={item.accent} />
            </View>
            <View style={styles.tileText}>
              <AppText variant="heading">{item.title}</AppText>
              <AppText variant="caption">{item.copy}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedText} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.sm
  },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm
  },
  tilePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }]
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center"
  },
  tileText: {
    flex: 1,
    gap: 2
  }
});
