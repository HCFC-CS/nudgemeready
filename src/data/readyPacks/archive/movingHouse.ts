import { defineContentPack } from "../packFactory";

export const movingHousePack = defineContentPack({
  meta: {
    id: "moving-house",
    version: "1.2.0",
    icon: "home-outline",
    category: "lifestyle",
    title: "Moving House",
    summary:
      "Packing, utilities, address changes, keys and move-day — one room and one list at a time.",
    features: [
      "Packing rooms",
      "Utilities",
      "Address changes",
      "Move-day plan",
      "Keys and access",
      "Declutter",
      "First-night box",
      "Partner shop links"
    ],
    productId: "ready.pack.moving_house"
  },
  templates: [
    {
      id: "what-next",
      title: "What would help with the move?",
      type: "list",
      notes: "Pick one focus. You do not have to do everything today.",
      listItems: [
        { title: "Pack one room" },
        { title: "Utilities / admin" },
        { title: "Address changes" },
        { title: "Move-day logistics" },
        { title: "Rest — also valid" }
      ],
      priority: "soon"
    },
    {
      id: "packing",
      title: "Moving packing rooms",
      type: "list",
      listItems: [
        { title: "Kitchen" },
        { title: "Bedroom" },
        { title: "Bathroom" },
        { title: "Living room" },
        { title: "Important documents box" },
        { title: "Garage / storage (if any)" }
      ],
      dueInDays: 14,
      priority: "important"
    },
    {
      id: "declutter",
      title: "Declutter before packing",
      type: "list",
      notes: "Optional. Keep, donate, recycle, bin — no shame.",
      listItems: [
        { title: "Clothes pass" },
        { title: "Kitchen excess" },
        { title: "Papers / files" },
        { title: "Donation drop-off planned" }
      ],
      priority: "not_urgent"
    },
    {
      id: "first-night-box",
      title: "First-night / essentials box",
      type: "list",
      listItems: [
        { title: "Kettle / mugs / tea" },
        { title: "Toiletries" },
        { title: "Bedding / towels" },
        { title: "Chargers" },
        { title: "Snacks" },
        { title: "Important documents" },
        { title: "Medications if relevant (as prescribed — do not change doses)" }
      ],
      dueInDays: 3,
      priority: "important"
    },
    {
      id: "utilities",
      title: "Utilities switch checklist",
      type: "list",
      listItems: [
        { title: "Electricity" },
        { title: "Gas" },
        { title: "Water" },
        { title: "Internet" },
        { title: "Council tax" },
        { title: "Final meter readings" }
      ],
      dueInDays: 10,
      priority: "important"
    },
    {
      id: "address-changes",
      title: "Address change list",
      type: "list",
      listItems: [
        { title: "Bank" },
        { title: "GP / dentist" },
        { title: "Employer / payroll" },
        { title: "DVLA / driving" },
        { title: "Subscriptions" },
        { title: "Insurance" },
        { title: "Electoral roll" }
      ],
      dueInDays: 21,
      priority: "soon"
    },
    {
      id: "keys-access",
      title: "Keys and access",
      type: "list",
      listItems: [
        { title: "Collect new keys" },
        { title: "Return old keys" },
        { title: "Parking / permits" },
        { title: "Alarm / fob codes noted safely" }
      ],
      dueInDays: 2,
      priority: "important"
    },
    {
      id: "move-day",
      title: "Move-day plan",
      type: "list",
      listItems: [
        { title: "Confirm van / movers" },
        { title: "Confirm parking / access" },
        { title: "Protect pets / kids plan" },
        { title: "Snacks and water" },
        { title: "Final walk-through old home" },
        { title: "First-night box loaded last" }
      ],
      dueInDays: 1,
      priority: "important"
    },
    {
      id: "helper-ask",
      title: "Ask for help",
      type: "reminder",
      notes: "Lifting, childcare, or a meal — asking is allowed.",
      speakingReminderText: "It is okay to ask for help with the move.",
      priority: "soon"
    },
    {
      id: "settle-in",
      title: "First week settle-in",
      type: "list",
      notes: "One room usable is enough at first.",
      listItems: [
        { title: "Beds made" },
        { title: "Bathroom usable" },
        { title: "Kettle / fridge working" },
        { title: "Bins / recycling sorted" },
        { title: "Neighbours / building info if useful" }
      ],
      dueInDays: 7,
      priority: "soon"
    },
    {
      id: "pack-shop",
      title: "Optional packing supplies shop",
      type: "list",
      notes:
        "Browse partner suppliers for boxes, tape and bubble wrap. Affiliate links — we may earn a small commission if you buy, at no extra cost to you. Nothing required.",
      listItems: [
        { title: "Packing boxes" },
        { title: "Tape / bubble wrap" },
        { title: "Moving labels" },
        { title: "Nothing right now" }
      ],
      priority: "not_urgent"
    }
  ],
  aiCoachPrompts: [
    "Break moving house into one room at a time.",
    "Suggest a first-night essentials box.",
    "Help me prioritise utilities and address changes calmly."
  ],
  badges: [
    { id: "moving-box", title: "Boxes moving", description: "You kept the move organised." },
    { id: "moving-room", title: "One room packed", description: "Progress one space at a time." },
    { id: "moving-settled", title: "First night ready", description: "Essentials are covered." }
  ],
  crewRecommendations: [
    { roleHint: "guardian", reason: "Help with heavy lifting or key handover." },
    { roleHint: "cheerleader", reason: "Moral support on move day." }
  ]
});
