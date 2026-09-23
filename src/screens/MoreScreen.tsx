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
  icon: IoniconName;
  accent: string;
  onPress: () => void;
};

type MenuGroup = {
  title: string;
  links: MenuLink[];
};

export function MoreScreen() {
  const navigation = useNavigation<any>();
  const { isSupporterOnly, enableOwnNudgeWorld } = useCrew();
  const { packs, isInstalled } = useReadyPacks();

  const hasPlannerPack = useMemo(
    () => packs.some((pack) => isInstalled(pack.id) && Boolean(getPlannerConfig(pack.id))),
    [packs, isInstalled]
  );

  const groups = useMemo<MenuGroup[]>(() => {
    const myLife: MenuLink[] = [
      {
        label: "Calendar",
        subtitle: "Month, week and day — same timeline as Nudges",
        icon: "calendar-number-outline",
        accent: colors.babyBlue,
        onPress: () => navigation.navigate("CalendarHub")
      },
      {
        label: READY_PACKS_SHOP_LABEL,
        subtitle: "Specialist planners and checklists",
        icon: "cube-outline",
        accent: colors.softGold,
        onPress: () => navigation.navigate("ReadyPacks")
      },
      {
        label: "Crew",
        subtitle: "People who can help, and people I support",
        icon: "people-outline",
        accent: colors.primary,
        onPress: () => navigation.navigate("CrewHub")
      },
      {
        label: "Rewards",
        subtitle: "Points, treats, and I did something",
        icon: "star-outline",
        accent: colors.softGold,
        onPress: () => navigation.navigate("RewardBank")
      }
    ];

    if (hasPlannerPack) {
      myLife.splice(1, 0, {
        label: READY_4_TODAY_LABEL,
        subtitle: "Filtered view of the same dates in your packs",
        icon: "calendar-outline",
        accent: colors.babyBlue,
        onPress: () => navigation.navigate("PlannerHub")
      });
    }

    return [
      { title: "My life", links: myLife },
      {
        title: "Tools",
        links: [
          {
            label: "Money",
            subtitle: "Bills, spending and pack budgets",
            icon: "wallet-outline",
            accent: colors.primary,
            onPress: () => navigation.navigate("Budget")
          },
          {
            label: "Documents",
            subtitle: "Files attached to your nudges",
            icon: "folder-outline",
            accent: colors.primaryDark,
            onPress: () => navigation.navigate("DocumentsHub")
          },
          {
            label: "Saved Things",
            subtitle: "Find-it ideas you set aside to compare",
            icon: "bookmark-outline",
            accent: colors.softGold,
            onPress: () => navigation.navigate("SavedThings")
          }
        ]
      },
      {
        title: "App",
        links: [
          {
            label: "Profile",
            subtitle: "Your name, photo, and account details",
            icon: "person-outline",
            accent: colors.softWarning,
            onPress: () => navigation.navigate("Profile")
          },
          {
            label: "Settings",
            subtitle: "Reminders, notifications, accessibility, places",
            icon: "settings-outline",
            accent: colors.primaryDark,
            onPress: () => navigation.navigate("Settings")
          },
          {
            label: "Help & privacy",
            subtitle: "Privacy, terms and partner links",
            icon: "document-text-outline",
            accent: colors.charcoal,
            onPress: () => navigation.navigate("LegalInfo")
          }
        ]
      }
    ];
  }, [hasPlannerPack, navigation]);

  return (
    <Screen>
      <PageHeader
        title="Menu"
        showBack={false}
        helpText="Calendar, Ready4, Crew and Rewards live here. Add is on the Add tab; your timeline is on Nudges."
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
      {groups.map((group) => (
        <View key={group.title} style={styles.group}>
          <AppText variant="caption" style={styles.groupTitle}>
            {group.title}
          </AppText>
          <View style={styles.list}>
            {group.links.map((link) => (
              <MenuTile
                key={link.label}
                title={link.label}
                subtitle={link.subtitle}
                icon={link.icon}
                accent={link.accent}
                onPress={link.onPress}
              />
            ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.xs,
    marginBottom: spacing.md
  },
  groupTitle: {
    color: colors.mutedText,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase"
  },
  list: {
    gap: spacing.sm
  },
  banner: {
    gap: spacing.sm,
    marginBottom: spacing.md
  }
});
