import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { HorizonEntryCard } from "../components/HorizonEntryCard";
import { RewardGlance } from "../components/RewardGlance";
import { SoftCard, PageHeader, PrimaryButton, SecondaryButton, SectionHeading } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useAppSecurity } from "../hooks/useAppSecurity";
import { useCrew } from "../hooks/useCrew";
import { useNudgeHorizon } from "../hooks/useNudgeHorizon";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { useProfile } from "../hooks/useProfile";
import { READY_4_LABEL, READY_4_PACKS_LABEL, READY_PACKS_SHOP_LABEL } from "../content/ready4Copy";
import { useReadyPacks } from "../hooks/useReadyPacks";
import { getPlannerConfig } from "../services/ready4PlannerConfigs";
import {
  dismissSecurityLockPrompt,
  loadSecurityLockPromptState
} from "../services/securityLockPrompt";
import { colors, radii, spacing } from "../theme/theme";

function greetingForNow(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useProfile();
  const { isSupporterOnly, activeProfile, enableOwnNudgeWorld } = useCrew();
  const { items: nudges } = useNudgeItems();
  const { packs, isInstalled } = useReadyPacks();
  const { homePeek, isReady: horizonReady } = useNudgeHorizon();
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

  const installedPacks = useMemo(
    () => packs.filter((pack) => pack.kind === "content" && isInstalled(pack.id)).slice(0, 6),
    [packs, isInstalled]
  );

  const firstName = (profile.name || activeProfile.name || "").split(" ")[0];

  function openPeekEntry(sourceKind: string, sourceId: string, packId?: string | null) {
    if (sourceKind === "nudge") {
      const draft = nudges.find((item) => item.id === sourceId);
      if (draft) {
        navigation.navigate("ItemDetails", { draft });
      }
      return;
    }
    if (sourceKind === "planner") {
      navigation.navigate("PackPlanner", { packId: packId ?? "ready4-study" });
      return;
    }
    if (sourceKind === "budget") {
      navigation.navigate("BudgetItem", { itemId: sourceId });
    }
  }

  function openInstalledPack(packId: string) {
    if (getPlannerConfig(packId)) {
      navigation.navigate("PackPlanner", { packId });
      return;
    }
    navigation.navigate("ReadyPackPreview", { packId });
  }

  return (
    <Screen>
      <PageHeader title="Home" showBack={false} />
      <AppText variant="caption" style={styles.greeting}>
        {greetingForNow()}
        {firstName ? `, ${firstName}` : ""}
      </AppText>

      {isSupporterOnly ? (
        <SoftCard style={styles.banner}>
          <SectionHeading
            title="Supporting others"
            info="You can open the people you support. Set up the app for yourself if you want your own nudges."
          />
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
          <SectionHeading
            title="Protect your nudges"
            info="Keep a passcode on this phone and turn on app lock when you are ready."
          />
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

      <SoftCard style={styles.card}>
        <AppText variant="heading">What's coming up</AppText>
        {horizonReady ? (
          <>
            <AppText variant="muted">{homePeek.todaySummary}</AppText>
            {homePeek.next ? (
              <HorizonEntryCard
                entry={homePeek.next}
                compact
                showLeaveBy
                onPress={() =>
                  openPeekEntry(homePeek.next!.sourceKind, homePeek.next!.sourceId, homePeek.next!.packId)
                }
              />
            ) : null}
          </>
        ) : (
          <AppText variant="muted">Loading…</AppText>
        )}
        <PrimaryButton onPress={() => navigation.navigate("ComingUp")}>See what's coming up</PrimaryButton>
      </SoftCard>

      <RewardGlance />

      <SoftCard style={styles.card}>
        <View style={styles.headerRow}>
          <AppText variant="heading">My {READY_4_PACKS_LABEL}</AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Browse ${READY_PACKS_SHOP_LABEL}`}
            onPress={() => navigation.navigate("ReadyPacks")}
            hitSlop={8}
          >
            <AppText style={styles.link}>{installedPacks.length ? "Browse" : "Explore"}</AppText>
          </Pressable>
        </View>
        {installedPacks.length ? (
          <View style={styles.packRow}>
            {installedPacks.map((pack) => (
              <Pressable
                key={pack.id}
                accessibilityRole="button"
                accessibilityLabel={
                  getPlannerConfig(pack.id) ? `Open ${pack.title} planner` : `Open ${pack.title}`
                }
                onPress={() => openInstalledPack(pack.id)}
                style={({ pressed }) => [styles.packChip, pressed && styles.pressed]}
              >
                <AppText variant="caption" style={styles.packLabel} numberOfLines={1}>
                  {pack.title}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : (
          <AppText variant="muted">Install a {READY_4_LABEL} pack when you want a specialist planner.</AppText>
        )}
      </SoftCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    color: colors.accent,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: spacing.sm
  },
  banner: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  card: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  link: {
    color: colors.link,
    fontWeight: "700"
  },
  packRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  packChip: {
    maxWidth: "48%",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  packLabel: {
    color: colors.primaryDark,
    fontWeight: "600"
  },
  pressed: {
    opacity: 0.88
  }
});
