import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";

import { HorizonTimelineView } from "../components/HorizonTimeline";
import { PageHeader, SecondaryButton } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { colors, spacing } from "../theme/theme";
import type { NudgeHorizonId } from "../types/nudgeHorizon";
import type { RootStackParamList } from "../types/navigation";

const HORIZON_TABS: { id: NudgeHorizonId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "7 days" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "3 months" },
  { id: "year", label: "Year" },
  { id: "later", label: "Later" }
];

export function ComingUpScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, "ComingUp">>();
  const [horizon, setHorizon] = useState<NudgeHorizonId>(route.params?.horizon ?? "today");

  const tabs = useMemo(() => HORIZON_TABS, []);

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title="What's coming up"
        subtitle="One life view — near = detail, far = overview."
        showBack
        helpText="This is the same timeline as Nudges. Ready4 packs add context; they do not create a second calendar."
      />

      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setHorizon(tab.id)}
            style={[styles.tab, horizon === tab.id && styles.tabActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: horizon === tab.id }}
            accessibilityLabel={tab.label}
          >
            <AppText variant="caption" style={horizon === tab.id ? styles.tabTextActive : styles.tabText}>
              {tab.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      <SecondaryButton size="compact" onPress={() => navigation.navigate("Tabs", { screen: "Capture" })}>
        Add something
      </SecondaryButton>

      <HorizonTimelineView
        horizon={horizon}
        onOpenCalendar={() => navigation.navigate("CalendarHub")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  tab: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.ivoryElevated,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  tabActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  tabText: {
    color: colors.mutedText
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: "700"
  }
});
