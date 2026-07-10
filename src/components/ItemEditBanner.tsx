import { StyleSheet, View } from "react-native";

import { useOptionalItemEdit } from "../hooks/useItemEdit";
import { colors, radii, spacing } from "../theme/theme";
import { ToggleRow } from "./FormControls";
import { AppText } from "./Text";

export function ItemEditBanner() {
  const edit = useOptionalItemEdit();
  if (!edit) {
    return null;
  }

  const { editable, canToggleLock, isLocked, creatorLabel, setLocked } = edit;

  return (
    <View style={styles.banner}>
      <AppText variant="small" style={styles.meta}>
        Added by {creatorLabel}
        {isLocked ? " · Locked" : " · Editable"}
      </AppText>
      {!editable && isLocked ? (
        <AppText variant="muted">Only {creatorLabel} can change this while it is locked.</AppText>
      ) : null}
      {canToggleLock ? (
        <ToggleRow
          label="Lock editing"
          note="Only you can edit or unlock this nudge."
          value={isLocked}
          onValueChange={setLocked}
          disabled={false}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    gap: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.md
  },
  meta: {
    color: colors.primaryDark,
    fontWeight: "600"
  }
});
