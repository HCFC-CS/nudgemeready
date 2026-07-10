import { Pressable, StyleSheet, View } from "react-native";

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
  onRevokeConsent
}: {
  member: CrewMember;
  isExpanded?: boolean;
  onView: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onRevokeConsent?: (type: ConsentType) => void;
}) {
  const roleLabels = member.roles.map((role) => crewRoleCopy[role].title).join(", ");

  return (
    <SoftCard>
      <View style={styles.memberHeader}>
        <View style={styles.avatar}>
          <AppText variant="heading">{member.name.charAt(0)}</AppText>
        </View>
        <View style={styles.memberText}>
          <View style={styles.nameRow}>
            <AppText variant="heading">{member.name}</AppText>
            {member.isPrimaryCaptain ? <CaptainBadge /> : null}
          </View>
          <AppText variant="muted">
            {roleLabels} · {member.relationship}
          </AppText>
          <AppText variant="caption" style={styles.statusLine}>
            {formatInviteStatus(member.status)}
          </AppText>
        </View>
      </View>
      <PermissionSummary permissions={member.permissions} />
      {isExpanded ? (
        <View style={styles.section}>
          {member.email ? <AppText>{member.email}</AppText> : null}
          {member.phone ? <AppText>{member.phone}</AppText> : null}
          {member.consentStatus.length ? (
            <View style={styles.section}>
              <AppText variant="small">Consent</AppText>
              {member.consentStatus.map((consent) => (
                <View key={consent.type} style={styles.consentRow}>
                  <AppText variant="caption">
                    {CONSENT_LABELS[consent.type]}: {consent.granted ? "Granted" : "Pending"}
                  </AppText>
                  {consent.granted && onRevokeConsent ? (
                    <SecondaryButton onPress={() => onRevokeConsent(consent.type)}>Revoke</SecondaryButton>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
      <View style={styles.buttonRow}>
        <SecondaryButton onPress={onView}>{isExpanded ? "Hide" : "View"}</SecondaryButton>
        <SecondaryButton onPress={onEdit}>Edit roles</SecondaryButton>
        <SecondaryButton onPress={onRemove}>Remove</SecondaryButton>
      </View>
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
  return (
    <SoftCard>
      <AppText variant="heading">{request.title}</AppText>
      <AppText>{request.message}</AppText>
      <AppText variant="muted">Suggested by {request.crewMemberName}</AppText>
      <View style={styles.buttonRow}>
        <PrimaryButton onPress={() => onAction(request.id, "accepted")}>Accept</PrimaryButton>
        <SecondaryButton onPress={() => onAction(request.id, "snoozed")}>Not now</SecondaryButton>
        <SecondaryButton onPress={() => onAction(request.id, "declined")}>Decline</SecondaryButton>
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
  memberHeader: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center"
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center"
  },
  memberText: {
    flex: 1,
    gap: spacing.xs
  },
  nameRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    alignItems: "center"
  },
  statusLine: {
    color: colors.mutedText
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
    minHeight: 34,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  captainBadge: {
    borderRadius: radii.md,
    backgroundColor: colors.softGold,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  captainLabel: {
    color: colors.midnightBlue,
    fontWeight: "700"
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
  }
});
