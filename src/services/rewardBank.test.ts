import { describe, expect, it } from "vitest";

import {
  claimReward,
  createDefaultRewardWallet,
  earnPoints,
  getNextReward,
  setCustomRewards
} from "./rewardBank";

describe("rewardBank", () => {
  it("earns +1 / +2 / +3 and never goes negative on earn", () => {
    let wallet = createDefaultRewardWallet();
    wallet = earnPoints(wallet, {
      difficulty: "normal",
      title: "Open curtains",
      kind: "did_something"
    });
    expect(wallet.availablePoints).toBe(1);
    wallet = earnPoints(wallet, {
      difficulty: "hard",
      title: "Hard call",
      kind: "task"
    });
    expect(wallet.availablePoints).toBe(3);
    wallet = earnPoints(wallet, {
      difficulty: "really_hard",
      title: "Really hard",
      kind: "task"
    });
    expect(wallet.availablePoints).toBe(6);
    expect(wallet.lifetimePoints).toBe(6);
  });

  it("claims rewards without removing lifetime points", () => {
    let wallet = createDefaultRewardWallet();
    for (let i = 0; i < 5; i += 1) {
      wallet = earnPoints(wallet, {
        difficulty: "normal",
        title: `Win ${i}`,
        kind: "tiny_step"
      });
    }
    expect(wallet.availablePoints).toBe(5);
    wallet = claimReward(wallet, "coffee");
    expect(wallet.availablePoints).toBe(0);
    expect(wallet.lifetimePoints).toBe(5);
    expect(wallet.claims[0]?.title).toBe("Favourite coffee");
  });

  it("rejects claim when points are short", () => {
    const wallet = createDefaultRewardWallet();
    expect(() => claimReward(wallet, "coffee")).toThrow(/Not enough points/);
  });

  it("reports next reward progress", () => {
    let wallet = createDefaultRewardWallet();
    wallet = earnPoints(wallet, { difficulty: "normal", title: "A", kind: "other" });
    const next = getNextReward(wallet);
    expect(next.reward?.points).toBe(5);
    expect(next.pointsToNext).toBe(4);
  });

  it("allows custom rewards", () => {
    const wallet = setCustomRewards(createDefaultRewardWallet(), [
      { id: "film", points: 8, title: "Cinema night" }
    ]);
    expect(wallet.rewards).toHaveLength(1);
    expect(wallet.rewards[0]?.title).toBe("Cinema night");
  });
});
