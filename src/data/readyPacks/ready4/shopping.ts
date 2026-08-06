import { ready4Pack } from "../packFactory";

export const ready4ShoppingPack = ready4Pack({
  slug: "shopping",
  name: "Shopping",
  icon: "cart-outline",
  category: "lifestyle",
  summary:
    "Reusable lists, household essentials and a calm shop plan — buy what you need without the mental load.",
  features: [
    "Shopping lists",
    "Meal ingredients",
    "Household essentials",
    "Budget basket glance",
    "Seasonal / event shop"
  ],
  productId: "ready.pack.ready4_shopping",
  templates: [
    {
      id: "main-list",
      title: "Shopping list",
      type: "list",
      notes: "Edit freely. Tick as you go.",
      listItems: [
        { title: "Fruit / veg" },
        { title: "Dairy / alternatives" },
        { title: "Bread / staples" },
        { title: "Protein / mains" },
        { title: "Household" }
      ]
    },
    {
      id: "meal-ingredients",
      title: "Ingredients for planned meals",
      type: "list",
      notes: "Link to this week's meals if helpful.",
      listItems: [
        { title: "Meal 1 ingredients" },
        { title: "Meal 2 ingredients" },
        { title: "Snacks" }
      ]
    },
    {
      id: "household-essentials",
      title: "Household essentials restock",
      type: "list",
      repeatRule: { frequency: "weekly" },
      listItems: [
        { title: "Toilet paper / tissues" },
        { title: "Cleaning / washing" },
        { title: "Personal care" },
        { title: "Pet food if relevant" }
      ]
    },
    {
      id: "budget-basket",
      title: "Budget basket glance",
      type: "note",
      notes: "Optional spend limit for this trip. Organisational only — not financial advice."
    },
    {
      id: "seasonal-shop",
      title: "Event / seasonal shop",
      type: "list",
      notes: "Birthdays, holidays, guests — edit as needed.",
      listItems: [
        { title: "Card / gift" },
        { title: "Food extras" },
        { title: "Decor / wrapping (optional)" }
      ]
    },
    {
      id: "before-you-go",
      title: "Before you leave for the shop",
      type: "list",
      listItems: [
        { title: "Bags / trolley token" },
        { title: "List open" },
        { title: "Loyalty / payment card" },
        { title: "Anything from the fridge checked" }
      ]
    }
  ],
  aiCoachPrompts: [
    "Help me turn this week's meals into a short shopping list.",
    "Suggest a calm essentials restock checklist."
  ]
});
