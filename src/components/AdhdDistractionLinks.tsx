import { useMemo } from "react";
import { Linking, StyleSheet, View } from "react-native";

import { withAffiliate } from "../services/affiliateLinks";
import { getAdhdDistractionSections } from "../services/adhdDistractionLinks";
import { colors, spacing } from "../theme/theme";
import { AffiliateDisclosure } from "./AffiliateDisclosure";
import { SoftCard, SecondaryButton } from "./NudgeComponents";
import { AppText } from "./Text";

export function AdhdDistractionLinks({
  sourcePackId,
  sourceTemplateId,
  title,
  notes
}: {
  sourcePackId?: string;
  sourceTemplateId?: string;
  title: string;
  notes?: string;
}) {
  const sections = useMemo(
    () =>
      getAdhdDistractionSections({
        sourcePackId,
        sourceTemplateId,
        title,
        notes
      }),
    [sourcePackId, sourceTemplateId, title, notes]
  );

  if (!sections.length) {
    return null;
  }

  const showAffiliateNote = sections.some((section) =>
    section.links.some((link) => Boolean(link.url.match(/amazon\.|spotify\.|argos\.|etsy\.|ebay\.|johnlewis\.|loopearplugs\.|sensorydirect\.|notonthehighstreet\./i)))
  );

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      {sections.map((section) => (
        <SoftCard key={section.id} style={styles.card}>
          <AppText variant="heading">{section.title}</AppText>
          <AppText variant="muted">{section.hint}</AppText>
          {section.links.map((link) => (
            <SecondaryButton
              key={link.id}
              accessibilityLabel={`Open ${link.label}`}
              onPress={() => {
                void Linking.openURL(withAffiliate(link.url));
              }}
            >
              {link.label}
            </SecondaryButton>
          ))}
        </SoftCard>
      ))}
      {showAffiliateNote ? <AffiliateDisclosure compact /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  card: {
    gap: spacing.xs,
    borderColor: colors.borderLight
  }
});
