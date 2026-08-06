import { ready4Pack } from "../packFactory";

export const ready4IndependencePack = ready4Pack({
  slug: "independence",
  name: "Independence",
  icon: "walk-outline",
  category: "lifestyle",
  summary:
    "Morning and evening routines, safety checks and essential tasks for confident independent living.",
  features: [
    "Morning & evening routines",
    "Home safety checks",
    "Essential tasks",
    "Appointments glance",
    "Emergency contacts note"
  ],
  productId: "ready.pack.ready4_independence",
  templates: [
    {
      id: "morning-routine",
      title: "Morning independence routine",
      type: "routine",
      repeatRule: { frequency: "daily" },
      notes: "Edit to fit you. Skip steps that do not apply.",
      speakingReminderText: "Your morning routine is here when you want it.",
      listItems: [
        { title: "Wash / dress" },
        { title: "Eat or drink something" },
        { title: "Medication organisation if relevant (as prescribed)" },
        { title: "Keys / phone / bag ready" }
      ]
    },
    {
      id: "evening-routine",
      title: "Evening settle routine",
      type: "routine",
      repeatRule: { frequency: "daily" },
      speakingReminderText: "Evening settle when you are ready.",
      listItems: [
        { title: "Doors / windows as preferred" },
        { title: "Phone on charge" },
        { title: "Clothes for tomorrow (optional)" },
        { title: "Rest" }
      ]
    },
    {
      id: "safety-checks",
      title: "Home safety check",
      type: "list",
      repeatRule: { frequency: "daily" },
      listItems: [
        { title: "Doors locked when leaving / overnight" },
        { title: "Keys in usual place" },
        { title: "Appliances off if needed" },
        { title: "Heating / windows as preferred" }
      ]
    },
    {
      id: "essential-tasks",
      title: "Essential tasks this week",
      type: "list",
      repeatRule: { frequency: "weekly" },
      notes: "One or two items only — rest still counts.",
      listItems: [
        { title: "Laundry" },
        { title: "Shopping / food" },
        { title: "One bill or message" },
        { title: "Cleaning glance" }
      ]
    },
    {
      id: "appointments-glance",
      title: "Upcoming appointments",
      type: "list",
      notes: "Medical, social or personal — edit freely.",
      listItems: [
        { title: "Next appointment noted" },
        { title: "Travel plan" },
        { title: "Support person if needed" }
      ]
    },
    {
      id: "emergency-info",
      title: "Important contacts note",
      type: "note",
      notes:
        "Trusted people and key numbers for your own use. Share with Crew only if you choose. Not a substitute for emergency services."
    }
  ],
  aiCoachPrompts: [
    "Help me build a simple morning routine for independent living.",
    "Suggest a calm evening safety checklist."
  ]
});
