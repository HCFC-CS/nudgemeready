import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { PageHeader, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { AffiliateDisclosure } from "../components/AffiliateDisclosure";
import { useSavedThings } from "../hooks/useSavedThings";
import { withAffiliate } from "../services/affiliateLinks";
import { openExternalUrl } from "../services/openExternalUrl";
import { SAVED_THINGS_COMPARE_LIMIT } from "../types/savedThings";
import { colors, radii, spacing } from "../theme/theme";

export function SavedThingsScreen() {
  const navigation = useNavigation<any>();
  const { items, compareItems, remove, toggleCompareItem, showShopIdeasAgain, state } = useSavedThings();
  const [notice, setNotice] = useState("");

  function handleCompare(id: string) {
    const accepted = toggleCompareItem(id);
    setNotice(accepted ? "" : "Compare up to three things at a time.");
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title="Saved Things"
        showBack
        helpText="Ideas you set aside from Help me find it. Compare up to three. You never have to buy anything."
      />

      {items.length === 0 ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Nothing saved yet</AppText>
          <AppText variant="muted">
            On a nudge, open Help me find it and tap Save. Completing a nudge never requires a purchase.
          </AppText>
          <SecondaryButton size="compact" onPress={() => navigation.goBack()}>
            Back
          </SecondaryButton>
        </SoftCard>
      ) : (
        <View style={styles.list}>
          {items.map((item) => {
            const comparing = compareItems.some((entry) => entry.id === item.id);
            return (
              <SoftCard key={item.id} style={styles.card}>
                <AppText style={styles.title}>{item.title}</AppText>
                <AppText variant="caption" style={styles.meta}>
                  {item.partnerLabel ?? "Shop"} · optional idea
                </AppText>
                <View style={styles.row}>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`Open ${item.title}`}
                    onPress={() => void openExternalUrl(withAffiliate(item.url), item.title)}
                    style={({ pressed }) => [styles.btn, styles.primary, pressed && styles.pressed]}
                  >
                    <AppText style={styles.primaryLabel}>Open</AppText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: comparing }}
                    onPress={() => handleCompare(item.id)}
                    style={({ pressed }) => [
                      styles.btn,
                      comparing && styles.primary,
                      pressed && styles.pressed
                    ]}
                  >
                    <AppText style={comparing ? styles.primaryLabel : styles.quietLabel}>
                      {comparing ? "In compare" : "Compare"}
                    </AppText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => remove(item.id)}
                    style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
                  >
                    <AppText style={styles.quietLabel}>Remove</AppText>
                  </Pressable>
                </View>
              </SoftCard>
            );
          })}
        </View>
      )}

      {compareItems.length >= 2 ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Compare ({compareItems.length} of {SAVED_THINGS_COMPARE_LIMIT})</AppText>
          <AppText variant="muted">Side by side, quietly. No ranking as better or worse.</AppText>
          <View style={styles.compareRow}>
            {compareItems.map((item) => (
              <View key={item.id} style={styles.compareCol}>
                <AppText style={styles.title} numberOfLines={3}>
                  {item.title}
                </AppText>
                <AppText variant="caption" style={styles.meta}>
                  {item.partnerLabel ?? "Shop"}
                </AppText>
                <Pressable
                  accessibilityRole="link"
                  onPress={() => void openExternalUrl(withAffiliate(item.url), item.title)}
                  style={({ pressed }) => [styles.btn, styles.primary, pressed && styles.pressed]}
                >
                  <AppText style={styles.primaryLabel}>Open</AppText>
                </Pressable>
              </View>
            ))}
          </View>
          <AffiliateDisclosure compact />
        </SoftCard>
      ) : items.length ? (
        <AppText variant="muted">Pick two or three saved ideas to compare them here.</AppText>
      ) : null}

      {notice ? <AppText variant="muted">{notice}</AppText> : null}

      {state.alreadyHaveKeys.length ? (
        <SecondaryButton size="compact" onPress={showShopIdeasAgain}>
          Show hidden shop ideas again
        </SecondaryButton>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm
  },
  card: {
    gap: spacing.sm
  },
  title: {
    fontWeight: "700",
    color: colors.text
  },
  meta: {
    color: colors.mutedText
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  compareRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  compareCol: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.ivoryElevated
  },
  btn: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center"
  },
  primary: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  primaryLabel: {
    color: colors.primaryDark,
    fontWeight: "700"
  },
  quietLabel: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  pressed: {
    opacity: 0.86
  }
});
