import { organisationalHealthNote, ready4Pack } from "../packFactory";

/** Aligned to Ready_4_Baby_User_Flow — early-days organisation, not medical advice. */
export const ready4BabyPack = ready4Pack({
  slug: "baby",
  name: "Baby",
  icon: "happy-outline",
  category: "family",
  summary:
    "Feeds, bag checks, appointments and rest prompts for early days — organisational support only.",
  features: [
    "What would help today",
    "Feed / rest prompts",
    "Bag checklist",
    "Appointment prep",
    "Visitor boundaries",
    "Ask for help"
  ],
  productId: "ready.pack.ready4_baby",
  healthDisclaimer: organisationalHealthNote,
  templates: [
    {
      id: "what-helps",
      title: "What would help today?",
      type: "list",
      notes: "Pick one. Rest counts.",
      listItems: [
        { title: "Feed / rest check-in" },
        { title: "Bag or supplies" },
        { title: "Appointment prep" },
        { title: "Ask for help" },
        { title: "Rest — also valid" }
      ]
    },
    {
      id: "feed-rest",
      title: "Feed / rest check-in",
      type: "reminder",
      notes: "Organisational only — follow your midwife or health visitor. Not feeding advice.",
      speakingReminderText: "A gentle feed or rest check-in when you are ready.",
      priority: "soon"
    },
    {
      id: "bag-checklist",
      title: "Going-out bag",
      type: "list",
      listItems: [
        { title: "Nappies and wipes" },
        { title: "Spare clothes" },
        { title: "Feeds / bottles as relevant" },
        { title: "Keys / phone" },
        { title: "Comfort item" }
      ]
    },
    {
      id: "appointment-prep",
      title: "Baby appointment prep",
      type: "list",
      notes: organisationalHealthNote,
      dueInDays: 5,
      listItems: [
        { title: "Confirm time and place" },
        { title: "Questions written down" },
        { title: "Notes / red book if used" },
        { title: "Travel plan" }
      ]
    },
    {
      id: "visitor-boundaries",
      title: "Visitor boundaries",
      type: "list",
      notes: "Protect rest. Edit freely.",
      listItems: [
        { title: "Visits are optional" },
        { title: "Short visits preferred" },
        { title: "Illness check" },
        { title: "Someone else can host" }
      ]
    },
    {
      id: "parent-reset",
      title: "Parent reset",
      type: "list",
      listItems: [
        { title: "Drink water" },
        { title: "Eat something" },
        { title: "Sit for five minutes" },
        { title: "Ask for help if needed" }
      ]
    },
    {
      id: "ask-help",
      title: "Ask for help today",
      type: "reminder",
      notes: "Meals, laundry, holding baby, or a short rest — asking is allowed.",
      speakingReminderText: "It is okay to ask for help today."
    }
  ]
});
