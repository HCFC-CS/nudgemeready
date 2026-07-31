import type { CrewMember } from "../types/crew";

export function getPrimaryCaptain(members: CrewMember[]): CrewMember | undefined {
  const accepted = members.filter((member) => member.status === "accepted");
  return (
    accepted.find((member) => member.isPrimaryCaptain) ??
    accepted.find((member) => member.roles.includes("captain"))
  );
}
