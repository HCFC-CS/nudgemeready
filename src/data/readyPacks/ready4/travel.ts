import { ready4Pack } from "../packFactory";

/** Ready 4 Travel — Edition 1 catalogue + best of the former Holiday Planner. */
export const ready4TravelPack = ready4Pack({
  slug: "travel",
  name: "Travel",
  icon: "airplane-outline",
  category: "events",
  summary:
    "Passports, packing, transport, airport extras, stays and a calm return-home checklist.",
  features: [
    "Travel countdown",
    "Packing lists",
    "Documents",
    "Airport checklist",
    "Accommodation",
    "Return home"
  ],
  productId: "ready.pack.ready4_travel",
  templates: [
    {
      id: "passport-expiry",
      title: "Check passport expiry",
      type: "reminder",
      notes: "Confirm your passport is valid for your trip and any destination rules.",
      speakingReminderText: "Gentle reminder to check your passport expiry date.",
      dueInDays: 14,
      reminderInDays: 14,
      priority: "important"
    },
    {
      id: "travel-insurance",
      title: "Confirm travel insurance",
      type: "reminder",
      notes: "Check cover dates, policy number, and emergency contact details.",
      speakingReminderText: "Remember to confirm your travel insurance.",
      dueInDays: 10,
      reminderInDays: 10,
      priority: "important"
    },
    {
      id: "need-transport",
      title: "Need transport to the airport?",
      type: "list",
      notes:
        "Tick the option that fits. Put your airport name in the notes (e.g. Heathrow) for local taxi and parking links on this card.",
      dueInDays: 7,
      priority: "important",
      listItems: [
        { title: "Taxi / private hire" },
        { title: "Airport parking" },
        { title: "Drop-off by family or friend" },
        { title: "Train / coach / public transport" },
        { title: "Not decided yet" }
      ]
    },
    {
      id: "airport-taxi",
      title: "Book taxi or private hire",
      type: "reminder",
      notes: "Add your airport or home area in the notes. Open taxi links below when ready.",
      speakingReminderText: "Reminder to book a taxi or private hire for the airport.",
      dueInDays: 5,
      reminderInDays: 5,
      priority: "soon"
    },
    {
      id: "airport-parking",
      title: "Pay or book airport parking",
      type: "reminder",
      notes: "Add your airport name. Use the parking links below. Confirm booking reference.",
      speakingReminderText: "Reminder about airport parking payment or booking.",
      dueInDays: 5,
      reminderInDays: 5,
      priority: "soon"
    },
    {
      id: "book-stay",
      title: "Book or confirm your stay",
      type: "reminder",
      notes: "Destination: (add place). Compare stays using the links on this card.",
      speakingReminderText: "Reminder to book or confirm where you are staying.",
      dueInDays: 12,
      reminderInDays: 12,
      priority: "soon"
    },
    {
      id: "airport-extras",
      title: "Airport extras for this trip?",
      type: "list",
      notes: "Tick what would help. Put your airport name in the notes for official links.",
      dueInDays: 8,
      priority: "soon",
      listItems: [
        { title: "Special assistance" },
        { title: "Lounge access" },
        { title: "Meet & greet" },
        { title: "Speedy boarding / fast track" },
        { title: "None needed" }
      ]
    },
    {
      id: "special-assistance",
      title: "Arrange special assistance",
      type: "reminder",
      notes:
        "Add your airport name. Use official assistance links and request help through your airline. Organisational support only.",
      speakingReminderText: "Reminder to arrange special assistance if you need it.",
      dueInDays: 10,
      reminderInDays: 10,
      priority: "important"
    },
    {
      id: "packing-checklist",
      title: "Packing checklist",
      type: "list",
      notes: "Tick as you pack. Edit freely for your trip.",
      dueInDays: 3,
      priority: "soon",
      listItems: [
        { title: "Passport and tickets" },
        { title: "Phone charger and adapters" },
        { title: "Clothes for the forecast" },
        { title: "Toiletries" },
        { title: "Medication if relevant (as prescribed)" },
        { title: "Entertainment for travel" }
      ]
    },
    {
      id: "check-in",
      title: "Online check-in",
      type: "reminder",
      notes: "Open when check-in becomes available and save boarding passes.",
      speakingReminderText: "Reminder to complete online check-in.",
      dueInDays: 1,
      reminderInDays: 1,
      priority: "important"
    },
    {
      id: "departure-time",
      title: "Leave for the airport",
      type: "reminder",
      notes: "Set your own departure time based on traffic and security queues.",
      speakingReminderText: "Time to leave for the airport when you are ready.",
      dueInDays: 0,
      reminderInDays: 0,
      priority: "needs_attention"
    },
    {
      id: "return-home",
      title: "Return-home checklist",
      type: "list",
      notes: "A soft landing after travel.",
      dueInDays: 21,
      priority: "not_urgent",
      listItems: [
        { title: "Unpack bag" },
        { title: "Start laundry" },
        { title: "Restock fridge basics" },
        { title: "Charge devices" },
        { title: "Sort post" }
      ]
    }
  ],
  aiCoachPrompts: [
    "Help me break travel prep into small calm steps.",
    "Suggest a packing list for a short city break.",
    "Help me choose between taxi and airport parking for this trip."
  ]
});
