import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Alert, Linking, Pressable, Share, StyleSheet, View } from "react-native";

import { CrewMemberCard, CrewRequestCard } from "../components/CrewComponents";
import { CrewSwitcher } from "../components/CrewSwitcher";
import { EmptyState, PageHeader, PrimaryButton } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useCrew } from "../hooks/useCrew";
import { useProfile } from "../hooks/useProfile";
import { getInviteSharePayload, type InviteShareChannel } from "../services/crewInvites";
import {
  SAFEGUARDING_MESSAGE,
  type ConsentType,
  type CrewInvitation,
  type CrewMember,
  type CrewRequestStatus,
  type CrewRole
} from "../types/crew";
import { colors, radii, spacing } from "../theme/theme";

const roleCycle: CrewRole[] = ["captain", "guardian", "guide", "anchor", "cheerleader", "observer", "admin"];

export function MyCrewScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useProfile();
  const {
    myCrewMembers,
    requests,
    revokeMembership,
    updateMembershipRoles,
    updateConsent,
    updateRequest,
    resendInvitation
  } = useCrew();
  const [expandedMemberId, setExpandedMemberId] = useState<string>();
  const [notice, setNotice] = useState("");

  const acceptedMembers = useMemo(() => {
    const accepted = myCrewMembers.filter((member) => member.status === "accepted");
    return [...accepted].sort((a, b) => Number(b.isPrimaryCaptain) - Number(a.isPrimaryCaptain));
  }, [myCrewMembers]);

  const pendingMembers = useMemo(
    () =>
      myCrewMembers.filter(
        (member) => member.status === "sent" || member.status === "draft" || member.status === "expired"
      ),
    [myCrewMembers]
  );

  function removeMember(membershipId: string) {
    revokeMembership(membershipId);
    setNotice("Access revoked.");
  }

  function editMember(member: CrewMember) {
    const nextRole = member.roles[0] ?? "anchor";
    const roleIndex = roleCycle.indexOf(nextRole);
    const rotated = roleCycle[(roleIndex + 1) % roleCycle.length];
    updateMembershipRoles(member.membershipId, member.roles.includes(rotated) ? member.roles : [...member.roles, rotated]);
    setNotice(`Updated ${member.name}.`);
  }

  function revokeConsent(membershipId: string, type: ConsentType) {
    updateConsent(membershipId, { type, granted: false, revokedAt: new Date().toISOString() });
    setNotice("Consent revoked.");
  }

  async function shareResentInvite(invitation: CrewInvitation, channel: InviteShareChannel) {
    const payload = getInviteSharePayload(invitation, channel);
    if (payload.kind === "share") {
      await Share.share({ message: payload.message });
      return;
    }
    await Linking.openURL(payload.url);
  }

  function resendLink(member: CrewMember) {
    try {
      const invitation = resendInvitation(member.membershipId, profile.name.trim() || "You");
      const buttons: { text: string; onPress?: () => void; style?: "cancel" | "default" }[] = [
        {
          text: "Copy / share link",
          onPress: () => void shareResentInvite(invitation, "copy")
        }
      ];
      if (invitation.email) {
        buttons.push({
          text: "Email",
          onPress: () => void shareResentInvite(invitation, "email")
        });
      }
      if (invitation.phone) {
        buttons.push({
          text: "Text message",
          onPress: () => void shareResentInvite(invitation, "sms")
        });
      }
      buttons.push({
        text: "WhatsApp",
        onPress: () => void shareResentInvite(invitation, "whatsapp")
      });
      buttons.push({ text: "Done", style: "cancel" });

      Alert.alert(
        `Resend invite to ${member.name}`,
        "Share the invite link again. It stays valid for another 14 days.",
        buttons
      );
      setNotice(`Invite link ready to resend to ${member.name}.`);
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : "Could not resend invite.");
    }
  }

  return (
    <Screen>
      <CrewSwitcher />
      <PageHeader title="My Crew" subtitle="Your support circle." showBack />

      <View style={styles.topRow}>
        <PrimaryButton size="compact" onPress={() => navigation.navigate("InviteCrew")} style={styles.inviteBtn}>
          Invite
        </PrimaryButton>
        <AppText variant="caption" style={styles.privacyHint}>
          You choose what each person can see.
        </AppText>
      </View>

      {notice ? (
        <Pressable onPress={() => setNotice("")} style={styles.notice}>
          <AppText variant="small">{notice}</AppText>
          <Ionicons name="close" size={16} color={colors.mutedText} />
        </Pressable>
      ) : null}

      <CrewRequests requests={requests} onAction={updateRequest} />

      {acceptedMembers.length ? (
        <View style={styles.block}>
          <AppText variant="section">People</AppText>
          <View style={styles.list}>
            {acceptedMembers.map((member) => (
              <CrewMemberCard
                key={member.id}
                member={member}
                isExpanded={expandedMemberId === member.id}
                onView={() => setExpandedMemberId((current) => (current === member.id ? undefined : member.id))}
                onEdit={() => editMember(member)}
                onRemove={() => removeMember(member.membershipId)}
                onRevokeConsent={(type) => revokeConsent(member.membershipId, type)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {pendingMembers.length ? (
        <View style={styles.block}>
          <AppText variant="section">Pending</AppText>
          <View style={styles.list}>
            {pendingMembers.map((member) => (
              <CrewMemberCard
                key={member.id}
                member={member}
                isExpanded={expandedMemberId === member.id}
                onView={() => setExpandedMemberId((current) => (current === member.id ? undefined : member.id))}
                onEdit={() => editMember(member)}
                onRemove={() => removeMember(member.membershipId)}
                onResendLink={() => resendLink(member)}
                onRevokeConsent={(type) => revokeConsent(member.membershipId, type)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {!myCrewMembers.length ? (
        <EmptyState title="No one here yet" message="Invite someone you trust when you want support." />
      ) : null}

      <AppText variant="caption" style={styles.safeguard}>
        {SAFEGUARDING_MESSAGE}
      </AppText>
    </Screen>
  );
}

function CrewRequests({
  requests,
  onAction
}: {
  requests: ReturnType<typeof useCrew>["requests"];
  onAction: (requestId: string, status: CrewRequestStatus) => void;
}) {
  const pendingRequests = requests.filter((request) => request.status === "pending");
  if (!pendingRequests.length) {
    return null;
  }

  const deletionAlerts = pendingRequests.filter((request) => request.kind === "nudge_deleted");
  const suggestions = pendingRequests.filter((request) => request.kind !== "nudge_deleted");

  return (
    <View style={styles.block}>
      {deletionAlerts.length ? (
        <>
          <AppText variant="section">Alerts</AppText>
          <View style={styles.list}>
            {deletionAlerts.map((request) => (
              <CrewRequestCard key={request.id} request={request} onAction={onAction} />
            ))}
          </View>
        </>
      ) : null}
      {suggestions.length ? (
        <>
          <AppText variant="section">Suggestions</AppText>
          <View style={styles.list}>
            {suggestions.map((request) => (
              <CrewRequestCard key={request.id} request={request} onAction={onAction} />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm
  },
  inviteBtn: {
    minWidth: 96
  },
  privacyHint: {
    flex: 1,
    color: colors.mutedText
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm
  },
  block: {
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  list: {
    gap: spacing.sm
  },
  safeguard: {
    color: colors.mutedText,
    marginTop: spacing.md
  }
});
