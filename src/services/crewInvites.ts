import type { ConsentType, CrewInvitation, CrewPermissionSet, CrewRole, InviteMethod } from "../types/crew";
import { mergeRolePermissions } from "../types/crew";

const INVITE_BASE = "https://nudgemeready.app/invite";
const APP_SCHEME = "nudge-me://invite";

export type SharedInvitePayload = {
  v: 1;
  invitation: CrewInvitation;
  targetProfile: {
    id: string;
    name: string;
    avatarSymbol?: string;
  };
  crew: {
    id: string;
    name: string;
    supportedProfileId: string;
  };
};

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const base64 =
    typeof globalThis.btoa === "function" ? globalThis.btoa(binary) : manualBase64Encode(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function manualBase64Encode(binary: string) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  for (let i = 0; i < binary.length; i += 3) {
    const a = binary.charCodeAt(i);
    const b = binary.charCodeAt(i + 1);
    const c = binary.charCodeAt(i + 2);
    const triplet = (a << 16) | ((Number.isNaN(b) ? 0 : b) << 8) | (Number.isNaN(c) ? 0 : c);
    output += chars[(triplet >> 18) & 63];
    output += chars[(triplet >> 12) & 63];
    output += Number.isNaN(b) ? "=" : chars[(triplet >> 6) & 63];
    output += Number.isNaN(c) ? "=" : chars[triplet & 63];
  }
  return output;
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const withPad = padded + "=".repeat((4 - (padded.length % 4)) % 4);
  const binary =
    typeof globalThis.atob === "function"
      ? globalThis.atob(withPad)
      : manualBase64Decode(withPad);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function manualBase64Decode(value: string) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const cleaned = value.replace(/=+$/g, "");
  let output = "";
  for (let i = 0; i < cleaned.length; i += 4) {
    const a = chars.indexOf(cleaned[i] ?? "A");
    const b = chars.indexOf(cleaned[i + 1] ?? "A");
    const c = chars.indexOf(cleaned[i + 2] ?? "A");
    const d = chars.indexOf(cleaned[i + 3] ?? "A");
    const triplet = (a << 18) | (b << 12) | ((c & 63) << 6) | (d & 63);
    output += String.fromCharCode((triplet >> 16) & 255);
    if (cleaned[i + 2] && cleaned[i + 2] !== "=") output += String.fromCharCode((triplet >> 8) & 255);
    if (cleaned[i + 3] && cleaned[i + 3] !== "=") output += String.fromCharCode(triplet & 255);
  }
  return output;
}

export function encodeSharedInvitePayload(payload: SharedInvitePayload) {
  return toBase64Url(JSON.stringify(payload));
}

export function decodeSharedInvitePayload(raw: string): SharedInvitePayload | null {
  try {
    const parsed = JSON.parse(fromBase64Url(raw)) as SharedInvitePayload;
    if (parsed?.v !== 1 || !parsed.invitation?.id || !parsed.crew?.id || !parsed.targetProfile?.id) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function buildInviteLink(inviteId: string, payloadToken?: string) {
  if (payloadToken) {
    return `${INVITE_BASE}/${inviteId}?d=${payloadToken}`;
  }
  return `${INVITE_BASE}/${inviteId}`;
}

export function buildAppInviteLink(inviteId: string, payloadToken?: string) {
  if (payloadToken) {
    return `${APP_SCHEME}/${inviteId}?d=${payloadToken}`;
  }
  return `${APP_SCHEME}/${inviteId}`;
}

export function buildSharedInvitePayload(input: {
  invitation: CrewInvitation;
  targetProfileName: string;
  targetProfileId: string;
  targetCrewId: string;
  targetCrewName: string;
  avatarSymbol?: string;
}): SharedInvitePayload {
  const tokenPayload: SharedInvitePayload = {
    v: 1,
    invitation: input.invitation,
    targetProfile: {
      id: input.targetProfileId,
      name: input.targetProfileName,
      avatarSymbol: input.avatarSymbol
    },
    crew: {
      id: input.targetCrewId,
      name: input.targetCrewName,
      supportedProfileId: input.targetProfileId
    }
  };
  return tokenPayload;
}

export function attachInvitePayloadToInvitation(
  invitation: CrewInvitation,
  payload: SharedInvitePayload
): CrewInvitation {
  const token = encodeSharedInvitePayload(payload);
  return {
    ...invitation,
    inviteLink: buildInviteLink(invitation.id, token)
  };
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
  membershipId: string;
  inviteeUserId?: string;
  targetCrewName?: string;
  avatarSymbol?: string;
}): CrewInvitation {
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + 14);

  const draft: CrewInvitation = {
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
    membershipId: input.membershipId,
    inviteeUserId: input.inviteeUserId,
    proposedRoles: input.roles,
    proposedPermissions: input.permissions ?? mergeRolePermissions(input.roles),
    proposedConsents: input.consents ?? [],
    status: "sent",
    personalMessage: input.personalMessage,
    expiresAt: expires.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  const payload = buildSharedInvitePayload({
    invitation: draft,
    targetProfileName: input.targetProfileName,
    targetProfileId: input.targetProfileId,
    targetCrewId: input.targetCrewId,
    targetCrewName: input.targetCrewName ?? `${input.targetProfileName}'s Crew`,
    avatarSymbol: input.avatarSymbol
  });

  return attachInvitePayloadToInvitation(draft, { ...payload, invitation: draft });
}

export function parseInviteFromUrl(url: string): { inviteId?: string; payload: SharedInvitePayload | null } {
  try {
    const normalized = url.replace("nudge-me://", "https://nudge-me.app/");
    const parsed = new URL(normalized);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const inviteIndex = parts.findIndex((part) => part === "invite");
    const inviteId = inviteIndex >= 0 ? parts[inviteIndex + 1] : parts[parts.length - 1];
    const token = parsed.searchParams.get("d") ?? undefined;
    return {
      inviteId: inviteId || undefined,
      payload: token ? decodeSharedInvitePayload(token) : null
    };
  } catch {
    return { inviteId: undefined, payload: null };
  }
}

export function getEmailInviteCopy(invite: CrewInvitation) {
  return {
    subject: "You've been invited to join a Crew on Nudge me Ready",
    body: `Hi,

You've been invited to join a Crew on Nudge me Ready.

Nudge me Ready helps people stay independent with gentle reminders, support and peace of mind for the people who care about them.

This invite gives you access to their nudges only. You only get your own reminders if you set up the app for yourself.

When you accept, you’ll agree to the Crew Supporter Terms — a short promise to be supportive, respect privacy, and stay within the role you’re offered.

Use the secure link below to review the invite and accept:

${invite.inviteLink}`
  };
}

export function getSmsInviteCopy(invite: CrewInvitation) {
  return `You've been invited to join a Crew on Nudge me Ready (access to their nudges only — set up the app yourself for your own):

${invite.inviteLink}`;
}

export function getWhatsAppInviteCopy(invite: CrewInvitation) {
  return `Hi, I'd like to invite you to join my Crew on Nudge me Ready.

You'll get access to my nudges only. Set up the app for yourself if you want your own reminders.

When you accept, you’ll agree to the Crew Supporter Terms (be supportive, respect privacy, stay in role).

Join using this secure link:

${invite.inviteLink}`;
}

export function getInviteMethodLabel(method: InviteMethod) {
  if (method === "email") return "Email";
  if (method === "sms") return "SMS";
  if (method === "whatsapp") return "WhatsApp";
  return "Copy link";
}

export function extendInviteExpiry(invite: CrewInvitation, days = 14): CrewInvitation {
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + days);
  const refreshed: CrewInvitation = {
    ...invite,
    status: "sent",
    expiresAt: expires.toISOString(),
    updatedAt: now.toISOString()
  };
  const payload = buildSharedInvitePayload({
    invitation: refreshed,
    targetProfileName: invite.targetProfileName,
    targetProfileId: invite.targetProfileId,
    targetCrewId: invite.targetCrewId,
    targetCrewName: `${invite.targetProfileName}'s Crew`
  });
  return attachInvitePayloadToInvitation(refreshed, { ...payload, invitation: refreshed });
}

export type InviteShareChannel = "email" | "sms" | "whatsapp" | "copy";

export function getInviteSharePayload(invite: CrewInvitation, channel: InviteShareChannel) {
  if (channel === "copy") {
    return { kind: "share" as const, message: invite.inviteLink };
  }
  if (channel === "email") {
    const copy = getEmailInviteCopy(invite);
    const to = invite.email ? encodeURIComponent(invite.email) : "";
    return {
      kind: "url" as const,
      url: `mailto:${to}?subject=${encodeURIComponent(copy.subject)}&body=${encodeURIComponent(copy.body)}`
    };
  }
  if (channel === "sms") {
    const to = invite.phone ? encodeURIComponent(invite.phone) : "";
    return {
      kind: "url" as const,
      url: `sms:${to}?body=${encodeURIComponent(getSmsInviteCopy(invite))}`
    };
  }
  return {
    kind: "url" as const,
    url: `https://wa.me/?text=${encodeURIComponent(getWhatsAppInviteCopy(invite))}`
  };
}
