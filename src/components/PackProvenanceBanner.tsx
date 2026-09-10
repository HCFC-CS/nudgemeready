import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, View } from "react-native";

import { getPack } from "../data/readyPacks/catalogue";
import { READY_4_PACK_LABEL } from "../content/ready4Copy";
import { colors, radii, spacing } from "../theme/theme";
import { AppText } from "./Text";

/** Calm chip showing which Ready4 pack an item came from. */
export function PackProvenanceBanner({
  sourcePackId,
  userEdited
}: {
  sourcePackId?: string;
  userEdited?: boolean;
}) {
  const navigation = useNavigation<any>();
  if (!sourcePackId) {
    return null;
  }

  const pack = getPack(sourcePackId);
  const title = pack?.title ?? READY_4_PACK_LABEL;
  const canOpen = Boolean(pack);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        canOpen ? `From ${title}. Open ${READY_4_PACK_LABEL} preview.` : `From ${title}. Pack is no longer in the catalogue.`
      }
      disabled={!canOpen}
      onPress={() => {
        if (canOpen) {
          navigation.navigate("ReadyPackPreview", { packId: sourcePackId });
        }
      }}
      style={styles.wrap}
    >
      <View style={styles.chip}>
        <AppText variant="caption" style={styles.label}>
          From {title}
          {userEdited ? " · edited by you" : ""}
          {!canOpen ? " · no longer in catalogue" : ""}
        </AppText>
        {canOpen ? (
          <AppText variant="caption" style={styles.link}>
            View pack
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.ivoryElevated,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  label: {
    color: colors.charcoal,
    flex: 1
  },
  link: {
    color: colors.accent,
    fontWeight: "600"
  }
});
