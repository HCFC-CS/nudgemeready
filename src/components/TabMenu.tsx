import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, shadows, spacing } from "../theme/theme";
import type { TabParamList } from "../types/navigation";
import type { IoniconName } from "./iconTypes";
import { AppText } from "./Text";
import { useCrew } from "../hooks/useCrew";

export const TAB_MENU_HEIGHT = 72;

type TabItem = {
  label: string;
  screen: keyof TabParamList;
  icon: IoniconName;
  isFab?: boolean;
};

function useActiveTab(): keyof TabParamList | null {
  return useNavigationState((state) => {
    const tabsRoute = state.routes.find((route) => route.name === "Tabs");
    if (!tabsRoute?.state) {
      return state.routes[state.index]?.name === "Tabs" ? "Home" : null;
    }
    const tabState = tabsRoute.state;
    const tabRoute = tabState.routes[tabState.index ?? 0];
    return tabRoute?.name as keyof TabParamList;
  });
}

export function TabMenu() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const activeTab = useActiveTab();
  const { isSupporterOnly, activeProfile } = useCrew();

  const tabItems: TabItem[] = [
    { label: "Home", screen: "Home", icon: "home-outline" },
    {
      label: isSupporterOnly ? activeProfile.name.split(" ")[0] || "Crew" : "Nudges",
      screen: "Today",
      icon: "notifications-outline"
    },
    { label: "Add", screen: "Capture", icon: "add", isFab: true },
    { label: "Menu", screen: "More", icon: "ellipsis-horizontal" },
    { label: "Focus", screen: "Focus", icon: "disc-outline" }
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {tabItems.map((item) => {
        const isActive = activeTab === item.screen;

        if (item.isFab) {
          return (
            <Pressable
              key={item.screen}
              accessibilityRole="button"
              accessibilityLabel="Add a nudge"
              onPress={() => navigation.navigate("Tabs", { screen: item.screen })}
              style={({ pressed }) => [styles.fabWrap, pressed && styles.pressed]}
            >
              <View style={[styles.fab, isActive && styles.fabActive]}>
                <Ionicons name="add" size={28} color={colors.onFab} />
                <AppText style={styles.fabLabel}>Add</AppText>
              </View>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={item.screen}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => navigation.navigate("Tabs", { screen: item.screen })}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={isActive ? colors.accent : colors.primary}
            />
            <AppText variant="caption" style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.ivoryElevated,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
    minHeight: TAB_MENU_HEIGHT,
    ...shadows.sm
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 52,
    paddingVertical: spacing.sm
  },
  fabWrap: {
    flex: 1,
    alignItems: "center",
    marginTop: -26
  },
  fab: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.fab,
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    ...shadows.fab
  },
  fabActive: {
    backgroundColor: colors.primaryPressed
  },
  fabLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.onFab,
    marginTop: -2,
    letterSpacing: 0.2
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.96 }]
  },
  label: {
    fontWeight: "600",
    color: colors.primaryDark,
    fontSize: 12
  },
  labelActive: {
    color: colors.accent
  }
});
