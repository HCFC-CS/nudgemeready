import { ready4Pack } from "../packFactory";

export const ready4HomePack = ready4Pack({
  slug: "home",
  name: "Home",
  icon: "home-outline",
  category: "lifestyle",
  version: "1.1.0",
  summary:
    "Calm home routines — daily reset, cleaning, bins, maintenance and bills — without overwhelm.",
  features: [
    "Daily reset",
    "Cleaning planner",
    "Leaving-home check",
    "Bin collection",
    "Home maintenance",
    "Bill reminders"
  ],
  // Free — one of two included packs
  templates: [
    {
      id: "what-helps",
      title: "What would help at home?",
      type: "list",
      notes: "Pick one. Rest counts. Open that tool next.",
      listItems: [
        { title: "Daily home reset" },
        { title: "Leaving-home check" },
        { title: "Cleaning planner" },
        { title: "Bin day" },
        { title: "Maintenance glance" },
        { title: "Household bills" },
        { title: "Rest — also valid" }
      ]
    },
    {
      id: "daily-reset",
      title: "Daily home reset",
      type: "routine",
      repeatRule: { frequency: "daily" },
      notes: "Keep it short. One or two steps still count.",
      speakingReminderText: "A soft home reset when you are ready.",
      listItems: [
        { title: "Clear one surface" },
        { title: "Dishes or sink tidy" },
        { title: "Bins / recycling glance" },
        { title: "Keys and phone in usual place" }
      ]
    },
    {
      id: "leaving-home",
      title: "Leaving-home check",
      type: "list",
      notes: "Edit to match your day.",
      listItems: [
        { title: "Keys" },
        { title: "Phone" },
        { title: "Wallet / cards" },
        { title: "Doors locked if needed" }
      ]
    },
    {
      id: "cleaning-planner",
      title: "Cleaning planner",
      type: "list",
      repeatRule: { frequency: "weekly" },
      notes: "Room by room — skip what does not need doing.",
      listItems: [
        { title: "Kitchen" },
        { title: "Bathroom" },
        { title: "Floors / vacuum" },
        { title: "Laundry" },
        { title: "Beds / freshen" }
      ]
    },
    {
      id: "bin-day",
      title: "Bin collection",
      type: "reminder",
      notes: "Edit the day to match your collection. Put bins out the night before if that helps.",
      speakingReminderText: "Bin day reminder when you are ready.",
      repeatRule: { frequency: "weekly" },
      priority: "soon"
    },
    {
      id: "maintenance",
      title: "Home maintenance checklist",
      type: "list",
      notes: "A gentle quarterly glance. Edit freely.",
      dueInDays: 30,
      listItems: [
        { title: "Smoke / CO alarm check" },
        { title: "Filter / extractor wipe" },
        { title: "Boiler / heating glance" },
        { title: "Anything needing a call-out noted" }
      ]
    },
    {
      id: "bill-reminders",
      title: "Household bills glance",
      type: "list",
      repeatRule: { frequency: "monthly" },
      notes: "Organisational only — not financial advice.",
      listItems: [
        { title: "Rent / mortgage noted" },
        { title: "Utilities noted" },
        { title: "Council tax / service charge" },
        { title: "Any leftover item handled or deferred kindly" }
      ]
    }
  ],
  aiCoachPrompts: [
    "Help me plan a ten-minute home reset.",
    "Suggest a simple weekly cleaning plan without pressure."
  ]
});
