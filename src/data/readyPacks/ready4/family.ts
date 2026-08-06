import { ready4Pack } from "../packFactory";

export const ready4FamilyPack = ready4Pack({
  slug: "family",
  name: "Family",
  icon: "people-outline",
  category: "family",
  summary:
    "School, meals, chores and shared plans — so the mental load is not only in one person's head.",
  features: [
    "Family week glance",
    "School hub",
    "Meal planner",
    "Chores",
    "Family budget glance",
    "Handover notes"
  ],
  productId: "ready.pack.ready4_family",
  templates: [
    {
      id: "family-week",
      title: "Family week glance",
      type: "list",
      repeatRule: { frequency: "weekly" },
      notes: "One calm look at the week ahead.",
      listItems: [
        { title: "Clubs / fixtures noted" },
        { title: "Work late days noted" },
        { title: "Who covers pickup" },
        { title: "One rest / family moment" }
      ]
    },
    {
      id: "school-hub",
      title: "School / nursery checklist",
      type: "list",
      repeatRule: { frequency: "daily" },
      notes: "Edit for your household. Skip days that do not apply.",
      listItems: [
        { title: "Bags packed" },
        { title: "PE / kit if needed" },
        { title: "Forms / payments noted" },
        { title: "Packed lunch or dinner money" },
        { title: "Anything special today" }
      ]
    },
    {
      id: "meal-planner",
      title: "Meal ideas this week",
      type: "list",
      repeatRule: { frequency: "weekly" },
      notes: "Simple ideas only — no perfect plate required.",
      listItems: [
        { title: "Mon / Tue idea" },
        { title: "Wed / Thu idea" },
        { title: "Fri idea" },
        { title: "Shopping linked (optional)" }
      ]
    },
    {
      id: "chores",
      title: "Chore share",
      type: "list",
      notes: "Age-appropriate and optional. Rest still counts.",
      listItems: [
        { title: "Job 1 — (edit me)" },
        { title: "Job 2 — (edit me)" },
        { title: "Job 3 — (edit me)" }
      ]
    },
    {
      id: "family-budget",
      title: "Family spend glance",
      type: "list",
      repeatRule: { frequency: "weekly" },
      notes: "Organisational only — not financial advice.",
      listItems: [
        { title: "Food / shop noted" },
        { title: "Activities / clubs" },
        { title: "Upcoming birthdays / trips" }
      ]
    },
    {
      id: "handover",
      title: "Pickup / handover notes",
      type: "note",
      notes: "Who is collecting, where, and any change of plan."
    }
  ],
  aiCoachPrompts: [
    "Help me plan tomorrow morning for the family with fewer decisions.",
    "Suggest a calm school-run checklist."
  ]
});
