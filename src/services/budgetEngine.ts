import type {
  Budget,
  BudgetCategory,
  BudgetItem,
  BudgetState,
  MonthlySummary,
  SavingsGoal
} from "../types/budget";
import { toMonthlyEquivalentMinor } from "./budgetMoney";

export function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getCoreBudget(state: BudgetState): Budget {
  const core = state.budgets.find((budget) => budget.type === "core");
  if (!core) {
    throw new Error("Core budget missing");
  }
  return core;
}

export function categoriesForBudget(state: BudgetState, budgetId: string, options?: { includeHidden?: boolean }) {
  return state.categories
    .filter((category) => category.budgetId === budgetId)
    .filter((category) => options?.includeHidden || (!category.hidden && !category.archived))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function itemsForBudget(state: BudgetState, budgetId: string) {
  return state.items.filter((item) => item.budgetId === budgetId && !item.archived);
}

export function itemsForCategory(state: BudgetState, categoryId: string) {
  return state.items.filter((item) => item.categoryId === categoryId && !item.archived);
}

function amountForSummary(item: BudgetItem, useActual: boolean): number {
  const raw =
    useActual && item.actualAmountMinor != null ? item.actualAmountMinor : item.expectedAmountMinor;
  if (raw == null) {
    return 0;
  }
  return toMonthlyEquivalentMinor(raw, item.frequency, item.customInterval);
}

/**
 * Core monthly view:
 * MONEY IN − PLANNED SPENDING − PLANNED SAVING = LEFT
 * One-off items do not feed the monthly dashboard (frequency one_off → 0 monthly).
 * Project / Ready4 budgets are excluded unless the caller passes that budgetId.
 */
export function summariseBudget(
  state: BudgetState,
  budgetId: string,
  options?: { useActuals?: boolean }
): MonthlySummary {
  const useActuals = Boolean(options?.useActuals && state.trackActuals);
  const items = itemsForBudget(state, budgetId);

  let moneyInMinor = 0;
  let goingOutMinor = 0;
  let savingMinor = 0;

  for (const item of items) {
    const monthly = amountForSummary(item, useActuals);
    if (item.itemType === "income") {
      moneyInMinor += monthly;
    } else if (item.itemType === "saving") {
      savingMinor += monthly;
    } else {
      goingOutMinor += monthly;
    }
  }

  return {
    moneyInMinor,
    goingOutMinor,
    savingMinor,
    leftMinor: moneyInMinor - goingOutMinor - savingMinor,
    usingActuals: useActuals
  };
}

export function upcomingItems(state: BudgetState, budgetId: string, withinDays = 45): BudgetItem[] {
  const now = Date.now();
  const limit = now + withinDays * 24 * 60 * 60 * 1000;
  return itemsForBudget(state, budgetId)
    .filter((item) => {
      const due = item.nextDueDate || item.dueDate;
      if (!due) {
        return false;
      }
      const ms = Date.parse(due);
      return Number.isFinite(ms) && ms >= now - 24 * 60 * 60 * 1000 && ms <= limit;
    })
    .sort((a, b) => {
      const aDue = Date.parse(a.nextDueDate || a.dueDate || "");
      const bDue = Date.parse(b.nextDueDate || b.dueDate || "");
      return aDue - bDue;
    });
}

export function activeGoals(state: BudgetState): SavingsGoal[] {
  return state.goals.filter((goal) => !goal.completed);
}

export function goalProgress(goal: SavingsGoal) {
  const left = Math.max(0, goal.targetAmountMinor - goal.currentAmountMinor);
  const ratio =
    goal.targetAmountMinor > 0
      ? Math.min(1, goal.currentAmountMinor / goal.targetAmountMinor)
      : 0;
  return { leftMinor: left, ratio };
}

export function suggestedMonthlyContribution(goal: SavingsGoal, now = new Date()): number | null {
  if (!goal.targetDate || goal.paused || goal.completed) {
    return null;
  }
  const targetMs = Date.parse(goal.targetDate);
  if (!Number.isFinite(targetMs) || targetMs <= now.getTime()) {
    return null;
  }
  const left = Math.max(0, goal.targetAmountMinor - goal.currentAmountMinor);
  if (left <= 0) {
    return 0;
  }
  const months = Math.max(1, (targetMs - now.getTime()) / (30.4375 * 24 * 60 * 60 * 1000));
  return Math.ceil(left / months);
}

export function calmLeftMessage(summary: MonthlySummary): string {
  if (summary.leftMinor >= 0) {
    return `You've got room after planned spending this month.`;
  }
  return `Your planned spending is a little more than your income this month. Want to have a look together?`;
}

export function categoryMonthlyTotal(
  state: BudgetState,
  category: BudgetCategory,
  options?: { useActuals?: boolean }
): number {
  const useActuals = Boolean(options?.useActuals && state.trackActuals);
  return itemsForCategory(state, category.id).reduce(
    (sum, item) => sum + amountForSummary(item, useActuals),
    0
  );
}

/** Project budget rollup: total expected, spent (actual), committed (expected remaining). */
export function summariseProjectBudget(state: BudgetState, budgetId: string) {
  const items = itemsForBudget(state, budgetId);
  let totalBudgetMinor = 0;
  let spentMinor = 0;
  let committedMinor = 0;

  for (const item of items) {
    const expected = item.expectedAmountMinor ?? 0;
    const actual = item.actualAmountMinor ?? 0;
    totalBudgetMinor += expected;
    spentMinor += actual;
    if (actual < expected) {
      committedMinor += expected - actual;
    }
  }

  return {
    totalBudgetMinor,
    spentMinor,
    committedMinor,
    leftMinor: totalBudgetMinor - spentMinor - committedMinor
  };
}
