import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BrandMark, HeartDivider } from "../components/BrandMark";
import { SoftCard, PrimaryButton, SecondaryButton } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import type { IoniconName } from "../components/iconTypes";
import { useAppSecurity } from "../hooks/useAppSecurity";
import { useCrew } from "../hooks/useCrew";
import {
  dismissSecurityLockPrompt,
  loadSecurityLockPromptState
} from "../services/securityLockPrompt";
import { colors, radii, shadows, spacing } from "../theme/theme";

type HomeCard = {
  title: string;
  route: string;
  icon: IoniconName;
  accent: string;
};

function TileIcon({ name, accent, withHeart }: { name: IoniconName; accent: string; withHeart?: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={name} size={28} color={accent} />
      {withHeart ? <Ionicons name="heart" size={10} color={colors.accent} style={styles.heartAccent} /> : null}
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { isSupporterOnly, activeProfile, enableOwnNudgeWorld } = useCrew();
  const { settings, isReady: securityReady } = useAppSecurity();
  const [showLockTip, setShowLockTip] = useState(false);

  useEffect(() => {
    let active = true;
    if (!securityReady) {
      return;
    }
    if (settings.lockEnabled && settings.hasCredential) {
      setShowLockTip(false);
      return;
    }
    loadSecurityLockPromptState().then((state) => {
      if (active) {
        setShowLockTip(!state.dismissed);
      }
    });
    return () => {
      active = false;
    };
  }, [securityReady, settings.lockEnabled, settings.hasCredential]);

  const cards: HomeCard[] = isSupporterOnly
    ? [
        {
          title: activeProfile.isSelf ? "Crews I Support" : `${activeProfile.name}'s nudges`,
          route: activeProfile.isSelf ? "CrewsISupport" : "Today",
          icon: activeProfile.isSelf ? "heart-outline" : "notifications-outline",
          accent: colors.primary
        },
        { title: "Focus", route: "Focus", icon: "disc-outline", accent: colors.primary },
        { title: "Completed", route: "Done", icon: "checkmark-circle-outline", accent: colors.accent }
      ]
    : [
        { title: "Focus", route: "Focus", icon: "disc-outline", accent: colors.primary },
        { title: "My Nudges", route: "Today", icon: "notifications-outline", accent: colors.primary },
        { title: "ReadyPacks", route: "ReadyPacks", icon: "cube-outline", accent: colors.softGold },
        { title: "My Crew", route: "MyCrew", icon: "people-outline", accent: colors.primary },
        { title: "Completed", route: "Done", icon: "checkmark-circle-outline", accent: colors.accent }
      ];

  return (
    <Screen>
      <View style={styles.hero}>
        <BrandMark size={64} />
        <AppText variant="title" style={styles.brandTitle}>
          Nudge me Ready
        </AppText>
        <AppText variant="muted" style={styles.subtitle}>
          {isSupporterOnly
            ? activeProfile.isSelf
              ? "You’re here to support someone. Open your invite or Crews I Support."
              : `Supporting ${activeProfile.name}. Their nudges only — until you set up the app for yourself.`
            : "Your calm starting point."}
        </AppText>
        <HeartDivider />
      </View>

      {isSupporterOnly ? (
        <SoftCard style={styles.banner}>
          <AppText variant="heading">Crew access only</AppText>
          <AppText variant="muted">
            {activeProfile.isSelf
              ? "A crew invite gives you access to that person’s nudges only. You don’t get your own world unless you set up Nudge me Ready for yourself."
              : `This invite gives you access to ${activeProfile.name}’s world. You don’t get your own nudges unless you set up Nudge me Ready for yourself.`}
          </AppText>
          <PrimaryButton
            size="compact"
            onPress={() => {
              enableOwnNudgeWorld();
              navigation.navigate("Profile");
            }}
          >
            Set up for myself
          </PrimaryButton>
        </SoftCard>
      ) : null}

      {!isSupporterOnly && showLockTip ? (
        <SoftCard style={styles.banner}>
          <AppText variant="heading">Protect your nudges</AppText>
          <AppText variant="muted">
            Keep a passcode on this phone, turn on app lock, and store your recovery code offline — that
            covers a lost phone and casual snooping.
          </AppText>
          <PrimaryButton size="compact" onPress={() => navigation.navigate("Settings")}>
            Turn on app lock
          </PrimaryButton>
          <SecondaryButton
            size="compact"
            onPress={() => {
              void dismissSecurityLockPrompt().then(() => setShowLockTip(false));
            }}
          >
            Not now
          </SecondaryButton>
        </SoftCard>
      ) : null}

      <View style={styles.grid}>
        {cards.map((item) => (
          <Pressable
            key={item.title}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => navigation.navigate(item.route)}
            style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
          >
            <TileIcon
              name={item.icon}
              accent={item.accent}
              withHeart={item.title.includes("Nudge") || item.title.includes("Crew")}
            />
            <AppText variant="heading" style={styles.tileTitle}>
              {item.title}
            </AppText>
          </Pressable>
        ))}
      </View>

      {!isSupporterOnly ? (
        <SoftCard style={styles.banner}>
          <AppText variant="heading">Need a ready-made start?</AppText>
          <AppText variant="muted">
            Ready 4 packs add calm routines and checklists you can edit — home, wellbeing, travel, study and
            more.
          </AppText>
          <PrimaryButton size="compact" onPress={() => navigation.navigate("ReadyPacks")}>
            Browse ReadyPacks
          </PrimaryButton>
        </SoftCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.xs
  },
  brandTitle: {
    textAlign: "center",
    fontFamily: "Georgia",
    fontWeight: "600"
  },
  subtitle: {
    textAlign: "center"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  tile: {
    width: "48%",
    minHeight: 112,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm
  },
  tilePressed: {
    opacity: 0.9
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  heartAccent: {
    position: "absolute",
    right: 4,
    bottom: 4
  },
  tileTitle: {
    fontSize: 16
  },
  banner: {
    marginTop: spacing.md,
    gap: spacing.sm
  }
});
