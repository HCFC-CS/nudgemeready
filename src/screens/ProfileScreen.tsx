import { useNavigation } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";

import { Button } from "../components/Button";
import { Field } from "../components/FormControls";
import { PageHeader, SoftCard } from "../components/NudgeComponents";
import { ProfileAvatarPicker } from "../components/ProfileAvatarPicker";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useHomeSettings } from "../hooks/useHomeSettings";
import { useProfile } from "../hooks/useProfile";
import { getCurrentCoordinates } from "../services/locationReminders";
import {
  buildLeavingHomeSpeechText,
  hasHomeCoordinates
} from "../services/homeSettingsStorage";
import { colors, spacing } from "../theme/theme";

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { profile, updateName, updateEmail, updatePhone } = useProfile();
  const { homeSettings, setCoordinates } = useHomeSettings();

  async function handleUseCurrentLocation() {
    const coordinates = await getCurrentCoordinates();
    if (coordinates) {
      setCoordinates(coordinates.latitude, coordinates.longitude);
    }
  }

  return (
    <Screen>
      <PageHeader title="Profile" subtitle="Your account details and preferences." />

      <SoftCard>
        <AppText variant="heading">Home location</AppText>
        <AppText variant="muted">
          {hasHomeCoordinates(homeSettings)
            ? homeSettings.label.trim() || "Home saved"
            : "No home location saved yet."}
        </AppText>
        {hasHomeCoordinates(homeSettings) ? (
          <AppText variant="small" style={{ color: colors.mutedText }}>
            Reminder radius: {homeSettings.thresholdMeters} m ·{" "}
            {homeSettings.enabled ? "On" : "Off"}
          </AppText>
        ) : null}
        <AppText variant="muted">{buildLeavingHomeSpeechText(homeSettings.checklistItems)}</AppText>
        <View style={styles.homeActions}>
          <Button tone="secondary" onPress={handleUseCurrentLocation}>
            Use current location
          </Button>
          <Button tone="quiet" onPress={() => navigation.navigate("Settings")}>
            Home settings
          </Button>
        </View>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Account</AppText>
        <Field label="Name" value={profile.name} onChangeText={updateName} placeholder="Your name" />
        <Field label="Email" value={profile.email} onChangeText={updateEmail} placeholder="you@example.com" />
        <Field label="Phone" value={profile.phone} onChangeText={updatePhone} placeholder="Optional" />
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Profile picture</AppText>
        <ProfileAvatarPicker />
      </SoftCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  homeActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
