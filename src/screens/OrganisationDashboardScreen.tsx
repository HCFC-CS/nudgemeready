import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { CrewSwitcher } from "../components/CrewSwitcher";
import { StatPill } from "../components/ModernUI";
import { PageHeader, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useCrew } from "../hooks/useCrew";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { organisationTypeLabels, SAFEGUARDING_MESSAGE } from "../types/crew";
import { colors, radii, spacing } from "../theme/theme";

export function OrganisationDashboardScreen() {
  const { organisation, getOrganisationProfiles, getCrewForProfile, invitations } = useCrew();
  const { items } = useNudgeItems();
  const profiles = getOrganisationProfiles();

  const stats = useMemo(() => {
    const allMembers = profiles.flatMap((profile) => getCrewForProfile(profile.id));
    const openInvites = invitations.filter((invite) => invite.status === "sent").length;
    return {
      individuals: profiles.length,
      crewMembers: allMembers.length,
      openInvites,
      escalations: allMembers.filter((member) => member.status === "expired" || member.status === "revoked").length,
      safeguarding: 0
    };
  }, [profiles, getCrewForProfile, invitations]);

  if (!organisation) {
    return (
      <Screen>
        <PageHeader title="People We Support" subtitle="No organisation access on this account." showBack />
      </Screen>
    );
  }

  return (
    <Screen>
      <CrewSwitcher />
      <PageHeader
        title="People We Support"
        subtitle="Manage supported individuals, Crew access, nudges and escalations from one secure dashboard."
        showBack
      />

      <SoftCard>
        <AppText variant="heading">{organisation.name}</AppText>
        <AppText variant="muted">{organisationTypeLabels[organisation.type]}</AppText>
        <AppText variant="caption">{SAFEGUARDING_MESSAGE}</AppText>
      </SoftCard>

      <View style={styles.statsRow}>
        <StatPill label="Individuals" value={stats.individuals} />
        <StatPill label="Crew members" value={stats.crewMembers} />
        <StatPill label="Open invites" value={stats.openInvites} />
      </View>

      <View style={styles.statsRow}>
        <StatPill label="Escalations" value={stats.escalations} />
        <StatPill label="Safeguarding flags" value={stats.safeguarding} />
        <StatPill label="Licence seats" value={organisation.licenceSeats} />
      </View>

      <View style={styles.section}>
        <AppText variant="heading">Supported individuals</AppText>
        {profiles.length === 0 ? (
          <AppText variant="muted">No supported individuals yet.</AppText>
        ) : null}
        {profiles.map((profile) => {
          const crew = getCrewForProfile(profile.id);
          const open = items.filter((item) => item.status === "open").length;
          const done = items.filter((item) => item.status === "done").length;
          return (
            <SoftCard key={profile.id}>
              <AppText variant="heading">{profile.name}</AppText>
              <AppText variant="muted">{crew.length} Crew members assigned</AppText>
              <View style={styles.metaRow}>
                <MetaTag label="Open nudges" value={String(open)} />
                <MetaTag label="Completed" value={String(done)} />
                <MetaTag label="Crew" value={String(crew.length)} />
              </View>
            </SoftCard>
          );
        })}
      </View>

      <View style={styles.section}>
        <AppText variant="heading">Invite status</AppText>
        {invitations.length ? (
          invitations.map((invite) => (
            <SoftCard key={invite.id}>
              <AppText variant="body">{invite.targetProfileName}</AppText>
              <AppText variant="caption">
                {invite.inviteMethod} · {invite.status}
              </AppText>
            </SoftCard>
          ))
        ) : (
          <SoftCard>
            <AppText variant="muted">No organisation invites sent yet.</AppText>
          </SoftCard>
        )}
      </View>
    </Screen>
  );
}

function MetaTag({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaTag}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="small" style={styles.metaValue}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  section: {
    gap: spacing.sm
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  metaTag: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 2
  },
  metaValue: {
    fontWeight: "700",
    color: colors.primaryDark
  }
});
