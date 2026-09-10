import { getEncryptedItem, setEncryptedItem } from "./encryptedStorage";
import {
  DEFAULT_REWARD_DEFINITIONS,
  pointsForDifficulty,
  type RewardClaim,
  type RewardDefinition,
  type RewardDifficulty,
  type RewardEarnEvent,
  type RewardWallet
} from "../types/rewards";

const REWARD_BANK_KEY = "nudge-me:reward-bank-v1";

export function createDefaultRewardWallet(): RewardWallet {
  return {
    availablePoints: 0,
    lifetimePoints: 0,
    rewards: DEFAULT_REWARD_DEFINITIONS.map((entry) => ({ ...entry })),
    claims: [],
    ledger: []
  };
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeWallet(parsed: Partial<RewardWallet> | null | undefined): RewardWallet {
  const base = createDefaultRewardWallet();
  if (!parsed) {
    return base;
  }
  return {
    availablePoints: Math.max(0, Number(parsed.availablePoints) || 0),
    lifetimePoints: Math.max(0, Number(parsed.lifetimePoints) || 0),
    rewards: Array.isArray(parsed.rewards) && parsed.rewards.length
      ? parsed.rewards.map((entry) => ({
          id: String(entry.id),
          points: Math.max(1, Number(entry.points) || 1),
          title: migrateDefaultRewardTitle(String(entry.title || "Reward").trim() || "Reward")
        }))
      : base.rewards,
    claims: Array.isArray(parsed.claims) ? parsed.claims : [],
    ledger: Array.isArray(parsed.ledger) ? parsed.ledger : []
  };
}

function migrateDefaultRewardTitle(title: string) {
  return title === "£10 guilt-free treat" ? "£10 treat" : title;
}

export async function loadRewardWallet(): Promise<RewardWallet> {
  const raw = await getEncryptedItem(REWARD_BANK_KEY);
  if (!raw) {
    return createDefaultRewardWallet();
  }
  try {
    return normalizeWallet(JSON.parse(raw) as Partial<RewardWallet>);
  } catch {
    return createDefaultRewardWallet();
  }
}

export async function saveRewardWallet(wallet: RewardWallet) {
  await setEncryptedItem(REWARD_BANK_KEY, JSON.stringify(normalizeWallet(wallet)));
}

export function earnPoints(
  wallet: RewardWallet,
  input: {
    difficulty: RewardDifficulty;
    title: string;
    kind: RewardEarnEvent["kind"];
    packId?: string;
    sourceItemId?: string;
    at?: Date;
  }
): RewardWallet {
  const points = pointsForDifficulty(input.difficulty);
  const event: RewardEarnEvent = {
    id: createId("earn"),
    points,
    difficulty: input.difficulty,
    title: input.title.trim() || "Something done",
    earnedAt: (input.at ?? new Date()).toISOString(),
    packId: input.packId,
    sourceItemId: input.sourceItemId,
    kind: input.kind
  };
  return {
    ...wallet,
    availablePoints: wallet.availablePoints + points,
    lifetimePoints: wallet.lifetimePoints + points,
    ledger: [event, ...wallet.ledger].slice(0, 200)
  };
}

export function claimReward(wallet: RewardWallet, rewardId: string, at = new Date()): RewardWallet {
  const reward = wallet.rewards.find((entry) => entry.id === rewardId);
  if (!reward) {
    throw new Error("That reward is not in your bank.");
  }
  if (wallet.availablePoints < reward.points) {
    throw new Error("Not enough points yet — keep going at your own pace.");
  }
  const claim: RewardClaim = {
    id: createId("claim"),
    rewardId: reward.id,
    title: reward.title,
    points: reward.points,
    claimedAt: at.toISOString()
  };
  return {
    ...wallet,
    availablePoints: wallet.availablePoints - reward.points,
    claims: [claim, ...wallet.claims]
  };
}

export function setCustomRewards(wallet: RewardWallet, rewards: RewardDefinition[]): RewardWallet {
  const cleaned = rewards
    .map((entry) => ({
      id: entry.id || createId("reward"),
      points: Math.max(1, Math.round(entry.points)),
      title: entry.title.trim() || "Reward"
    }))
    .filter((entry) => entry.title.length > 0);
  return {
    ...wallet,
    rewards: cleaned.length ? cleaned : createDefaultRewardWallet().rewards
  };
}

export function getBigGoal(wallet: RewardWallet): {
  reward: RewardDefinition | null;
  pointsToGo: number;
} {
  const sorted = [...wallet.rewards].sort((a, b) => a.points - b.points);
  const big = sorted[sorted.length - 1] ?? null;
  if (!big) {
    return { reward: null, pointsToGo: 0 };
  }
  return {
    reward: big,
    pointsToGo: Math.max(0, big.points - wallet.availablePoints)
  };
}

export function getNextReward(wallet: RewardWallet): {
  reward: RewardDefinition | null;
  pointsToNext: number;
} {
  const sorted = [...wallet.rewards].sort((a, b) => a.points - b.points);
  const next = sorted.find((entry) => entry.points > wallet.availablePoints) ?? sorted[sorted.length - 1] ?? null;
  if (!next) {
    return { reward: null, pointsToNext: 0 };
  }
  if (wallet.availablePoints >= next.points) {
    const affordable = [...sorted].reverse().find((entry) => entry.points <= wallet.availablePoints) ?? next;
    return { reward: affordable, pointsToNext: 0 };
  }
  return { reward: next, pointsToNext: Math.max(0, next.points - wallet.availablePoints) };
}
