import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { PermissionSummary } from "../components/CrewComponents";
import { Field } from "../components/FormControls";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import {
  CREW_SUPPORTER_ACCEPT_LABEL,
  CREW_SUPPORTER_COMMITMENTS,
  CREW_SUPPORTER_TERMS_INTRO,
  CREW_SUPPORTER_TERMS_VERSION
} from "../content/crewSupporterTerms";
import { useCrew } from "../hooks/useCrew";
import { useProfile } from "../hooks/useProfile";
import { decodeSharedInvitePayload } from "../services/crewInvites";
import { crewRoleCopy, SAFEGUARDING_MESSAGE } from "../types/crew";
import { colors, radii, spacing } from "../theme/theme";
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
    switchProfile,
    hasOwnNudgeWorld
  } = useCrew();
  const [mode, setMode] = useState<"choose" | "existing" | "new">("choose");
  const [newName, setNewName] = useState(profile.name);
  const [notice, setNotice] = useState("");
  const [importError, setImportError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

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
    if (!invitation || !termsAccepted) {
      setNotice("Please agree to the Crew Supporter Terms before joining.");
      return;
    }
    acceptInvitation(invitation.id, name.trim() || profile.name.trim() || "Me", {
      acceptedAt: new Date().toISOString(),
      version: CREW_SUPPORTER_TERMS_VERSION
    });
    switchProfile(invitation.targetProfileId);
    setNotice(
      hasOwnNudgeWorld
        ? "Invite accepted. You can switch between your nudges and this crew."
        : "Invite accepted. You have access to this nudgee only — set up the app for yourself if you want your own nudges."
    );
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

      <SoftCard>
        <AppText variant="heading">Access for this invite</AppText>
        <AppText variant="muted">
          Joining gives you access to {invitation.targetProfileName} only — their nudges and crew role. You do not get
          your own Nudge me Ready world unless you set the app up for yourself later.
        </AppText>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Crew Supporter Terms</AppText>
        <AppText variant="muted">{CREW_SUPPORTER_TERMS_INTRO}</AppText>
        {CREW_SUPPORTER_COMMITMENTS.map((item) => (
          <View key={item.title} style={styles.commitment}>
            <AppText variant="small" style={styles.commitmentTitle}>
              {item.title}
            </AppText>
            <AppText variant="caption">{item.body}</AppText>
          </View>
        ))}
        <Pressable onPress={() => navigation.navigate("CrewTerms")} style={styles.termsLink}>
          <AppText style={styles.linkLabel}>Read full Crew Supporter Terms</AppText>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("TermsOfUse")} style={styles.termsLink}>
          <AppText style={styles.linkLabel}>Read app Terms of Use (no liability)</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: termsAccepted }}
          onPress={() => {
            setTermsAccepted((current) => !current);
            setNotice("");
          }}
          style={styles.checkboxRow}
        >
          <Ionicons
            name={termsAccepted ? "checkbox" : "square-outline"}
            size={24}
            color={termsAccepted ? colors.primary : colors.mutedText}
          />
          <AppText variant="muted" style={styles.checkboxLabel}>
            {CREW_SUPPORTER_ACCEPT_LABEL}
          </AppText>
        </Pressable>
      </SoftCard>

      {mode === "choose" ? (
        <View style={styles.actions}>
          <PrimaryButton
            onPress={() => {
              if (!termsAccepted) {
                setNotice("Please agree to the Crew Supporter Terms before joining.");
                return;
              }
              setMode("existing");
            }}
          >
            Use this account
          </PrimaryButton>
          <SecondaryButton
            onPress={() => {
              if (!termsAccepted) {
                setNotice("Please agree to the Crew Supporter Terms before joining.");
                return;
              }
              setMode("new");
            }}
          >
            Use a different name
          </SecondaryButton>
          <SecondaryButton onPress={() => declineInvitation(invitation.id)}>Decline invite</SecondaryButton>
        </View>
      ) : null}

      {mode === "existing" ? (
        <View style={styles.actions}>
          <AppText variant="muted">Join as {profile.name.trim() || "Me"} and attach to this crew.</AppText>
          <PrimaryButton disabled={!termsAccepted} onPress={() => finishAccept(profile.name.trim() || "Me")}>
            Accept invite
          </PrimaryButton>
          <SecondaryButton onPress={() => setMode("choose")}>Back</SecondaryButton>
        </View>
      ) : null}

      {mode === "new" ? (
        <View style={styles.actions}>
          <Field label="Your name" value={newName} onChangeText={setNewName} placeholder="How should this Crew know you?" />
          <PrimaryButton disabled={!termsAccepted} onPress={() => finishAccept(newName)}>
            Accept and join
          </PrimaryButton>
          <SecondaryButton onPress={() => setMode("choose")}>Back</SecondaryButton>
        </View>
      ) : null}

      {notice ? <AppText variant="small">{notice}</AppText> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
  commitment: { gap: 2, marginTop: spacing.sm },
  commitmentTitle: { fontWeight: "700", color: colors.text },
  termsLink: { marginTop: spacing.sm, alignSelf: "flex-start" },
  linkLabel: { color: colors.accent, fontWeight: "600" },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft
  },
  checkboxLabel: { flex: 1 }
});
