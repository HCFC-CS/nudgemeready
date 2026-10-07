import { describe, expect, it } from "vitest";

import {
  createId,
  getCoreBudget,
  summariseBudget,
  summariseProjectBudget
} from "./budgetEngine";
import {
  annualEquivalentMinor,
  formatMoneyMinor,
  parseMoneyToMinor,
  toMonthlyEquivalentMinor
} from "./budgetMoney";
import { parseBudgetQuickAdd } from "./budgetParse";
import { budgetExtensionsForInstalledPacks } from "./ready4BudgetExtensions";
import { createDefaultBudgetState } from "./budgetStorage";
import type { BudgetItem } from "../types/budget";

describe("budgetMoney", () => {
  it("parses and formats without float drift", () => {
    expect(parseMoneyToMinor("£12.99")).toBe(1299);
    expect(parseMoneyToMinor("1,800")).toBe(180000);
    expect(formatMoneyMinor(1299)).toBe("£12.99");
    expect(formatMoneyMinor(-8500)).toBe("-£85.00");
  });

  it("converts frequencies to monthly equivalents", () => {
    expect(toMonthlyEquivalentMinor(60000, "annually")).toBe(5000);
    expect(toMonthlyEquivalentMinor(4500, "monthly")).toBe(4500);
    expect(toMonthlyEquivalentMinor(1000, "weekly")).toBe(Math.round((1000 * 52) / 12));
    expect(toMonthlyEquivalentMinor(7000, "every_x_weeks", 6)).toBe(Math.round((7000 * (52 / 6)) / 12));
    expect(toMonthlyEquivalentMinor(10000, "one_off")).toBe(0);
    expect(annualEquivalentMinor(1299, "monthly")).toBe(1299 * 12);
  });
});

describe("budgetEngine summary", () => {
  it("calculates money in, going out, saving and left for the core budget", () => {
    const state = createDefaultBudgetState();
    const core = getCoreBudget(state);
    const incomeCat = state.categories.find((category) => category.kind === "income")!;
    const homeCat = state.categories.find((category) => category.kind === "home")!;
    const saveCat = state.categories.find((category) => category.kind === "savings")!;

    const baseItem = (patch: Partial<BudgetItem> & Pick<BudgetItem, "name" | "itemType">): BudgetItem => ({
      id: createId("item"),
      budgetId: core.id,
      categoryId: null,
      expectedAmountMinor: null,
      actualAmountMinor: null,
      frequency: "monthly",
      customInterval: null,
      dueDate: null,
      nextDueDate: null,
      isSubscription: false,
      notes: null,
      archived: false,
      createdAt: core.createdAt,
      updatedAt: core.updatedAt,
      ...patch
    });

    state.items = [
      baseItem({
        name: "Salary",
        itemType: "income",
        expectedAmountMinor: 300000,
        categoryId: incomeCat.id
      }),
      baseItem({
        name: "Rent",
        itemType: "expense",
        expectedAmountMinor: 90000,
        categoryId: homeCat.id
      }),
      baseItem({
        name: "Insurance",
        itemType: "expense",
        expectedAmountMinor: 60000,
        frequency: "annually",
        categoryId: homeCat.id
      }),
      baseItem({
        name: "Holiday pot",
        itemType: "saving",
        expectedAmountMinor: 20000,
        categoryId: saveCat.id
      })
    ];

    const summary = summariseBudget(state, core.id);
    expect(summary.moneyInMinor).toBe(300000);
    expect(summary.goingOutMinor).toBe(90000 + 5000);
    expect(summary.savingMinor).toBe(20000);
    expect(summary.leftMinor).toBe(300000 - 95000 - 20000);
  });

  it("keeps project budgets separate from monthly left", () => {
    const state = createDefaultBudgetState();
    const core = getCoreBudget(state);
    state.budgets.push({
      id: "wedding",
      name: "Wedding",
      type: "project",
      period: "monthly",
      currency: "GBP",
      readyPackId: "ready4-wedding",
      createdAt: core.createdAt,
      updatedAt: core.updatedAt
    });
    state.items.push({
      id: "photo",
      budgetId: "wedding",
      categoryId: null,
      name: "Photographer",
      itemType: "expense",
      expectedAmountMinor: 180000,
      actualAmountMinor: 30000,
      frequency: "one_off",
      customInterval: null,
      dueDate: null,
      nextDueDate: null,
      isSubscription: false,
      notes: null,
      archived: false,
      createdAt: core.createdAt,
      updatedAt: core.updatedAt
    });

    const monthly = summariseBudget(state, core.id);
    expect(monthly.goingOutMinor).toBe(0);
    const project = summariseProjectBudget(state, "wedding");
    expect(project.totalBudgetMinor).toBe(180000);
    expect(project.spentMinor).toBe(30000);
    expect(project.committedMinor).toBe(150000);
  });
});

describe("parseBudgetQuickAdd", () => {
  it("parses natural language into a confirmable draft", () => {
    const draft = parseBudgetQuickAdd("£45 a month for dog grooming");
    expect(draft.amountMinor).toBe(4500);
    expect(draft.frequency).toBe("monthly");
    expect(draft.itemType).toBe("expense");
    expect(draft.suggestedCategoryKind).toBe("family");
    expect(draft.name.toLowerCase()).toMatch(/dog|groom/);
  });

  it("detects salary as income and annual insurance", () => {
    expect(parseBudgetQuickAdd("Salary £3200").itemType).toBe("income");
    const insurance = parseBudgetQuickAdd("Car insurance £620 due in November");
    expect(insurance.frequency).toBe("one_off");
    expect(insurance.suggestedCategoryKind).toBe("travel");
    expect(insurance.dueDate).toMatch(/-11-/);
  });
});

describe("Ready4 budget extensions", () => {
  it("only returns extensions for installed packs", () => {
    const none = budgetExtensionsForInstalledPacks([]);
    expect(none).toHaveLength(0);
    const some = budgetExtensionsForInstalledPacks(["ready4-wedding", "ready4-unknown"]);
    expect(some.map((entry) => entry.packId)).toEqual(["ready4-wedding"]);
  });
});
