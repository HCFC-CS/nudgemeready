import { ready4Pack } from "../packFactory";

export const ready4AppointmentsPack = ready4Pack({
  slug: "appointments",
  name: "Appointments",
  icon: "calendar-outline",
  category: "lifestyle",
  summary:
    "Countdown, prep, travel and follow-ups — arrive prepared without the last-minute scramble.",
  features: [
    "Appointment timeline",
    "Preparation checklist",
    "Travel planner",
    "Follow-up tracker",
    "Notes & outcomes"
  ],
  productId: "ready.pack.ready4_appointments",
  templates: [
    {
      id: "appointment-card",
      title: "Next appointment",
      type: "appointment",
      notes: "Edit date, place and who it is with.",
      dueInDays: 7,
      priority: "important"
    },
    {
      id: "prep-checklist",
      title: "Appointment preparation",
      type: "list",
      dueInDays: 5,
      notes: "Documents, forms and questions.",
      listItems: [
        { title: "Confirm time and place" },
        { title: "Referral / letters / ID if needed" },
        { title: "Questions written down" },
        { title: "Anything to take packed" }
      ]
    },
    {
      id: "travel-planner",
      title: "Travel to appointment",
      type: "list",
      dueInDays: 2,
      listItems: [
        { title: "Route chosen" },
        { title: "Parking / ticket sorted" },
        { title: "Leave time set" },
        { title: "Buffer for delays" }
      ]
    },
    {
      id: "leave-reminder",
      title: "Leave for appointment",
      type: "reminder",
      notes: "Set your own leave time based on travel.",
      speakingReminderText: "Time to leave for your appointment when you are ready.",
      dueInDays: 0,
      priority: "needs_attention"
    },
    {
      id: "follow-up",
      title: "Follow-up actions",
      type: "list",
      notes: "Capture next steps before they fade.",
      listItems: [
        { title: "Book next appointment if needed" },
        { title: "Collect prescription / forms" },
        { title: "Tell someone the outcome (optional)" },
        { title: "Add notes below" }
      ]
    },
    {
      id: "outcomes-note",
      title: "Appointment notes & outcomes",
      type: "note",
      notes: "Key points for your own records. Not a clinical record."
    }
  ],
  aiCoachPrompts: [
    "Help me prepare for an appointment calmly.",
    "Suggest a follow-up checklist after a meeting or clinic visit."
  ]
});
