import type { BudgetCategoryKind } from "../types/budget";

export type Ready4BudgetSuggestedItem = {
  name: string;
  itemType?: "expense" | "saving" | "income";
};

export type Ready4BudgetCategoryTemplate = {
  name: string;
  kind?: BudgetCategoryKind;
  suggestedItems: Ready4BudgetSuggestedItem[];
};

export type Ready4BudgetExtension = {
  packId: string;
  budgetName: string;
  categories: Ready4BudgetCategoryTemplate[];
};

/**
 * Ready4 packs register specialist project budgets here.
 * Only surface when installedReadyPacks.includes(packId).
 */
export const READY4_BUDGET_EXTENSIONS: Ready4BudgetExtension[] = [
  {
    packId: "ready4-moving",
    budgetName: "Moving budget",
    categories: [
      {
        name: "Moving costs",
        suggestedItems: [
          { name: "Deposit / upfront costs" },
          { name: "Mortgage fees" },
          { name: "Survey" },
          { name: "Solicitor" },
          { name: "Legal fees" },
          { name: "Removal company" },
          { name: "Storage" },
          { name: "Boxes" },
          { name: "Packing" },
          { name: "Cleaning" },
          { name: "Decorating" },
          { name: "Furniture" },
          { name: "Utility changes" },
          { name: "Insurance" },
          { name: "Contingency" }
        ]
      }
    ]
  },
  {
    packId: "ready4-wedding",
    budgetName: "Wedding budget",
    categories: [
      {
        name: "Wedding",
        suggestedItems: [
          { name: "Venue" },
          { name: "Ceremony" },
          { name: "Registration" },
          { name: "Dress / outfits" },
          { name: "Rings" },
          { name: "Flowers" },
          { name: "Photography" },
          { name: "Video" },
          { name: "Catering" },
          { name: "Drinks" },
          { name: "Entertainment" },
          { name: "Decorations" },
          { name: "Invitations" },
          { name: "Transport" },
          { name: "Hen / stag" },
          { name: "Honeymoon" },
          { name: "Gifts" },
          { name: "Favours" },
          { name: "Contingency" }
        ]
      }
    ]
  },
  {
    packId: "ready4-baby",
    budgetName: "Baby budget",
    categories: [
      {
        name: "Baby",
        suggestedItems: [
          { name: "Hospital bag" },
          { name: "Pram" },
          { name: "Travel system" },
          { name: "Car seat" },
          { name: "Cot" },
          { name: "Furniture" },
          { name: "Clothes" },
          { name: "Feeding" },
          { name: "Changing" },
          { name: "Nappies" },
          { name: "Baby monitor" },
          { name: "Safety equipment" },
          { name: "Baby shower" },
          { name: "Sip & See" },
          { name: "Baptism / christening" },
          { name: "Classes" },
          { name: "Activities" },
          { name: "Childcare planning" },
          { name: "Push present" },
          { name: "Contingency" }
        ]
      }
    ]
  },
  {
    packId: "ready4-travel",
    budgetName: "Travel budget",
    categories: [
      {
        name: "Travel",
        suggestedItems: [
          { name: "Flights / transport" },
          { name: "Accommodation" },
          { name: "Transfers" },
          { name: "Insurance" },
          { name: "Parking" },
          { name: "Food" },
          { name: "Activities" },
          { name: "Spending money" },
          { name: "Luggage" },
          { name: "Travel purchases" },
          { name: "Visas / documents" },
          { name: "Pet/home care" },
          { name: "Contingency" }
        ]
      }
    ]
  },
  {
    packId: "ready4-finance",
    budgetName: "Finance focus",
    categories: [
      {
        name: "Finance extras",
        suggestedItems: [
          { name: "Bill calendar review" },
          { name: "Subscription check" },
          { name: "Annual renewals" }
        ]
      }
    ]
  },
  {
    packId: "ready4-shopping",
    budgetName: "Shopping focus",
    categories: [
      {
        name: "Shopping",
        suggestedItems: [{ name: "Essentials restock" }, { name: "Big purchase plan" }]
      }
    ]
  }
];

export function budgetExtensionsForInstalledPacks(installedPackIds: string[]): Ready4BudgetExtension[] {
  const installed = new Set(installedPackIds);
  return READY4_BUDGET_EXTENSIONS.filter((entry) => installed.has(entry.packId));
}
