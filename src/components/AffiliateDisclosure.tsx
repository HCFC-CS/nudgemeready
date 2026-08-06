import { StyleSheet } from "react-native";

import { getAffiliateDisclosureShort } from "../services/affiliateLinks";
import { spacing } from "../theme/theme";
import { AppText } from "./Text";

/** Small ASA/FTC-style disclosure under commercial outbound link groups. */
export function AffiliateDisclosure({ compact = false }: { compact?: boolean }) {
  return (
    <AppText variant="caption" style={compact ? styles.compact : styles.text} accessibilityRole="text">
      {getAffiliateDisclosureShort()}
    </AppText>
  );
}

const styles = StyleSheet.create({
  text: {
    marginTop: spacing.xs,
    opacity: 0.85
  },
  compact: {
    marginTop: spacing.xs,
    opacity: 0.8
  }
});
