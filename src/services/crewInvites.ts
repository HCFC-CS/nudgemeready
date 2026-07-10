import type { ConsentType, CrewInvitation, CrewPermissionSet, CrewRole, InviteMethod } from "../types/crew";
import { mergeRolePermissions } from "../types/crew";

const INVITE_BASE = "https://nudgemeready.app/invite";

export function buildInviteLink(inviteId: string) {
  return `${INVITE_BASE}/${inviteId}`;
}

export function buildInviteDraft(input: {
  inviteId: string;
  invitedByName: string;
  targetProfileName: string;
  method: InviteMethod;
  roles: CrewRole[];
  permissions?: CrewPermissionSet;
  consents?: ConsentType[];
  email?: string;
  phone?: string;
  personalMessage?: string;
  invitedByUserId: string;
  targetCrewId: string;
  targetProfileId: string;
}): CrewInvitation {
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + 14);

  return {
    id: input.inviteId,
    invitedByUserId: input.invitedByUserId,
    invitedByName: input.invitedByName,
    inviteMethod: input.method,
    email: input.email,
    phone: input.phone,
    inviteLink: buildInviteLink(input.inviteId),
    targetCrewId: input.targetCrewId,
    targetProfileId: input.targetProfileId,
    targetProfileName: input.targetProfileName,
    proposedRoles: input.roles,
    proposedPermissions: input.permissions ?? mergeRolePermissions(input.roles),
    proposedConsents: input.consents ?? [],
    status: "sent",
    personalMessage: input.personalMessage,
    expiresAt: expires.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

export function getEmailInviteCopy(invite: CrewInvitation) {
  return {
    subject: "You've been invited to join a Crew on Nudge Me Ready",
    body: `Hi,

You've been invited to join a Crew on Nudge Me Ready.

Nudge Me Ready helps people stay independent with gentle reminders, support and peace of mind for the people who care about them.

Use the secure link below to accept your invite:

${invite.inviteLink}`
  };
}

export function getSmsInviteCopy(invite: CrewInvitation) {
  return `You've been invited to join a Crew on Nudge Me Ready.

Accept here:

${invite.inviteLink}`;
}

export function getWhatsAppInviteCopy(invite: CrewInvitation) {
  return `Hi, I'd like to invite you to join my Crew on Nudge Me Ready.

Nudge Me Ready helps me stay on track with gentle reminders and support.

You can join using this secure link:

${invite.inviteLink}`;
}

export function getInviteMethodLabel(method: InviteMethod) {
  if (method === "email") return "Email";
  if (method === "sms") return "SMS";
  if (method === "whatsapp") return "WhatsApp";
  return "Copy link";
}
