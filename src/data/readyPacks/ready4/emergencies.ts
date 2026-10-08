import { organisationalHealthNote, ready4Pack } from "../packFactory";

export const ready4EmergenciesPack = ready4Pack({
  slug: "emergencies",
  name: "Emergencies",
  icon: "alert-circle-outline",
  category: "lifestyle",
  summary:
    "Contacts, grab bag, home plan and document locations — preparation for peace of mind, not panic.",
  healthDisclaimer: organisationalHealthNote,
  features: [
    "Emergency contacts",
    "Medical information note",
    "Grab bag checklist",
    "Home emergency plan",
    "Important documents",
    "Annual review"
  ],
  productId: "ready.pack.ready4_emergencies",
  templates: [
    {
      id: "emergency-contacts",
      title: "Emergency contacts",
      type: "note",
      notes:
        "Trusted people and key numbers for your household. In an emergency dial local emergency services. This pack is organisational only."
    },
    {
      id: "medical-info",
      title: "Essential medical information note",
      type: "note",
      notes:
        organisationalHealthNote +
        " Optional allergies, conditions and clinician contacts for your own or household use — not a medical device."
    },
    {
      id: "grab-bag",
      title: "Grab bag checklist",
      type: "list",
      notes: "Prepare when calm. Edit for your household.",
      listItems: [
        { title: "Torch / power bank" },
        { title: "Water / snacks" },
        { title: "Medications list / supply as prescribed" },
        { title: "Copies of key documents" },
        { title: "Cash / cards / keys" },
        { title: "Phone chargers" }
      ]
    },
    {
      id: "home-plan",
      title: "Home emergency plan",
      type: "list",
      listItems: [
        { title: "Meeting point noted" },
        { title: "Utility shut-offs location noted" },
        { title: "Smoke / CO alarms checked" },
        { title: "Evacuation route thought through" },
        { title: "Shared with trusted person (optional)" }
      ]
    },
    {
      id: "important-docs",
      title: "Where vital documents live",
      type: "note",
      notes: "Passports, insurance, deeds — note locations only. Keep originals secure."
    },
    {
      id: "annual-review",
      title: "Annual emergency plan review",
      type: "reminder",
      notes: "Refresh contacts, kit and plans once a year.",
      speakingReminderText: "Reminder to review your emergency plan when you can.",
      dueInDays: 365,
      priority: "soon"
    }
  ],
  aiCoachPrompts: [
    "Help me build a simple grab-bag checklist for my household.",
    "Suggest a calm annual review of emergency contacts and plans."
  ]
});
