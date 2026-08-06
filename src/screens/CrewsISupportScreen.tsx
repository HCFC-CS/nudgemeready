import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, View } from "react-native";

import { CrewSwitcher } from "../components/CrewSwitcher";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useCrew } from "../hooks/useCrew";
import { crewRoleCopy } from "../types/crew";
import { colors, radii, shadows, spacing } from "../theme/theme";

export function CrewsISupportScreen() {
  const navigation = useNavigation<any>();
  const {
    supportedCrewLinks,
    pendingInvitesForMe,
    switchProfile,
    declineInvitation,
    isSupporterOnly,
    enableOwnNudgeWorld
  } = useCrew();

  return (
    <Screen>
      <CrewSwitcher />
      <PageHeader
        title="Crews I Support"
        subtitle="Only crews you’ve joined by invite — access to that nudgee only."
        showBack
      />

      {isSupporterOnly ? (
        <SoftCard style={styles.inviteCard}>
          <AppText variant="heading">Supporting only</AppText>
          <AppText variant="muted">
            You can open the people below. You don’t have your own nudges until you set up Nudge me Ready for yourself.
          </AppText>
          <PrimaryButton
            size="compact"
            onPress={() => {
              enableOwnNudgeWorld();
              navigation.navigate("Profile");
            }}
          >
            Set up for myself
          </PrimaryButton>
        </SoftCard>
      ) : null}
      {pendingInvitesForMe.length ? (
        <View style={styles.block}>
          <AppText variant="section">Invites for you</AppText>
          {pendingInvitesForMe.map((invite) => (
            <SoftCard key={invite.id} style={styles.inviteCard}>
              <AppText variant="heading">Support {invite.targetProfileName}</AppText>
              <AppText variant="small" style={styles.meta}>
                From {invite.invitedByName} ·{" "}
                {invite.proposedRoles.map((role) => crewRoleCopy[role].title).join(", ")}
              </AppText>
              {invite.personalMessage ? (
                <AppText variant="muted" numberOfLines={2}>
                  {invite.personalMessage}
                </AppText>
              ) : null}
              <AppText variant="caption" style={styles.meta}>
                You’ll review Crew Supporter Terms before joining.
              </AppText>
              <View style={styles.row}>
                <PrimaryButton
                  size="compact"
                  onPress={() => navigation.navigate("AcceptInvite", { inviteId: invite.id })}
                >
                  Review & accept
                </PrimaryButton>
                <SecondaryButton size="compact" onPress={() => declineInvitation(invite.id)}>
                  Decline
                </SecondaryButton>
              </View>
            </SoftCard>
          ))}
        </View>
      ) : null}

      <View style={styles.block}>
        <AppText variant="section">Attached crews</AppText>
        <View style={styles.list}>
          {supportedCrewLinks.map(({ profile: supported, membership, invitation }) => (
            <Pressable
              key={supported.id}
              onPress={() => {
                switchProfile(supported.id);
                navigation.navigate("Tabs", { screen: "Today" });
              }}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={styles.avatar}>
                <AppText variant="heading">{supported.avatarSymbol ?? supported.name.charAt(0)}</AppText>
              </View>
              <View style={styles.copy}>
                <AppText variant="heading">{supported.name}</AppText>
                <AppText variant="caption" style={styles.meta}>
                  {membership.roles.map((role) => crewRoleCopy[role].title).join(" · ")}
                  {invitation ? ` · Invited by ${invitation.invitedByName}` : ""}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedText} />
            </Pressable>
          ))}
        </View>

        {!supportedCrewLinks.length && !pendingInvitesForMe.length ? (
          <View style={styles.empty}>
            <AppText variant="heading">No crews yet</AppText>
            <AppText variant="muted" style={styles.emptyCopy}>
              You’ll appear here after the nudgee or their Crew Captain invites you, and you accept.
            </AppText>
          </View>
        ) : null}

        {!supportedCrewLinks.length && pendingInvitesForMe.length ? (
          <AppText variant="muted" style={styles.emptyCopy}>
            Accept an invite above to attach to that person’s crew.
          </AppText>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm
  },
  list: {
    gap: spacing.sm
  },
  inviteCard: {
    gap: spacing.sm
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm
  },
  cardPressed: {
    opacity: 0.92
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    gap: 2
  },
  meta: {
    color: colors.mutedText
  },
  empty: {
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    alignItems: "center"
  },
  emptyCopy: {
    textAlign: "center",
    lineHeight: 20
  }
});
