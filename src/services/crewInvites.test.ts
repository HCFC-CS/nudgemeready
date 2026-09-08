import { describe, expect, it } from "vitest";

import {
  buildInviteDraft,
  decodeSharedInvitePayload,
  getEmailInviteCopy,
  getSmsInviteCopy
} from "./crewInvites";

describe("crew invites", () => {
  it("keeps invite links short", () => {
    const invite = buildInviteDraft({
      inviteId: "inv-1",
      invitedByName: "Alex",
      targetProfileName: "Sam",
      method: "whatsapp",
      roles: ["anchor"],
      invitedByUserId: "user-1",
      targetCrewId: "crew-1",
      targetProfileId: "profile-1",
      membershipId: "mem-1"
    });

    expect(invite.inviteLink.length).toBeLessThan(500);
    expect(invite.inviteLink.startsWith("https://nudgemeready.app/invite/inv-1?d=")).toBe(true);

    const token = new URL(invite.inviteLink).searchParams.get("d");
    expect(token).toBeTruthy();
    const decoded = decodeSharedInvitePayload(token!);
    expect(decoded?.invitation.id).toBe("inv-1");
    expect(decoded?.targetProfile.name).toBe("Sam");
    expect(decoded?.invitation.proposedRoles).toEqual(["anchor"]);
  });

  it("keeps share copy to two short lines", () => {
    const invite = buildInviteDraft({
      inviteId: "inv-2",
      invitedByName: "Alex",
      targetProfileName: "Sam",
      method: "sms",
      roles: ["guardian"],
      invitedByUserId: "user-1",
      targetCrewId: "crew-1",
      targetProfileId: "profile-1",
      membershipId: "mem-2"
    });
    const sms = getSmsInviteCopy(invite);
    const email = getEmailInviteCopy(invite);

    expect(sms.split("\n")).toHaveLength(2);
    expect(email.body.split("\n").length).toBeLessThanOrEqual(4);
    expect(sms).not.toMatch(/Crew Supporter Terms/);
    expect(email.body).not.toMatch(/peace of mind/);
  });

  it("still reads older full payloads", () => {
    const legacy = {
      v: 1 as const,
      invitation: {
        id: "old-1",
        invitedByUserId: "user-1",
        invitedByName: "Alex",
        inviteMethod: "link" as const,
        inviteLink: "https://nudgemeready.app/invite/old-1",
        targetCrewId: "crew-1",
        targetProfileId: "profile-1",
        targetProfileName: "Sam",
        membershipId: "mem-old",
        proposedRoles: ["observer" as const],
        proposedPermissions: {
          viewNudges: true,
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
        },
        proposedConsents: [],
        status: "sent" as const,
        expiresAt: "2030-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      },
      targetProfile: { id: "profile-1", name: "Sam" },
      crew: { id: "crew-1", name: "Sam's Crew", supportedProfileId: "profile-1" }
    };
    const token = Buffer.from(JSON.stringify(legacy), "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    const decoded = decodeSharedInvitePayload(token);
    expect(decoded?.invitation.id).toBe("old-1");
  });
});
