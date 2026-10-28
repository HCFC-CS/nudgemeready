import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  claimReward,
  createDefaultRewardWallet,
  earnPoints,
  getBigGoal,
  getNextReward,
  loadRewardWallet,
  saveRewardWallet,
  setCustomRewards
} from "../services/rewardBank";
import type { RewardDefinition, RewardDifficulty, RewardEarnEvent, RewardWallet } from "../types/rewards";

type RewardBankContextValue = {
  wallet: RewardWallet;
  isReady: boolean;
  nextReward: RewardDefinition | null;
  pointsToNext: number;
  bigGoal: RewardDefinition | null;
  pointsToBigGoal: number;
  earn: (input: {
    difficulty: RewardDifficulty;
    title: string;
    kind: RewardEarnEvent["kind"];
    packId?: string;
    sourceItemId?: string;
  }) => number;
  claim: (rewardId: string) => void;
  replaceRewards: (rewards: RewardDefinition[]) => void;
};

const RewardBankContext = createContext<RewardBankContextValue | undefined>(undefined);

export function RewardBankProvider({ children }: PropsWithChildren) {
  const [wallet, setWallet] = useState<RewardWallet>(createDefaultRewardWallet);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadRewardWallet()
      .then(setWallet)
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) {
      void saveRewardWallet(wallet);
    }
  }, [wallet, isReady]);

  const earn = useCallback(
    (input: {
      difficulty: RewardDifficulty;
      title: string;
      kind: RewardEarnEvent["kind"];
      packId?: string;
      sourceItemId?: string;
    }) => {
      let points = 1;
      setWallet((current) => {
        const next = earnPoints(current, input);
        points = next.availablePoints - current.availablePoints;
        return next;
      });
      return points;
    },
    []
  );

  const claim = useCallback((rewardId: string) => {
    setWallet((current) => claimReward(current, rewardId));
  }, []);

  const replaceRewards = useCallback((rewards: RewardDefinition[]) => {
    setWallet((current) => setCustomRewards(current, rewards));
  }, []);

  const next = useMemo(() => getNextReward(wallet), [wallet]);
  const big = useMemo(() => getBigGoal(wallet), [wallet]);

  const value = useMemo(
    () => ({
      wallet,
      isReady,
      nextReward: next.reward,
      pointsToNext: next.pointsToNext,
      bigGoal: big.reward,
      pointsToBigGoal: big.pointsToGo,
      earn,
      claim,
      replaceRewards
    }),
    [
      wallet,
      isReady,
      next.reward,
      next.pointsToNext,
      big.reward,
      big.pointsToGo,
      earn,
      claim,
      replaceRewards
    ]
  );

  return <RewardBankContext.Provider value={value}>{children}</RewardBankContext.Provider>;
}

export function useRewardBank() {
  const value = useContext(RewardBankContext);
  if (!value) {
    throw new Error("useRewardBank must be used within RewardBankProvider");
  }
  return value;
}
