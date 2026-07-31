import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "../components/Button";
import { Field } from "../components/FormControls";
import { HomeLocationPicker } from "../components/HomeLocationPicker";
import { PageHeader, PrimaryButton, SoftCard } from "../components/NudgeComponents";
import { ProfileAvatarPicker } from "../components/ProfileAvatarPicker";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useHomeSettings } from "../hooks/useHomeSettings";
import { type ProfileDraft, useProfile } from "../hooks/useProfile";
import { hasHomeCoordinates, hasReminderPlaces } from "../services/homeSettingsStorage";
import { colors, spacing } from "../theme/theme";

function cloneProfile(profile: ProfileDraft): ProfileDraft {
  return {
    name: profile.name,
    icon: profile.icon,
    avatarUri: profile.avatarUri,
    email: profile.email,
    phone: profile.phone
  };
}

export function ProfileScreen() {
  const { profile, saveProfile } = useProfile();
  const { homeSettings } = useHomeSettings();
  const [draft, setDraft] = useState<ProfileDraft>(() => cloneProfile(profile));
  const [notice, setNotice] = useState("");

  useFocusEffect(
    useCallback(() => {
      setDraft(cloneProfile(profile));
      setNotice("");
    }, [profile])
  );

  const isDirty = useMemo(
    () =>
      draft.name !== profile.name ||
      draft.email !== profile.email ||
      draft.phone !== profile.phone ||
      draft.icon !== profile.icon ||
      draft.avatarUri !== profile.avatarUri,
    [draft, profile]
  );

  function handleSave() {
    if (!isDirty) {
      setNotice("No changes to save.");
      return;
    }
    saveProfile(draft);
    setNotice("Profile saved.");
  }

  function handleDiscard() {
    setDraft(cloneProfile(profile));
    setNotice("Changes discarded.");
  }

  return (
    <Screen>
      <PageHeader title="Profile" subtitle="Your account details and preferences." />

      <SoftCard>
        <AppText variant="heading">Account</AppText>
        <Field
          label="Name"
          value={draft.name}
          onChangeText={(name) => {
            setNotice("");
            setDraft((current) => ({ ...current, name }));
          }}
          placeholder="Your name"
        />
        <Field
          label="Email"
          value={draft.email}
          onChangeText={(email) => {
            setNotice("");
            setDraft((current) => ({ ...current, email }));
          }}
          placeholder="you@example.com"
        />
        <Field
          label="Phone"
          value={draft.phone}
          onChangeText={(phone) => {
            setNotice("");
            setDraft((current) => ({ ...current, phone }));
          }}
          placeholder="Optional"
        />
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Profile picture</AppText>
        <ProfileAvatarPicker
          name={draft.name}
          icon={draft.icon}
          avatarUri={draft.avatarUri}
          onIconChange={(icon) => {
            setNotice("");
            setDraft((current) => ({ ...current, icon, avatarUri: undefined }));
          }}
          onAvatarChange={(avatarUri) => {
            setNotice("");
            setDraft((current) => ({ ...current, avatarUri }));
          }}
        />
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Save changes</AppText>
        <AppText variant="muted">
          {isDirty ? "You have unsaved profile updates." : "Account details are up to date."}
        </AppText>
        <View style={styles.saveRow}>
          <PrimaryButton onPress={handleSave}>Save profile</PrimaryButton>
          {isDirty ? (
            <Button tone="quiet" onPress={handleDiscard}>
              Discard
            </Button>
          ) : null}
        </View>
        {notice ? <AppText variant="small">{notice}</AppText> : null}
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Places</AppText>
        {hasHomeCoordinates(homeSettings) ? (
          <AppText variant="caption" style={{ color: colors.mutedText }}>
            {homeSettings.thresholdMeters} m ·{" "}
            {homeSettings.enabled && hasReminderPlaces(homeSettings) ? "Reminders on" : "Reminders off"}
          </AppText>
        ) : null}
        <HomeLocationPicker />
      </SoftCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  saveRow: {
    gap: spacing.sm,
    marginTop: spacing.xs
  }
});
