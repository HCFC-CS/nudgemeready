import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import type {
  BudgetCategory,
  BudgetItem,
  BudgetState,
  ParsedBudgetDraft,
  SavingsGoal
} from "../types/budget";
import { CORE_BUDGET_CATEGORY_SEEDS, defaultItemTypeForCategory } from "../services/budgetDefaults";
import {
  categoriesForBudget,
  createId,
  getCoreBudget,
  itemsForBudget,
  summariseBudget
} from "../services/budgetEngine";
import { createDefaultBudgetState, loadBudgetState, saveBudgetState, touch } from "../services/budgetStorage";
import type { Ready4BudgetExtension } from "../services/ready4BudgetExtensions";

type BudgetContextValue = {
  state: BudgetState;
  isReady: boolean;
  coreBudgetId: string;
  summary: ReturnType<typeof summariseBudget>;
  categories: BudgetCategory[];
  items: BudgetItem[];
  refresh: () => Promise<void>;
  setTrackActuals: (value: boolean) => void;
  addCategory: (name: string, kind?: BudgetCategory["kind"], budgetId?: string) => BudgetCategory;
  renameCategory: (categoryId: string, name: string) => void;
  hideCategory: (categoryId: string, hidden?: boolean) => void;
  archiveCategory: (categoryId: string) => void;
  addItem: (input: Partial<BudgetItem> & Pick<BudgetItem, "name" | "itemType">) => BudgetItem;
  updateItem: (itemId: string, patch: Partial<BudgetItem>) => void;
  archiveItem: (itemId: string) => void;
  addItemFromDraft: (draft: ParsedBudgetDraft, categoryId?: string | null) => BudgetItem;
  addGoal: (input: Pick<SavingsGoal, "name" | "targetAmountMinor"> & Partial<SavingsGoal>) => SavingsGoal;
  updateGoal: (goalId: string, patch: Partial<SavingsGoal>) => void;
  ensureProjectBudgetFromExtension: (extension: Ready4BudgetExtension) => string;
};

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

export function BudgetProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<BudgetState>(createDefaultBudgetState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadBudgetState()
      .then(setState)
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    void saveBudgetState(state);
  }, [state, isReady]);

  const persist = useCallback((updater: (current: BudgetState) => BudgetState) => {
    setState((current) => touch(updater(current)));
  }, []);

  const refresh = useCallback(async () => {
    setState(await loadBudgetState());
  }, []);

  const coreBudgetId = useMemo(() => {
    try {
      return getCoreBudget(state).id;
    } catch {
      return state.budgets[0]?.id ?? "";
    }
  }, [state]);

  const summary = useMemo(
    () => (coreBudgetId ? summariseBudget(state, coreBudgetId) : summariseBudget(state, "")),
    [state, coreBudgetId]
  );

  const categories = useMemo(
    () => (coreBudgetId ? categoriesForBudget(state, coreBudgetId) : []),
    [state, coreBudgetId]
  );

  const items = useMemo(
    () => (coreBudgetId ? itemsForBudget(state, coreBudgetId) : []),
    [state, coreBudgetId]
  );

  const setTrackActuals = useCallback(
    (value: boolean) => {
      persist((current) => ({ ...current, trackActuals: value }));
    },
    [persist]
  );

  const addCategory = useCallback(
    (name: string, kind: BudgetCategory["kind"] = "custom", budgetId?: string) => {
      const category: BudgetCategory = {
        id: createId("cat"),
        budgetId: budgetId ?? coreBudgetId,
        name: name.trim() || "My category",
        kind,
        isSystemCategory: false,
        sortOrder: 500 + state.categories.length,
        hidden: false,
        archived: false
      };
      persist((current) => ({ ...current, categories: [...current.categories, category] }));
      return category;
    },
    [coreBudgetId, persist, state.categories.length]
  );

  const renameCategory = useCallback(
    (categoryId: string, name: string) => {
      persist((current) => ({
        ...current,
        categories: current.categories.map((category) =>
          category.id === categoryId ? { ...category, name: name.trim() || category.name } : category
        )
      }));
    },
    [persist]
  );

  const hideCategory = useCallback(
    (categoryId: string, hidden = true) => {
      persist((current) => ({
        ...current,
        categories: current.categories.map((category) =>
          category.id === categoryId ? { ...category, hidden } : category
        )
      }));
    },
    [persist]
  );

  const archiveCategory = useCallback(
    (categoryId: string) => {
      persist((current) => ({
        ...current,
        categories: current.categories.map((category) =>
          category.id === categoryId ? { ...category, archived: true, hidden: true } : category
        )
      }));
    },
    [persist]
  );

  const addItem = useCallback(
    (input: Partial<BudgetItem> & Pick<BudgetItem, "name" | "itemType">) => {
      const at = new Date().toISOString();
      const item: BudgetItem = {
        id: createId("item"),
        budgetId: input.budgetId ?? coreBudgetId,
        categoryId: input.categoryId ?? null,
        name: input.name.trim() || "Something",
        itemType: input.itemType,
        expectedAmountMinor: input.expectedAmountMinor ?? null,
        actualAmountMinor: input.actualAmountMinor ?? null,
        frequency: input.frequency ?? "monthly",
        customInterval: input.customInterval ?? null,
        dueDate: input.dueDate ?? null,
        nextDueDate: input.nextDueDate ?? input.dueDate ?? null,
        isSubscription: Boolean(input.isSubscription),
        notes: input.notes ?? null,
        readyPackId: input.readyPackId ?? null,
        reminderItemId: input.reminderItemId ?? null,
        goalId: input.goalId ?? null,
        archived: false,
        createdAt: at,
        updatedAt: at
      };
      persist((current) => ({ ...current, items: [...current.items, item] }));
      return item;
    },
    [coreBudgetId, persist]
  );

  const updateItem = useCallback(
    (itemId: string, patch: Partial<BudgetItem>) => {
      persist((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === itemId ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item
        )
      }));
    },
    [persist]
  );

  const archiveItem = useCallback(
    (itemId: string) => {
      updateItem(itemId, { archived: true });
    },
    [updateItem]
  );

  const addItemFromDraft = useCallback(
    (draft: ParsedBudgetDraft, categoryId?: string | null) => {
      let resolvedCategoryId = categoryId ?? null;
      if (!resolvedCategoryId) {
        const match = categories.find((category) => category.kind === draft.suggestedCategoryKind);
        resolvedCategoryId = match?.id ?? null;
      }
      return addItem({
        name: draft.name,
        itemType: draft.itemType,
        expectedAmountMinor: draft.amountMinor,
        frequency: draft.frequency,
        customInterval: draft.customInterval,
        dueDate: draft.dueDate,
        nextDueDate: draft.dueDate,
        categoryId: resolvedCategoryId,
        isSubscription: draft.isSubscription,
        notes: draft.notes
      });
    },
    [addItem, categories]
  );

  const addGoal = useCallback(
    (input: Pick<SavingsGoal, "name" | "targetAmountMinor"> & Partial<SavingsGoal>) => {
      const at = new Date().toISOString();
      const goal: SavingsGoal = {
        id: createId("goal"),
        name: input.name.trim() || "Goal",
        targetAmountMinor: input.targetAmountMinor,
        currentAmountMinor: input.currentAmountMinor ?? 0,
        targetDate: input.targetDate ?? null,
        paused: false,
        completed: false,
        readyPackId: input.readyPackId ?? null,
        createdAt: at,
        updatedAt: at
      };
      persist((current) => ({ ...current, goals: [...current.goals, goal] }));
      return goal;
    },
    [persist]
  );

  const updateGoal = useCallback(
    (goalId: string, patch: Partial<SavingsGoal>) => {
      persist((current) => ({
        ...current,
        goals: current.goals.map((goal) =>
          goal.id === goalId ? { ...goal, ...patch, updatedAt: new Date().toISOString() } : goal
        )
      }));
    },
    [persist]
  );

  const ensureProjectBudgetFromExtension = useCallback(
    (extension: Ready4BudgetExtension) => {
      const existing = state.budgets.find(
        (budget) => budget.type === "project" && budget.readyPackId === extension.packId
      );
      if (existing) {
        return existing.id;
      }
      const at = new Date().toISOString();
      const budgetId = createId("budget");
      const budget = {
        id: budgetId,
        name: extension.budgetName,
        type: "project" as const,
        period: "monthly" as const,
        currency: "GBP" as const,
        readyPackId: extension.packId,
        createdAt: at,
        updatedAt: at
      };
      const newCategories: BudgetCategory[] = extension.categories.map((template, index) => ({
        id: createId("cat"),
        budgetId,
        name: template.name,
        kind: template.kind ?? "custom",
        isSystemCategory: false,
        sortOrder: (index + 1) * 10,
        hidden: false,
        archived: false
      }));
      persist((current) => ({
        ...current,
        budgets: [...current.budgets, budget],
        categories: [...current.categories, ...newCategories]
      }));
      return budgetId;
    },
    [persist, state.budgets]
  );

  const value: BudgetContextValue = {
    state,
    isReady,
    coreBudgetId,
    summary,
    categories,
    items,
    refresh,
    setTrackActuals,
    addCategory,
    renameCategory,
    hideCategory,
    archiveCategory,
    addItem,
    updateItem,
    archiveItem,
    addItemFromDraft,
    addGoal,
    updateGoal,
    ensureProjectBudgetFromExtension
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget must be used inside BudgetProvider");
  }
  return context;
}

export function suggestedItemsForKind(kind: BudgetCategory["kind"]) {
  return CORE_BUDGET_CATEGORY_SEEDS.find((seed) => seed.kind === kind)?.suggestedItems ?? [];
}

export { defaultItemTypeForCategory };
