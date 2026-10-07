import { useMemo } from "react";

import { createNudgeeActor, createSupporterActor } from "../services/itemPermissions";
import { useCrew } from "./useCrew";
import { useProfile } from "./useProfile";

export function useNudgeActor() {
  const { profile } = useProfile();
  const { activeProfile, myMembershipId, myCrewMembers } = useCrew();

  return useMemo(() => {
    if (activeProfile.isSelf) {
      return createNudgeeActor(profile);
    }
    const membership =
      myCrewMembers.find((member) => member.membershipId === myMembershipId) ??
      myCrewMembers.find((member) => member.status === "accepted");
    if (membership) {
      return createSupporterActor({ id: membership.id, name: membership.name || profile.name || "Supporter" });
    }
    return createSupporterActor({
      id: myMembershipId ?? "supporter",
      name: profile.name.trim() || "Supporter"
    });
  }, [activeProfile.isSelf, myCrewMembers, myMembershipId, profile]);
}
