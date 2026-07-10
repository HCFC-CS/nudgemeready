export type CrewRole =
  | "captain"
  | "guardian"
  | "guide"
  | "anchor"
  | "cheerleader"
  | "observer"
  | "admin";

export type InviteStatus = "draft" | "sent" | "accepted" | "declined" | "expired" | "revoked";

export type InviteMethod = "email" | "sms" | "whatsapp" | "link";

export type ConsentType =
  | "health"
  | "medication"
  | "finance"
  | "location"
  | "wellbeing"
  | "appointments"
  | "travel"
  | "professional_notes";

export type ConsentRecord = {
  type: ConsentType;
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  grantedBy?: string;
};

export type CrewPermissionKey =
  | "viewNudges"
  | "createNudges"
  | "editNudges"
  | "completeNudges"
  | "viewMedicationNudges"
  | "viewFinancialNudges"
  | "viewWellbeingCheckIns"
  | "viewTravelNudges"
  | "viewLocationNudges"
  | "receiveMissedNudgeAlerts"
  | "receiveEscalationAlerts"
  | "inviteCrewMembers"
  | "manageRoles"
  | "manageBilling"
  | "accessOrganisationDashboard"
  | "exportReports"
  | "viewAuditLog"
  | "sendEncouragement"
  | "viewProgress"
  | "addProfessionalNotes";

export type CrewPermissionSet = Record<CrewPermissionKey, boolean>;

export type SupportedProfile = {
  id: string;
  name: string;
  userId: string;
  organisationId?: string;
  isSelf: boolean;
  avatarSymbol?: string;
};

export type Crew = {
  id: string;
  supportedProfileId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CrewMembership = {
  id: string;
  userId?: string;
  crewId: string;
  memberName: string;
  email?: string;
  phone?: string;
  roles: CrewRole[];
  permissions: CrewPermissionSet;
  inviteStatus: InviteStatus;
  consentStatus: ConsentRecord[];
  relationship: string;
  isPrimaryCaptain: boolean;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
};

export type CrewInvitation = {
  id: string;
  invitedByUserId: string;
  invitedByName: string;
  inviteMethod: InviteMethod;
  email?: string;
  phone?: string;
  inviteLink: string;
  targetCrewId: string;
  targetProfileId: string;
  targetProfileName: string;
  proposedRoles: CrewRole[];
  proposedPermissions: CrewPermissionSet;
  proposedConsents: ConsentType[];
  status: InviteStatus;
  personalMessage?: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type OrganisationType =
  | "nhs"
  | "local_authority"
  | "care_provider"
  | "supported_living"
  | "school"
  | "university"
  | "charity"
  | "employer"
  | "private_healthcare"
  | "professional_practice";

export type Organisation = {
  id: string;
  name: string;
  type: OrganisationType;
  licenceSeats: number;
  createdAt: string;
};

export type OrganisationUser = {
  id: string;
  organisationId: string;
  userId: string;
  name: string;
  roles: CrewRole[];
  createdAt: string;
};

export type OrganisationSupportedProfile = {
  id: string;
  organisationId: string;
  supportedProfileId: string;
  assignedProfessionalIds: string[];
  safeguardingFlag?: boolean;
  consentSummary: ConsentRecord[];
};

export type CrewRequestStatus = "pending" | "accepted" | "declined" | "snoozed";

export type CrewRequest = {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  title: string;
  message: string;
  status: CrewRequestStatus;
  createdAt: string;
};

/** UI-facing member card */
export type CrewMember = {
  id: string;
  membershipId: string;
  name: string;
  email?: string;
  phone?: string;
  roles: CrewRole[];
  relationship: string;
  permissions: CrewPermissionSet;
  isPrimaryCaptain: boolean;
  status: InviteStatus;
  consentStatus: ConsentRecord[];
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
};

export const SAFEGUARDING_MESSAGE =
  "Nudge Me Ready helps with everyday support and reassurance. It is not an emergency service. If someone is at immediate risk, contact emergency services.";

export const CONSENT_LABELS: Record<ConsentType, string> = {
  health: "Health",
  medication: "Medication",
  finance: "Finance",
  location: "Location",
  wellbeing: "Wellbeing",
  appointments: "Appointments",
  travel: "Travel",
  professional_notes: "Professional notes"
};

export const PERMISSION_LABELS: Record<CrewPermissionKey, string> = {
  viewNudges: "View nudges",
  createNudges: "Create nudges",
  editNudges: "Edit nudges",
  completeNudges: "Complete nudges",
  viewMedicationNudges: "View medication nudges",
  viewFinancialNudges: "View financial nudges",
  viewWellbeingCheckIns: "View wellbeing check-ins",
  viewTravelNudges: "View travel nudges",
  viewLocationNudges: "View location-based nudges",
  receiveMissedNudgeAlerts: "Receive missed nudge alerts",
  receiveEscalationAlerts: "Receive escalation alerts",
  inviteCrewMembers: "Invite Crew members",
  manageRoles: "Manage roles",
  manageBilling: "Manage billing",
  accessOrganisationDashboard: "Access organisation dashboard",
  exportReports: "Export reports",
  viewAuditLog: "View audit log",
  sendEncouragement: "Send encouragement",
  viewProgress: "View progress",
  addProfessionalNotes: "Add professional notes"
};

export const SENSITIVE_PERMISSIONS: CrewPermissionKey[] = [
  "viewMedicationNudges",
  "viewFinancialNudges",
  "viewWellbeingCheckIns",
  "viewLocationNudges",
  "addProfessionalNotes"
];

export const SENSITIVE_CONSENT_MAP: Partial<Record<CrewPermissionKey, ConsentType>> = {
  viewMedicationNudges: "medication",
  viewFinancialNudges: "finance",
  viewWellbeingCheckIns: "wellbeing",
  viewLocationNudges: "location",
  viewTravelNudges: "travel",
  addProfessionalNotes: "professional_notes"
};

function emptyPermissions(): CrewPermissionSet {
  return {
    viewNudges: false,
    createNudges: false,
    editNudges: false,
    completeNudges: false,
    viewMedicationNudges: false,
    viewFinancialNudges: false,
    viewWellbeingCheckIns: false,
    viewTravelNudges: false,
    viewLocationNudges: false,
    receiveMissedNudgeAlerts: false,
    receiveEscalationAlerts: false,
    inviteCrewMembers: false,
    manageRoles: false,
    manageBilling: false,
    accessOrganisationDashboard: false,
    exportReports: false,
    viewAuditLog: false,
    sendEncouragement: false,
    viewProgress: false,
    addProfessionalNotes: false
  };
}

export const defaultCrewPermissions: Record<CrewRole, CrewPermissionSet> = {
  captain: {
    ...emptyPermissions(),
    viewNudges: true,
    createNudges: true,
    editNudges: true,
    completeNudges: true,
    viewMedicationNudges: true,
    viewFinancialNudges: true,
    viewWellbeingCheckIns: true,
    viewTravelNudges: true,
    viewLocationNudges: true,
    receiveMissedNudgeAlerts: true,
    receiveEscalationAlerts: true,
    inviteCrewMembers: true,
    manageRoles: true,
    sendEncouragement: true,
    viewProgress: true
  },
  guardian: {
    ...emptyPermissions(),
    viewNudges: true,
    viewProgress: true,
    receiveMissedNudgeAlerts: true,
    receiveEscalationAlerts: true,
    sendEncouragement: true,
    completeNudges: true,
    viewTravelNudges: true,
    viewAppointments: true as never
  } as CrewPermissionSet,
  guide: {
    ...emptyPermissions(),
    viewNudges: true,
    createNudges: true,
    viewProgress: true,
    sendEncouragement: true,
    addProfessionalNotes: true,
    viewWellbeingCheckIns: true,
    receiveEscalationAlerts: true
  },
  anchor: {
    ...emptyPermissions(),
    viewNudges: true,
    sendEncouragement: true,
    completeNudges: true,
    viewProgress: true,
    receiveMissedNudgeAlerts: true
  },
  cheerleader: {
    ...emptyPermissions(),
    sendEncouragement: true,
    viewProgress: true
  },
  observer: {
    ...emptyPermissions(),
    viewNudges: true
  },
  admin: {
    ...emptyPermissions(),
    manageBilling: true,
    manageRoles: true,
    inviteCrewMembers: true,
    accessOrganisationDashboard: true,
    exportReports: true,
    viewAuditLog: true
  }
};

// Fix guardian - I accidentally used viewAppointments which doesn't exist
defaultCrewPermissions.guardian = {
  ...emptyPermissions(),
  viewNudges: true,
  viewProgress: true,
  receiveMissedNudgeAlerts: true,
  receiveEscalationAlerts: true,
  sendEncouragement: true,
  completeNudges: true,
  viewTravelNudges: true
};

export function mergeRolePermissions(roles: CrewRole[]): CrewPermissionSet {
  const merged = emptyPermissions();
  for (const role of roles) {
    const rolePerms = defaultCrewPermissions[role];
    for (const key of Object.keys(merged) as CrewPermissionKey[]) {
      if (rolePerms[key]) {
        merged[key] = true;
      }
    }
  }
  return merged;
}

export const crewRoleCopy: Record<
  CrewRole,
  {
    title: string;
    shortDescription: string;
    purpose: string;
    uiCopy: string;
    can: string[];
    cannot: string[];
  }
> = {
  captain: {
    title: "Crew Captain",
    shortDescription: "Primary responsible support",
    purpose: "Your trusted go-to who helps organise and coordinate support.",
    uiCopy: "Primary responsible support person.",
    can: ["Manage Crew", "Invite members", "Assign roles", "Set escalation rules", "Receive important alerts"],
    cannot: ["Override your choices without consent"]
  },
  guardian: {
    title: "Guardian",
    shortDescription: "Family or legal support",
    purpose: "Family or legal support role for key decisions and routines.",
    uiCopy: "Family or legal support when you need someone close.",
    can: ["View key nudges", "Receive alerts", "Support decisions", "Help manage routines"],
    cannot: ["Access sensitive data without consent"]
  },
  guide: {
    title: "Guide",
    shortDescription: "Professional support",
    purpose: "Professional support such as OT, social worker, SENCO or care coordinator.",
    uiCopy: "Professional support when you need structured help.",
    can: ["Create support plans", "Suggest nudges", "Review progress", "Add professional notes if permitted"],
    cannot: ["Access private information without consent"]
  },
  anchor: {
    title: "Anchor",
    shortDescription: "Trusted practical support",
    purpose: "Trusted emotional and practical support person.",
    uiCopy: "Someone steady who helps you keep going.",
    can: ["Receive check-ins", "Encourage completion", "Help with selected nudges"],
    cannot: ["Manage Crew settings"]
  },
  cheerleader: {
    title: "Cheerleader",
    shortDescription: "Encouragement only",
    purpose: "Encouragement and celebration without access to sensitive details.",
    uiCopy: "Celebrates wins and sends supportive messages.",
    can: ["Send supportive messages", "Celebrate wins", "View limited progress"],
    cannot: ["View sensitive data", "Edit nudges", "Receive safeguarding alerts"]
  },
  observer: {
    title: "Observer",
    shortDescription: "Read-only support",
    purpose: "Light-touch view-only access to what you choose to share.",
    uiCopy: "Can see what you permit — nothing more.",
    can: ["View permitted information only"],
    cannot: ["Edit", "Invite", "Escalate", "Manage"]
  },
  admin: {
    title: "Admin",
    shortDescription: "Account management",
    purpose: "Technical and account management for families or organisations.",
    uiCopy: "Manages account settings, billing and organisation users.",
    can: ["Manage account settings", "Manage billing", "Manage organisation users"],
    cannot: ["Access clinical data without role permission and consent"]
  }
};

export const organisationTypeLabels: Record<OrganisationType, string> = {
  nhs: "NHS",
  local_authority: "Local Authority",
  care_provider: "Care Provider",
  supported_living: "Supported Living Provider",
  school: "School",
  university: "University",
  charity: "Charity",
  employer: "Employer",
  private_healthcare: "Private Healthcare Provider",
  professional_practice: "Professional Practice"
};
