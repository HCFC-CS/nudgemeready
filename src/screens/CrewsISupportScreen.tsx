import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, View } from "react-native";

import { CrewSwitcher } from "../components/CrewSwitcher";
import { PageHeader } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useCrew } from "../hooks/useCrew";
import { colors, radii, shadows, spacing } from "../theme/theme";

export function CrewsISupportScreen() {
  const navigation = useNavigation<any>();
  const { crewsISupport, switchProfile } = useCrew();

  return (
    <Screen>
      <CrewSwitcher />
      <PageHeader
        title="Crews I Support"
        subtitle="All the people you support, in one place."
        showBack
      />

      <View style={styles.list}>
        {crewsISupport.map((profile) => (
          <Pressable
            key={profile.id}
            onPress={() => {
              switchProfile(profile.id);
              navigation.navigate("Tabs", { screen: "Today" });
            }}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.avatar}>
              <AppText variant="heading">{profile.avatarSymbol ?? profile.name.charAt(0)}</AppText>
            </View>
            <View style={styles.copy}>
              <AppText variant="heading">{profile.name}</AppText>
              <AppText variant="muted">{profile.name}'s Crew</AppText>
              {profile.organisationId ? (
                <AppText variant="caption" style={styles.orgTag}>
                  Organisation client
                </AppText>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedText} />
          </Pressable>
        ))}
      </View>

      {!crewsISupport.length ? (
        <View style={styles.empty}>
          <AppText variant="heading">No supported profiles yet</AppText>
          <AppText variant="muted">When you accept a Crew invite to support someone, they will appear here.</AppText>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm
  },
  cardPressed: {
    opacity: 0.92
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    gap: 2
  },
  orgTag: {
    color: colors.softGold,
    fontWeight: "700"
  },
  empty: {
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    alignItems: "center"
  }
});
