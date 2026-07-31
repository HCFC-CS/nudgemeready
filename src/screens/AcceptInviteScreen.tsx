import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { PermissionSummary } from "../components/CrewComponents";
import { Field } from "../components/FormControls";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useCrew } from "../hooks/useCrew";
import { useProfile } from "../hooks/useProfile";
import { decodeSharedInvitePayload } from "../services/crewInvites";
import { crewRoleCopy, SAFEGUARDING_MESSAGE } from "../types/crew";
import { spacing } from "../theme/theme";
import type { RootStackParamList } from "../types/navigation";

type Route = RouteProp<RootStackParamList, "AcceptInvite">;

export function AcceptInviteScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { profile } = useProfile();
  const {
    findInvitation,
    importSharedInvitation,
    acceptInvitation,
    declineInvitation,
    switchProfile
  } = useCrew();
  const [mode, setMode] = useState<"choose" | "existing" | "new">("choose");
  const [newName, setNewName] = useState(profile.name);
  const [notice, setNotice] = useState("");
  const [importError, setImportError] = useState("");

  const inviteId = route.params?.inviteId;
  const payloadToken = route.params?.payload;

  useEffect(() => {
    if (!payloadToken) return;
    const payload = decodeSharedInvitePayload(payloadToken);
    if (!payload) {
      setImportError("This invite link looks damaged. Ask for a fresh invite.");
      return;
    }
    importSharedInvitation(payload);
    setImportError("");
  }, [payloadToken, importSharedInvitation]);

  const invitation = useMemo(() => findInvitation(inviteId), [findInvitation, inviteId, payloadToken]);

  function finishAccept(name: string) {
    if (!invitation) {
      return;
    }
    acceptInvitation(invitation.id, name.trim() || profile.name.trim() || "Me");
    switchProfile(invitation.targetProfileId);
    setNotice("Invite accepted. This crew is now in Crews I Support.");
    navigation.navigate("CrewsISupport");
  }

  if (!invitation) {
    return (
      <Screen showTabMenu={false}>
        <PageHeader
          title="Invite not found"
          subtitle={
            importError ||
            "Open the full invite link from your email or message, or ask for a new invite."
          }
          showBack
        />
        <PrimaryButton onPress={() => navigation.navigate("CrewsISupport")}>Back to Crews I Support</PrimaryButton>
      </Screen>
    );
  }

  if (invitation.status === "accepted") {
    return (
      <Screen showTabMenu={false}>
        <PageHeader title="Already joined" subtitle={`${invitation.targetProfileName}'s Crew`} showBack />
        <PrimaryButton
          onPress={() => {
            switchProfile(invitation.targetProfileId);
            navigation.navigate("CrewsISupport");
          }}
        >
          Open Crews I Support
        </PrimaryButton>
      </Screen>
    );
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title="Join a Crew"
        subtitle={`${invitation.invitedByName} invited you to support ${invitation.targetProfileName}.`}
        showBack
      />

      <SoftCard>
        <AppText variant="heading">Roles offered</AppText>
        <AppText variant="muted">
          {invitation.proposedRoles.map((role) => crewRoleCopy[role].title).join(", ")}
        </AppText>
        <PermissionSummary permissions={invitation.proposedPermissions} />
        <AppText variant="caption">{SAFEGUARDING_MESSAGE}</AppText>
      </SoftCard>

      {mode === "choose" ? (
        <View style={styles.actions}>
          <PrimaryButton onPress={() => setMode("existing")}>Use this account</PrimaryButton>
          <SecondaryButton onPress={() => setMode("new")}>Use a different name</SecondaryButton>
          <SecondaryButton onPress={() => declineInvitation(invitation.id)}>Decline invite</SecondaryButton>
        </View>
      ) : null}

      {mode === "existing" ? (
        <View style={styles.actions}>
          <AppText variant="muted">Join as {profile.name.trim() || "Me"} and attach to this crew.</AppText>
          <PrimaryButton onPress={() => finishAccept(profile.name.trim() || "Me")}>Accept invite</PrimaryButton>
        </View>
      ) : null}

      {mode === "new" ? (
        <View style={styles.actions}>
          <Field label="Your name" value={newName} onChangeText={setNewName} placeholder="How should this Crew know you?" />
          <PrimaryButton onPress={() => finishAccept(newName)}>Accept and join</PrimaryButton>
        </View>
      ) : null}

      {notice ? <AppText variant="small">{notice}</AppText> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm }
});
