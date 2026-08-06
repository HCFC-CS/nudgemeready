import { defineContentPack, organisationalHealthNote } from "../packFactory";

export const anxietySupportPack = defineContentPack({
  meta: {
    id: "anxiety-support",
    version: "1.2.0",
    icon: "cloudy-outline",
    category: "wellbeing",
    title: "Anxiety Support",
    summary:
      "Breathing, grounding and journal prompts — supportive organisation, not therapy or medical advice.",
    features: [
      "Breathing pause",
      "Grounding checklist",
      "Worry dump journal",
      "Overwhelm timeout",
      "Tiny next step",
      "Support contacts",
      "Bedtime wind-down",
      "Partner shop links"
    ],
    healthDisclaimer: organisationalHealthNote,
    productId: "ready.pack.anxiety_support"
  },
  templates: [
    {
      id: "what-would-help",
      title: "What would help right now?",
      type: "list",
      notes: "Tick one. Seek professional support if you need it. This pack is not therapy.",
      listItems: [
        { title: "Breathing pause" },
        { title: "Grounding checklist" },
        { title: "Write it down" },
        { title: "A short timeout" },
        { title: "Message someone trusted" },
        { title: "Not sure — rest is okay" }
      ],
      priority: "soon"
    },
    {
      id: "breathing",
      title: "Breathing pause",
      type: "reminder",
      notes: "Slow breaths at your pace. Seek professional support if you need it. Not medical advice.",
      speakingReminderText: "A quiet moment for a few slow breaths.",
      priority: "soon"
    },
    {
      id: "grounding",
      title: "Grounding checklist",
      type: "list",
      listItems: [
        { title: "5 things you can see" },
        { title: "4 things you can touch" },
        { title: "3 things you can hear" },
        { title: "2 things you can smell" },
        { title: "1 thing you can taste" }
      ],
      priority: "soon"
    },
    {
      id: "journal",
      title: "Worry dump journal",
      type: "note",
      notes: "Write it down so it does not have to stay only in your head."
    },
    {
      id: "overwhelm-timeout",
      title: "Timeout when overwhelmed",
      type: "reminder",
      notes: "Permission to pause. If you feel unsafe, seek urgent help through local emergency services or Samaritans (116 123 in the UK).",
      speakingReminderText: "Timeout. It is okay to pause. You can come back later.",
      priority: "needs_attention"
    },
    {
      id: "tiny-next-step",
      title: "One tiny next step",
      type: "task",
      notes: "Make it small enough to start. Edit freely.",
      priority: "soon"
    },
    {
      id: "support-contacts",
      title: "Support contacts checklist",
      type: "list",
      notes: "Organisational only — not a crisis service inside the app.",
      listItems: [
        { title: "Trusted person I can message" },
        { title: "GP / clinician contact if relevant" },
        { title: "Samaritans / local helpline if needed" }
      ],
      priority: "important"
    },
    {
      id: "body-scan-soft",
      title: "Soft body check-in",
      type: "list",
      listItems: [
        { title: "Unclench jaw if tight" },
        { title: "Drop shoulders" },
        { title: "Feel feet on the floor" },
        { title: "Drink water" }
      ],
      priority: "not_urgent"
    },
    {
      id: "evening-wind-down",
      title: "Evening wind-down",
      type: "routine",
      notes: "Comfort only. Ongoing anxiety may need professional support.",
      repeatRule: { frequency: "daily" },
      listItems: [
        { title: "Dim stimulation" },
        { title: "Short worry dump (optional)" },
        { title: "Breathing or quiet time" },
        { title: "Rest" }
      ],
      speakingReminderText: "Evening wind-down when you are ready.",
      priority: "soon"
    },
    {
      id: "pack-shop",
      title: "Optional calm comfort shop",
      type: "list",
      notes:
        "Browse partner suppliers for journals, earplugs and calm extras. Affiliate links — we may earn a small commission if you buy, at no extra cost to you. Nothing required. Organisational support only — not therapy or medical advice.",
      listItems: [
        { title: "Journal" },
        { title: "Earplugs / fidget" },
        { title: "Weighted blanket (optional)" },
        { title: "Nothing right now" }
      ],
      priority: "not_urgent"
    }
  ],
  aiCoachPrompts: [
    "Offer a calm grounding script without pressure.",
    "Help me choose one tiny next step when I feel overwhelmed — no diagnosis.",
    "Suggest a kind timeout plan and remind me this is not a substitute for professional support."
  ],
  badges: [
    { id: "anxiety-paused", title: "You paused", description: "A soft reset counts." },
    { id: "anxiety-grounded", title: "Grounded for a moment", description: "You used a grounding step." },
    { id: "anxiety-tiny-step", title: "Tiny step", description: "Small starts matter." }
  ],
  crewRecommendations: [
    { roleHint: "cheerleader", reason: "A calm voice when things feel loud." },
    { roleHint: "guardian", reason: "Someone who can sit with you without fixing everything." }
  ]
});
