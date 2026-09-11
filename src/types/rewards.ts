export type RewardDifficulty = "normal" | "hard" | "really_hard";

export type RewardDefinition = {
  id: string;
  points: number;
  title: string;
};

export type RewardClaim = {
  id: string;
  rewardId: string;
  title: string;
  points: number;
  claimedAt: string;
};

export type RewardEarnEvent = {
  id: string;
  points: number;
  difficulty: RewardDifficulty;
  title: string;
  earnedAt: string;
  packId?: string;
  sourceItemId?: string;
  kind: "task" | "tiny_step" | "did_something" | "other";
};

export type RewardWallet = {
  availablePoints: number;
  lifetimePoints: number;
  rewards: RewardDefinition[];
  claims: RewardClaim[];
  ledger: RewardEarnEvent[];
};

export const DID_SOMETHING_TEMPLATE_ID = "core-did-something";
export const DID_SOMETHING_LIST_TITLE = "Things I Did That Weren't On The List";

export const DEFAULT_REWARD_DEFINITIONS: RewardDefinition[] = [
  { id: "coffee", points: 5, title: "Favourite coffee" },
  { id: "treat-10", points: 10, title: "£10 treat" },
  { id: "lunch", points: 15, title: "Takeaway or lunch out" },
  { id: "treat-25", points: 25, title: "£25 treat" },
  { id: "hobby", points: 40, title: "Beauty, hobby or clothing treat" },
  { id: "bigger", points: 60, title: "Something bigger I've been wanting" },
  { id: "day-out", points: 100, title: "Day out or experience" }
];

export function pointsForDifficulty(difficulty: RewardDifficulty): number {
  if (difficulty === "really_hard") {
    return 3;
  }
  if (difficulty === "hard") {
    return 2;
  }
  return 1;
}

export function difficultyFromEffort(effort?: string): RewardDifficulty {
  if (effort === "large") {
    return "really_hard";
  }
  if (effort === "medium") {
    return "hard";
  }
  return "normal";
}

export function difficultyLabel(difficulty: RewardDifficulty): string {
  if (difficulty === "really_hard") {
    return "Really hard";
  }
  if (difficulty === "hard") {
    return "Hard";
  }
  return "Normal";
}
