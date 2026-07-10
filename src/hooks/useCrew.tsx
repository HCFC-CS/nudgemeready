import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import type { CrewStoreState } from "../data/mockCrewData";
import { CURRENT_USER_ID, defaultCrewStore } from "../data/mockCrewData";
import { buildInviteDraft } from "../services/crewInvites";
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

type CrewContextValue = {
  isReady: boolean;
  activeProfile: SupportedProfile;
  activeProfileId: string;
  myMembershipId?: string;
  switchProfile: (profileId: string) => void;
  profiles: SupportedProfile[];
  crewsISupport: SupportedProfile[];
  myCrewMembers: CrewMember[];
  organisation: Organisation | null;
  hasOrganisationAccess: boolean;
  invitations: CrewInvitation[];
  requests: CrewRequest[];
  sendInvitation: (draft: InviteDraft, invitedByName: string) => CrewInvitation;
  acceptInvitation: (inviteId: string, userName?: string) => void;
  declineInvitation: (inviteId: string) => void;
  revokeMembership: (membershipId: string) => void;
  updateMembershipRoles: (membershipId: string, roles: CrewRole[]) => void;
  updateMembershipPermissions: (membershipId: string, permissions: CrewPermissionSet) => void;
  updateConsent: (membershipId: string, consent: ConsentRecord) => void;
  updateRequest: (requestId: string, status: CrewRequestStatus) => void;
  getCrewForProfile: (profileId: string) => CrewMember[];
  getOrganisationProfiles: () => SupportedProfile[];
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

  const crewsISupport = useMemo(() => {
    const supportedCrewIds = store.memberships
      .filter((membership) => membership.userId === CURRENT_USER_ID && membership.inviteStatus === "accepted")
      .map((membership) => membership.crewId);
    const profileIds = store.crews
      .filter((crew) => supportedCrewIds.includes(crew.id))
      .map((crew) => crew.supportedProfileId)
      .filter((profileId) => profileId !== store.profiles.find((p) => p.isSelf)?.id);
    return store.profiles.filter((profile) => profileIds.includes(profile.id));
  }, [store.crews, store.memberships, store.profiles]);

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

  function switchProfile(profileId: string) {
    setStore((current) => ({ ...current, activeProfileId: profileId }));
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

    const inviteId = `invite-${Date.now()}`;
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
      targetProfileId: targetProfile.id
    });

    const membership: CrewMembership = {
      id: `membership-${Date.now()}`,
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

  function acceptInvitation(inviteId: string, userName = "New Crew member") {
    setStore((current) => {
      const invitation = current.invitations.find((entry) => entry.id === inviteId);
      if (!invitation) {
        return current;
      }
      const now = new Date().toISOString();
      return {
        ...current,
        invitations: current.invitations.map((entry) =>
          entry.id === inviteId ? { ...entry, status: "accepted", acceptedAt: now, updatedAt: now } : entry
        ),
        memberships: current.memberships.map((membership) =>
          membership.crewId === invitation.targetCrewId &&
          membership.memberName === invitation.targetProfileName &&
          membership.inviteStatus === "sent"
            ? { ...membership, inviteStatus: "accepted", userId: `user-${Date.now()}`, memberName: userName, updatedAt: now }
            : membership.crewId === invitation.targetCrewId && membership.inviteStatus === "sent"
              ? { ...membership, inviteStatus: "accepted", userId: CURRENT_USER_ID, updatedAt: now }
              : membership
        )
      };
    });
  }

  function declineInvitation(inviteId: string) {
    setStore((current) => ({
      ...current,
      invitations: current.invitations.map((entry) =>
        entry.id === inviteId ? { ...entry, status: "declined", updatedAt: new Date().toISOString() } : entry
      )
    }));
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
    myMembershipId,
    switchProfile,
    profiles: store.profiles,
    crewsISupport,
    myCrewMembers,
    organisation,
    hasOrganisationAccess: Boolean(organisation),
    invitations: store.invitations,
    requests: store.requests,
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    revokeMembership,
    updateMembershipRoles,
    updateMembershipPermissions,
    updateConsent,
    updateRequest,
    getCrewForProfile,
    getOrganisationProfiles
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
