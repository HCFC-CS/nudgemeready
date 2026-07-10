import type { CrewMember } from "../types/crew";
import type { ListShare, NudgeItem } from "../types/nudge";

export function getAcceptedCrewMembers(members: CrewMember[]) {
  return members.filter((member) => member.status === "accepted");
}

export function getUnsharedMembers(members: CrewMember[], sharedWith: ListShare[] = []) {
  const sharedIds = new Set(sharedWith.map((entry) => entry.membershipId));
  return getAcceptedCrewMembers(members).filter((member) => !sharedIds.has(member.membershipId));
}

export function shareListWithMember(sharedWith: ListShare[] = [], member: CrewMember, canEdit = false): ListShare[] {
  if (sharedWith.some((entry) => entry.membershipId === member.membershipId)) {
    return sharedWith;
  }
  return [
    ...sharedWith,
    {
      membershipId: member.membershipId,
      memberName: member.name,
      sharedAt: new Date().toISOString(),
      canEdit
    }
  ];
}

export function unshareListWithMember(sharedWith: ListShare[] = [], membershipId: string): ListShare[] {
  return sharedWith.filter((entry) => entry.membershipId !== membershipId);
}

export function formatSharedLabel(sharedWith: ListShare[] = []) {
  if (!sharedWith.length) {
    return "";
  }
  if (sharedWith.length === 1) {
    return sharedWith[0].memberName;
  }
  return `${sharedWith.length} Crew`;
}

export function canViewList(
  list: NudgeItem,
  options: { isSelfProfile: boolean; viewerMembershipId?: string }
) {
  if (list.type !== "list") {
    return false;
  }
  if (options.isSelfProfile) {
    return true;
  }
  if (!options.viewerMembershipId) {
    return false;
  }
  return list.sharedWith?.some((entry) => entry.membershipId === options.viewerMembershipId) ?? false;
}

export function filterVisibleLists(
  lists: NudgeItem[],
  options: { isSelfProfile: boolean; viewerMembershipId?: string }
) {
  return lists.filter((list) => canViewList(list, options));
}
