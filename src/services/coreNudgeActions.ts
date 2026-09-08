import type { CoreNudgeAction, NudgeIntent, NudgeIntentCategory } from "../types/nudgeIntents";

export const NUDGE_INTENT_CATEGORIES: NudgeIntentCategory[] = [
  {
    intent: "plan",
    title: "Plan it",
    subtitle: "I've got something coming up",
    icon: "map-outline"
  },
  {
    intent: "remember",
    title: "Remember it",
    subtitle: "Don't let me forget",
    icon: "notifications-outline"
  },
  {
    intent: "do",
    title: "Do it",
    subtitle: "I need to get something done",
    icon: "checkbox-outline"
  },
  {
    intent: "book_go",
    title: "Book & go",
    subtitle: "I've got somewhere to be",
    icon: "calendar-outline"
  },
  {
    intent: "buy_pay",
    title: "Buy & pay",
    subtitle: "I need to buy, pay or renew something",
    icon: "card-outline"
  },
  {
    intent: "life_people",
    title: "Life & people",
    subtitle: "People, celebrations & things that matter",
    icon: "heart-outline"
  }
];

/** Everyday actions — never require a Ready4 pack. */
export const CORE_NUDGE_ACTIONS: CoreNudgeAction[] = [
  // Plan it
  { id: "plan-something", intent: "plan", kind: "create", label: "Plan something", itemType: "project", defaultTitle: "", icon: "map-outline" },
  { id: "prepare-something", intent: "plan", kind: "create", label: "Prepare for something", itemType: "task", defaultTitle: "Prepare for ", icon: "construct-outline" },
  { id: "organise-something", intent: "plan", kind: "create", label: "Organise something", itemType: "task", defaultTitle: "Organise ", icon: "grid-outline" },
  { id: "make-checklist", intent: "plan", kind: "create", label: "Make a checklist", itemType: "list", defaultTitle: "", icon: "list-outline" },
  { id: "decide-something", intent: "plan", kind: "create", label: "Decide something", itemType: "note", defaultTitle: "Decide: ", icon: "help-circle-outline" },

  // Remember it
  { id: "remember-something", intent: "remember", kind: "create", label: "Remember something", itemType: "reminder", defaultTitle: "", icon: "notifications-outline" },
  { id: "set-reminder", intent: "remember", kind: "create", label: "Set a reminder", itemType: "reminder", defaultTitle: "", icon: "alarm-outline" },
  { id: "note-something", intent: "remember", kind: "create", label: "Note something", itemType: "note", defaultTitle: "", icon: "document-text-outline" },
  { id: "follow-up", intent: "remember", kind: "create", label: "Follow something up", itemType: "reminder", defaultTitle: "Follow up: ", icon: "call-outline" },
  { id: "check-something", intent: "remember", kind: "create", label: "Check something", itemType: "reminder", defaultTitle: "Check ", icon: "eye-outline" },
  { id: "bring-something", intent: "remember", kind: "create", label: "Bring something", itemType: "reminder", defaultTitle: "Bring ", icon: "bag-outline" },
  { id: "take-something", intent: "remember", kind: "create", label: "Take something", itemType: "reminder", defaultTitle: "Take ", icon: "cube-outline" },

  // Do it
  { id: "add-task", intent: "do", kind: "create", label: "Add a task", itemType: "task", defaultTitle: "", icon: "checkbox-outline" },
  { id: "start-something", intent: "do", kind: "create", label: "Start something", itemType: "task", defaultTitle: "Start ", icon: "play-outline" },
  { id: "finish-something", intent: "do", kind: "create", label: "Finish something", itemType: "task", defaultTitle: "Finish ", icon: "flag-outline" },
  { id: "sort-something", intent: "do", kind: "create", label: "Sort something", itemType: "chore", defaultTitle: "Sort ", icon: "brush-outline" },
  { id: "send-something", intent: "do", kind: "create", label: "Send something", itemType: "task", defaultTitle: "Send ", icon: "send-outline" },
  { id: "submit-something", intent: "do", kind: "create", label: "Submit something", itemType: "task", defaultTitle: "Submit ", icon: "cloud-upload-outline" },
  { id: "collect-something", intent: "do", kind: "create", label: "Collect something", itemType: "task", defaultTitle: "Collect ", icon: "download-outline" },
  { id: "return-something", intent: "do", kind: "create", label: "Return something", itemType: "task", defaultTitle: "Return ", icon: "return-down-back-outline" },
  { id: "focus-one", intent: "do", kind: "route", label: "Just one thing (Focus)", route: "Focus", icon: "disc-outline" },

  // Book & go
  { id: "add-booking", intent: "book_go", kind: "create", label: "Add a booking", itemType: "appointment", defaultTitle: "", icon: "ticket-outline" },
  { id: "add-appointment", intent: "book_go", kind: "create", label: "Add an appointment", itemType: "appointment", defaultTitle: "", icon: "calendar-outline" },
  { id: "add-place-to-go", intent: "book_go", kind: "create", label: "Add somewhere I need to go", itemType: "event", defaultTitle: "", icon: "navigate-outline" },
  { id: "add-event", intent: "book_go", kind: "create", label: "Add an event", itemType: "event", defaultTitle: "", icon: "sparkles-outline" },
  { id: "add-meeting", intent: "book_go", kind: "create", label: "Add a meeting", itemType: "appointment", defaultTitle: "Meeting: ", icon: "people-outline" },
  { id: "leave-by", intent: "book_go", kind: "create", label: "Set a leave-by reminder", itemType: "reminder", defaultTitle: "Leave by ", icon: "time-outline" },
  { id: "things-to-take", intent: "book_go", kind: "create", label: "Add things I need to take", itemType: "list", defaultTitle: "Things to take", icon: "bag-handle-outline" },

  // Buy & pay
  { id: "buy-something", intent: "buy_pay", kind: "create", label: "Buy something", itemType: "task", defaultTitle: "Buy ", icon: "cart-outline" },
  { id: "pay-something", intent: "buy_pay", kind: "create", label: "Pay something", itemType: "reminder", defaultTitle: "Pay ", icon: "card-outline" },
  { id: "bill-reminder", intent: "buy_pay", kind: "create", label: "Add a bill reminder", itemType: "reminder", defaultTitle: "Bill: ", icon: "receipt-outline" },
  { id: "renewal", intent: "buy_pay", kind: "create", label: "Add a renewal", itemType: "reminder", defaultTitle: "Renew ", icon: "refresh-outline" },
  { id: "shopping-list", intent: "buy_pay", kind: "create", label: "Add something to a shopping list", itemType: "list", defaultTitle: "Shopping list", icon: "list-outline" },
  { id: "cancel-something", intent: "buy_pay", kind: "create", label: "Cancel something", itemType: "task", defaultTitle: "Cancel ", icon: "close-circle-outline" },
  { id: "track-bought", intent: "buy_pay", kind: "create", label: "Track something I've bought", itemType: "note", defaultTitle: "Bought: ", icon: "cube-outline" },

  // Life & people
  { id: "birthday", intent: "life_people", kind: "create", label: "Remember a birthday", itemType: "occasion", defaultTitle: "Birthday: ", icon: "balloon-outline" },
  { id: "anniversary", intent: "life_people", kind: "create", label: "Remember an anniversary", itemType: "special_day", defaultTitle: "Anniversary: ", icon: "heart-outline" },
  { id: "contact-someone", intent: "life_people", kind: "create", label: "Contact someone", itemType: "reminder", defaultTitle: "Contact ", icon: "call-outline" },
  { id: "message-someone", intent: "life_people", kind: "create", label: "Message someone", itemType: "reminder", defaultTitle: "Message ", icon: "chatbubble-outline" },
  { id: "share-something", intent: "life_people", kind: "create", label: "Share something", itemType: "task", defaultTitle: "Share ", icon: "share-outline" },
  { id: "ask-crew", intent: "life_people", kind: "crew", label: "Ask Crew for help", route: "Help", icon: "people-outline" },
  { id: "celebration", intent: "life_people", kind: "create", label: "Add a celebration or important date", itemType: "occasion", defaultTitle: "", icon: "gift-outline" }
];

export function coreActionsForIntent(intent: NudgeIntent): CoreNudgeAction[] {
  return CORE_NUDGE_ACTIONS.filter((action) => action.intent === intent);
}

export function getIntentCategory(intent: NudgeIntent): NudgeIntentCategory {
  return NUDGE_INTENT_CATEGORIES.find((entry) => entry.intent === intent) ?? NUDGE_INTENT_CATEGORIES[0]!;
}
