export type WhyHardReasonId =
  | "tired"
  | "hungry"
  | "stressed"
  | "overwhelmed"
  | "in_pain"
  | "forgot"
  | "no_time"
  | "missing_what_i_need"
  | "not_feeling_well"
  | "struggling_to_start"
  | "dont_want_to"
  | "something_else";

export type WhyHardAction = "make_smaller" | "five_minute" | "later" | "skip_today";

export type WhyHardActionOption = {
  id: WhyHardAction;
  label: string;
};

export type WhyHardReason = {
  id: WhyHardReasonId;
  label: string;
  message: string;
  actions: WhyHardActionOption[];
};

const MAKE_SMALLER: WhyHardActionOption = { id: "make_smaller", label: "Make it smaller" };
const FIVE_MINUTE: WhyHardActionOption = { id: "five_minute", label: "5-minute version" };
const MOVE_IT: WhyHardActionOption = { id: "later", label: "Move it" };
const SKIP_TODAY: WhyHardActionOption = { id: "skip_today", label: "Skip today" };

/**
 * Friction reasons and supportive next steps.
 * Copy reduces pressure. It never diagnoses, never shames, and never adds extra reminders.
 */
export const WHY_HARD_REASONS: WhyHardReason[] = [
  {
    id: "tired",
    label: "Tired",
    message: "Days like this are allowed. A smaller version still counts.",
    actions: [MAKE_SMALLER, SKIP_TODAY]
  },
  {
    id: "hungry",
    label: "Hungry",
    message: "Eat something first if you can. This can wait.",
    actions: [MOVE_IT, FIVE_MINUTE]
  },
  {
    id: "stressed",
    label: "Stressed",
    message: "You do not have to do the whole thing. Shrink it or park it.",
    actions: [MAKE_SMALLER, SKIP_TODAY]
  },
  {
    id: "overwhelmed",
    label: "Overwhelmed",
    message: "Let's make it smaller. One tiny piece is enough.",
    actions: [MAKE_SMALLER]
  },
  {
    id: "in_pain",
    label: "In pain",
    message: "Rest is valid. Skip or do a tiny version — no penalty.",
    actions: [SKIP_TODAY, MAKE_SMALLER]
  },
  {
    id: "forgot",
    label: "Forgot",
    message: "That's human. Move it, or try it a little earlier next time.",
    actions: [MOVE_IT]
  },
  {
    id: "no_time",
    label: "No time",
    message: "A 5-minute version is still a real start.",
    actions: [FIVE_MINUTE, SKIP_TODAY]
  },
  {
    id: "missing_what_i_need",
    label: "Don't have what I need",
    message: "Note what you need, or move it until you have it.",
    actions: [MOVE_IT, MAKE_SMALLER]
  },
  {
    id: "not_feeling_well",
    label: "Not feeling well",
    message: "Looking after yourself comes first. Skip or shrink it.",
    actions: [SKIP_TODAY, MAKE_SMALLER]
  },
  {
    id: "struggling_to_start",
    label: "Struggling to start",
    message: "Starting is the hard part. Two minutes is a start.",
    actions: [MAKE_SMALLER, FIVE_MINUTE]
  },
  {
    id: "dont_want_to",
    label: "Don't want to",
    message: "You can skip, move, or make it tiny. None of those is failure.",
    actions: [SKIP_TODAY, MOVE_IT, MAKE_SMALLER]
  },
  {
    id: "something_else",
    label: "Something else",
    message: "Whatever is in the way, you can shrink it, move it, or skip today.",
    actions: [MAKE_SMALLER, MOVE_IT, SKIP_TODAY]
  }
];

export function getWhyHardReason(id: WhyHardReasonId): WhyHardReason | undefined {
  return WHY_HARD_REASONS.find((reason) => reason.id === id);
}

export function whyHardActionNotice(action: WhyHardAction): string {
  if (action === "five_minute") {
    return "Try a 5-minute version — a tiny step is just below.";
  }
  if (action === "make_smaller") {
    return "A tiny step is just below. That is enough.";
  }
  if (action === "skip_today") {
    return "Skipped for today. It will sit at 9:00 tomorrow.";
  }
  return "Moved to 9:00 tomorrow. No extra reminders added.";
}
