import { defineContentPack, organisationalHealthNote } from "../packFactory";

export const ibsManagementPack = defineContentPack({
  meta: {
    id: "ibs-management",
    version: "1.2.0",
    icon: "restaurant-outline",
    category: "health",
    title: "IBS Management",
    summary:
      "Medication organisation, food diary and trigger notes for your own records — organisational support only.",
    features: [
      "Medication organisation",
      "Food diary",
      "Trigger log",
      "Appointment prep",
      "Shopping for safe-ish staples",
      "Flare-day plan",
      "Partner shop links"
    ],
    healthDisclaimer: organisationalHealthNote,
    productId: "ready.pack.ibs_management"
  },
  templates: [
    {
      id: "medication",
      title: "Medication organisation",
      type: "reminder",
      notes: organisationalHealthNote,
      repeatRule: { frequency: "daily" },
      speakingReminderText: "Medication organisation reminder.",
      priority: "important"
    },
    {
      id: "food-diary",
      title: "Food diary note",
      type: "note",
      notes:
        "What you ate and how you felt — for your own tracking and clinician visits. Not diagnostic. Do not change prescribed medication based on this note."
    },
    {
      id: "triggers",
      title: "Possible trigger log",
      type: "list",
      listItems: [
        { title: "Note a possible trigger" },
        { title: "Note what helped" },
        { title: "Note timing (optional)" }
      ],
      notes: "Not diagnostic. Share with a clinician if useful.",
      priority: "not_urgent"
    },
    {
      id: "flare-day",
      title: "Flare-day comfort plan",
      type: "list",
      notes: organisationalHealthNote,
      listItems: [
        { title: "Reduce non-essential plans" },
        { title: "Have water nearby" },
        { title: "Use usual comfort foods if advised for you" },
        { title: "Rest when needed" },
        { title: "Contact clinician / pharmacy if concerned (as appropriate)" }
      ],
      priority: "needs_attention"
    },
    {
      id: "appointment-prep",
      title: "GP / clinic appointment prep",
      type: "list",
      notes: organisationalHealthNote,
      listItems: [
        { title: "Bring food / symptom notes" },
        { title: "Write top questions" },
        { title: "List current medication as prescribed" },
        { title: "Confirm appointment time" }
      ],
      dueInDays: 5,
      priority: "important"
    },
    {
      id: "staples-shop",
      title: "Staples shopping list",
      type: "list",
      notes: "Edit for foods that usually suit you. Not a prescribed diet.",
      listItems: [
        { title: "Usual safe breakfast option" },
        { title: "Easy lunch option" },
        { title: "Evening meal basics" },
        { title: "Hydration" }
      ],
      priority: "soon"
    },
    {
      id: "hydration",
      title: "Hydration nudge",
      type: "reminder",
      speakingReminderText: "A quiet water reminder.",
      repeatRule: { frequency: "daily" },
      priority: "not_urgent"
    },
    {
      id: "week-review",
      title: "Weekly pattern note",
      type: "note",
      notes: "Optional weekly glance for your own records before appointments. Not a diagnosis."
    },
    {
      id: "pack-shop",
      title: "Optional comfort and tracking shop",
      type: "list",
      notes:
        "Browse partner suppliers for heat pads, diaries and bottles. Affiliate links — we may earn a small commission if you buy, at no extra cost to you. Nothing required. Organisational support only — not medical advice.",
      listItems: [
        { title: "Hot water bottle / heat pad" },
        { title: "Food diary" },
        { title: "Water bottle" },
        { title: "Nothing right now" }
      ],
      priority: "not_urgent"
    }
  ],
  aiCoachPrompts: [
    "Help me organise notes before a GP appointment.",
    "Suggest a flare-day comfort checklist without medical advice.",
    "Help me turn food notes into clear questions for a clinician."
  ],
  badges: [
    { id: "ibs-noted", title: "Noted calmly", description: "You kept a practical record." },
    { id: "ibs-prep", title: "Appointment ready", description: "You gathered what you need." },
    { id: "ibs-flare-plan", title: "Flare plan ready", description: "You prepared a kinder day plan." }
  ],
  crewRecommendations: [
    { roleHint: "guardian", reason: "Someone who can help with appointments." },
    { roleHint: "cheerleader", reason: "Support without food policing." }
  ]
});
