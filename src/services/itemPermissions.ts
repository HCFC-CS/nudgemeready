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
