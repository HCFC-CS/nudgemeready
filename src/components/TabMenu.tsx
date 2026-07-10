import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radii, shadows, spacing } from "../theme/theme";
import type { TabParamList } from "../types/navigation";
import type { IoniconName } from "./iconTypes";
import { AppText } from "./Text";

export const TAB_MENU_HEIGHT = 68;

type TabItem = {
  label: string;
  screen: keyof TabParamList;
  icon: IoniconName;
  isFab?: boolean;
};

const tabItems: TabItem[] = [
  { label: "Home", screen: "Home", icon: "home-outline" },
  { label: "My Nudges", screen: "Today", icon: "sunny-outline" },
  { label: "+nudge", screen: "Capture", icon: "add", isFab: true },
  { label: "Focus", screen: "Focus", icon: "timer-outline" },
  { label: "More", screen: "More", icon: "ellipsis-horizontal" }
];

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

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {tabItems.map((item) => {
        const isActive = activeTab === item.screen;

        if (item.isFab) {
          return (
            <Pressable
              key={item.screen}
              accessibilityRole="button"
              accessibilityLabel="Add nudge"
              onPress={() => navigation.navigate("Tabs", { screen: item.screen })}
              style={({ pressed }) => [styles.fabWrap, pressed && styles.pressed]}
            >
              <View style={styles.fab}>
                <Ionicons name={item.icon} size={28} color={colors.onFab} />
              </View>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={item.screen}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => navigation.navigate("Tabs", { screen: item.screen })}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Ionicons
                name={item.icon}
                size={22}
                color={isActive ? colors.primaryDark : colors.mutedText}
              />
            </View>
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
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.card,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    minHeight: TAB_MENU_HEIGHT,
    ...shadows.sm
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingVertical: spacing.xs
  },
  iconWrap: {
    width: 36,
    height: 32,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  iconWrapActive: {
    backgroundColor: colors.primarySoft
  },
  fabWrap: {
    flex: 1,
    alignItems: "center",
    marginTop: -22
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.fab,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.fab
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.96 }]
  },
  label: {
    fontWeight: "600"
  },
  labelActive: {
    color: colors.accent
  }
});
