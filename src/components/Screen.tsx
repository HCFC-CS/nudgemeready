import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "../theme/theme";
import { TAB_MENU_HEIGHT, TabMenu } from "./TabMenu";

type ScreenProps = PropsWithChildren<{
  showTabMenu?: boolean;
}>;

export function Screen({ children, showTabMenu = true }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, showTabMenu && styles.contentWithMenu]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {showTabMenu ? <TabMenu /> : null}
    </SafeAreaView>
  );
}

export function FixedScreen({ children, showTabMenu = false }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={[styles.fixedContent, showTabMenu && styles.fixedContentWithMenu]}>{children}</View>
      {showTabMenu ? <TabMenu /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    flex: 1
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.lg
  },
  contentWithMenu: {
    paddingBottom: TAB_MENU_HEIGHT + spacing.lg
  },
  fixedContent: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md
  },
  fixedContentWithMenu: {
    paddingBottom: spacing.sm
  }
});
