import { defineContentPack, organisationalHealthNote } from "../packFactory";

export const autismSupportPack = defineContentPack({
  meta: {
    id: "autism-support",
    version: "1.2.0",
    icon: "leaf-outline",
    category: "neurodiversity",
    title: "Autism Support",
    summary:
      "Predictable routines, transition warnings, sensory breaks and appointment prep — organisational support only.",
    features: [
      "Predictable day outline",
      "Transition warnings",
      "Sensory breaks",
      "Meltdown / overload recovery",
      "Appointment prep",
      "Social energy check",
      "Comfort kit",
      "Partner shop links"
    ],
    healthDisclaimer: organisationalHealthNote,
    productId: "ready.pack.autism_support"
  },
  templates: [
    {
      id: "what-would-help",
      title: "What would help today?",
      type: "list",
      notes: "Tick one or two options. Edit freely. There is no wrong answer.",
      listItems: [
        { title: "A clear plan for the day" },
        { title: "Extra transition warning time" },
        { title: "A quiet / sensory break" },
        { title: "Headphones or comfort item" },
        { title: "Fewer social demands" },
        { title: "Not sure yet — that is okay" }
      ],
      priority: "soon"
    },
    {
      id: "day-structure",
      title: "Predictable day outline",
      type: "routine",
      notes: "Edit times and order so the day feels clear. Skip steps that do not fit.",
      repeatRule: { frequency: "daily" },
      listItems: [
        { title: "Morning start" },
        { title: "Main activity" },
        { title: "Sensory or quiet break" },
        { title: "Second activity (optional)" },
        { title: "Evening wind-down" }
      ],
      speakingReminderText: "Your day outline is here when you want it.",
      priority: "soon"
    },
    {
      id: "transition-warning",
      title: "Transition warning",
      type: "reminder",
      notes: "Give yourself notice before a change of activity. Edit the timing to suit you.",
      speakingReminderText: "A change is coming soon. You can finish this gently.",
      priority: "important"
    },
    {
      id: "transition-checklist",
      title: "Transition steps",
      type: "list",
      notes: "Use before switching tasks or places.",
      listItems: [
        { title: "Pause current activity" },
        { title: "Note what comes next" },
        { title: "Gather what you need" },
        { title: "Take a short sensory reset if needed" },
        { title: "Start the next thing when ready" }
      ],
      priority: "not_urgent"
    },
    {
      id: "sensory-break",
      title: "Sensory break",
      type: "reminder",
      notes: "Quiet space, headphones, stretch, dim lights, or whatever helps you. Organisational support only.",
      speakingReminderText: "Time for a sensory break if you need one.",
      priority: "soon"
    },
    {
      id: "sensory-break-checklist",
      title: "Sensory break options",
      type: "list",
      listItems: [
        { title: "Quieter room or corner" },
        { title: "Headphones / earplugs" },
        { title: "Dim lights if possible" },
        { title: "Comfort item or fidget" },
        { title: "Drink water" },
        { title: "Return when ready" }
      ],
      priority: "not_urgent"
    },
    {
      id: "overload-recovery",
      title: "After overload / meltdown recovery",
      type: "list",
      notes: "No order required. Recovery is allowed. This is not a diagnosis tool.",
      listItems: [
        { title: "Get somewhere safer or quieter" },
        { title: "Reduce noise / light if you can" },
        { title: "No pressure to talk yet" },
        { title: "Water or snack when ready" },
        { title: "Rest before deciding the next step" }
      ],
      priority: "needs_attention"
    },
    {
      id: "appointment-prep",
      title: "Appointment prep checklist",
      type: "list",
      notes: "Edit for medical, school, work or other appointments.",
      listItems: [
        { title: "Confirm time and place" },
        { title: "Plan travel" },
        { title: "Write questions" },
        { title: "Pack comfort items" },
        { title: "Note preferred communication needs" }
      ],
      dueInDays: 2,
      priority: "important"
    },
    {
      id: "social-energy",
      title: "Social energy check",
      type: "note",
      notes: "Roughly note how much social energy you have today. Protecting energy is allowed."
    },
    {
      id: "comfort-kit",
      title: "Comfort kit checklist",
      type: "list",
      notes:
        "Open partner shop links on this card for optional sensory supplies. Affiliate links where supported. Organisational only — not medical advice.",
      listItems: [
        { title: "Headphones / earplugs" },
        { title: "Fidget or comfort item" },
        { title: "Sunglasses / hat if helpful" },
        { title: "Snack and water" },
        { title: "Exit plan if needed" }
      ],
      priority: "soon"
    },
    {
      id: "pack-shop",
      title: "Optional sensory / comfort shop",
      type: "list",
      notes:
        "Browse partner suppliers (Amazon, Argos, Loop, Sensory Direct and more). Affiliate links — we may earn a small commission if you buy, at no extra cost to you. Nothing required. Organisational support only.",
      listItems: [
        { title: "Headphones or earplugs" },
        { title: "Fidget / sensory tool" },
        { title: "Visual timer" },
        { title: "Nothing right now" }
      ],
      priority: "not_urgent"
    },
    {
      id: "evening-wind-down",
      title: "Evening wind-down",
      type: "routine",
      notes: "Close the day predictably.",
      repeatRule: { frequency: "daily" },
      listItems: [
        { title: "Same wind-down order if possible" },
        { title: "Reduce stimulation" },
        { title: "Tomorrow's outline glance (optional)" },
        { title: "Rest" }
      ],
      speakingReminderText: "Evening wind-down when you are ready.",
      priority: "soon"
    }
  ],
  aiCoachPrompts: [
    "Help me plan a calm transition between two activities.",
    "Suggest a predictable day outline without pressure.",
    "Help me prepare for an appointment with comfort items and clear steps.",
    "Give me a recovery checklist after sensory overload — no diagnosis language."
  ],
  badges: [
    { id: "autism-pace", title: "At your pace", description: "You shaped the day to fit you." },
    { id: "autism-transition", title: "Gentle change", description: "You handled a transition kindly." },
    { id: "autism-recovery", title: "Recovery space", description: "You protected your calm." }
  ],
  crewRecommendations: [
    { roleHint: "guardian", reason: "Someone who knows your preferred communication style." },
    { roleHint: "cheerleader", reason: "Quiet encouragement without forced social pressure." }
  ]
});
