import { Linking, Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Button } from "../components/Button";
import { PageHeader, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { colors, spacing } from "../theme/theme";

const PRIVACY_URL = "https://nudgemeready.app/privacy";
const SUPPORT_URL = "https://nudgemeready.app/support";
const SUPPORT_EMAIL = "mailto:support@nudgemeready.app";

export function LegalInfoScreen() {
  const navigation = useNavigation<any>();

  return (
    <Screen showTabMenu={false}>
      <PageHeader title="Privacy & support" subtitle="How Nudge me Ready looks after your information." showBack />

      <SoftCard>
        <AppText variant="heading">Privacy</AppText>
        <AppText variant="muted">
          Your nudges, notes, appointments, crew details, and settings stay on this phone and are encrypted
          at rest. We do not sync them to a cloud account yet.
        </AppText>
        <AppText variant="muted">
          Optional app lock (Face ID, PIN, or password) keeps the app private when you leave it. Permissions
          (contacts, calendars, location, microphone, notifications, camera) are only used for features you
          turn on.
        </AppText>
        <Button tone="quiet" onPress={() => void Linking.openURL(PRIVACY_URL)}>
          Open privacy policy
        </Button>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Support</AppText>
        <AppText variant="muted">
          Need help with sign-in, invites, calendars, or TestFlight builds? Email us or open the support page.
        </AppText>
        <Button tone="primary" onPress={() => void Linking.openURL(SUPPORT_EMAIL)}>
          Email support
        </Button>
        <Button tone="quiet" onPress={() => void Linking.openURL(SUPPORT_URL)}>
          Open support page
        </Button>
      </SoftCard>

      <View style={styles.footer}>
        <Pressable onPress={() => navigation.goBack()}>
          <AppText style={styles.back}>Back to Settings</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { alignItems: "center", paddingVertical: spacing.sm },
  back: { color: colors.accent, fontWeight: "600" }
});
