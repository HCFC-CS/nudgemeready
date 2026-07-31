import * as Notifications from "expo-notifications";

import { ensureNotificationPermission } from "./notifications";
import type { CrewMember } from "../types/crew";

export async function notifyCaptainOfNudgeDeleted(input: {
  captain: CrewMember;
  itemTitle: string;
  deletedByName: string;
  profileName?: string;
}) {
  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    return;
  }

  const whose = input.profileName ? `${input.profileName}'s` : "a";
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Captain alert · ${input.captain.name}`,
      body: `${input.deletedByName} deleted ${whose} nudge “${input.itemTitle}”.`,
      data: {
        role: "captain",
        kind: "nudge_deleted",
        captainMembershipId: input.captain.membershipId,
        itemTitle: input.itemTitle,
        deletedByName: input.deletedByName
      }
    },
    trigger: null
  });
}
