import { defineContentPack, organisationalHealthNote } from "../packFactory";

export const dementiaSupportPack = defineContentPack({
  meta: {
    id: "dementia-support",
    version: "1.2.0",
    icon: "heart-outline",
    category: "health",
    title: "Dementia Support",
    summary:
      "Meals, hydration, family check-ins and safety reminders for shared care — organisational support only.",
    features: [
      "Medication organisation",
      "Meals",
      "Hydration",
      "Family check-ins",
      "Safety evening check",
      "Appointment prep",
      "Carer pause",
      "Partner shop links"
    ],
    healthDisclaimer: organisationalHealthNote,
    productId: "ready.pack.dementia_support"
  },
  templates: [
    {
      id: "medication-organisation",
      title: "Medication organisation check",
      type: "reminder",
      notes: organisationalHealthNote,
      repeatRule: { frequency: "daily" },
      speakingReminderText: "Medication organisation reminder for today.",
      priority: "important"
    },
    {
      id: "medication-supply",
      title: "Medication supply checklist",
      type: "list",
      notes: organisationalHealthNote,
      listItems: [
        { title: "Today's doses organised as prescribed" },
        { title: "Supply checked" },
        { title: "Repeat arranged if needed" },
        { title: "Stored in the usual safe place" }
      ],
      repeatRule: { frequency: "weekly" },
      priority: "soon"
    },
    {
      id: "meals",
      title: "Mealtime reminder",
      type: "reminder",
      repeatRule: { frequency: "daily" },
      speakingReminderText: "A gentle mealtime reminder.",
      notes: "Edit meal times to suit. Organisational support only.",
      priority: "soon"
    },
    {
      id: "meal-checklist",
      title: "Simple meal checklist",
      type: "list",
      listItems: [
        { title: "Breakfast" },
        { title: "Lunch" },
        { title: "Evening meal" },
        { title: "Drink with each meal if helpful" }
      ],
      repeatRule: { frequency: "daily" },
      priority: "not_urgent"
    },
    {
      id: "hydration",
      title: "Hydration reminder",
      type: "reminder",
      repeatRule: { frequency: "daily" },
      speakingReminderText: "Time for a drink of water.",
      priority: "soon"
    },
    {
      id: "family-checkin",
      title: "Family check-in",
      type: "reminder",
      notes: "A short call or message with someone who cares.",
      repeatRule: { frequency: "daily" },
      speakingReminderText: "Family check-in when you are ready.",
      priority: "soon"
    },
    {
      id: "safety",
      title: "Safety evening check",
      type: "list",
      listItems: [
        { title: "Doors locked" },
        { title: "Keys in usual place" },
        { title: "Phone charged" },
        { title: "Lights as preferred" },
        { title: "Heating / windows as preferred" }
      ],
      repeatRule: { frequency: "daily" },
      priority: "important"
    },
    {
      id: "appointment-prep",
      title: "Appointment / clinic prep",
      type: "list",
      notes: organisationalHealthNote,
      listItems: [
        { title: "Confirm time and place" },
        { title: "Travel plan" },
        { title: "Questions written down" },
        { title: "Medication list for clinician (as advised)" },
        { title: "Support person arranged if needed" }
      ],
      dueInDays: 3,
      priority: "important"
    },
    {
      id: "daily-orientation",
      title: "Gentle day orientation",
      type: "list",
      notes: "Optional prompts to keep the day clear. Edit wording to suit.",
      listItems: [
        { title: "Today is (edit day / date)" },
        { title: "Morning plan" },
        { title: "Afternoon plan" },
        { title: "Who might visit or call" }
      ],
      repeatRule: { frequency: "daily" },
      priority: "not_urgent"
    },
    {
      id: "carer-pause",
      title: "Carer pause",
      type: "reminder",
      notes: "For supporters: a short break is allowed. Ask for help if you need it.",
      speakingReminderText: "Carer pause. A short rest is allowed.",
      priority: "soon"
    },
    {
      id: "shared-care-note",
      title: "Shared care note",
      type: "note",
      notes: "Park useful notes for family or carers here. Not a clinical record."
    },
    {
      id: "pack-shop",
      title: "Optional care organisation shop",
      type: "list",
      notes:
        "Browse partner suppliers for pill organisers, clocks and night lights. Affiliate links — we may earn a small commission if you buy, at no extra cost to you. Nothing required. Organisational support only — not medical devices as treatment.",
      listItems: [
        { title: "Pill organiser" },
        { title: "Calendar clock" },
        { title: "Night light" },
        { title: "Nothing right now" }
      ],
      priority: "not_urgent"
    }
  ],
  aiCoachPrompts: [
    "Suggest a calm shared-care evening checklist.",
    "Help organise a clinic appointment without giving medical advice.",
    "Give a kind carer pause reminder.",
    "Help turn today into a simple morning and afternoon plan."
  ],
  badges: [
    { id: "dementia-care-day", title: "Care day", description: "Small checks that keep the day steady." },
    { id: "dementia-safety", title: "Evening settled", description: "Safety checks done gently." },
    { id: "dementia-carer-pause", title: "Carer pause taken", description: "Supporters need rest too." }
  ],
  crewRecommendations: [
    { roleHint: "guardian", reason: "Trusted family or carer for check-ins." },
    { roleHint: "cheerleader", reason: "Warm company without pressure." }
  ]
});
