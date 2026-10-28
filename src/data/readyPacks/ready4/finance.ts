import { ready4Pack } from "../packFactory";

export const ready4FinancePack = ready4Pack({
  slug: "finance",
  name: "Finance",
  icon: "wallet-outline",
  category: "lifestyle",
  version: "1.1.0",
  summary:
    "Bills, subscriptions, renewals and a simple budget glance — organised calmly, not judged.",
  features: [
    "Bill calendar",
    "Subscription tracker",
    "Savings goals",
    "Annual renewals",
    "Budget planner"
  ],
  productId: "ready.pack.ready4_finance",
  templates: [
    {
      id: "what-helps",
      title: "What would help with money admin?",
      type: "list",
      notes: "Pick one section. Open that tool next. Amounts stay optional.",
      listItems: [
        { title: "Upcoming bills" },
        { title: "Subscription review" },
        { title: "Annual renewals" },
        { title: "Budget glance" },
        { title: "Payment due soon" },
        { title: "Rest — also valid" }
      ]
    },
    {
      id: "bill-calendar",
      title: "Upcoming bills",
      type: "list",
      repeatRule: { frequency: "monthly" },
      notes: "Organisational only — not financial advice. Edit amounts and dates to suit you. When ready, tap Sorted / Later / Ask.",
      listItems: [
        { title: "Bill 1 — (edit me)" },
        { title: "Bill 2 — (edit me)" },
        { title: "Bill 3 — (edit me)" },
        { title: "Payday / buffer noted" }
      ]
    },
    {
      id: "subscriptions",
      title: "Subscription review",
      type: "list",
      repeatRule: { frequency: "monthly" },
      notes: "Keep, Review later, Cancelled, or Not sure — your choice. No shame for unused trials.",
      listItems: [
        { title: "Streaming / media" },
        { title: "Apps / cloud" },
        { title: "Memberships" },
        { title: "Anything to cancel noted" }
      ]
    },
    {
      id: "savings-goals",
      title: "Savings goal note",
      type: "note",
      notes: "One goal is enough. Track progress kindly — not financial advice."
    },
    {
      id: "annual-renewals",
      title: "Annual renewals checklist",
      type: "list",
      dueInDays: 60,
      notes: "Insurance, MOT, tax, memberships — edit to suit.",
      listItems: [
        { title: "Car insurance / MOT" },
        { title: "Home / contents insurance" },
        { title: "Tax / self-assessment if relevant" },
        { title: "Other memberships" }
      ]
    },
    {
      id: "budget-planner",
      title: "Simple monthly budget glance",
      type: "list",
      repeatRule: { frequency: "monthly" },
      notes: "Rough categories only. Not a formal budget product.",
      listItems: [
        { title: "Essentials covered" },
        { title: "Flexible spend noted" },
        { title: "One money admin task done" },
        { title: "Rest — money worry pause if needed" }
      ]
    },
    {
      id: "payment-nudge",
      title: "Payment due soon",
      type: "reminder",
      notes: "Edit to match a real payment. Organisational only.",
      speakingReminderText: "A soft reminder about an upcoming payment.",
      dueInDays: 3,
      priority: "soon"
    }
  ],
  aiCoachPrompts: [
    "Help me list this month's bills without overwhelm.",
    "Suggest a calm subscription review checklist."
  ]
});
