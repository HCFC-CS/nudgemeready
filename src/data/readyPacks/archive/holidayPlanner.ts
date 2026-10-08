import { defineContentPack } from "../packFactory";

export const holidayPlannerPack = defineContentPack({
  meta: {
    id: "holiday-planner",
    version: "1.2.0",
    icon: "airplane-outline",
    category: "events",
    title: "Holiday Planner",
    summary:
      "Passports, packing, transport, special assistance, lounges, meet & greet, stays, check-in and a calm return-home checklist.",
    features: [
      "Packing",
      "Passports",
      "Need transport?",
      "Special assistance",
      "Lounge access",
      "Meet & greet",
      "Speedy boarding / fast track",
      "Airport parking links",
      "Taxi options",
      "Stay booking links",
      "Medication packing",
      "Travel reminders"
    ],
    productId: undefined
  },
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
        "Tick the option that fits this trip. Put your airport name in the title or notes (for example Heathrow or Manchester) to get local taxi and parking links on this card.",
      listItems: [
        { title: "Taxi / private hire to the airport" },
        { title: "Airport parking (drive and park)" },
        { title: "Drop-off by family or friend" },
        { title: "Train / coach / public transport" },
        { title: "Not decided yet" }
      ],
      dueInDays: 7,
      priority: "important"
    },
    {
      id: "airport-taxi",
      title: "Book taxi or private hire",
      type: "reminder",
      notes:
        "Add your airport or home area in the notes (e.g. Taxi to Gatwick). Open the taxi links below for local companies and maps.",
      speakingReminderText: "Reminder to book a taxi or private hire for the airport.",
      dueInDays: 5,
      reminderInDays: 5,
      priority: "soon"
    },
    {
      id: "airport-parking",
      title: "Pay or book airport parking",
      type: "reminder",
      notes:
        "Add your airport name here (Heathrow, Gatwick, Manchester, and so on). Use the parking links below for official and comparison sites. Confirm booking reference and entry instructions.",
      speakingReminderText: "Reminder about airport parking payment or booking.",
      dueInDays: 5,
      reminderInDays: 5,
      priority: "soon"
    },
    {
      id: "book-stay",
      title: "Book or confirm your stay",
      type: "reminder",
      notes:
        "Destination: (add place). Compare hotels and stays on Booking.com, Expedia or Hotels.com using the links below.",
      speakingReminderText: "Reminder to book or confirm where you are staying.",
      dueInDays: 12,
      reminderInDays: 12,
      priority: "soon"
    },
    {
      id: "airport-extras",
      title: "Airport extras for this trip?",
      type: "list",
      notes:
        "Tick what would make the journey easier. Put your airport name in the notes (for example Heathrow) to open official assistance and booking links on this card.",
      listItems: [
        { title: "Special assistance" },
        { title: "Lounge access" },
        { title: "Meet & greet" },
        { title: "Speedy boarding" },
        { title: "Fast track security" },
        { title: "None needed" }
      ],
      dueInDays: 8,
      priority: "soon"
    },
    {
      id: "special-assistance",
      title: "Arrange special assistance",
      type: "reminder",
      notes:
        "Add your airport name here. Use the official assistance links below, and also request help through your airline. Organisational support only — follow airport and airline guidance.",
      speakingReminderText: "Reminder to arrange special assistance if you need it.",
      dueInDays: 10,
      reminderInDays: 10,
      priority: "important"
    },
    {
      id: "lounge-access",
      title: "Book lounge access",
      type: "reminder",
      notes:
        "Add your airport if you know it. Compare lounge options below. Check terminal and opening times before you book.",
      speakingReminderText: "Reminder about lounge access if you want a quieter wait.",
      dueInDays: 6,
      reminderInDays: 6,
      priority: "not_urgent"
    },
    {
      id: "meet-and-greet",
      title: "Book meet & greet",
      type: "reminder",
      notes:
        "Useful if parking or finding the terminal feels stressful. Add your airport name, then use the booking links below.",
      speakingReminderText: "Reminder to book meet and greet if that would help.",
      dueInDays: 6,
      reminderInDays: 6,
      priority: "not_urgent"
    },
    {
      id: "speedy-boarding",
      title: "Speedy boarding or fast track",
      type: "reminder",
      notes:
        "Check your airline first for speedy or priority boarding, then airport fast track if you still want it. Links below help you compare.",
      speakingReminderText: "Reminder to check speedy boarding or fast track options.",
      dueInDays: 4,
      reminderInDays: 4,
      priority: "not_urgent"
    },
    {
      id: "packing-checklist",
      title: "Holiday packing checklist",
      type: "list",
      notes: "Tick items as you pack. Edit freely for your trip.",
      listItems: [
        { title: "Passport and tickets" },
        { title: "Phone charger and adapters" },
        { title: "Clothes for the forecast" },
        { title: "Toiletries" },
        { title: "Sunglasses / hat" },
        { title: "Entertainment for travel" }
      ],
      dueInDays: 3,
      priority: "soon"
    },
    {
      id: "medication-packing",
      title: "Pack medication for travel",
      type: "reminder",
      notes:
        "Organisational reminder only: pack enough of your usual medication and keep a list of what you take. This is not medical advice.",
      speakingReminderText: "Remember to pack your medication for the trip.",
      dueInDays: 2,
      reminderInDays: 2,
      priority: "important"
    },
    {
      id: "currency",
      title: "Sort currency or travel card",
      type: "reminder",
      notes: "Cash, card, or travel wallet — whatever you prefer.",
      speakingReminderText: "Reminder to sort currency or your travel card.",
      dueInDays: 4,
      reminderInDays: 4
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
      listItems: [
        { title: "Unpack bag" },
        { title: "Start laundry" },
        { title: "Restock fridge basics" },
        { title: "Charge devices" },
        { title: "Sort post" }
      ],
      dueInDays: 21,
      priority: "not_urgent"
    }
  ],
  aiCoachPrompts: [
    "Help me break holiday prep into small calm steps.",
    "Suggest a packing list for a short city break.",
    "Remind me what to do the night before travel without rushing me.",
    "Help me choose between taxi and airport parking for this trip.",
    "Help me decide whether lounge access or meet and greet would make travel calmer."
  ],
  badges: [
    {
      id: "holiday-packed",
      title: "Packed and ready",
      description: "You worked through holiday prep at your own pace."
    }
  ],
  crewRecommendations: [
    {
      roleHint: "cheerleader",
      reason: "A friendly check-in the day before travel can reduce last-minute stress."
    }
  ]
});
