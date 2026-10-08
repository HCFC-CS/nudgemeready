import { defineContentPack } from "../packFactory";

export const workingParentPack = defineContentPack({
  meta: {
    id: "working-parent",
    version: "1.2.0",
    icon: "people-outline",
    category: "family",
    title: "Working Parent",
    summary:
      "School run, clubs, lunches, shopping and handovers — so the mental load is not only in your head.",
    features: [
      "School run",
      "Clubs and pickup",
      "Lunches",
      "Shopping",
      "Week glance",
      "Handover notes",
      "Parent reset",
      "Partner shop links"
    ],
    productId: "ready.pack.working_parent"
  },
  templates: [
    {
      id: "school-run",
      title: "School run checklist",
      type: "list",
      listItems: [
        { title: "Bags packed" },
        { title: "Water bottles" },
        { title: "Keys and phone" },
        { title: "Leave on time" },
        { title: "Anything special today noted" }
      ],
      repeatRule: { frequency: "daily" },
      priority: "important"
    },
    {
      id: "morning-top-3",
      title: "Morning top 3",
      type: "list",
      notes: "Three things only so the morning stays kind.",
      listItems: [
        { title: "Priority 1" },
        { title: "Priority 2" },
        { title: "Priority 3" }
      ],
      repeatRule: { frequency: "daily" },
      priority: "soon"
    },
    {
      id: "clubs",
      title: "After-school club",
      type: "reminder",
      notes: "Kit, pickup time, and who is collecting.",
      speakingReminderText: "Club reminder for today.",
      priority: "soon"
    },
    {
      id: "pickup-handover",
      title: "Pickup / handover notes",
      type: "note",
      notes: "Who is collecting, where, and any change of plan."
    },
    {
      id: "lunches",
      title: "Pack lunches",
      type: "reminder",
      repeatRule: { frequency: "daily" },
      speakingReminderText: "Lunch packing reminder.",
      notes: "Edit or skip on packed-lunch days that do not apply.",
      priority: "soon"
    },
    {
      id: "lunch-list",
      title: "Lunch box ideas",
      type: "list",
      listItems: [
        { title: "Main" },
        { title: "Fruit / veg" },
        { title: "Snack" },
        { title: "Drink" }
      ],
      priority: "not_urgent"
    },
    {
      id: "shopping",
      title: "Family shopping list",
      type: "list",
      listItems: [
        { title: "Milk" },
        { title: "Fruit" },
        { title: "Bread" },
        { title: "Snacks" },
        { title: "School / club extras" }
      ],
      priority: "soon"
    },
    {
      id: "week-glance",
      title: "Family week glance",
      type: "list",
      notes: "One calm look at the week.",
      listItems: [
        { title: "Clubs / fixtures noted" },
        { title: "Work late days noted" },
        { title: "Who covers pickup" },
        { title: "One rest / family moment" }
      ],
      repeatRule: { frequency: "weekly" },
      priority: "soon"
    },
    {
      id: "forms-admin",
      title: "School / club forms",
      type: "task",
      notes: "Permission slips, payments, kit lists — edit as needed.",
      dueInDays: 5,
      priority: "important"
    },
    {
      id: "parent-reset",
      title: "Parent reset",
      type: "list",
      listItems: [
        { title: "Drink water" },
        { title: "Sit for 5 minutes" },
        { title: "Ask for help if needed" },
        { title: "Drop one non-essential" }
      ],
      priority: "soon"
    },
    {
      id: "pack-shop",
      title: "Optional family supplies shop",
      type: "list",
      notes:
        "Browse partner suppliers for lunch boxes, bottles and labels. Affiliate links — we may earn a small commission if you buy, at no extra cost to you. Nothing required.",
      listItems: [
        { title: "Lunch boxes" },
        { title: "Water bottles" },
        { title: "Name labels" },
        { title: "Nothing right now" }
      ],
      priority: "not_urgent"
    }
  ],
  aiCoachPrompts: [
    "Help me plan tomorrow morning with fewer decisions.",
    "Suggest a calm school-run checklist.",
    "Help me write a clear pickup handover note."
  ],
  badges: [
    { id: "parent-morning", title: "Morning managed", description: "You got the morning moving." },
    { id: "parent-week", title: "Week glanced", description: "You looked ahead." },
    { id: "parent-reset", title: "Reset taken", description: "You claimed a pause." }
  ],
  crewRecommendations: [
    { roleHint: "guardian", reason: "Someone who can cover pickup if needed." },
    { roleHint: "cheerleader", reason: "Appreciation for the invisible load." }
  ]
});
