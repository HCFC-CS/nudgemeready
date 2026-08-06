import { defineContentPack } from "../packFactory";

export const shiftWorkerPack = defineContentPack({
  meta: {
    id: "shift-worker",
    version: "1.2.0",
    icon: "time-outline",
    category: "work",
    title: "Shift Worker",
    summary:
      "Shift notes, sleep protection, meals, commute and recovery — for awkward patterns without guilt.",
    features: [
      "Shift details",
      "Sleep protection",
      "Meal prep",
      "Commute leave",
      "Post-shift reset",
      "Roster week glance",
      "Life admin catch-up",
      "Partner shop links"
    ],
    productId: "ready.pack.shift_worker"
  },
  templates: [
    {
      id: "shift-note",
      title: "Next shift details",
      type: "note",
      notes: "Write start time, end time, location, uniform, and anything you need to bring."
    },
    {
      id: "roster-week",
      title: "This week's roster glance",
      type: "list",
      notes: "Tick shifts you have confirmed. Edit freely.",
      listItems: [
        { title: "Shift 1 noted" },
        { title: "Shift 2 noted" },
        { title: "Days off protected" },
        { title: "Swap / cover if needed" }
      ],
      priority: "soon"
    },
    {
      id: "sleep-protect",
      title: "Protect sleep window",
      type: "reminder",
      notes: "Dim lights, silence notifications, rest when you can. Not medical sleep advice.",
      speakingReminderText: "Sleep window reminder when you are ready.",
      priority: "important"
    },
    {
      id: "sleep-checklist",
      title: "Sleep protection checklist",
      type: "list",
      listItems: [
        { title: "Tell household the sleep window" },
        { title: "Phone on Do Not Disturb" },
        { title: "Blackout / eye mask if useful" },
        { title: "Cool / quiet space if possible" }
      ],
      priority: "soon"
    },
    {
      id: "shift-meal",
      title: "Shift meal prep",
      type: "reminder",
      notes: "Pack food and water for the shift. Keep it simple.",
      speakingReminderText: "Meal prep reminder for your shift.",
      priority: "soon"
    },
    {
      id: "meal-bag",
      title: "Shift bag checklist",
      type: "list",
      listItems: [
        { title: "Food / snacks" },
        { title: "Water / drink" },
        { title: "Uniform / ID / keys" },
        { title: "Phone charger" },
        { title: "Anything site-specific" }
      ],
      priority: "soon"
    },
    {
      id: "commute",
      title: "Leave for shift",
      type: "reminder",
      speakingReminderText: "Time to leave for your shift when you are ready.",
      notes: "Edit the leave time to match your commute.",
      priority: "soon"
    },
    {
      id: "post-shift-reset",
      title: "Post-shift reset",
      type: "list",
      notes: "Come down gently after a long shift.",
      listItems: [
        { title: "Change out of work clothes" },
        { title: "Eat or drink something" },
        { title: "Short wind-down" },
        { title: "Protect the next sleep window" }
      ],
      priority: "soon"
    },
    {
      id: "life-admin",
      title: "Life admin on a day off",
      type: "list",
      notes: "One or two items only — rest still counts.",
      listItems: [
        { title: "Laundry / dishes (optional)" },
        { title: "One bill or message" },
        { title: "Food for next shift" },
        { title: "Rest without guilt" }
      ],
      priority: "not_urgent"
    },
    {
      id: "handover-note",
      title: "Handover / notes to self",
      type: "note",
      notes: "Anything to remember for the next shift or for covering staff."
    },
    {
      id: "pack-shop",
      title: "Optional sleep and shift bag shop",
      type: "list",
      notes:
        "Browse partner suppliers for eye masks, meal prep and earplugs. Affiliate links — we may earn a small commission if you buy, at no extra cost to you. Nothing required.",
      listItems: [
        { title: "Eye mask / blackout help" },
        { title: "Meal prep containers" },
        { title: "Earplugs" },
        { title: "Nothing right now" }
      ],
      priority: "not_urgent"
    }
  ],
  aiCoachPrompts: [
    "Help me plan rest around an awkward shift pattern.",
    "Suggest a simple shift bag checklist.",
    "Help me protect a sleep window without guilt."
  ],
  badges: [
    { id: "shift-survived", title: "Shift done", description: "You got through the roster day." },
    { id: "shift-sleep", title: "Sleep protected", description: "You guarded rest." },
    { id: "shift-reset", title: "Came down gently", description: "Post-shift care counts." }
  ],
  crewRecommendations: [
    { roleHint: "cheerleader", reason: "Quiet support around night shifts." },
    { roleHint: "guardian", reason: "Someone who can protect your sleep window at home." }
  ]
});
