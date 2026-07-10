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

export const CURRENT_USER_ID = "user-helen";

export const mockSupportedProfiles: SupportedProfile[] = [
  { id: "profile-helen", name: "Helen", userId: CURRENT_USER_ID, isSelf: true, avatarSymbol: "🌿" },
  { id: "profile-mum", name: "Mum", userId: "user-mum", isSelf: false, avatarSymbol: "💐" },
  { id: "profile-dad", name: "Dad", userId: "user-dad", isSelf: false, avatarSymbol: "🎩" },
  { id: "profile-child-1", name: "Child 1", userId: "user-child-1", isSelf: false, avatarSymbol: "⭐" },
  { id: "profile-child-2", name: "Child 2", userId: "user-child-2", isSelf: false, avatarSymbol: "🌙" },
  { id: "profile-patient-a", name: "Patient A", userId: "user-patient-a", isSelf: false, organisationId: "org-ot-practice" },
  { id: "profile-patient-b", name: "Patient B", userId: "user-patient-b", isSelf: false, organisationId: "org-ot-practice" },
  { id: "profile-patient-c", name: "Patient C", userId: "user-patient-c", isSelf: false, organisationId: "org-ot-practice" },
  { id: "profile-patient-d", name: "Patient D", userId: "user-patient-d", isSelf: false, organisationId: "org-ot-practice" }
];

export const mockCrews: Crew[] = mockSupportedProfiles.map((profile) => ({
  id: `crew-${profile.id}`,
  supportedProfileId: profile.id,
  name: `${profile.name}'s Crew`,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z"
}));

export const mockMemberships: CrewMembership[] = [
  {
    id: "membership-mum-captain",
    userId: "user-mum",
    crewId: "crew-profile-helen",
    memberName: "Mum",
    email: "mum@example.com",
    phone: "07700 900111",
    roles: ["captain", "guardian"],
    permissions: mergeRolePermissions(["captain", "guardian"]),
    inviteStatus: "accepted",
    consentStatus: [
      { type: "health", granted: true, grantedAt: "2026-05-01T00:00:00.000Z" },
      { type: "medication", granted: true, grantedAt: "2026-05-01T00:00:00.000Z" }
    ],
    relationship: "Parent",
    isPrimaryCaptain: true,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    lastActiveAt: "2026-06-18T13:15:00.000Z"
  },
  {
    id: "membership-sarah-guide",
    userId: "user-sarah",
    crewId: "crew-profile-helen",
    memberName: "Sarah",
    email: "sarah@example.com",
    roles: ["guide", "anchor"],
    permissions: defaultCrewPermissions.guide,
    inviteStatus: "accepted",
    consentStatus: [{ type: "wellbeing", granted: true, grantedAt: "2026-05-10T00:00:00.000Z" }],
    relationship: "Occupational therapist",
    isPrimaryCaptain: false,
    createdAt: "2026-05-10T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    lastActiveAt: "2026-06-17T11:45:00.000Z"
  },
  {
    id: "membership-erin-cheer",
    userId: "user-erin",
    crewId: "crew-profile-helen",
    memberName: "Erin",
    email: "erin@example.com",
    roles: ["cheerleader"],
    permissions: defaultCrewPermissions.cheerleader,
    inviteStatus: "accepted",
    consentStatus: [],
    relationship: "Friend",
    isPrimaryCaptain: false,
    createdAt: "2026-05-12T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    lastActiveAt: "2026-05-31T18:20:00.000Z"
  },
  {
    id: "membership-tom-pending",
    crewId: "crew-profile-helen",
    memberName: "Tom",
    email: "tom@example.com",
    roles: ["observer"],
    permissions: defaultCrewPermissions.observer,
    inviteStatus: "sent",
    consentStatus: [],
    relationship: "Trusted friend",
    isPrimaryCaptain: false,
    createdAt: "2026-06-15T00:00:00.000Z",
    updatedAt: "2026-06-15T00:00:00.000Z"
  },
  {
    id: "membership-helen-supports-mum",
    userId: CURRENT_USER_ID,
    crewId: "crew-profile-mum",
    memberName: "Helen",
    email: "helen@example.com",
    roles: ["captain", "guardian"],
    permissions: mergeRolePermissions(["captain", "guardian"]),
    inviteStatus: "accepted",
    consentStatus: [
      { type: "health", granted: true, grantedAt: "2026-04-01T00:00:00.000Z" },
      { type: "medication", granted: true, grantedAt: "2026-04-01T00:00:00.000Z" },
      { type: "finance", granted: true, grantedAt: "2026-04-01T00:00:00.000Z" }
    ],
    relationship: "Daughter",
    isPrimaryCaptain: true,
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    lastActiveAt: "2026-06-19T09:00:00.000Z"
  },
  {
    id: "membership-helen-supports-dad",
    userId: CURRENT_USER_ID,
    crewId: "crew-profile-dad",
    memberName: "Helen",
    email: "helen@example.com",
    roles: ["guardian", "anchor"],
    permissions: mergeRolePermissions(["guardian", "anchor"]),
    inviteStatus: "accepted",
    consentStatus: [{ type: "health", granted: true, grantedAt: "2026-04-01T00:00:00.000Z" }],
    relationship: "Daughter",
    isPrimaryCaptain: false,
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    lastActiveAt: "2026-06-18T16:30:00.000Z"
  },
  {
    id: "membership-helen-supports-child-1",
    userId: CURRENT_USER_ID,
    crewId: "crew-profile-child-1",
    memberName: "Helen",
    email: "helen@example.com",
    roles: ["guardian", "captain"],
    permissions: mergeRolePermissions(["guardian", "captain"]),
    inviteStatus: "accepted",
    consentStatus: [{ type: "appointments", granted: true, grantedAt: "2026-03-01T00:00:00.000Z" }],
    relationship: "Parent",
    isPrimaryCaptain: true,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    lastActiveAt: "2026-06-19T07:45:00.000Z"
  },
  {
    id: "membership-helen-supports-child-2",
    userId: CURRENT_USER_ID,
    crewId: "crew-profile-child-2",
    memberName: "Helen",
    email: "helen@example.com",
    roles: ["guardian", "captain"],
    permissions: mergeRolePermissions(["guardian", "captain"]),
    inviteStatus: "accepted",
    consentStatus: [{ type: "appointments", granted: true, grantedAt: "2026-03-01T00:00:00.000Z" }],
    relationship: "Parent",
    isPrimaryCaptain: true,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    lastActiveAt: "2026-06-19T08:10:00.000Z"
  },
  {
    id: "membership-helen-ot-patient-a",
    userId: CURRENT_USER_ID,
    crewId: "crew-profile-patient-a",
    memberName: "Helen",
    email: "helen@example.com",
    roles: ["guide"],
    permissions: defaultCrewPermissions.guide,
    inviteStatus: "accepted",
    consentStatus: [{ type: "professional_notes", granted: true, grantedAt: "2026-02-01T00:00:00.000Z" }],
    relationship: "Occupational therapist",
    isPrimaryCaptain: false,
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    lastActiveAt: "2026-06-17T14:00:00.000Z"
  },
  {
    id: "membership-helen-ot-patient-b",
    userId: CURRENT_USER_ID,
    crewId: "crew-profile-patient-b",
    memberName: "Helen",
    email: "helen@example.com",
    roles: ["guide"],
    permissions: defaultCrewPermissions.guide,
    inviteStatus: "accepted",
    consentStatus: [{ type: "professional_notes", granted: true, grantedAt: "2026-02-01T00:00:00.000Z" }],
    relationship: "Occupational therapist",
    isPrimaryCaptain: false,
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    lastActiveAt: "2026-06-16T10:30:00.000Z"
  },
  {
    id: "membership-helen-ot-patient-c",
    userId: CURRENT_USER_ID,
    crewId: "crew-profile-patient-c",
    memberName: "Helen",
    email: "helen@example.com",
    roles: ["guide"],
    permissions: defaultCrewPermissions.guide,
    inviteStatus: "accepted",
    consentStatus: [{ type: "professional_notes", granted: true, grantedAt: "2026-02-01T00:00:00.000Z" }],
    relationship: "Occupational therapist",
    isPrimaryCaptain: false,
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    lastActiveAt: "2026-06-15T11:00:00.000Z"
  },
  {
    id: "membership-helen-ot-patient-d",
    userId: CURRENT_USER_ID,
    crewId: "crew-profile-patient-d",
    memberName: "Helen",
    email: "helen@example.com",
    roles: ["guide"],
    permissions: defaultCrewPermissions.guide,
    inviteStatus: "accepted",
    consentStatus: [{ type: "professional_notes", granted: true, grantedAt: "2026-02-01T00:00:00.000Z" }],
    relationship: "Occupational therapist",
    isPrimaryCaptain: false,
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    lastActiveAt: "2026-06-14T09:15:00.000Z"
  }
];

export const mockInvitations: CrewInvitation[] = [];

export const mockCrewRequests: CrewRequest[] = [
  {
    id: "crew-request-sarah",
    crewMemberId: "membership-sarah-guide",
    crewMemberName: "Sarah",
    title: "Plan the dentist call",
    message: "Sarah suggested this. Do you want to keep it?",
    status: "pending",
    createdAt: "2026-06-01T12:00:00.000Z"
  }
];

export const mockOrganisations: Organisation[] = [
  {
    id: "org-ot-practice",
    name: "Helen Cunliffe OT Practice",
    type: "professional_practice",
    licenceSeats: 25,
    createdAt: "2026-01-01T00:00:00.000Z"
  }
];

export const mockOrganisationUsers: OrganisationUser[] = [
  {
    id: "org-user-helen",
    organisationId: "org-ot-practice",
    userId: CURRENT_USER_ID,
    name: "Helen",
    roles: ["guide", "admin"],
    createdAt: "2026-01-01T00:00:00.000Z"
  }
];

export const mockOrganisationProfiles: OrganisationSupportedProfile[] = [
  {
    id: "org-profile-a",
    organisationId: "org-ot-practice",
    supportedProfileId: "profile-patient-a",
    assignedProfessionalIds: [CURRENT_USER_ID],
    consentSummary: [{ type: "professional_notes", granted: true, grantedAt: "2026-02-01T00:00:00.000Z" }]
  },
  {
    id: "org-profile-b",
    organisationId: "org-ot-practice",
    supportedProfileId: "profile-patient-b",
    assignedProfessionalIds: [CURRENT_USER_ID],
    safeguardingFlag: false,
    consentSummary: [{ type: "professional_notes", granted: true, grantedAt: "2026-02-01T00:00:00.000Z" }]
  },
  {
    id: "org-profile-c",
    organisationId: "org-ot-practice",
    supportedProfileId: "profile-patient-c",
    assignedProfessionalIds: [CURRENT_USER_ID],
    consentSummary: [{ type: "professional_notes", granted: true, grantedAt: "2026-02-01T00:00:00.000Z" }]
  },
  {
    id: "org-profile-d",
    organisationId: "org-ot-practice",
    supportedProfileId: "profile-patient-d",
    assignedProfessionalIds: [CURRENT_USER_ID],
    safeguardingFlag: true,
    consentSummary: [{ type: "professional_notes", granted: false }]
  }
];

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

export const defaultCrewStore: CrewStoreState = {
  activeProfileId: "profile-helen",
  profiles: mockSupportedProfiles,
  crews: mockCrews,
  memberships: mockMemberships,
  invitations: mockInvitations,
  requests: mockCrewRequests,
  organisations: mockOrganisations,
  organisationUsers: mockOrganisationUsers,
  organisationProfiles: mockOrganisationProfiles
};
