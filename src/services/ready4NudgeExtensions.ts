import type { Ready4NudgeExtension, Ready4NudgeExtensionPack } from "../types/nudgeIntents";

function ext(
  packId: string,
  intent: Ready4NudgeExtension["intent"],
  id: string,
  label: string,
  extra: Partial<Ready4NudgeExtension> = {}
): Ready4NudgeExtension {
  return {
    id: `${packId}:${id}`,
    packId,
    intent,
    label,
    itemType: extra.itemType ?? "task",
    defaultTitle: extra.defaultTitle ?? label,
    templateId: extra.templateId,
    route: extra.route,
    icon: extra.icon
  };
}

/**
 * Ready4 packs register nudge extensions here.
 * Only loaded when the pack is installed — never shown on first use otherwise.
 */
export const READY4_NUDGE_EXTENSION_PACKS: Ready4NudgeExtensionPack[] = [
  {
    packId: "ready4-moving",
    extensions: [
      ext("ready4-moving", "plan", "plan-move", "Plan my move", { itemType: "project", templateId: "what-helps" }),
      ext("ready4-moving", "plan", "packing", "Packing plan", { itemType: "list", templateId: "packing" }),
      ext("ready4-moving", "plan", "budget", "Moving budget", { itemType: "list", templateId: "move-budget" }),
      ext("ready4-moving", "plan", "viewing", "House viewing", { itemType: "appointment", templateId: "viewing-prep" }),
      ext("ready4-moving", "plan", "checklist", "Moving checklist", { itemType: "list", templateId: "what-helps" }),
      ext("ready4-moving", "remember", "solicitor", "Solicitor follow-up", { itemType: "reminder", defaultTitle: "Call solicitor about the move" }),
      ext("ready4-moving", "remember", "mortgage", "Mortgage deadline", { itemType: "reminder", templateId: "mortgage-readiness" }),
      ext("ready4-moving", "remember", "exchange", "Exchange / completion date", { itemType: "reminder" }),
      ext("ready4-moving", "remember", "utilities", "Utility changes", { itemType: "list", templateId: "address-change" }),
      ext("ready4-moving", "buy_pay", "removals", "Removal company", { itemType: "task", templateId: "move-suppliers" }),
      ext("ready4-moving", "buy_pay", "boxes", "Boxes & packing supplies", { itemType: "list" }),
      ext("ready4-moving", "buy_pay", "storage", "Storage", { itemType: "task" }),
      ext("ready4-moving", "buy_pay", "solicitor-costs", "Solicitor costs", { itemType: "reminder" }),
      ext("ready4-moving", "buy_pay", "purchases", "Moving purchases", { itemType: "list" })
    ]
  },
  {
    packId: "ready4-baby",
    extensions: [
      ext("ready4-baby", "plan", "prepare", "Prepare for baby", { itemType: "list", templateId: "what-helps" }),
      ext("ready4-baby", "plan", "hospital-bag", "Hospital bag", { itemType: "list", templateId: "bag-checklist" }),
      ext("ready4-baby", "plan", "baby-shower", "Baby shower", { itemType: "event" }),
      ext("ready4-baby", "plan", "sip-see", "Sip & See", { itemType: "event" }),
      ext("ready4-baby", "plan", "christening", "Baptism / christening", { itemType: "occasion" }),
      ext("ready4-baby", "buy_pay", "equipment", "Baby equipment", { itemType: "list" }),
      ext("ready4-baby", "buy_pay", "pram", "Pram / travel system", { itemType: "task" }),
      ext("ready4-baby", "buy_pay", "furniture", "Nursery furniture", { itemType: "list" }),
      ext("ready4-baby", "buy_pay", "clothes", "Baby clothes", { itemType: "list" }),
      ext("ready4-baby", "buy_pay", "registry", "Gift registry", { itemType: "list" }),
      ext("ready4-baby", "book_go", "classes", "Classes", { itemType: "appointment" }),
      ext("ready4-baby", "book_go", "appointments", "Baby appointments", { itemType: "appointment", templateId: "appointment-prep" }),
      ext("ready4-baby", "book_go", "activities", "Baby activities", { itemType: "event" }),
      ext("ready4-baby", "life_people", "shower", "Baby shower plans", { itemType: "event" }),
      ext("ready4-baby", "life_people", "crew", "Ask Crew for baby support", { route: "Help" }),
      ext("ready4-baby", "life_people", "family", "Family events", { itemType: "occasion" })
    ]
  },
  {
    packId: "ready4-wedding",
    extensions: [
      ext("ready4-wedding", "plan", "dashboard", "Wedding planning", { itemType: "project", templateId: "what-helps" }),
      ext("ready4-wedding", "plan", "budget", "Wedding budget", { itemType: "list" }),
      ext("ready4-wedding", "plan", "guests", "Guest list", { itemType: "list" }),
      ext("ready4-wedding", "buy_pay", "suppliers", "Wedding suppliers", { itemType: "list" }),
      ext("ready4-wedding", "buy_pay", "outfits", "Dress / outfits", { itemType: "task" }),
      ext("ready4-wedding", "book_go", "venue", "Venue / ceremony", { itemType: "appointment" }),
      ext("ready4-wedding", "life_people", "party", "Wedding party", { itemType: "list" })
    ]
  },
  {
    packId: "ready4-home",
    extensions: [
      ext("ready4-home", "do", "daily-reset", "10-minute home reset", { itemType: "chore", templateId: "daily-reset" }),
      ext("ready4-home", "do", "cleaning", "Cleaning planner", { itemType: "list", templateId: "cleaning-planner" }),
      ext("ready4-home", "remember", "bins", "Bin day", { itemType: "reminder", templateId: "bin-day" }),
      ext("ready4-home", "remember", "maintenance", "Home maintenance", { itemType: "task", templateId: "maintenance" }),
      ext("ready4-home", "buy_pay", "bills", "Household bills", { itemType: "reminder", templateId: "bill-reminders" })
    ]
  },
  {
    packId: "ready4-finance",
    extensions: [
      ext("ready4-finance", "buy_pay", "bills", "Bill calendar", { itemType: "list", templateId: "bill-calendar" }),
      ext("ready4-finance", "buy_pay", "subscriptions", "Subscriptions", { itemType: "list", templateId: "subscriptions" }),
      ext("ready4-finance", "buy_pay", "renewals", "Annual renewals", { itemType: "list", templateId: "annual-renewals" }),
      ext("ready4-finance", "plan", "budget", "Budget planner", { itemType: "list", templateId: "budget-planner" }),
      ext("ready4-finance", "remember", "payment", "Payment nudge", { itemType: "reminder", templateId: "payment-nudge" })
    ]
  },
  {
    packId: "ready4-shopping",
    extensions: [
      ext("ready4-shopping", "buy_pay", "main-list", "Shopping list", { itemType: "list", templateId: "main-list" }),
      ext("ready4-shopping", "buy_pay", "household", "Household essentials", { itemType: "list" }),
      ext("ready4-shopping", "plan", "meal", "Meal ingredients", { itemType: "list" })
    ]
  },
  {
    packId: "ready4-study",
    extensions: [
      ext("ready4-study", "plan", "assignment", "Assignment planner", { itemType: "task", templateId: "assignment-planner" }),
      ext("ready4-study", "plan", "revision", "Revision planner", { itemType: "list" }),
      ext("ready4-study", "remember", "exam", "Exam countdown", { itemType: "list", templateId: "exam-countdown" }),
      ext("ready4-study", "do", "study-session", "Study session", { itemType: "task" })
    ]
  },
  {
    packId: "ready4-travel",
    extensions: [
      ext("ready4-travel", "plan", "trip", "Plan a trip", { itemType: "project" }),
      ext("ready4-travel", "plan", "packing", "Packing list", { itemType: "list" }),
      ext("ready4-travel", "book_go", "flights", "Flights / bookings", { itemType: "appointment" }),
      ext("ready4-travel", "remember", "documents", "Travel documents", { itemType: "list" }),
      ext("ready4-travel", "buy_pay", "insurance", "Travel insurance", { itemType: "task" })
    ]
  },
  {
    packId: "ready4-work",
    extensions: [
      ext("ready4-work", "do", "top3", "Work Top 3", { itemType: "list" }),
      ext("ready4-work", "book_go", "meeting", "Meeting prep", { itemType: "appointment" }),
      ext("ready4-work", "remember", "follow-up", "Work follow-up", { itemType: "reminder" }),
      ext("ready4-work", "do", "wins", "Work wins", { itemType: "note" })
    ]
  },
  {
    packId: "ready4-appointments",
    extensions: [
      ext("ready4-appointments", "book_go", "book", "Book an appointment", { itemType: "appointment" }),
      ext("ready4-appointments", "plan", "prepare", "Prepare for appointment", { itemType: "list" }),
      ext("ready4-appointments", "remember", "questions", "Questions to ask", { itemType: "list" }),
      ext("ready4-appointments", "do", "follow-up", "Appointment follow-up", { itemType: "task" })
    ]
  },
  {
    packId: "ready4-wellbeing",
    extensions: [
      ext("ready4-wellbeing", "do", "tiny-win", "Tiny wellbeing win", { itemType: "task" }),
      ext("ready4-wellbeing", "remember", "routine", "Wellbeing routine", { itemType: "routine" }),
      ext("ready4-wellbeing", "life_people", "check-in", "Mood check-in", { itemType: "note" })
    ]
  },
  {
    packId: "ready4-family",
    extensions: [
      ext("ready4-family", "book_go", "school", "School / family calendar", { itemType: "event" }),
      ext("ready4-family", "life_people", "birthday", "Family birthday", { itemType: "occasion" }),
      ext("ready4-family", "remember", "forms", "Permission forms", { itemType: "reminder" }),
      ext("ready4-family", "do", "tasks", "Family task", { itemType: "task" })
    ]
  },
  {
    packId: "ready4-medication",
    extensions: [
      ext("ready4-medication", "remember", "dose", "Medication reminder", { itemType: "reminder" }),
      ext("ready4-medication", "remember", "refill", "Prescription refill", { itemType: "reminder" }),
      ext("ready4-medication", "book_go", "pharmacy", "Pharmacy / appointment", { itemType: "appointment" })
    ]
  },
  {
    packId: "ready4-independence",
    extensions: [
      ext("ready4-independence", "do", "daily", "Daily living step", { itemType: "task" }),
      ext("ready4-independence", "plan", "meal", "Make a meal (guided)", { itemType: "list" }),
      ext("ready4-independence", "life_people", "crew", "Ask Crew for support", { route: "Help" })
    ]
  },
  {
    packId: "ready4-pets",
    extensions: [
      ext("ready4-pets", "do", "daily-care", "Daily pet care", { itemType: "list", templateId: "daily-care" }),
      ext("ready4-pets", "remember", "medication", "Pet medication", {
        itemType: "reminder",
        templateId: "pet-medication"
      }),
      ext("ready4-pets", "book_go", "vet", "Vet appointment prep", { itemType: "list", templateId: "vet-planner" }),
      ext("ready4-pets", "remember", "vaccinations", "Vaccinations & boosters", {
        itemType: "list",
        templateId: "vaccinations"
      }),
      ext("ready4-pets", "do", "grooming", "Grooming checklist", { itemType: "list", templateId: "grooming" })
    ]
  },
  {
    packId: "ready4-digital-life",
    extensions: [
      ext("ready4-digital-life", "plan", "what-helps", "Digital life — what would help?", {
        itemType: "list",
        templateId: "what-helps"
      }),
      ext("ready4-digital-life", "do", "passwords", "Password review", {
        itemType: "list",
        templateId: "password-review"
      }),
      ext("ready4-digital-life", "remember", "updates", "Software updates", {
        itemType: "reminder",
        templateId: "software-updates"
      }),
      ext("ready4-digital-life", "buy_pay", "subscriptions", "Digital subscriptions", {
        itemType: "list",
        templateId: "subscriptions"
      }),
      ext("ready4-digital-life", "do", "backup", "Backup check", {
        itemType: "reminder",
        templateId: "cloud-backup"
      })
    ]
  },
  {
    packId: "ready4-life-admin",
    extensions: [
      ext("ready4-life-admin", "plan", "documents", "Important documents", {
        itemType: "list",
        templateId: "document-vault"
      }),
      ext("ready4-life-admin", "remember", "renewals", "Renewals this season", {
        itemType: "list",
        templateId: "renewal-calendar"
      }),
      ext("ready4-life-admin", "do", "household", "Household admin", {
        itemType: "list",
        templateId: "household-admin"
      }),
      ext("ready4-life-admin", "remember", "vehicle", "Vehicle reminders", {
        itemType: "list",
        templateId: "vehicle"
      })
    ]
  },
  {
    packId: "ready4-emergencies",
    extensions: [
      ext("ready4-emergencies", "life_people", "contacts", "Emergency contacts", {
        itemType: "note",
        templateId: "emergency-contacts"
      }),
      ext("ready4-emergencies", "plan", "grab-bag", "Grab bag checklist", {
        itemType: "list",
        templateId: "grab-bag"
      }),
      ext("ready4-emergencies", "plan", "home-plan", "Home emergency plan", {
        itemType: "list",
        templateId: "home-plan"
      }),
      ext("ready4-emergencies", "remember", "review", "Annual emergency plan review", {
        itemType: "reminder",
        templateId: "annual-review"
      })
    ]
  }
];

export function extensionsForInstalledPacks(installedPackIds: string[]): Ready4NudgeExtension[] {
  const installed = new Set(installedPackIds);
  return READY4_NUDGE_EXTENSION_PACKS.filter((pack) => installed.has(pack.packId)).flatMap(
    (pack) => pack.extensions
  );
}
