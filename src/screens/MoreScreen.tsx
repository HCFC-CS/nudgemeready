import { useNavigation } from "@react-navigation/native";

import { MenuTile } from "../components/ModernUI";
import { PageHeader, PrimaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { CrewSwitcher } from "../components/CrewSwitcher";
import { useCrew } from "../hooks/useCrew";
import { colors, spacing } from "../theme/theme";
import { StyleSheet, View } from "react-native";

export function MoreScreen() {
  const navigation = useNavigation<any>();
  const { hasOrganisationAccess, isSupporterOnly, activeProfile, enableOwnNudgeWorld } = useCrew();

  const links = [
    ...(isSupporterOnly
      ? [
          {
            label: `${activeProfile.name}'s nudges`,
            subtitle: "The person you support",
            route: "Tabs",
            tab: "Today",
            icon: "sunny-outline" as const,
            accent: colors.softGold
          }
        ]
      : [
          {
            label: "My Nudges",
            subtitle: "Your own reminders and support",
            route: "Tabs",
            tab: "Today",
            icon: "sunny-outline" as const,
            accent: colors.softGold
          },
          {
            label: "My Crew",
            subtitle: "People supporting you",
            route: "MyCrew",
            icon: "people-outline" as const,
            accent: colors.primary
          }
        ]),
    {
      label: "Crews I Support",
      subtitle: isSupporterOnly
        ? "Your nudgee access from invites"
        : "All the people you support, in one place",
      route: "CrewsISupport",
      icon: "heart-outline" as const,
      accent: colors.babyBlue
    },
    ...(hasOrganisationAccess
      ? [
          {
            label: "People We Support",
            subtitle: "Organisation dashboard",
            route: "OrganisationDashboard",
            icon: "business-outline" as const,
            accent: colors.charcoal
          }
        ]
      : []),
    {
      label: "ReadyPacks",
      subtitle: "Routines and checklists you can edit",
      route: "ReadyPacks",
      icon: "cube-outline" as const,
      accent: colors.softGold
    },
    {
      label: "Profile",
      subtitle: "Your name and home location",
      route: "Profile",
      icon: "person-outline" as const,
      accent: colors.softWarning
    },
    {
      label: "Settings",
      subtitle: "Reminders, leaving home, preferences",
      route: "Settings",
      icon: "settings-outline" as const,
      accent: colors.primaryDark
    },
    {
      label: "Privacy & support",
      subtitle: "Privacy, terms and partner links",
      route: "LegalInfo",
      icon: "document-text-outline" as const,
      accent: colors.charcoal
    }
  ];

  return (
    <Screen>
      <CrewSwitcher />
      <PageHeader
        title="More"
        subtitle={
          isSupporterOnly
            ? "Crew access and account settings."
            : "My Nudges, Crew, and account settings."
        }
      />
      {isSupporterOnly ? (
        <SoftCard style={styles.banner}>
          <AppText variant="muted">
            You only have access to people you’ve been invited to support. Set up the app for yourself if you want
            your own nudges and crew.
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
            onPress={() =>
              link.tab ? navigation.navigate(link.route, { screen: link.tab }) : navigation.navigate(link.route)
            }
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
