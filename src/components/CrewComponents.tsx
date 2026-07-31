import { Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  CONSENT_LABELS,
  crewRoleCopy,
  defaultCrewPermissions,
  PERMISSION_LABELS,
  type ConsentType,
  type CrewMember,
  type CrewPermissionKey,
  type CrewPermissionSet,
  type CrewRequest,
  type CrewRequestStatus,
  type CrewRole
} from "../types/crew";
import { colors, radii, spacing } from "../theme/theme";
import { CategoryChip, PrimaryButton, SecondaryButton, SoftCard } from "./NudgeComponents";
import { AppText } from "./Text";

export function CrewMemberCard({
  member,
  isExpanded,
  onView,
  onEdit,
  onRemove,
  onResendLink,
  onRevokeConsent
}: {
  member: CrewMember;
  isExpanded?: boolean;
  onView: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onResendLink?: () => void;
  onRevokeConsent?: (type: ConsentType) => void;
}) {
  const roleLabels = member.roles
    .filter((role, index, all) => all.indexOf(role) === index)
    .map((role) => crewRoleCopy[role].title)
    .join(" · ");
  const canResend =
    Boolean(onResendLink) &&
    (member.status === "sent" || member.status === "draft" || member.status === "expired");

  return (
    <SoftCard style={styles.memberCard}>
      <Pressable onPress={onView} style={styles.memberHeader}>
        <View style={styles.avatar}>
          <AppText variant="small" style={styles.avatarLetter}>
            {member.name.charAt(0)}
          </AppText>
        </View>
        <View style={styles.memberText}>
          <View style={styles.nameRow}>
            <AppText variant="heading" numberOfLines={1} style={styles.memberName}>
              {member.name}
            </AppText>
            {member.isPrimaryCaptain ? <CaptainBadge /> : null}
          </View>
          <AppText variant="caption" numberOfLines={1} style={styles.metaLine}>
            {roleLabels}
            {member.relationship ? ` · ${member.relationship}` : ""}
            {member.status !== "accepted" ? ` · ${formatInviteStatus(member.status)}` : ""}
          </AppText>
        </View>
        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedText} />
      </Pressable>

      {isExpanded ? (
        <View style={styles.expanded}>
          {member.email ? <AppText variant="small">{member.email}</AppText> : null}
          {member.phone ? <AppText variant="small">{member.phone}</AppText> : null}
          <PermissionSummary permissions={member.permissions} />
          {member.consentStatus.length ? (
            <View style={styles.section}>
              <AppText variant="caption">Consent</AppText>
              {member.consentStatus.map((consent) => (
                <View key={consent.type} style={styles.consentRow}>
                  <AppText variant="caption">
                    {CONSENT_LABELS[consent.type]} · {consent.granted ? "On" : "Off"}
                  </AppText>
                  {consent.granted && onRevokeConsent ? (
                    <Pressable onPress={() => onRevokeConsent(consent.type)} hitSlop={8}>
                      <AppText variant="caption" style={styles.revokeLink}>
                        Revoke
                      </AppText>
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
          <View style={styles.buttonRow}>
            {canResend ? (
              <PrimaryButton size="compact" onPress={onResendLink}>
                Resend link
              </PrimaryButton>
            ) : null}
            <SecondaryButton size="compact" onPress={onEdit}>
              Roles
            </SecondaryButton>
            <SecondaryButton size="compact" onPress={onRemove}>
              Remove
            </SecondaryButton>
          </View>
        </View>
      ) : null}
    </SoftCard>
  );
}

export function MultiRoleSelector({
  selectedRoles,
  onToggle
}: {
  selectedRoles: CrewRole[];
  onToggle: (role: CrewRole) => void;
}) {
  const roles = Object.keys(crewRoleCopy) as CrewRole[];
  return (
    <View style={styles.section}>
      <View style={styles.roleGrid}>
        {roles.map((role) => {
          const selected = selectedRoles.includes(role);
          return (
            <Pressable
              key={role}
              onPress={() => onToggle(role)}
              style={[styles.roleCard, selected && styles.roleCardSelected]}
            >
              <AppText variant="heading">{crewRoleCopy[role].title}</AppText>
              <AppText variant="muted">{crewRoleCopy[role].shortDescription}</AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function PermissionEditor({
  permissions,
  onToggle
}: {
  permissions: CrewPermissionSet;
  onToggle: (key: CrewPermissionKey) => void;
}) {
  return (
    <View style={styles.chips}>
      {(Object.keys(PERMISSION_LABELS) as CrewPermissionKey[]).map((key) => (
        <CategoryChip
          key={key}
          label={PERMISSION_LABELS[key]}
          selected={permissions[key]}
          onPress={() => onToggle(key)}
        />
      ))}
    </View>
  );
}

export function PermissionSummary({
  member,
  role,
  permissions
}: {
  member?: CrewMember;
  role?: CrewRole;
  permissions?: CrewPermissionSet;
}) {
  const resolved = permissions ?? member?.permissions ?? defaultCrewPermissions[role ?? "observer"];
  const enabled = (Object.keys(PERMISSION_LABELS) as CrewPermissionKey[]).filter((key) => resolved[key]);

  return (
    <View style={styles.section}>
      <AppText variant="small">Can help with</AppText>
      <View style={styles.chips}>
        {enabled.slice(0, 6).map((key) => (
          <View key={key} style={styles.permissionPill}>
            <AppText variant="small">{PERMISSION_LABELS[key]}</AppText>
          </View>
        ))}
        {enabled.length > 6 ? (
          <View style={styles.permissionPill}>
            <AppText variant="small">+{enabled.length - 6} more</AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function CaptainBadge() {
  return (
    <View style={styles.captainBadge}>
      <AppText variant="small" style={styles.captainLabel}>
        Captain
      </AppText>
    </View>
  );
}

export function CrewRequestCard({
  request,
  onAction
}: {
  request: CrewRequest;
  onAction: (requestId: string, status: CrewRequestStatus) => void;
}) {
  const isDeletionAlert = request.kind === "nudge_deleted";

  return (
    <SoftCard style={styles.requestCard}>
      <AppText variant="heading">{request.title}</AppText>
      <AppText variant="small" numberOfLines={2}>
        {request.message}
      </AppText>
      <AppText variant="caption" style={styles.requestMeta}>
        {isDeletionAlert ? request.crewMemberName : `From ${request.crewMemberName}`}
      </AppText>
      <View style={styles.buttonRow}>
        {isDeletionAlert ? (
          <PrimaryButton size="compact" onPress={() => onAction(request.id, "accepted")}>
            Got it
          </PrimaryButton>
        ) : (
          <>
            <PrimaryButton size="compact" onPress={() => onAction(request.id, "accepted")}>
              Accept
            </PrimaryButton>
            <SecondaryButton size="compact" onPress={() => onAction(request.id, "snoozed")}>
              Later
            </SecondaryButton>
            <SecondaryButton size="compact" onPress={() => onAction(request.id, "declined")}>
              Decline
            </SecondaryButton>
          </>
        )}
      </View>
    </SoftCard>
  );
}

function formatInviteStatus(status: CrewMember["status"]) {
  if (status === "sent") return "Invite sent";
  if (status === "accepted") return "Active";
  if (status === "declined") return "Declined";
  if (status === "expired") return "Expired";
  if (status === "revoked") return "Access revoked";
  return "Draft";
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm
  },
  memberCard: {
    paddingVertical: spacing.md
  },
  memberHeader: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center"
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarLetter: {
    fontWeight: "700",
    color: colors.midnightBlue
  },
  memberText: {
    flex: 1,
    gap: 2
  },
  memberName: {
    flexShrink: 1
  },
  nameRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    alignItems: "center"
  },
  metaLine: {
    color: colors.mutedText
  },
  expanded: {
    marginTop: spacing.md,
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  permissionPill: {
    minHeight: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center"
  },
  captainBadge: {
    borderRadius: radii.sm,
    backgroundColor: colors.softGold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  captainLabel: {
    color: colors.midnightBlue,
    fontWeight: "700",
    fontSize: 11
  },
  roleGrid: {
    gap: spacing.sm
  },
  roleCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.xs
  },
  roleCardSelected: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.primarySoft
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  revokeLink: {
    color: colors.link,
    fontWeight: "600"
  },
  requestCard: {
    gap: spacing.xs
  },
  requestMeta: {
    color: colors.mutedText
  }
});
