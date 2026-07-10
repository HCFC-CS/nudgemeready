import { useNavigation } from "@react-navigation/native";

import { MenuTile } from "../components/ModernUI";
import { PageHeader } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { CrewSwitcher } from "../components/CrewSwitcher";
import { useCrew } from "../hooks/useCrew";
import { colors, spacing } from "../theme/theme";
import { StyleSheet, View } from "react-native";

export function MoreScreen() {
  const navigation = useNavigation<any>();
  const { hasOrganisationAccess } = useCrew();

  const links = [
    { label: "My Nudges", subtitle: "Your own reminders and support", route: "Tabs", tab: "Today", icon: "sunny-outline" as const, accent: colors.softGold },
    { label: "My Crew", subtitle: "People supporting you", route: "MyCrew", icon: "people-outline" as const, accent: colors.primary },
    { label: "Crews I Support", subtitle: "All the people you support, in one place", route: "CrewsISupport", icon: "heart-outline" as const, accent: colors.babyBlue },
    ...(hasOrganisationAccess
      ? [{
          label: "People We Support",
          subtitle: "Organisation dashboard",
          route: "OrganisationDashboard",
          icon: "business-outline" as const,
          accent: colors.charcoal
        }]
      : []),
    { label: "Profile", subtitle: "Your name and home location", route: "Profile", icon: "person-outline" as const, accent: colors.softWarning },
    { label: "Settings", subtitle: "Reminders, leaving home, preferences", route: "Settings", icon: "settings-outline" as const, accent: colors.primaryDark }
  ];

  return (
    <Screen>
      <CrewSwitcher />
      <PageHeader title="More" subtitle="My Nudges, Crew, and account settings." />
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
  }
});
