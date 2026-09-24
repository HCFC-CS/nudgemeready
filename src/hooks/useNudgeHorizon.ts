import { useMemo, useState } from "react";

import { useBudget } from "./useBudget";
import { useNudgeItems } from "./useNudgeItems";
import { useReady4Planner } from "./useReady4Planner";
import {
  applySimplify,
  buildHomeComingUpPeek,
  buildLaterView,
  buildMonthView,
  buildQuarterView,
  buildTodayView,
  buildUnifiedHorizonEntries,
  buildWeekView,
  buildYearView
} from "../services/nudgeHorizonEngine";
import type { NudgeHorizonId, SimplifyMode } from "../types/nudgeHorizon";

export function useNudgeHorizon() {
  const { items: nudges, isReady: nudgesReady } = useNudgeItems();
  const { state: plannerState, isReady: plannerReady } = useReady4Planner();
  const { state: budgetState, coreBudgetId, isReady: budgetReady } = useBudget();
  const [simplifyMode, setSimplifyMode] = useState<SimplifyMode>("as_is");
  const [horizon, setHorizon] = useState<NudgeHorizonId>("today");

  const isReady = nudgesReady && plannerReady && budgetReady;

  const entries = useMemo(() => {
    if (!isReady) {
      return [];
    }
    return applySimplify(
      buildUnifiedHorizonEntries({
        nudges,
        plannerItems: plannerState.items,
        budgetState,
        coreBudgetId
      }),
      simplifyMode
    );
  }, [isReady, nudges, plannerState.items, budgetState, coreBudgetId, simplifyMode]);

  const today = useMemo(() => buildTodayView(entries), [entries]);
  const week = useMemo(() => buildWeekView(entries), [entries]);
  const month = useMemo(() => buildMonthView(entries), [entries]);
  const quarter = useMemo(() => buildQuarterView(entries), [entries]);
  const year = useMemo(() => buildYearView(entries), [entries]);
  const later = useMemo(() => buildLaterView(entries), [entries]);
  const homePeek = useMemo(() => buildHomeComingUpPeek(entries), [entries]);

  return {
    isReady,
    horizon,
    setHorizon,
    simplifyMode,
    setSimplifyMode,
    entries,
    today,
    week,
    month,
    quarter,
    year,
    later,
    homePeek
  };
}
