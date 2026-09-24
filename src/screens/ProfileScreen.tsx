import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "../components/Button";
import { Field } from "../components/FormControls";
import { PageHeader, PrimaryButton, SecondaryButton, SectionHeading, SoftCard } from "../components/NudgeComponents";
import { ProfileAvatarPicker } from "../components/ProfileAvatarPicker";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { type ProfileDraft, useProfile } from "../hooks/useProfile";
import { useCrew } from "../hooks/useCrew";
import { spacing } from "../theme/theme";
import { formatDateOfBirthDisplay, validateDateOfBirthForSignup } from "../utils/dateOfBirth";

function cloneProfile(profile: ProfileDraft): ProfileDraft {
  return {
    name: profile.name,
    icon: profile.icon,
    avatarUri: profile.avatarUri,
    email: profile.email,
    phone: profile.phone,
    dateOfBirth: profile.dateOfBirth,
    authProvider: profile.authProvider
  };
}

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { profile, saveProfile } = useProfile();
  const { renameSelfProfile } = useCrew();
  const [draft, setDraft] = useState<ProfileDraft>(() => cloneProfile(profile));
  const [dobInput, setDobInput] = useState(() => formatDateOfBirthDisplay(profile.dateOfBirth));
  const [notice, setNotice] = useState("");

  useFocusEffect(
    useCallback(() => {
      setDraft(cloneProfile(profile));
      setDobInput(formatDateOfBirthDisplay(profile.dateOfBirth));
      setNotice("");
    }, [profile])
  );

  const isDirty = useMemo(
    () =>
      draft.name !== profile.name ||
      draft.email !== profile.email ||
      draft.phone !== profile.phone ||
      draft.dateOfBirth !== profile.dateOfBirth ||
      draft.icon !== profile.icon ||
      draft.avatarUri !== profile.avatarUri,
    [draft, profile]
  );

  function handleSave() {
    if (!isDirty && dobInput === formatDateOfBirthDisplay(profile.dateOfBirth)) {
      setNotice("No changes to save.");
      return;
    }
    try {
      const dateOfBirth = validateDateOfBirthForSignup(dobInput);
      saveProfile({ ...draft, dateOfBirth });
      renameSelfProfile(draft.name);
      setDraft((current) => ({ ...current, dateOfBirth }));
      setDobInput(formatDateOfBirthDisplay(dateOfBirth));
      setNotice("Profile saved.");
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : "Could not save profile.");
    }
  }

  function handleDiscard() {
    setDraft(cloneProfile(profile));
    setDobInput(formatDateOfBirthDisplay(profile.dateOfBirth));
    setNotice("Changes discarded.");
  }

  return (
    <Screen>
      <PageHeader title="Profile" subtitle="Your account details. Places and reminders live in Settings." />

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
          label="Date of birth"
          value={dobInput}
          onChangeText={(value) => {
            setNotice("");
            setDobInput(value.slice(0, 10));
          }}
          placeholder="DD/MM/YYYY"
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
        <SectionHeading
          title="Places & reminders"
          info="Home, work, school and leaving reminders are managed in Settings — not duplicated here."
        />
        <SecondaryButton size="compact" onPress={() => navigation.navigate("Settings")}>
          Open Settings
        </SecondaryButton>
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
