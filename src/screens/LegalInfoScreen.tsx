import { Linking, Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRef } from "react";

import { Button } from "../components/Button";
import { PageHeader, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { getAffiliateDisclosureLong } from "../services/affiliateLinks";
import { isDevAdminAvailable } from "../services/devAdmin";
import { colors, spacing } from "../theme/theme";

const PRIVACY_URL = "https://nudgemeready.app/privacy";
const SUPPORT_URL = "https://nudgemeready.app/support";
const SUPPORT_EMAIL = "mailto:support@nudgemeready.app";

export function LegalInfoScreen() {
  const navigation = useNavigation<any>();
  const versionTapRef = useRef({ count: 0, timer: null as ReturnType<typeof setTimeout> | null });

  function handleVersionTap() {
    if (!isDevAdminAvailable()) {
      return;
    }
    const state = versionTapRef.current;
    state.count += 1;
    if (state.timer) {
      clearTimeout(state.timer);
    }
    state.timer = setTimeout(() => {
      state.count = 0;
    }, 1800);
    if (state.count >= 7) {
      state.count = 0;
      navigation.navigate("DevAdmin");
    }
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader title="Privacy & support" subtitle="How Nudge me Ready looks after your information." showBack />

      <SoftCard>
        <AppText variant="heading">Privacy</AppText>
        <AppText variant="muted">
          Your nudges, notes, appointments, crew details, settings, and document attachments stay on this phone and
          are encrypted at rest. We do not sync them to a cloud account yet.
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
        <AppText variant="heading">If you forget your PIN or password</AppText>
        <AppText variant="muted">
          Recovery resets the lock only. It does not delete your nudges, profile, crew, or documents. Your data
          stays on this phone until you uninstall the app (or use an explicit Clear action in Settings).
        </AppText>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Terms of Use</AppText>
        <AppText variant="muted">
          Nudge me Ready is a guidance and supportive tool only. Missed reminders, deleted data, downtime, bugs,
          and outcomes of use are your responsibility — the app accepts no liability.
        </AppText>
        <Button tone="quiet" onPress={() => navigation.navigate("TermsOfUse")}>
          Read Terms of Use
        </Button>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Crew Supporter Terms</AppText>
        <AppText variant="muted">
          People who join a Crew agree to be supportive, respect privacy, and stay within the role they’re offered.
        </AppText>
        <Button tone="quiet" onPress={() => navigation.navigate("CrewTerms")}>
          Read Crew Supporter Terms
        </Button>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Partner / affiliate links</AppText>
        <AppText variant="muted">{getAffiliateDisclosureLong()}</AppText>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Health-related ReadyPacks</AppText>
        <AppText variant="muted">
          Packs that touch wellbeing or organisation around medication and emergencies are organisational support
          only. They do not diagnose, prescribe, or change medication. Always follow advice from your clinician.
        </AppText>
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
        <Pressable onPress={handleVersionTap} accessibilityRole="text">
          <AppText variant="caption" style={styles.version}>
            Nudge me Ready · on-device
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { alignItems: "center", paddingVertical: spacing.sm, gap: spacing.sm },
  back: { color: colors.accent, fontWeight: "600" },
  version: { color: colors.mutedText }
});
