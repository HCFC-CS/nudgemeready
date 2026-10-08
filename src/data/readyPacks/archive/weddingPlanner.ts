import { defineContentPack } from "../packFactory";

export const weddingPlannerPack = defineContentPack({
  meta: {
    id: "wedding-planner",
    version: "1.2.0",
    icon: "heart-outline",
    category: "events",
    title: "Wedding Planner",
    summary:
      "Budget, guests, suppliers, timeline and day-of checklists — calm progress without panic.",
    features: [
      "Budget",
      "Guests",
      "Suppliers",
      "Countdown",
      "Timeline",
      "Day-of checklist",
      "Vendor contacts",
      "Partner shop links"
    ],
    productId: "ready.pack.wedding_planner"
  },
  templates: [
    {
      id: "what-next",
      title: "What needs a decision this week?",
      type: "list",
      notes: "One or two decisions only. Perfection is optional.",
      listItems: [
        { title: "Budget item" },
        { title: "Guest / RSVP item" },
        { title: "Supplier item" },
        { title: "Nothing urgent — rest is fine" }
      ],
      priority: "soon"
    },
    {
      id: "budget",
      title: "Wedding budget tracker",
      type: "list",
      listItems: [
        { title: "Venue" },
        { title: "Catering" },
        { title: "Attire" },
        { title: "Photography" },
        { title: "Flowers / décor" },
        { title: "Entertainment" },
        { title: "Contingency" }
      ],
      priority: "important"
    },
    {
      id: "guests",
      title: "Guest list progress",
      type: "task",
      notes: "Invite sent, RSVP, dietary notes. Edit as needed.",
      priority: "soon"
    },
    {
      id: "guest-checklist",
      title: "Guest admin checklist",
      type: "list",
      listItems: [
        { title: "Draft guest list" },
        { title: "Send invites" },
        { title: "Track RSVPs" },
        { title: "Note dietary / access needs" },
        { title: "Final headcount" }
      ],
      priority: "soon"
    },
    {
      id: "suppliers",
      title: "Supplier confirmations",
      type: "list",
      listItems: [
        { title: "Confirm venue deposit" },
        { title: "Confirm photographer" },
        { title: "Confirm florist / décor" },
        { title: "Confirm entertainment" },
        { title: "Confirm catering / cake" }
      ],
      dueInDays: 30,
      priority: "important"
    },
    {
      id: "vendor-contacts",
      title: "Vendor contacts note",
      type: "note",
      notes: "Names, phone numbers, and booking references in one place."
    },
    {
      id: "timeline",
      title: "Planning timeline",
      type: "list",
      notes: "Rough milestones — edit to your date.",
      listItems: [
        { title: "Book venue" },
        { title: "Book key suppliers" },
        { title: "Send invites" },
        { title: "Finalise numbers" },
        { title: "Day-of plan" }
      ],
      priority: "soon"
    },
    {
      id: "countdown",
      title: "Wedding countdown check-in",
      type: "reminder",
      notes: "One weekly glance at what still needs a decision.",
      repeatRule: { frequency: "weekly" },
      speakingReminderText: "Wedding planning check-in when you are ready.",
      priority: "soon"
    },
    {
      id: "day-of",
      title: "Day-of checklist",
      type: "list",
      listItems: [
        { title: "Rings / documents" },
        { title: "Outfits and shoes" },
        { title: "Emergency kit" },
        { title: "Vendor timeline shared" },
        { title: "Someone holding the plan" },
        { title: "Eat and drink something" }
      ],
      dueInDays: 1,
      priority: "important"
    },
    {
      id: "self-care",
      title: "Planning pause",
      type: "reminder",
      notes: "You can pause planning. Joy still matters.",
      speakingReminderText: "A soft reminder to pause wedding planning if you need a break.",
      priority: "not_urgent"
    },
    {
      id: "pack-shop",
      title: "Optional cards and favours shop",
      type: "list",
      notes:
        "Browse partner shops (Moonpig, Notonthehighstreet, Amazon, Etsy). Affiliate links — we may earn a small commission if you buy, at no extra cost to you. Nothing required.",
      listItems: [
        { title: "Cards / thank-yous" },
        { title: "Favours" },
        { title: "Guest book / decor" },
        { title: "Nothing right now" }
      ],
      priority: "not_urgent"
    }
  ],
  aiCoachPrompts: [
    "Help me prioritise the next wedding decision calmly.",
    "Suggest a day-of checklist without overwhelm.",
    "Help me turn the guest list into small admin steps."
  ],
  badges: [
    { id: "wedding-step", title: "One decision down", description: "Progress without panic." },
    { id: "wedding-rsvp", title: "Guest progress", description: "Admin moved forward." },
    { id: "wedding-pause", title: "Pause taken", description: "Rest is part of planning." }
  ],
  crewRecommendations: [
    { roleHint: "cheerleader", reason: "Someone to share the load of planning." },
    { roleHint: "guardian", reason: "A day-of person who can hold the plan." }
  ]
});
