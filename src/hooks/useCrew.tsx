import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { CrewStoreState } from "../data/mockCrewData";
import { CURRENT_USER_ID, defaultCrewStore } from "../data/mockCrewData";
import {
  attachInvitePayloadToInvitation,
  buildInviteDraft,
  extendInviteExpiry,
  type SharedInvitePayload
} from "../services/crewInvites";
import { getPrimaryCaptain } from "../services/crewCaptain";
import { notifyCaptainOfNudgeDeleted } from "../services/captainAlerts";
import { loadCrewStore, saveCrewStore } from "../services/crewStorage";
import type {
  ConsentRecord,
  ConsentType,
  CrewInvitation,
  CrewMember,
  CrewMembership,
  CrewPermissionSet,
  CrewRequest,
  CrewRequestStatus,
  CrewRole,
  InviteMethod,
  Organisation,
  SupportedProfile
} from "../types/crew";
import { mergeRolePermissions } from "../types/crew";

type InviteDraft = {
  method: InviteMethod;
  contact: string;
  targetProfileId: string;
  roles: CrewRole[];
  permissions: CrewPermissionSet;
  consents: ConsentType[];
  relationship: string;
  memberName: string;
  personalMessage?: string;
};

export type SupportedCrewLink = {
  profile: SupportedProfile;
  membership: CrewMembership;
  invitation?: CrewInvitation;
};

type CrewContextValue = {
  isReady: boolean;
  activeProfile: SupportedProfile;
  activeProfileId: string;
  /** True when this user has set up Nudge me Ready for themselves (not invite-only). */
  hasOwnNudgeWorld: boolean;
  /** Supporting others without a personal nudge world yet. */
  isSupporterOnly: boolean;
  myMembershipId?: string;
  switchProfile: (profileId: string) => void;
  enableOwnNudgeWorld: () => void;
  setHasOwnNudgeWorld: (enabled: boolean) => void;
  profiles: SupportedProfile[];
  crewsISupport: SupportedProfile[];
  supportedCrewLinks: SupportedCrewLink[];
  pendingInvitesForMe: CrewInvitation[];
  inviteableProfiles: SupportedProfile[];
  myCrewMembers: CrewMember[];
  organisation: Organisation | null;
  hasOrganisationAccess: boolean;
  invitations: CrewInvitation[];
  requests: CrewRequest[];
  sendInvitation: (draft: InviteDraft, invitedByName: string) => CrewInvitation;
  resendInvitation: (membershipId: string, invitedByName?: string) => CrewInvitation;
  importSharedInvitation: (payload: import("../services/crewInvites").SharedInvitePayload) => CrewInvitation;
  findInvitation: (inviteId?: string) => CrewInvitation | undefined;
  acceptInvitation: (
    inviteId: string,
    userName?: string,
    terms?: { acceptedAt: string; version: string }
  ) => void;
  declineInvitation: (inviteId: string) => void;
  revokeMembership: (membershipId: string) => void;
  updateMembershipRoles: (membershipId: string, roles: CrewRole[]) => void;
  updateMembershipPermissions: (membershipId: string, permissions: CrewPermissionSet) => void;
  updateConsent: (membershipId: string, consent: ConsentRecord) => void;
  updateRequest: (requestId: string, status: CrewRequestStatus) => void;
  reportNudgeDeleted: (itemTitle: string, deletedByName: string) => void;
  renameSelfProfile: (name: string) => void;
  getCrewForProfile: (profileId: string) => CrewMember[];
  getOrganisationProfiles: () => SupportedProfile[];
  canInviteToProfile: (profileId: string) => boolean;
};

const CrewContext = createContext<CrewContextValue | undefined>(undefined);

function membershipToMember(membership: CrewMembership): CrewMember {
  return {
    id: membership.id,
    membershipId: membership.id,
    name: membership.memberName,
    email: membership.email,
    phone: membership.phone,
    roles: membership.roles,
    relationship: membership.relationship,
    permissions: membership.permissions,
    isPrimaryCaptain: membership.isPrimaryCaptain,
    status: membership.inviteStatus,
    consentStatus: membership.consentStatus,
    createdAt: membership.createdAt,
    updatedAt: membership.updatedAt,
    lastActiveAt: membership.lastActiveAt
  };
}

function useProvideCrew() {
  const [isReady, setIsReady] = useState(false);
  const [store, setStore] = useState<CrewStoreState>(defaultCrewStore);

  useEffect(() => {
    loadCrewStore()
      .then(setStore)
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) {
      saveCrewStore(store);
    }
  }, [isReady, store]);

  const activeProfile = useMemo(
    () => store.profiles.find((profile) => profile.id === store.activeProfileId) ?? store.profiles[0],
    [store.activeProfileId, store.profiles]
  );

  const selfProfileId = useMemo(
    () => store.profiles.find((profile) => profile.isSelf)?.id,
    [store.profiles]
  );

  /** Crews the current user joined via an accepted invite (not their own nudgee profile). */
  const supportedCrewLinks = useMemo(() => {
    const links: SupportedCrewLink[] = [];
    for (const membership of store.memberships) {
      if (membership.userId !== CURRENT_USER_ID || membership.inviteStatus !== "accepted") {
        continue;
      }
      const crew = store.crews.find((entry) => entry.id === membership.crewId);
      if (!crew || crew.supportedProfileId === selfProfileId) {
        continue;
      }
      const profile = store.profiles.find((entry) => entry.id === crew.supportedProfileId);
      if (!profile) {
        continue;
      }
      const invitation = store.invitations.find(
        (entry) => entry.membershipId === membership.id || (entry.targetCrewId === crew.id && entry.inviteeUserId === CURRENT_USER_ID)
      );
      links.push({ profile, membership, invitation });
    }
    return links;
  }, [selfProfileId, store.crews, store.invitations, store.memberships, store.profiles]);

  const crewsISupport = useMemo(() => supportedCrewLinks.map((link) => link.profile), [supportedCrewLinks]);

  const pendingInvitesForMe = useMemo(
    () =>
      store.invitations.filter(
        (invite) => invite.status === "sent" && invite.inviteeUserId === CURRENT_USER_ID && invite.targetProfileId !== selfProfileId
      ),
    [selfProfileId, store.invitations]
  );

  const myCrewMembers = useMemo(() => {
    const selfProfile = store.profiles.find((profile) => profile.id === store.activeProfileId);
    if (!selfProfile) {
      return [];
    }
    const crew = store.crews.find((entry) => entry.supportedProfileId === selfProfile.id);
    if (!crew) {
      return [];
    }
    return store.memberships
      .filter((membership) => membership.crewId === crew.id && membership.inviteStatus !== "revoked")
      .map(membershipToMember);
  }, [store.activeProfileId, store.crews, store.memberships, store.profiles]);

  const myMembershipId = useMemo(() => {
    const crew = store.crews.find((entry) => entry.supportedProfileId === store.activeProfileId);
    if (!crew) {
      return undefined;
    }
    return store.memberships.find(
      (membership) =>
        membership.crewId === crew.id && membership.userId === CURRENT_USER_ID && membership.inviteStatus === "accepted"
    )?.id;
  }, [store.activeProfileId, store.crews, store.memberships]);

  const organisation = useMemo(() => {
    const orgUser = store.organisationUsers.find((entry) => entry.userId === CURRENT_USER_ID);
    if (!orgUser) {
      return null;
    }
    return store.organisations.find((entry) => entry.id === orgUser.organisationId) ?? null;
  }, [store.organisationUsers, store.organisations]);

  function canInviteToProfile(profileId: string) {
    const profile = store.profiles.find((entry) => entry.id === profileId);
    if (!profile) {
      return false;
    }
    if (profile.isSelf || profile.userId === CURRENT_USER_ID) {
      return true;
    }
    const crew = store.crews.find((entry) => entry.supportedProfileId === profileId);
    if (!crew) {
      return false;
    }
    return store.memberships.some(
      (membership) =>
        membership.crewId === crew.id &&
        membership.userId === CURRENT_USER_ID &&
        membership.inviteStatus === "accepted" &&
        (membership.isPrimaryCaptain || membership.roles.includes("captain"))
    );
  }

  const inviteableProfiles = useMemo(() => {
    return store.profiles.filter((profile) => {
      if (profile.isSelf || profile.userId === CURRENT_USER_ID) {
        return true;
      }
      const crew = store.crews.find((entry) => entry.supportedProfileId === profile.id);
      if (!crew) {
        return false;
      }
      return store.memberships.some(
        (membership) =>
          membership.crewId === crew.id &&
          membership.userId === CURRENT_USER_ID &&
          membership.inviteStatus === "accepted" &&
          (membership.isPrimaryCaptain || membership.roles.includes("captain"))
      );
    });
  }, [store.crews, store.memberships, store.profiles]);

  function switchProfile(profileId: string) {
    setStore((current) => {
      const profile = current.profiles.find((entry) => entry.id === profileId);
      if (!profile) {
        return current;
      }
      if (profile.isSelf && !current.hasOwnNudgeWorld) {
        return current;
      }
      return { ...current, activeProfileId: profileId };
    });
  }

  function setHasOwnNudgeWorld(enabled: boolean) {
    setStore((current) => {
      const selfId = current.profiles.find((profile) => profile.isSelf)?.id;
      if (enabled) {
        return {
          ...current,
          hasOwnNudgeWorld: true,
          activeProfileId: selfId ?? current.activeProfileId
        };
      }
      const supportedProfileId = current.memberships
        .filter(
          (membership) =>
            membership.userId === CURRENT_USER_ID && membership.inviteStatus === "accepted"
        )
        .map((membership) => current.crews.find((crew) => crew.id === membership.crewId)?.supportedProfileId)
        .find((profileId) => profileId && profileId !== selfId);
      return {
        ...current,
        hasOwnNudgeWorld: false,
        activeProfileId: supportedProfileId ?? current.activeProfileId
      };
    });
  }

  function enableOwnNudgeWorld() {
    setStore((current) => {
      const selfId = current.profiles.find((profile) => profile.isSelf)?.id ?? current.activeProfileId;
      return {
        ...current,
        hasOwnNudgeWorld: true,
        activeProfileId: selfId
      };
    });
  }

  function getCrewIdForProfile(profileId: string) {
    return store.crews.find((crew) => crew.supportedProfileId === profileId)?.id;
  }

  function sendInvitation(draft: InviteDraft, invitedByName: string) {
    const targetProfile = store.profiles.find((profile) => profile.id === draft.targetProfileId);
    const crewId = getCrewIdForProfile(draft.targetProfileId);
    if (!targetProfile || !crewId) {
      throw new Error("Profile or crew not found");
    }
    if (!canInviteToProfile(draft.targetProfileId)) {
      throw new Error("Only the nudgee or their Crew Captain can send invites for this crew.");
    }

    const inviteId = `invite-${Date.now()}`;
    const membershipId = `membership-${Date.now()}`;
    const contactIsEmail = draft.contact.includes("@");
    const invitation = buildInviteDraft({
      inviteId,
      invitedByName,
      targetProfileName: targetProfile.name,
      method: draft.method,
      roles: draft.roles,
      permissions: draft.permissions,
      consents: draft.consents,
      email: contactIsEmail ? draft.contact : undefined,
      phone: contactIsEmail ? undefined : draft.contact,
      personalMessage: draft.personalMessage,
      invitedByUserId: CURRENT_USER_ID,
      targetCrewId: crewId,
      targetProfileId: targetProfile.id,
      membershipId,
      targetCrewName: store.crews.find((crew) => crew.id === crewId)?.name,
      avatarSymbol: targetProfile.avatarSymbol
    });

    const membership: CrewMembership = {
      id: membershipId,
      crewId,
      memberName: draft.memberName,
      email: contactIsEmail ? draft.contact : undefined,
      phone: contactIsEmail ? undefined : draft.contact,
      roles: draft.roles,
      permissions: draft.permissions,
      inviteStatus: "sent",
      consentStatus: draft.consents.map((type) => ({ type, granted: false })),
      relationship: draft.relationship,
      isPrimaryCaptain: false,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt
    };

    setStore((current) => ({
      ...current,
      invitations: [...current.invitations, invitation],
      memberships: [...current.memberships, membership]
    }));

    return invitation;
  }

  function resendInvitation(membershipId: string, invitedByName = "You") {
    const membership = store.memberships.find((entry) => entry.id === membershipId);
    if (!membership) {
      throw new Error("Crew member not found");
    }
    if (membership.inviteStatus !== "sent" && membership.inviteStatus !== "draft" && membership.inviteStatus !== "expired") {
      throw new Error("This invite can’t be resent");
    }

    const crew = store.crews.find((entry) => entry.id === membership.crewId);
    const targetProfile = store.profiles.find((profile) => profile.id === crew?.supportedProfileId);
    if (!crew || !targetProfile) {
      throw new Error("Crew not found");
    }
    if (!canInviteToProfile(targetProfile.id)) {
      throw new Error("Only the nudgee or their Crew Captain can resend invites for this crew.");
    }

    const existing = store.invitations.find(
      (entry) => entry.membershipId === membershipId && (entry.status === "sent" || entry.status === "expired" || entry.status === "draft")
    );

    if (existing) {
      const refreshed = extendInviteExpiry(existing);
      setStore((current) => ({
        ...current,
        invitations: current.invitations.map((entry) => (entry.id === existing.id ? refreshed : entry)),
        memberships: current.memberships.map((entry) =>
          entry.id === membershipId
            ? { ...entry, inviteStatus: "sent", updatedAt: refreshed.updatedAt }
            : entry
        )
      }));
      return refreshed;
    }

    const inviteId = `invite-resend-${Date.now()}`;
    const invitation = buildInviteDraft({
      inviteId,
      invitedByName,
      targetProfileName: targetProfile.name,
      method: membership.email ? "email" : membership.phone ? "sms" : "link",
      roles: membership.roles,
      permissions: membership.permissions,
      consents: membership.consentStatus.map((consent) => consent.type),
      email: membership.email,
      phone: membership.phone,
      invitedByUserId: CURRENT_USER_ID,
      targetCrewId: crew.id,
      targetProfileId: targetProfile.id,
      membershipId
    });

    setStore((current) => ({
      ...current,
      invitations: [...current.invitations, invitation],
      memberships: current.memberships.map((entry) =>
        entry.id === membershipId
          ? { ...entry, inviteStatus: "sent", updatedAt: invitation.updatedAt }
          : entry
      )
    }));

    return invitation;
  }

  const importSharedInvitation = useCallback((payload: SharedInvitePayload) => {
    const invitation = {
      ...payload.invitation,
      inviteLink: attachInvitePayloadToInvitation(payload.invitation, payload).inviteLink
    };

    setStore((current) => {
      const hasInvite = current.invitations.some((entry) => entry.id === invitation.id);
      const hasProfile = current.profiles.some((profile) => profile.id === payload.targetProfile.id);
      const hasCrew = current.crews.some((crew) => crew.id === payload.crew.id);
      const hasMembership = current.memberships.some((membership) => membership.id === invitation.membershipId);
      const now = new Date().toISOString();

      return {
        ...current,
        profiles: hasProfile
          ? current.profiles
          : [
              ...current.profiles,
              {
                id: payload.targetProfile.id,
                name: payload.targetProfile.name,
                userId: `user-${payload.targetProfile.id}`,
                isSelf: false,
                avatarSymbol: payload.targetProfile.avatarSymbol ?? "💙"
              }
            ],
        crews: hasCrew
          ? current.crews
          : [
              ...current.crews,
              {
                id: payload.crew.id,
                supportedProfileId: payload.crew.supportedProfileId,
                name: payload.crew.name,
                createdAt: invitation.createdAt ?? now,
                updatedAt: now
              }
            ],
        invitations: hasInvite
          ? current.invitations.map((entry) => (entry.id === invitation.id ? invitation : entry))
          : [...current.invitations, invitation],
        memberships: hasMembership
          ? current.memberships
          : [
              ...current.memberships,
              {
                id: invitation.membershipId,
                crewId: payload.crew.id,
                memberName: "Pending supporter",
                email: invitation.email,
                phone: invitation.phone,
                roles: invitation.proposedRoles,
                permissions: invitation.proposedPermissions,
                inviteStatus: invitation.status === "accepted" ? "accepted" : "sent",
                consentStatus: (invitation.proposedConsents ?? []).map((type) => ({ type, granted: false })),
                relationship: "Crew invite",
                isPrimaryCaptain: false,
                createdAt: invitation.createdAt ?? now,
                updatedAt: now
              }
            ]
      };
    });

    return invitation;
  }, []);

  const findInvitation = useCallback(
    (inviteId?: string) => {
      if (!inviteId) return undefined;
      return store.invitations.find((entry) => entry.id === inviteId);
    },
    [store.invitations]
  );

  function acceptInvitation(
    inviteId: string,
    userName = "Me",
    terms?: { acceptedAt: string; version: string }
  ) {
    setStore((current) => {
      const invitation = current.invitations.find((entry) => entry.id === inviteId);
      if (!invitation || (invitation.status !== "sent" && invitation.status !== "draft")) {
        return current;
      }
      if (!terms?.acceptedAt || !terms?.version) {
        return current;
      }
      const now = new Date().toISOString();
      const hasMembership = current.memberships.some((membership) => membership.id === invitation.membershipId);
      const memberships = hasMembership
        ? current.memberships.map((membership) =>
            membership.id === invitation.membershipId
              ? {
                  ...membership,
                  inviteStatus: "accepted" as const,
                  userId: CURRENT_USER_ID,
                  memberName: userName,
                  supporterTermsAcceptedAt: terms.acceptedAt,
                  supporterTermsVersion: terms.version,
                  updatedAt: now,
                  lastActiveAt: now
                }
              : membership
          )
        : [
            ...current.memberships,
            {
              id: invitation.membershipId,
              userId: CURRENT_USER_ID,
              crewId: invitation.targetCrewId,
              memberName: userName,
              email: invitation.email,
              phone: invitation.phone,
              roles: invitation.proposedRoles,
              permissions: invitation.proposedPermissions,
              inviteStatus: "accepted" as const,
              consentStatus: (invitation.proposedConsents ?? []).map((type) => ({ type, granted: false })),
              relationship: "Crew invite",
              isPrimaryCaptain: false,
              supporterTermsAcceptedAt: terms.acceptedAt,
              supporterTermsVersion: terms.version,
              createdAt: now,
              updatedAt: now,
              lastActiveAt: now
            }
          ];

      return {
        ...current,
        activeProfileId: invitation.targetProfileId,
        // Accepting a crew invite grants access to that nudgee only.
        // Keep an existing personal world if they already set one up; otherwise stay supporter-only.
        hasOwnNudgeWorld: current.hasOwnNudgeWorld !== false,
        invitations: current.invitations.map((entry) =>
          entry.id === inviteId
            ? {
                ...entry,
                status: "accepted",
                acceptedAt: now,
                updatedAt: now,
                inviteeUserId: CURRENT_USER_ID,
                supporterTermsAcceptedAt: terms.acceptedAt,
                supporterTermsVersion: terms.version
              }
            : entry
        ),
        memberships
      };
    });
  }

  function declineInvitation(inviteId: string) {
    setStore((current) => {
      const invitation = current.invitations.find((entry) => entry.id === inviteId);
      const now = new Date().toISOString();
      return {
        ...current,
        invitations: current.invitations.map((entry) =>
          entry.id === inviteId ? { ...entry, status: "declined", updatedAt: now } : entry
        ),
        memberships: invitation
          ? current.memberships.map((membership) =>
              membership.id === invitation.membershipId
                ? { ...membership, inviteStatus: "declined", updatedAt: now }
                : membership
            )
          : current.memberships
      };
    });
  }

  function revokeMembership(membershipId: string) {
    setStore((current) => ({
      ...current,
      memberships: current.memberships.map((membership) =>
        membership.id === membershipId
          ? { ...membership, inviteStatus: "revoked", updatedAt: new Date().toISOString() }
          : membership
      )
    }));
  }

  function updateMembershipRoles(membershipId: string, roles: CrewRole[]) {
    setStore((current) => ({
      ...current,
      memberships: current.memberships.map((membership) =>
        membership.id === membershipId
          ? {
              ...membership,
              roles,
              permissions: mergeRolePermissions(roles),
              updatedAt: new Date().toISOString()
            }
          : membership
      )
    }));
  }

  function updateMembershipPermissions(membershipId: string, permissions: CrewPermissionSet) {
    setStore((current) => ({
      ...current,
      memberships: current.memberships.map((membership) =>
        membership.id === membershipId
          ? { ...membership, permissions, updatedAt: new Date().toISOString() }
          : membership
      )
    }));
  }

  function updateConsent(membershipId: string, consent: ConsentRecord) {
    setStore((current) => ({
      ...current,
      memberships: current.memberships.map((membership) => {
        if (membership.id !== membershipId) {
          return membership;
        }
        const others = membership.consentStatus.filter((entry) => entry.type !== consent.type);
        return {
          ...membership,
          consentStatus: [...others, consent],
          updatedAt: new Date().toISOString()
        };
      })
    }));
  }

  function updateRequest(requestId: string, status: CrewRequestStatus) {
    setStore((current) => ({
      ...current,
      requests: current.requests.map((request) => (request.id === requestId ? { ...request, status } : request))
    }));
  }

  function reportNudgeDeleted(itemTitle: string, deletedByName: string) {
    const captain = getPrimaryCaptain(myCrewMembers);
    if (!captain) {
      return;
    }

    const alert: CrewRequest = {
      id: `nudge-deleted-${Date.now()}`,
      crewMemberId: captain.membershipId,
      crewMemberName: captain.name,
      title: "Nudge deleted",
      message: `${deletedByName} deleted “${itemTitle}” from ${activeProfile.name}'s nudges.`,
      status: "pending",
      createdAt: new Date().toISOString(),
      kind: "nudge_deleted"
    };

    setStore((current) => ({
      ...current,
      requests: [alert, ...current.requests]
    }));

    void notifyCaptainOfNudgeDeleted({
      captain,
      itemTitle,
      deletedByName,
      profileName: activeProfile.name
    });
  }

  function renameSelfProfile(name: string) {
    const cleaned = name.trim();
    if (!cleaned) {
      return;
    }
    const now = new Date().toISOString();
    setStore((current) => {
      const self = current.profiles.find((profile) => profile.isSelf);
      if (!self) {
        return current;
      }
      return {
        ...current,
        profiles: current.profiles.map((profile) =>
          profile.id === self.id ? { ...profile, name: cleaned } : profile
        ),
        crews: current.crews.map((crew) =>
          crew.supportedProfileId === self.id
            ? { ...crew, name: `${cleaned}'s Crew`, updatedAt: now }
            : crew
        )
      };
    });
  }

  function getCrewForProfile(profileId: string) {
    const crewId = getCrewIdForProfile(profileId);
    if (!crewId) {
      return [];
    }
    return store.memberships
      .filter((membership) => membership.crewId === crewId && membership.inviteStatus !== "revoked")
      .map(membershipToMember);
  }

  function getOrganisationProfiles() {
    if (!organisation) {
      return [];
    }
    const profileIds = store.organisationProfiles
      .filter((entry) => entry.organisationId === organisation.id)
      .map((entry) => entry.supportedProfileId);
    return store.profiles.filter((profile) => profileIds.includes(profile.id));
  }

  return {
    isReady,
    activeProfile,
    activeProfileId: store.activeProfileId,
    hasOwnNudgeWorld: store.hasOwnNudgeWorld !== false,
    isSupporterOnly: store.hasOwnNudgeWorld === false,
    myMembershipId,
    switchProfile,
    enableOwnNudgeWorld,
    setHasOwnNudgeWorld,
    profiles: store.profiles,
    crewsISupport,
    supportedCrewLinks,
    pendingInvitesForMe,
    inviteableProfiles,
    myCrewMembers,
    organisation,
    hasOrganisationAccess: Boolean(organisation),
    invitations: store.invitations,
    requests: store.requests,
    sendInvitation,
    resendInvitation,
    importSharedInvitation,
    findInvitation,
    acceptInvitation,
    declineInvitation,
    revokeMembership,
    updateMembershipRoles,
    updateMembershipPermissions,
    updateConsent,
    updateRequest,
    reportNudgeDeleted,
    renameSelfProfile,
    getCrewForProfile,
    getOrganisationProfiles,
    canInviteToProfile
  };
}

export function CrewProvider({ children }: PropsWithChildren) {
  return <CrewContext.Provider value={useProvideCrew()}>{children}</CrewContext.Provider>;
}

export function useCrew() {
  const context = useContext(CrewContext);
  if (!context) {
    throw new Error("useCrew must be used inside CrewProvider");
  }
  return context;
}
