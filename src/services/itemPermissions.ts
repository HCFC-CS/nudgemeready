import type { CrewMember } from "../types/crew";
import type { NudgeCreator, NudgeItem } from "../types/nudge";

export function createNudgeeActor(profile: { name: string }): NudgeCreator {
  return {
    type: "nudgee",
    id: "nudgee",
    name: profile.name.trim() || "You"
  };
}

export function createSupporterActor(member: Pick<CrewMember, "id" | "name">): NudgeCreator {
  return {
    type: "supporter",
    id: member.id,
    name: member.name
  };
}

type ActorProfile = { name: string };
type ActorCrewMember = Pick<CrewMember, "id" | "name"> & {
  membershipId?: string;
  status?: string;
};

/** Missing crew profile must not crash launch — treat as the person using the phone. */
export function resolveNudgeActor(
  activeProfile: { isSelf?: boolean } | null | undefined,
  profile: ActorProfile,
  myCrewMembers: ActorCrewMember[] = [],
  myMembershipId?: string
): NudgeCreator {
  if (!activeProfile || activeProfile.isSelf) {
    return createNudgeeActor(profile);
  }
  const membership =
    myCrewMembers.find((member) => member.membershipId === myMembershipId) ??
    myCrewMembers.find((member) => member.status === "accepted");
  if (membership) {
    return createSupporterActor({
      id: membership.id,
      name: membership.name || profile.name || "Supporter"
    });
  }
  return createSupporterActor({
    id: myMembershipId ?? "supporter",
    name: profile.name.trim() || "Supporter"
  });
}

export function resolveItemCreator(item: NudgeItem): NudgeCreator {
  return (
    item.createdBy ?? {
      type: "nudgee",
      id: "nudgee",
      name: "You"
    }
  );
}

export function isSameCreator(first: NudgeCreator, second: NudgeCreator) {
  return first.type === second.type && first.id === second.id;
}

export function canEditItem(item: NudgeItem, actor: NudgeCreator) {
  if (!item.isLocked) {
    return true;
  }
  return isSameCreator(resolveItemCreator(item), actor);
}

export function canToggleItemLock(item: NudgeItem, actor: NudgeCreator) {
  return isSameCreator(resolveItemCreator(item), actor);
}

export function formatCreatorLabel(creator: NudgeCreator) {
  if (creator.type === "nudgee") {
    return creator.name;
  }
  return `${creator.name} (supporter)`;
}
