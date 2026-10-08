import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { MenuTile } from "../components/ModernUI";
import { PageHeader, PrimaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { READY_4_TODAY_LABEL, READY_PACKS_SHOP_LABEL } from "../content/ready4Copy";
import { useCrew } from "../hooks/useCrew";
import { useReadyPacks } from "../hooks/useReadyPacks";
import { getPlannerConfig } from "../services/ready4PlannerConfigs";
import { colors, spacing } from "../theme/theme";
import type { IoniconName } from "../components/iconTypes";

type MenuLink = {
  label: string;
  subtitle: string;
  route: string;
  icon: IoniconName;
  accent: string;
};

export function MoreScreen() {
  const navigation = useNavigation<any>();
  const { isSupporterOnly, enableOwnNudgeWorld } = useCrew();
  const { packs, isInstalled } = useReadyPacks();

  const hasPlannerPack = useMemo(
    () => packs.some((pack) => isInstalled(pack.id) && Boolean(getPlannerConfig(pack.id))),
    [packs, isInstalled]
  );

  const links = useMemo(() => {
    const base: MenuLink[] = [
      {
        label: "Crew",
        subtitle: "People on this phone — invites and Ask send a message",
        route: "CrewHub",
        icon: "people-outline",
        accent: colors.primary
      },
      {
        label: "My money",
        subtitle: "What's coming in, going out, and left",
        route: "Budget",
        icon: "wallet-outline",
        accent: colors.primary
      },
      {
        label: "What's coming up",
        subtitle: "Today through later — one life timeline",
        route: "ComingUp",
        icon: "sunny-outline",
        accent: colors.softGold
      }
    ];

    if (hasPlannerPack) {
      base.push({
        label: READY_4_TODAY_LABEL,
        subtitle: "Combined view across your pack planners",
        route: "PlannerHub",
        icon: "calendar-outline",
        accent: colors.babyBlue
      });
    }

    base.push(
      {
        label: "Reward Bank",
        subtitle: "Points, treats, and wins you logged",
        route: "RewardBank",
        icon: "star-outline",
        accent: colors.softGold
      },
      {
        label: READY_PACKS_SHOP_LABEL,
        subtitle: "Specialist planners and checklists",
        route: "ReadyPacks",
        icon: "cube-outline",
        accent: colors.softGold
      },
      {
        label: "Everything",
        subtitle: "Search and filter all your nudges",
        route: "MyWorld",
        icon: "albums-outline",
        accent: colors.primaryDark
      },
      {
        label: "Calendar",
        subtitle: "Appointments and events linked to your phone",
        route: "CalendarHub",
        icon: "calendar-number-outline",
        accent: colors.babyBlue
      },
      {
        label: "Documents",
        subtitle: "Files attached to your nudges",
        route: "DocumentsHub",
        icon: "folder-outline",
        accent: colors.primaryDark
      },
      {
        label: "Saved Things",
        subtitle: "Find-it ideas you set aside to compare",
        route: "SavedThings",
        icon: "bookmark-outline",
        accent: colors.softGold
      },
      {
        label: "Profile",
        subtitle: "Your name, photo, and account details",
        route: "Profile",
        icon: "person-outline",
        accent: colors.softWarning
      },
      {
        label: "Settings",
        subtitle: "Reminders, places, notifications, preferences",
        route: "Settings",
        icon: "settings-outline",
        accent: colors.primaryDark
      },
      {
        label: "Privacy & support",
        subtitle: "Privacy, terms and partner links",
        route: "LegalInfo",
        icon: "document-text-outline",
        accent: colors.charcoal
      }
    );

    return base;
  }, [hasPlannerPack]);

  return (
    <Screen>
      <PageHeader
        title="Menu"
        showBack={false}
        helpText="Crew, money, timeline, rewards, packs, and settings. Add lives on the Add tab; your open list on Nudges."
      />
      {isSupporterOnly ? (
        <SoftCard style={styles.banner}>
          <AppText variant="muted">
            You're set up to support others. Set up the app for yourself if you want your own nudges and crew.
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
      <View style={styles.list}>
        {links.map((link) => (
          <MenuTile
            key={link.label}
            title={link.label}
            subtitle={link.subtitle}
            icon={link.icon}
            accent={link.accent}
            onPress={() => navigation.navigate(link.route)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm
  },
  banner: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  }
});
