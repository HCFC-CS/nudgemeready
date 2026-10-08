import { organisationalHealthNote, ready4Pack } from "../packFactory";

export const ready4MedicationPack = ready4Pack({
  slug: "medication",
  name: "Medication",
  icon: "medkit-outline",
  category: "health",
  summary:
    "Medication organisation, refill checks and appointment prep — organisational support only, not medical advice.",
  healthDisclaimer: organisationalHealthNote,
  features: [
    "Medication schedule",
    "Prescription tracker",
    "Pharmacy collection",
    "Health appointments",
    "Symptom journal"
  ],
  productId: "ready.pack.ready4_medication",
  templates: [
    {
      id: "med-schedule",
      title: "Medication organisation check",
      type: "reminder",
      repeatRule: { frequency: "daily" },
      notes: organisationalHealthNote,
      speakingReminderText: "Medication organisation reminder. Follow your clinician's advice.",
      priority: "important"
    },
    {
      id: "med-times",
      title: "Daily medication times",
      type: "list",
      repeatRule: { frequency: "daily" },
      notes: organisationalHealthNote + " Edit times to match what you have been prescribed.",
      listItems: [
        { title: "Morning — if prescribed" },
        { title: "Midday — if prescribed" },
        { title: "Evening — if prescribed" },
        { title: "Bedtime — if prescribed" }
      ]
    },
    {
      id: "prescription-tracker",
      title: "Prescription / supply check",
      type: "list",
      repeatRule: { frequency: "weekly" },
      notes: organisationalHealthNote,
      listItems: [
        { title: "Enough for the next few days" },
        { title: "Repeat / refill arranged if needed" },
        { title: "Stored in the usual safe place" }
      ]
    },
    {
      id: "pharmacy-collection",
      title: "Pharmacy collection / delivery",
      type: "reminder",
      notes: "Organisational only. Confirm collection or delivery with your pharmacy.",
      speakingReminderText: "Reminder about pharmacy collection if you need it.",
      dueInDays: 5,
      priority: "soon"
    },
    {
      id: "health-appointment",
      title: "Health appointment prep",
      type: "list",
      dueInDays: 7,
      notes: organisationalHealthNote,
      listItems: [
        { title: "Confirm time and place" },
        { title: "Travel plan" },
        { title: "Questions written down" },
        { title: "Medication list for clinician (as advised)" }
      ]
    },
    {
      id: "symptom-journal",
      title: "Symptom / wellbeing journal",
      type: "note",
      notes:
        "For your own records and clinician visits. Not a diagnosis tool. Do not change medication based on this note — ask your clinician."
    }
  ],
  aiCoachPrompts: [
    "Help me organise a calm medication routine without giving medical advice.",
    "Suggest questions to prepare for a clinician appointment."
  ]
});
