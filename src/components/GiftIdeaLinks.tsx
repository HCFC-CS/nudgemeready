import { useMemo } from "react";
import { Linking, StyleSheet, View } from "react-native";

import { getCardLinksForOccasion, getGiftLinksForOccasion } from "../services/giftLinks";
import { spacing } from "../theme/theme";
import { SecondaryButton } from "./NudgeComponents";
import { AppText } from "./Text";

export function GiftIdeaLinks({
  title,
  giftIdeas = [],
  variant = "present"
}: {
  title: string;
  giftIdeas?: string[];
  variant?: "card" | "present";
}) {
  const links = useMemo(
    () => (variant === "card" ? getCardLinksForOccasion(title) : getGiftLinksForOccasion(title, giftIdeas)),
    [title, giftIdeas, variant]
  );

  if (!title.trim() || !links.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AppText variant="small">{variant === "card" ? "Find a card" : "Shop for gifts"}</AppText>
      {links.map((link) => (
        <SecondaryButton
          key={link.id}
          onPress={() => {
            void Linking.openURL(link.url);
          }}
        >
          {link.label}
        </SecondaryButton>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs
  }
});
