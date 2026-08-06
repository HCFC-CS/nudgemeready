import { ready4Pack } from "../packFactory";

export const ready4WellbeingPack = ready4Pack({
  slug: "wellbeing",
  name: "Wellbeing",
  icon: "heart-outline",
  category: "wellbeing",
  summary:
    "Gentle structure for mornings, hydration, movement, sleep and gratitude — supportive, not pressured.",
  features: [
    "Morning reset",
    "Hydration",
    "Movement",
    "Mindfulness pause",
    "Sleep routine",
    "Gratitude journal"
  ],
  // Free — one of two included packs
  templates: [
    {
      id: "morning-reset",
      title: "Morning reset",
      type: "routine",
      repeatRule: { frequency: "daily" },
      notes: "Start gently. Skip steps that do not fit.",
      speakingReminderText: "A soft morning reset when you are ready.",
      listItems: [
        { title: "Drink water" },
        { title: "Open a curtain / get some light" },
        { title: "One kind intention for the day" },
        { title: "Eat or drink something" }
      ]
    },
    {
      id: "hydration",
      title: "Hydration nudge",
      type: "reminder",
      repeatRule: { frequency: "daily" },
      notes: "A quiet reminder only. No streak pressure.",
      speakingReminderText: "A quiet reminder to have some water."
    },
    {
      id: "movement",
      title: "Movement choices",
      type: "list",
      notes: "Whatever feels doable. Rest days are valid.",
      listItems: [
        { title: "Short walk" },
        { title: "Stretch" },
        { title: "Move at home" },
        { title: "Rest day — also valid" }
      ]
    },
    {
      id: "mindfulness",
      title: "Mindfulness pause",
      type: "reminder",
      notes: "A few slow breaths or a short sit. Seek professional support if you need it.",
      speakingReminderText: "A quiet moment for a few slow breaths."
    },
    {
      id: "sleep-routine",
      title: "Sleep wind-down",
      type: "routine",
      repeatRule: { frequency: "daily" },
      notes: "Comfort only. Ongoing sleep problems may need clinical advice.",
      speakingReminderText: "Wind-down when you are ready.",
      listItems: [
        { title: "Dim lights if you can" },
        { title: "Phone face-down" },
        { title: "Quiet wind-down" },
        { title: "Rest" }
      ]
    },
    {
      id: "gratitude",
      title: "Gratitude / good thing note",
      type: "note",
      notes: "Optional. One good thing is enough. No pressure to be positive."
    }
  ],
  aiCoachPrompts: [
    "Suggest one kind wellbeing step for a low-energy day.",
    "Help me plan a gentle evening wind-down."
  ]
});
