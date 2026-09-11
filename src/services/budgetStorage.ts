import type {
  Budget,
  BudgetCategory,
  BudgetItem,
  BudgetState,
  SavingsGoal
} from "../types/budget";
import { CORE_BUDGET_CATEGORY_SEEDS } from "./budgetDefaults";
import { createId } from "./budgetEngine";
import { getEncryptedItem, setEncryptedItem } from "./encryptedStorage";

const BUDGET_STATE_KEY = "nudge-me:budget-v1";

function nowIso() {
  return new Date().toISOString();
}

export function createDefaultBudgetState(at = nowIso()): BudgetState {
  const budgetId = createId("budget");
  const budget: Budget = {
    id: budgetId,
    name: "My money",
    type: "core",
    period: "monthly",
    currency: "GBP",
    readyPackId: null,
    createdAt: at,
    updatedAt: at
  };

  const categories: BudgetCategory[] = CORE_BUDGET_CATEGORY_SEEDS.map((seed) => ({
    id: createId("cat"),
    budgetId,
    name: seed.name,
    kind: seed.kind,
    isSystemCategory: true,
    sortOrder: seed.sortOrder,
    hidden: false,
    archived: false
  }));

  return {
    version: 1,
    trackActuals: false,
    period: "monthly",
    payday: null,
    budgets: [budget],
    categories,
    items: [],
    goals: [],
    dismissedTips: [],
    createdAt: at,
    updatedAt: at
  };
}

function normalizeState(parsed: Partial<BudgetState> | null | undefined): BudgetState {
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.budgets) || !parsed.budgets.length) {
    return createDefaultBudgetState();
  }
  return {
    version: 1,
    trackActuals: Boolean(parsed.trackActuals),
    period: parsed.period === "weekly" || parsed.period === "fortnightly" || parsed.period === "four_weekly"
      ? parsed.period
      : "monthly",
    payday: parsed.payday ?? null,
    budgets: parsed.budgets as Budget[],
    categories: Array.isArray(parsed.categories) ? (parsed.categories as BudgetCategory[]) : [],
    items: Array.isArray(parsed.items) ? (parsed.items as BudgetItem[]) : [],
    goals: Array.isArray(parsed.goals) ? (parsed.goals as SavingsGoal[]) : [],
    dismissedTips: Array.isArray(parsed.dismissedTips) ? parsed.dismissedTips.map(String) : [],
    createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : nowIso(),
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : nowIso()
  };
}

export async function loadBudgetState(): Promise<BudgetState> {
  const raw = await getEncryptedItem(BUDGET_STATE_KEY);
  if (!raw) {
    const fresh = createDefaultBudgetState();
    await saveBudgetState(fresh);
    return fresh;
  }
  try {
    return normalizeState(JSON.parse(raw) as Partial<BudgetState>);
  } catch {
    return createDefaultBudgetState();
  }
}

export async function saveBudgetState(state: BudgetState) {
  const next = { ...state, updatedAt: nowIso() };
  await setEncryptedItem(BUDGET_STATE_KEY, JSON.stringify(next));
  return next;
}

export function touch(state: BudgetState): BudgetState {
  return { ...state, updatedAt: nowIso() };
}
