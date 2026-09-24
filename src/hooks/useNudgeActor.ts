import { useMemo } from "react";

import { resolveNudgeActor } from "../services/itemPermissions";
import { useCrew } from "./useCrew";
import { useProfile } from "./useProfile";

export function useNudgeActor() {
  const { profile } = useProfile();
  const { activeProfile, myMembershipId, myCrewMembers } = useCrew();

  return useMemo(
    () => resolveNudgeActor(activeProfile, profile, myCrewMembers, myMembershipId),
    [activeProfile, myCrewMembers, myMembershipId, profile]
  );
}
