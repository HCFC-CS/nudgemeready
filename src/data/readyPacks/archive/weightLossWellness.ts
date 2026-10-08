import { defineContentPack, organisationalHealthNote } from "../packFactory";

export const weightLossWellnessPack = defineContentPack({
  meta: {
    id: "weight-loss-wellness",
    version: "1.2.0",
    icon: "fitness-outline",
    category: "wellbeing",
    title: "Weight Loss & Wellness",
    summary:
      "Meals, movement, water and habits — supportive organisation, not dieting pressure or medical advice.",
    features: [
      "Meal ideas",
      "Gentle movement",
      "Water habit",
      "One kind habit",
      "Shopping list",
      "Energy-based plan",
      "Non-scale wins",
      "Partner shop links"
    ],
    healthDisclaimer: organisationalHealthNote,
    productId: "ready.pack.weight_loss_wellness"
  },
  templates: [
    {
      id: "kind-framing",
      title: "Kind framing for today",
      type: "note",
      notes:
        "This pack is organisational support only. It does not prescribe diets, diagnose conditions, or change medication. Follow clinician advice for health conditions."
    },
    {
      id: "meals",
      title: "Plan today's meals",
      type: "list",
      listItems: [
        { title: "Breakfast idea" },
        { title: "Lunch idea" },
        { title: "Evening meal" },
        { title: "Snack if useful" }
      ],
      repeatRule: { frequency: "daily" },
      notes: "Edit freely. No perfect plate required.",
      priority: "soon"
    },
    {
      id: "movement",
      title: "Gentle movement",
      type: "reminder",
      notes: "Walk, stretch, or whatever feels doable today. Stop if anything feels wrong and seek advice if needed.",
      speakingReminderText: "A soft nudge for gentle movement.",
      priority: "soon"
    },
    {
      id: "movement-choices",
      title: "Movement choices",
      type: "list",
      listItems: [
        { title: "Short walk" },
        { title: "Stretch" },
        { title: "Dance / move at home" },
        { title: "Rest day — also valid" }
      ],
      priority: "not_urgent"
    },
    {
      id: "water",
      title: "Water habit",
      type: "reminder",
      repeatRule: { frequency: "daily" },
      speakingReminderText: "Water reminder.",
      priority: "not_urgent"
    },
    {
      id: "habit",
      title: "One kind habit",
      type: "chore",
      notes: "One small habit only — edit to suit you.",
      repeatRule: { frequency: "daily" },
      priority: "soon"
    },
    {
      id: "shopping",
      title: "Simple shopping list",
      type: "list",
      listItems: [
        { title: "Fruit / veg you like" },
        { title: "Protein option you like" },
        { title: "Easy meal base" },
        { title: "Hydration" }
      ],
      priority: "soon"
    },
    {
      id: "energy-plan",
      title: "Energy-based day plan",
      type: "list",
      notes: "Match plans to energy. Not a medical assessment.",
      listItems: [
        { title: "Low energy option" },
        { title: "Medium energy option" },
        { title: "If I have more energy" }
      ],
      priority: "soon"
    },
    {
      id: "non-scale-wins",
      title: "Non-scale wins note",
      type: "note",
      notes: "Sleep, mood, strength, consistency, kindness — whatever matters to you. No guilt language."
    },
    {
      id: "clinician-note",
      title: "Questions for a clinician (optional)",
      type: "list",
      notes: organisationalHealthNote,
      listItems: [
        { title: "Write any health questions" },
        { title: "Do not change medication yourself" },
        { title: "Book / attend appointment if needed" }
      ],
      priority: "not_urgent"
    },
    {
      id: "pack-shop",
      title: "Optional wellness kit shop",
      type: "list",
      notes:
        "Browse partner suppliers for water bottles, mats and bands. Affiliate links — we may earn a small commission if you buy, at no extra cost to you. Nothing required. Organisational support only — not diet or medical advice.",
      listItems: [
        { title: "Water bottle" },
        { title: "Yoga mat" },
        { title: "Resistance bands" },
        { title: "Nothing right now" }
      ],
      priority: "not_urgent"
    }
  ],
  aiCoachPrompts: [
    "Suggest one kind wellness step for a low-energy day.",
    "Help me plan simple meals without diet shame.",
    "Remind me this is organisational support, not medical or diet advice."
  ],
  badges: [
    { id: "wellness-kind", title: "Kind consistency", description: "You chose a supportive step." },
    { id: "wellness-moved", title: "Moved gently", description: "Movement at your pace." },
    { id: "wellness-hydrated", title: "Water counted", description: "A small care habit." }
  ],
  crewRecommendations: [
    { roleHint: "cheerleader", reason: "Non-judgemental encouragement." },
    { roleHint: "guardian", reason: "Someone who supports habits without policing food." }
  ]
});
