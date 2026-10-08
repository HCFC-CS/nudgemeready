import { defineContentPack, organisationalHealthNote } from "../packFactory";

export const newBabyPack = defineContentPack({
  meta: {
    id: "new-baby",
    version: "1.2.0",
    icon: "happy-outline",
    category: "family",
    title: "New Baby",
    summary:
      "Feeds, nappies, sleep notes and appointment organisation for early days — organisational support only.",
    features: [
      "Feed reminder / log",
      "Nappies and supplies",
      "Rest when baby rests",
      "Appointments",
      "Visitor boundaries",
      "Parent reset",
      "Bag checklist",
      "Partner shop links"
    ],
    healthDisclaimer: organisationalHealthNote,
    productId: "ready.pack.new_baby"
  },
  templates: [
    {
      id: "feed-log",
      title: "Feed reminder / log",
      type: "reminder",
      notes: "Organisational support only — follow your midwife or health visitor guidance. Not feeding medical advice.",
      speakingReminderText: "Feed check-in reminder.",
      priority: "important"
    },
    {
      id: "nappies",
      title: "Nappy and supplies check",
      type: "list",
      listItems: [
        { title: "Nappies stocked" },
        { title: "Wipes" },
        { title: "Change bag ready" },
        { title: "Spare outfit" }
      ],
      priority: "soon"
    },
    {
      id: "sleep-window",
      title: "Rest when baby rests",
      type: "reminder",
      notes: "A permission slip to rest, not a schedule to enforce.",
      speakingReminderText: "If you can, rest while baby rests.",
      priority: "soon"
    },
    {
      id: "appointments",
      title: "Baby appointment",
      type: "appointment",
      notes: "Clinic, health visitor, or GP — edit details. Follow professional advice.",
      dueInDays: 7,
      priority: "important"
    },
    {
      id: "appointment-prep",
      title: "Appointment prep",
      type: "list",
      notes: organisationalHealthNote,
      listItems: [
        { title: "Confirm time and place" },
        { title: "Questions written down" },
        { title: "Red book / notes if used" },
        { title: "Travel / parking plan" }
      ],
      dueInDays: 5,
      priority: "important"
    },
    {
      id: "visitor-boundaries",
      title: "Visitor boundaries",
      type: "list",
      notes: "Protect rest. Edit freely.",
      listItems: [
        { title: "Visits are optional" },
        { title: "Short visits preferred" },
        { title: "Hands washed / illness check" },
        { title: "Someone else can host if needed" }
      ],
      priority: "not_urgent"
    },
    {
      id: "parent-reset",
      title: "Parent reset",
      type: "list",
      listItems: [
        { title: "Drink water" },
        { title: "Eat something" },
        { title: "Sit down for 5 minutes" },
        { title: "Ask for help if needed" }
      ],
      priority: "soon"
    },
    {
      id: "bag-checklist",
      title: "Going-out bag checklist",
      type: "list",
      listItems: [
        { title: "Nappies and wipes" },
        { title: "Spare clothes" },
        { title: "Feeds / bottles as relevant" },
        { title: "Keys / phone / wallet" },
        { title: "Muslin / comfort item" }
      ],
      priority: "soon"
    },
    {
      id: "night-notes",
      title: "Night notes",
      type: "note",
      notes: "Optional log for your own use or to share with a health professional. Not diagnostic."
    },
    {
      id: "support-ask",
      title: "Ask for help today",
      type: "reminder",
      notes: "Meals, laundry, holding baby, or a short rest — asking is allowed.",
      speakingReminderText: "It is okay to ask for help today.",
      priority: "soon"
    },
    {
      id: "pack-shop",
      title: "Optional newborn supplies shop",
      type: "list",
      notes:
        "Browse partner suppliers for nappies, muslins and changing bags. Affiliate links — we may earn a small commission if you buy, at no extra cost to you. Nothing required. Organisational support only — not medical advice.",
      listItems: [
        { title: "Nappies / wipes" },
        { title: "Muslins" },
        { title: "Changing bag" },
        { title: "Nothing right now" }
      ],
      priority: "not_urgent"
    }
  ],
  aiCoachPrompts: [
    "Help me organise one calm hour with a newborn.",
    "Suggest a going-out bag checklist.",
    "Help me set kind visitor boundaries without guilt.",
    "Remind me this is organisational support, not medical advice."
  ],
  badges: [
    { id: "new-baby-day", title: "One day at a time", description: "You cared for today." },
    { id: "new-baby-rest", title: "Rest claimed", description: "You took a pause when you could." },
    { id: "new-baby-help", title: "Help asked", description: "Asking counts as strength." }
  ],
  crewRecommendations: [
    { roleHint: "guardian", reason: "Someone who can bring food or sit with baby." },
    { roleHint: "cheerleader", reason: "Warm check-ins without pressure to host." }
  ]
});
