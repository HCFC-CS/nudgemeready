import { useMemo } from "react";
import { Linking, StyleSheet, View } from "react-native";

import { withAffiliate } from "../services/affiliateLinks";
import { getHolidayTravelSections } from "../services/holidayTravelLinks";
import { colors, spacing } from "../theme/theme";
import { AffiliateDisclosure } from "./AffiliateDisclosure";
import { SoftCard, SecondaryButton } from "./NudgeComponents";
import { AppText } from "./Text";

export function HolidayTravelLinks({
  sourcePackId,
  sourceTemplateId,
  title,
  notes,
  locationLabel
}: {
  sourcePackId?: string;
  sourceTemplateId?: string;
  title: string;
  notes?: string;
  locationLabel?: string;
}) {
  const sections = useMemo(
    () =>
      getHolidayTravelSections({
        sourcePackId,
        sourceTemplateId,
        title,
        notes,
        locationLabel
      }),
    [sourcePackId, sourceTemplateId, title, notes, locationLabel]
  );

  if (!sections.length) {
    return null;
  }

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
      <AffiliateDisclosure />
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
