import { useState } from "react";
import { Alert, Platform, Share, StyleSheet, View } from "react-native";

import { colors, radii, spacing } from "../theme/theme";
import { Button } from "./Button";
import { AppText } from "./Text";

type RecoveryCodeSaveCardProps = {
  code: string;
  onSaved: () => void;
  /** Primary continue label after the user confirms they saved the code. */
  continueLabel?: string;
};

/**
 * One-time recovery code display with Share (so people can store it offline)
 * and clear guidance not to rely only on the phone.
 */
export function RecoveryCodeSaveCard({
  code,
  onSaved,
  continueLabel = "I’ve saved it"
}: RecoveryCodeSaveCardProps) {
  const [shared, setShared] = useState(false);

  async function handleShare() {
    // Web has no native share sheet; fall back to the clipboard so the code can
    // still be saved and the flow can continue. Native keeps the share sheet.
    if (Platform.OS === "web") {
      try {
        const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : undefined;
        if (clipboard?.writeText) {
          await clipboard.writeText(code);
        }
      } catch {
        // Clipboard can be blocked; the code is still visible on screen.
      }
      setShared(true);
      return;
    }
    try {
      const result = await Share.share({
        message:
          `Nudge me Ready recovery code\n\n${code}\n\n` +
          "Store this somewhere safe offline (paper, password manager, or a printed note). " +
          "Do not keep it only in this phone’s Notes. You need it if you forget your PIN or password."
      });
      if (result.action === Share.sharedAction) {
        setShared(true);
      }
    } catch {
      Alert.alert("Could not open share", "Write the code down somewhere safe offline, then continue.");
    }
  }

  function handleContinue() {
    if (!shared) {
      // react-native-web's Alert has no button dialog, so use window.confirm on
      // web to keep the "did you save it?" guard working. Native uses Alert.
      if (Platform.OS === "web") {
        const confirmed =
          typeof window !== "undefined" && typeof window.confirm === "function"
            ? window.confirm(
                "Saved offline? Copy or write the code down before continuing. It will not be shown again."
              )
            : true;
        if (confirmed) {
          onSaved();
        }
        return;
      }
      Alert.alert(
        "Saved offline?",
        "Write the code down or share it to a password manager / paper note before continuing. It will not be shown again.",
        [
          { text: "Go back", style: "cancel" },
          { text: "I’ve saved it", onPress: onSaved }
        ]
      );
      return;
    }
    onSaved();
  }

  return (
    <View style={styles.codeCard} accessibilityRole="summary">
      <AppText variant="caption" style={styles.hint}>
        Recovery code — save this offline now. It will not be shown again.
      </AppText>
      <AppText style={styles.codeText} accessibilityLabel={`Recovery code ${code}`}>
        {code}
      </AppText>
      <AppText variant="caption" style={styles.hint}>
        Keep a phone passcode on this device, turn on app lock, and store this code somewhere that is not only
        on this phone (paper or a password manager work well).
      </AppText>
      <Button tone="primary" onPress={() => void handleShare()}>
        Share / save code
      </Button>
      <Button tone="quiet" onPress={handleContinue}>
        {continueLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  codeCard: {
    gap: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    padding: spacing.md
  },
  hint: {
    color: colors.mutedText,
    textAlign: "center"
  },
  codeText: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 2,
    textAlign: "center",
    color: colors.text
  }
});
