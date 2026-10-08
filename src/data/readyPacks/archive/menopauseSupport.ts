import { defineContentPack, organisationalHealthNote } from "../packFactory";

export const menopauseSupportPack = defineContentPack({
  meta: {
    id: "menopause-support",
    version: "1.2.0",
    icon: "sunny-outline",
    category: "health",
    title: "Menopause Support",
    summary:
      "Medication organisation, hydration and a gentle symptom journal — organisational support only, not medical advice.",
    features: [
      "Medication / HRT organisation",
      "Hydration",
      "Symptom journal",
      "Appointment questions",
      "Sleep wind-down",
      "Energy check",
      "Partner shop links"
    ],
    healthDisclaimer: organisationalHealthNote,
    productId: "ready.pack.menopause_support"
  },
  templates: [
    {
      id: "medication",
      title: "Medication / HRT organisation",
      type: "reminder",
      notes: organisationalHealthNote,
      repeatRule: { frequency: "daily" },
      speakingReminderText: "Medication organisation reminder.",
      priority: "important"
    },
    {
      id: "medication-supply",
      title: "Supply / repeat check",
      type: "list",
      notes: organisationalHealthNote,
      listItems: [
        { title: "Enough supply for now" },
        { title: "Repeat arranged if needed" },
        { title: "Stored in usual place" }
      ],
      repeatRule: { frequency: "weekly" },
      priority: "soon"
    },
    {
      id: "hydration",
      title: "Hydration nudge",
      type: "reminder",
      repeatRule: { frequency: "daily" },
      speakingReminderText: "Have some water when you can.",
      priority: "not_urgent"
    },
    {
      id: "symptom-journal",
      title: "Symptom journal note",
      type: "note",
      notes:
        "Record what you notice for your own appointments. Not a diagnosis tool. Do not change medication based on this note — ask your clinician."
    },
    {
      id: "symptom-tracker-list",
      title: "Things to mention later (optional)",
      type: "list",
      notes: "Tick topics to raise with a clinician. Organisational only.",
      listItems: [
        { title: "Sleep changes" },
        { title: "Mood / energy changes" },
        { title: "Hot flushes / temperature" },
        { title: "Brain fog / concentration" },
        { title: "Other (edit me)" }
      ],
      priority: "not_urgent"
    },
    {
      id: "appointment-questions",
      title: "Clinician appointment questions",
      type: "list",
      notes: organisationalHealthNote,
      listItems: [
        { title: "Write top 3 questions" },
        { title: "Bring symptom notes" },
        { title: "Confirm appointment time" },
        { title: "Ask about next steps (with clinician)" }
      ],
      dueInDays: 7,
      priority: "important"
    },
    {
      id: "energy-check",
      title: "Energy check today",
      type: "note",
      notes: "Low / medium / okay — adjust plans kindly. Not a medical assessment."
    },
    {
      id: "sleep-wind-down",
      title: "Sleep wind-down",
      type: "routine",
      notes: "Comfort routines only. Seek clinical advice for ongoing sleep problems.",
      repeatRule: { frequency: "daily" },
      listItems: [
        { title: "Dim lights if you can" },
        { title: "Cooler room if helpful" },
        { title: "Phone face-down" },
        { title: "Quiet wind-down" }
      ],
      speakingReminderText: "Wind-down when you are ready.",
      priority: "soon"
    },
    {
      id: "kind-day-plan",
      title: "Kind day plan",
      type: "list",
      listItems: [
        { title: "One must-do (optional)" },
        { title: "One nice-to-do" },
        { title: "One rest / pause" }
      ],
      repeatRule: { frequency: "daily" },
      priority: "soon"
    },
    {
      id: "pack-shop",
      title: "Optional comfort extras shop",
      type: "list",
      notes:
        "Browse partner suppliers for cooling towels, fans and journals. Affiliate links — we may earn a small commission if you buy, at no extra cost to you. Nothing required. Organisational support only — not medical advice or HRT.",
      listItems: [
        { title: "Cooling towel / fan" },
        { title: "Water bottle" },
        { title: "Journal" },
        { title: "Nothing right now" }
      ],
      priority: "not_urgent"
    }
  ],
  aiCoachPrompts: [
    "Help me prepare questions for my clinician appointment.",
    "Suggest a kind day plan for low-energy days — no medical advice.",
    "Help me organise symptom notes for an appointment without diagnosing."
  ],
  badges: [
    { id: "meno-tracked", title: "Noted for you", description: "You kept a gentle record." },
    { id: "meno-appointment", title: "Questions ready", description: "You prepared for the conversation." },
    { id: "meno-kind-day", title: "Kind day", description: "You planned with care." }
  ],
  crewRecommendations: [
    { roleHint: "cheerleader", reason: "Supportive check-ins without minimising." },
    { roleHint: "guardian", reason: "Someone who can help with appointments if asked." }
  ]
});
