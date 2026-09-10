import { describe, expect, it } from "vitest";

import {
  claimReward,
  createDefaultRewardWallet,
  earnPoints,
  formatRewardEarnNotice,
  getBigGoal,
  getNextReward,
  isRestrictionRewardTitle,
  normalizeWallet,
  setCustomRewards
} from "./rewardBank";
import { DEFAULT_REWARD_DEFINITIONS } from "../types/rewards";

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

  it("reports a bigger goal separately from the next reward", () => {
    const wallet = createDefaultRewardWallet();
    const big = getBigGoal(wallet);
    expect(big.reward?.title).toBe("Day out or experience");
    expect(big.reward?.points).toBe(100);
    expect(big.pointsToGo).toBe(100);
  });

  it("rewrites the old guilt-framed default treat title", () => {
    const wallet = normalizeWallet({
      rewards: [{ id: "treat-10", points: 10, title: "£10 guilt-free treat" }]
    });
    expect(wallet.rewards[0]?.title).toBe("£10 treat");
    expect(DEFAULT_REWARD_DEFINITIONS.every((entry) => !/guilt/i.test(entry.title))).toBe(true);
  });

  it("allows custom rewards", () => {
    const wallet = setCustomRewards(createDefaultRewardWallet(), [
      { id: "film", points: 8, title: "Cinema night" }
    ]);
    expect(wallet.rewards).toHaveLength(1);
    expect(wallet.rewards[0]?.title).toBe("Cinema night");
  });

  it("never awards points for weight loss or meal skipping", () => {
    expect(isRestrictionRewardTitle("Lost 2kg")).toBe(true);
    expect(isRestrictionRewardTitle("calorie deficit day")).toBe(true);
    expect(isRestrictionRewardTitle("Skipped lunch")).toBe(true);
    expect(isRestrictionRewardTitle("I had a drink")).toBe(false);
    expect(isRestrictionRewardTitle("Short walk")).toBe(false);
    let wallet = createDefaultRewardWallet();
    wallet = earnPoints(wallet, {
      difficulty: "really_hard",
      title: "Weight loss — skipped dinner",
      kind: "did_something"
    });
    expect(wallet.availablePoints).toBe(0);
    expect(wallet.ledger).toHaveLength(0);
    wallet = earnPoints(wallet, {
      difficulty: "normal",
      title: "Short walk",
      kind: "tiny_step"
    });
    expect(wallet.availablePoints).toBe(1);
    expect(formatRewardEarnNotice(0, "Lost 2kg", "+{points}")).toMatch(/don't award points for weight/i);
  });
});
