/** Personal user budget types — amounts stored as integer minor units (pence). */

export type BudgetPeriod = "weekly" | "fortnightly" | "four_weekly" | "monthly";

export type BudgetType = "core" | "project";

export type BudgetCategoryKind =
  | "income"
  | "home"
  | "food"
  | "travel"
  | "bills"
  | "health"
  | "family"
  | "debt"
  | "fun"
  | "savings"
  | "other"
  | "custom";

export type BudgetItemType = "income" | "expense" | "saving";

export type BudgetFrequency =
  | "one_off"
  | "weekly"
  | "fortnightly"
  | "every_4_weeks"
  | "monthly"
  | "every_x_weeks"
  | "every_x_months"
  | "quarterly"
  | "six_monthly"
  | "annually"
  | "custom";

export type Budget = {
  id: string;
  name: string;
  type: BudgetType;
  period: BudgetPeriod;
  currency: "GBP";
  /** Optional Ready4 pack link — null for core monthly budget. */
  readyPackId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BudgetCategory = {
  id: string;
  budgetId: string;
  name: string;
  kind: BudgetCategoryKind;
  isSystemCategory: boolean;
  sortOrder: number;
  hidden: boolean;
  archived: boolean;
};

export type BudgetItem = {
  id: string;
  budgetId: string;
  categoryId: string | null;
  name: string;
  itemType: BudgetItemType;
  /** Expected amount in minor units (pence). */
  expectedAmountMinor: number | null;
  /** Optional actual amount in minor units. */
  actualAmountMinor: number | null;
  frequency: BudgetFrequency;
  /** Used when frequency is every_x_weeks / every_x_months / custom. */
  customInterval: number | null;
  dueDate: string | null;
  nextDueDate: string | null;
  isSubscription: boolean;
  notes: string | null;
  readyPackId?: string | null;
  reminderItemId?: string | null;
  goalId?: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmountMinor: number;
  currentAmountMinor: number;
  targetDate: string | null;
  paused: boolean;
  completed: boolean;
  readyPackId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BudgetPayday =
  | { kind: "day_of_month"; day: number }
  | { kind: "weekday"; weekday: number }
  | { kind: "last_working_day" }
  | { kind: "every_n_weeks"; weeks: number; anchorDate: string }
  | { kind: "custom"; label: string };

export type BudgetState = {
  version: 1;
  trackActuals: boolean;
  period: BudgetPeriod;
  payday: BudgetPayday | null;
  budgets: Budget[];
  categories: BudgetCategory[];
  items: BudgetItem[];
  goals: SavingsGoal[];
  /** Soft dismissals for pack discovery / tips. */
  dismissedTips: string[];
  createdAt: string;
  updatedAt: string;
};

export type MonthlySummary = {
  moneyInMinor: number;
  goingOutMinor: number;
  savingMinor: number;
  leftMinor: number;
  usingActuals: boolean;
};

export type ParsedBudgetDraft = {
  name: string;
  amountMinor: number | null;
  itemType: BudgetItemType;
  frequency: BudgetFrequency;
  customInterval: number | null;
  dueDate: string | null;
  suggestedCategoryKind: BudgetCategoryKind;
  isSubscription: boolean;
  notes: string | null;
  raw: string;
};
