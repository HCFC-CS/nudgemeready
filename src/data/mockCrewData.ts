import type {
  Crew,
  CrewInvitation,
  CrewMembership,
  CrewRequest,
  Organisation,
  OrganisationSupportedProfile,
  OrganisationUser,
  SupportedProfile
} from "../types/crew";
import { defaultCrewPermissions, mergeRolePermissions } from "../types/crew";

export const CURRENT_USER_ID = "user-self";

/** Kept for screenshots / demos only — not used for real first launch. */
export const mockSupportedProfiles: SupportedProfile[] = [
  { id: "profile-helen", name: "Helen", userId: CURRENT_USER_ID, isSelf: true, avatarSymbol: "🌿" },
  { id: "profile-mum", name: "Mum", userId: "user-mum", isSelf: false, avatarSymbol: "💐" }
];

export const mockCrews: Crew[] = mockSupportedProfiles.map((profile) => ({
  id: `crew-${profile.id}`,
  supportedProfileId: profile.id,
  name: `${profile.name}'s Crew`,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z"
}));

export const mockMemberships: CrewMembership[] = [];
export const mockInvitations: CrewInvitation[] = [];
export const mockCrewRequests: CrewRequest[] = [];
export const mockOrganisations: Organisation[] = [];
export const mockOrganisationUsers: OrganisationUser[] = [];
export const mockOrganisationProfiles: OrganisationSupportedProfile[] = [];

export type CrewStoreState = {
  activeProfileId: string;
  profiles: SupportedProfile[];
  crews: Crew[];
  memberships: CrewMembership[];
  invitations: CrewInvitation[];
  requests: CrewRequest[];
  organisations: Organisation[];
  organisationUsers: OrganisationUser[];
  organisationProfiles: OrganisationSupportedProfile[];
};

/** Fresh install: only the person using the phone, with their own empty crew. */
export function createEmptyCrewStore(name = "Me"): CrewStoreState {
  const profileId = "profile-self";
  const crewId = "crew-profile-self";
  const now = new Date().toISOString();
  const profile: SupportedProfile = {
    id: profileId,
    name: name.trim() || "Me",
    userId: CURRENT_USER_ID,
    isSelf: true,
    avatarSymbol: "🌿"
  };
  const crew: Crew = {
    id: crewId,
    supportedProfileId: profileId,
    name: `${profile.name}'s Crew`,
    createdAt: now,
    updatedAt: now
  };
  return {
    activeProfileId: profileId,
    profiles: [profile],
    crews: [crew],
    memberships: [],
    invitations: [],
    requests: [],
    organisations: [],
    organisationUsers: [],
    organisationProfiles: []
  };
}

export const defaultCrewStore: CrewStoreState = createEmptyCrewStore("Me");

// Re-export helpers used elsewhere that referenced mock permissions patterns.
export { defaultCrewPermissions, mergeRolePermissions };
