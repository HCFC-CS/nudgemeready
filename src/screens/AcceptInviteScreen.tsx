import { useRoute, type RouteProp } from "@react-navigation/native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { MultiRoleSelector, PermissionSummary } from "../components/CrewComponents";
import { Field } from "../components/FormControls";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useCrew } from "../hooks/useCrew";
import { crewRoleCopy, SAFEGUARDING_MESSAGE } from "../types/crew";
import { spacing } from "../theme/theme";
import type { RootStackParamList } from "../types/navigation";

type Route = RouteProp<RootStackParamList, "AcceptInvite">;

export function AcceptInviteScreen() {
  const route = useRoute<Route>();
  const { invitations, acceptInvitation, declineInvitation } = useCrew();
  const [mode, setMode] = useState<"choose" | "existing" | "new">("choose");
  const [newName, setNewName] = useState("");
  const [notice, setNotice] = useState("");

  const invitation =
    invitations.find((entry) => entry.id === route.params?.inviteId) ??
    ({
      id: route.params?.inviteId ?? "demo-invite",
      invitedByName: "Mum",
      targetProfileName: "Helen",
      proposedRoles: ["anchor" as const],
      proposedPermissions: {} as never,
      inviteLink: "https://nudgemeready.app/invite/demo",
      status: "sent" as const,
      inviteMethod: "link" as const,
      invitedByUserId: "",
      targetCrewId: "",
      targetProfileId: "",
      proposedConsents: [],
      expiresAt: "",
      createdAt: "",
      updatedAt: ""
    } satisfies (typeof invitations)[number]);

  function acceptExisting() {
    acceptInvitation(invitation.id);
    setNotice("Invite accepted. Welcome to the Crew.");
  }

  function acceptNewAccount() {
    acceptInvitation(invitation.id, newName.trim() || "New Crew member");
    setNotice("Account created and invite accepted.");
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
          <PrimaryButton onPress={() => setMode("existing")}>Log into existing account</PrimaryButton>
          <SecondaryButton onPress={() => setMode("new")}>Create a new account</SecondaryButton>
          <SecondaryButton onPress={() => declineInvitation(invitation.id)}>Decline invite</SecondaryButton>
        </View>
      ) : null}

      {mode === "existing" ? (
        <View style={styles.actions}>
          <AppText variant="muted">Use your existing Nudge Me Ready sign-in, then accept the invite.</AppText>
          <PrimaryButton onPress={acceptExisting}>Accept invite</PrimaryButton>
        </View>
      ) : null}

      {mode === "new" ? (
        <View style={styles.actions}>
          <Field label="Your name" value={newName} onChangeText={setNewName} placeholder="How should your Crew know you?" />
          <PrimaryButton onPress={acceptNewAccount}>Create account and join</PrimaryButton>
        </View>
      ) : null}

      {notice ? (
        <SoftCard>
          <AppText>{notice}</AppText>
        </SoftCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm
  }
});
