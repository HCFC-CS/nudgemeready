import { describe, expect, it } from "vitest";

import {
  compareThings,
  emptySavedThings,
  hideShopIdeas,
  isThingSaved,
  removeThing,
  saveThing,
  toggleCompare
} from "./savedThings";
import { SAVED_THINGS_COMPARE_LIMIT } from "../types/savedThings";

const now = new Date("2026-09-10T12:00:00.000Z");

describe("savedThings", () => {
  it("saves a find-it idea once and tags the affiliate partner", () => {
    let state = emptySavedThings();
    state = saveThing(
      state,
      { title: "Amazon · cleaning supplies", url: "https://www.amazon.co.uk/s?k=cleaning" },
      now
    );
    expect(state.items).toHaveLength(1);
    expect(state.items[0]?.partnerId).toBe("amazon");
    expect(isThingSaved(state, "https://www.amazon.co.uk/s?k=cleaning")).toBe(true);
    const again = saveThing(
      state,
      { title: "Duplicate", url: "https://www.amazon.co.uk/s?k=cleaning" },
      now
    );
    expect(again.items).toHaveLength(1);
  });

  it("compares at most three saved things", () => {
    let state = emptySavedThings();
    for (let index = 0; index < 4; index += 1) {
      state = saveThing(
        state,
        {
          id: `item-${index}`,
          title: `Idea ${index}`,
          url: `https://www.argos.co.uk/search/bag-${index}/`
        },
        now
      );
    }
    state = toggleCompare(state, "item-0");
    state = toggleCompare(state, "item-1");
    state = toggleCompare(state, "item-2");
    const blocked = toggleCompare(state, "item-3");
    expect(blocked.compareIds).toEqual(["item-0", "item-1", "item-2"]);
    expect(compareThings(blocked)).toHaveLength(SAVED_THINGS_COMPARE_LIMIT);
    const removed = toggleCompare(blocked, "item-1");
    expect(removed.compareIds).toEqual(["item-0", "item-2"]);
  });

  it("removes a thing from compare when it is deleted", () => {
    let state = saveThing(
      emptySavedThings(),
      { id: "keep", title: "Keep", url: "https://www.etsy.com/uk/search?q=guest" },
      now
    );
    state = toggleCompare(state, "keep");
    state = removeThing(state, "keep");
    expect(state.items).toHaveLength(0);
    expect(state.compareIds).toHaveLength(0);
  });

  it("remembers I already have this without requiring a purchase", () => {
    const hidden = hideShopIdeas(emptySavedThings(), "shop:ready4-home:cleaning-planner");
    expect(hidden.alreadyHaveKeys).toContain("shop:ready4-home:cleaning-planner");
  });
});
