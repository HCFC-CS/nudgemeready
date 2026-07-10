import { useMemo } from "react";

import { createNudgeeActor } from "../services/itemPermissions";
import { useProfile } from "./useProfile";

export function useNudgeActor() {
  const { profile } = useProfile();
  return useMemo(() => createNudgeeActor(profile), [profile]);
}
