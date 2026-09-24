import { describe, expect, it } from "vitest";

import { resolveNudgeActor } from "./itemPermissions";

describe("resolveNudgeActor", () => {
  it("uses the person on the phone when crew profile is missing", () => {
    const actor = resolveNudgeActor(undefined, { name: "Helen" });
    expect(actor.type).toBe("nudgee");
    expect(actor.name).toBe("Helen");
  });

  it("uses the person on the phone for a self profile", () => {
    const actor = resolveNudgeActor({ isSelf: true }, { name: "Helen" });
    expect(actor.type).toBe("nudgee");
  });

  it("uses the accepted crew membership when supporting someone else", () => {
    const actor = resolveNudgeActor({ isSelf: false }, { name: "Helen" }, [
      { id: "m1", name: "Sam", membershipId: "mem-1", status: "accepted" }
    ], "mem-1");
    expect(actor.type).toBe("supporter");
    expect(actor.id).toBe("m1");
    expect(actor.name).toBe("Sam");
  });
});
