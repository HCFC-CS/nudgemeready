import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { CrewMemberCard, CrewRequestCard } from "../components/CrewComponents";
import { CrewSwitcher } from "../components/CrewSwitcher";
import { EmptyState, PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useCrew } from "../hooks/useCrew";
import { crewRoleCopy, SAFEGUARDING_MESSAGE, type ConsentType, type CrewMember, type CrewRequestStatus, type CrewRole } from "../types/crew";
import { colors, radii, spacing } from "../theme/theme";

const roleSections: CrewRole[] = ["captain", "guardian", "guide", "anchor", "cheerleader", "observer", "admin"];

export function MyCrewScreen() {
  const navigation = useNavigation<any>();
  const { myCrewMembers, requests, revokeMembership, updateMembershipRoles, updateConsent, updateRequest } = useCrew();
  const [expandedMemberId, setExpandedMemberId] = useState<string>();
  const [notice, setNotice] = useState("");

  const acceptedMembers = useMemo(
    () => myCrewMembers.filter((member) => member.status === "accepted"),
    [myCrewMembers]
  );
  const pendingMembers = useMemo(
    () => myCrewMembers.filter((member) => member.status === "sent" || member.status === "draft"),
    [myCrewMembers]
  );
  const captain = acceptedMembers.find((member) => member.isPrimaryCaptain || member.roles.includes("captain"));

  function removeMember(membershipId: string) {
    revokeMembership(membershipId);
    setNotice("Crew member access revoked.");
  }

  function editMember(member: CrewMember) {
    const nextRole = member.roles[0] ?? "anchor";
    const roleIndex = roleSections.indexOf(nextRole);
    const rotated = roleSections[(roleIndex + 1) % roleSections.length];
    updateMembershipRoles(member.membershipId, member.roles.includes(rotated) ? member.roles : [...member.roles, rotated]);
    setNotice(`Updated roles for ${member.name}.`);
  }

  function revokeConsent(membershipId: string, type: Parameters<typeof updateConsent>[1]["type"]) {
    updateConsent(membershipId, { type, granted: false, revokedAt: new Date().toISOString() });
    setNotice("Consent revoked.");
  }

  return (
    <Screen>
      <CrewSwitcher />
      <PageHeader title="My Crew" subtitle="People supporting you — on your terms." showBack />
      <View style={styles.actions}>
        <PrimaryButton onPress={() => navigation.navigate("InviteCrew")}>Invite Crew member</PrimaryButton>
      </View>

      <SoftCard>
        <AppText variant="heading">You control what's shared</AppText>
        <AppText variant="muted">
          You decide what others can see. Sensitive medication, finance, location and wellbeing information needs your
          consent.
        </AppText>
        <AppText variant="caption" style={styles.safeguard}>
          {SAFEGUARDING_MESSAGE}
        </AppText>
      </SoftCard>

      {notice ? (
        <SoftCard>
          <AppText>{notice}</AppText>
        </SoftCard>
      ) : null}

      <CrewRequests requests={requests} onAction={updateRequest} />

      <CrewSection
        title="Crew Captain"
        members={captain ? [captain] : []}
        emptyMessage="Your primary support person can be marked as Crew Captain."
        expandedMemberId={expandedMemberId}
        onView={(id) => setExpandedMemberId((current) => (current === id ? undefined : id))}
        onEdit={editMember}
        onRemove={removeMember}
        onRevokeConsent={revokeConsent}
      />

      {roleSections.map((role) => (
        <CrewSection
          key={role}
          title={crewRoleCopy[role].title}
          members={acceptedMembers.filter((member) => member.roles.includes(role) && member.id !== captain?.id)}
          description={crewRoleCopy[role].uiCopy}
          emptyMessage={`No ${crewRoleCopy[role].title.toLowerCase()} yet.`}
          expandedMemberId={expandedMemberId}
          onView={(id) => setExpandedMemberId((current) => (current === id ? undefined : id))}
          onEdit={editMember}
          onRemove={removeMember}
          onRevokeConsent={revokeConsent}
        />
      ))}

      <CrewSection
        title="Pending invites"
        members={pendingMembers}
        emptyMessage="No pending invites right now."
        expandedMemberId={expandedMemberId}
        onView={(id) => setExpandedMemberId((current) => (current === id ? undefined : id))}
        onEdit={editMember}
        onRemove={removeMember}
        onRevokeConsent={revokeConsent}
      />

      {!myCrewMembers.length ? (
        <EmptyState title="Your Crew is empty" message="Invite someone you trust when you'd like support." />
      ) : null}
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
  return (
    <View style={styles.section}>
      <AppText variant="heading">Crew requests</AppText>
      {pendingRequests.map((request) => (
        <CrewRequestCard key={request.id} request={request} onAction={onAction} />
      ))}
    </View>
  );
}

function CrewSection({
  title,
  members,
  description,
  emptyMessage,
  expandedMemberId,
  onView,
  onEdit,
  onRemove,
  onRevokeConsent
}: {
  title: string;
  members: CrewMember[];
  description?: string;
  emptyMessage: string;
  expandedMemberId?: string;
  onView: (memberId: string) => void;
  onEdit: (member: CrewMember) => void;
  onRemove: (membershipId: string) => void;
  onRevokeConsent: (membershipId: string, type: ConsentType) => void;
}) {
  if (!members.length && title !== "Pending invites" && title !== "Crew Captain") {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText variant="heading">{title}</AppText>
        {description ? <AppText variant="muted">{description}</AppText> : null}
      </View>
      {members.length ? (
        members.map((member) => (
          <CrewMemberCard
            key={member.id}
            member={member}
            isExpanded={expandedMemberId === member.id}
            onView={() => onView(member.id)}
            onEdit={() => onEdit(member)}
            onRemove={() => onRemove(member.membershipId)}
            onRevokeConsent={(type) => onRevokeConsent(member.membershipId, type)}
          />
        ))
      ) : (
        <SoftCard>
          <AppText variant="muted">{emptyMessage}</AppText>
        </SoftCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm
  },
  section: {
    gap: spacing.md
  },
  sectionHeader: {
    gap: spacing.xs
  },
  safeguard: {
    marginTop: spacing.sm,
    lineHeight: 18
  }
});
