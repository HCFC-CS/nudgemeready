import type { BudgetCategoryKind } from "../types/budget";

export type DefaultCategorySeed = {
  kind: BudgetCategoryKind;
  name: string;
  sortOrder: number;
  suggestedItems: string[];
};

/** Core monthly suggested areas — defaults only; users can add/rename/hide. */
export const CORE_BUDGET_CATEGORY_SEEDS: DefaultCategorySeed[] = [
  {
    kind: "income",
    name: "Money in",
    sortOrder: 10,
    suggestedItems: [
      "Salary / wages",
      "Benefits / support",
      "Pension",
      "Maintenance / contributions",
      "Side income",
      "Other income"
    ]
  },
  {
    kind: "home",
    name: "Home",
    sortOrder: 20,
    suggestedItems: [
      "Rent / mortgage",
      "Council tax",
      "Gas",
      "Electricity",
      "Water",
      "Home insurance",
      "Service charges / ground rent",
      "Repairs / maintenance"
    ]
  },
  {
    kind: "food",
    name: "Food & everyday",
    sortOrder: 30,
    suggestedItems: ["Groceries", "Takeaways / lunches", "Household items", "Toiletries"]
  },
  {
    kind: "travel",
    name: "Travel & car",
    sortOrder: 40,
    suggestedItems: [
      "Car payment",
      "Fuel",
      "Car insurance",
      "Road tax",
      "MOT",
      "Repairs / servicing",
      "Parking",
      "Public transport",
      "Taxis"
    ]
  },
  {
    kind: "bills",
    name: "Bills & subscriptions",
    sortOrder: 50,
    suggestedItems: [
      "Mobile phone",
      "Broadband",
      "TV",
      "Streaming",
      "Apps",
      "Software",
      "Memberships"
    ]
  },
  {
    kind: "health",
    name: "Health & wellbeing",
    sortOrder: 60,
    suggestedItems: [
      "Prescriptions",
      "Medication",
      "Dentist",
      "Optician",
      "Gym",
      "Fitness",
      "Therapy / support",
      "Personal care"
    ]
  },
  {
    kind: "family",
    name: "Family & pets",
    sortOrder: 70,
    suggestedItems: [
      "Children",
      "Childcare",
      "School",
      "Activities",
      "Pet food",
      "Vet",
      "Pet insurance"
    ]
  },
  {
    kind: "debt",
    name: "Debt & finance",
    sortOrder: 80,
    suggestedItems: ["Loans", "Credit cards", "Overdraft", "Buy Now Pay Later", "Other repayments"]
  },
  {
    kind: "fun",
    name: "Fun & lifestyle",
    sortOrder: 90,
    suggestedItems: ["Eating out", "Coffee", "Socialising", "Entertainment", "Hobbies", "Clothes"]
  },
  {
    kind: "savings",
    name: "Savings & goals",
    sortOrder: 100,
    suggestedItems: [
      "Emergency fund",
      "Holiday",
      "Christmas",
      "Gifts",
      "Big purchase",
      "General savings"
    ]
  },
  {
    kind: "other",
    name: "Other",
    sortOrder: 110,
    suggestedItems: []
  }
];

export function defaultItemTypeForCategory(kind: BudgetCategoryKind): "income" | "expense" | "saving" {
  if (kind === "income") {
    return "income";
  }
  if (kind === "savings") {
    return "saving";
  }
  return "expense";
}
