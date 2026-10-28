import { describe, expect, it } from "vitest";

import {
  READY_4_LABEL,
  READY_4_PACK_LABEL,
  READY_4_PACKS_LABEL,
  READY_4_TODAY_LABEL,
  READY_PACKS_SHOP_LABEL
} from "./ready4Copy";

describe("ready4Copy", () => {
  it("uses Ready4 for packs and Ready4Packs for the shop", () => {
    expect(READY_4_LABEL).toBe("Ready4");
    expect(READY_4_PACK_LABEL).toBe("Ready4 pack");
    expect(READY_4_PACKS_LABEL).toBe("Ready4 packs");
    expect(READY_4_TODAY_LABEL).toBe("Ready4 today & this week");
    expect(READY_PACKS_SHOP_LABEL).toBe("Ready4Packs");
  });
});
