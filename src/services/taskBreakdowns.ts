export type BreakdownStep = {
  title: string;
  /** Suggested active minutes for this step (before the break). */
  minutes: number;
};

export type TaskBreakdownPlan = {
  id: string;
  label: string;
  keywords: string[];
  /** Soft total window in minutes (includes breaks). */
  totalMinutes: number;
  /** Short pause between steps. */
  breakMinutes: number;
  steps: BreakdownStep[];
  encouragement: string;
};

/**
 * Recommended gentle breakdowns for chores/tasks — small steps with breaks
 * so starting feels possible (e.g. ADHD-friendly kitchen clean).
 */
export const taskBreakdownPlans: TaskBreakdownPlan[] = [
  {
    id: "kitchen",
    label: "Clean the kitchen",
    keywords: ["kitchen", "clean kitchen", "tidy kitchen", "dishes", "washing up"],
    totalMinutes: 60,
    breakMinutes: 3,
    encouragement: "Five small steps with short rests. Skip or reorder anytime.",
    steps: [
      { title: "Wipe the sides", minutes: 8 },
      { title: "Clean the dishes", minutes: 12 },
      { title: "Put the dishes away", minutes: 8 },
      { title: "Clean the floor", minutes: 12 },
      { title: "Change the bin", minutes: 5 }
    ]
  },
  {
    id: "bathroom",
    label: "Clean the bathroom",
    keywords: ["bathroom", "toilet", "shower", "bath"],
    totalMinutes: 45,
    breakMinutes: 3,
    encouragement: "One surface at a time. Rests are part of the plan.",
    steps: [
      { title: "Clear surfaces", minutes: 5 },
      { title: "Wipe sink and taps", minutes: 8 },
      { title: "Clean toilet", minutes: 8 },
      { title: "Wipe shower / bath", minutes: 10 },
      { title: "Quick floor wipe", minutes: 6 }
    ]
  },
  {
    id: "bedroom",
    label: "Tidy the bedroom",
    keywords: ["bedroom", "tidy room", "make bed", "clothes floor"],
    totalMinutes: 40,
    breakMinutes: 3,
    encouragement: "Short passes only — good enough is enough.",
    steps: [
      { title: "Make the bed", minutes: 5 },
      { title: "Clothes into a basket", minutes: 8 },
      { title: "Clear one surface", minutes: 8 },
      { title: "Bin / recycling glance", minutes: 4 },
      { title: "Floor walk-through", minutes: 6 }
    ]
  },
  {
    id: "laundry",
    label: "Laundry",
    keywords: ["laundry", "washing", "washer", "dryer", "clothes wash"],
    totalMinutes: 35,
    breakMinutes: 4,
    encouragement: "Machine does most of the waiting. You do tiny handovers.",
    steps: [
      { title: "Gather a load", minutes: 5 },
      { title: "Start the wash", minutes: 5 },
      { title: "Move to dry / hang", minutes: 8 },
      { title: "Fold or hang away", minutes: 10 }
    ]
  },
  {
    id: "bins",
    label: "Bins & recycling",
    keywords: ["bin", "bins", "recycling", "rubbish", "trash"],
    totalMinutes: 20,
    breakMinutes: 2,
    encouragement: "Tiny jobs, one after another.",
    steps: [
      { title: "Collect indoor bags", minutes: 5 },
      { title: "Take out to outdoor bins", minutes: 5 },
      { title: "Replace liners", minutes: 4 },
      { title: "Wash hands / wipe handle", minutes: 2 }
    ]
  },
  {
    id: "desk",
    label: "Clear a desk / admin pile",
    keywords: ["desk", "paperwork", "admin pile", "clear desk", "mail"],
    totalMinutes: 30,
    breakMinutes: 3,
    encouragement: "One pile at a time. Rest between sorts.",
    steps: [
      { title: "Clear space to work", minutes: 4 },
      { title: "Sort keep / recycle / action", minutes: 10 },
      { title: "File or bag the keepers", minutes: 6 },
      { title: "Write the next tiny action", minutes: 4 }
    ]
  },
  {
    id: "generic-overwhelm",
    label: "Break any job into small steps",
    keywords: ["overwhelm", "too big", "dont know where", "don't know where", "stuck"],
    totalMinutes: 50,
    breakMinutes: 4,
    encouragement: "Start tiny. You can rename every step.",
    steps: [
      { title: "Name the job in one line", minutes: 3 },
      { title: "Gather what you need", minutes: 5 },
      { title: "Do the first 10-minute chunk", minutes: 10 },
      { title: "Short rest", minutes: 4 },
      { title: "Do the second chunk", minutes: 10 },
      { title: "Stop or one last tiny finish", minutes: 8 }
    ]
  }
];

export function findTaskBreakdowns(title: string, limit = 3): TaskBreakdownPlan[] {
  const query = title.trim().toLowerCase();
  if (!query) {
    return taskBreakdownPlans.filter((plan) => plan.id !== "generic-overwhelm").slice(0, limit);
  }

  const scored = taskBreakdownPlans
    .map((plan) => {
      const score = plan.keywords.reduce((total, keyword) => {
        if (query.includes(keyword) || keyword.includes(query)) {
          return total + keyword.length;
        }
        return total;
      }, 0);
      return { plan, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length) {
    return scored.slice(0, limit).map((row) => row.plan);
  }

  return [taskBreakdownPlans.find((plan) => plan.id === "generic-overwhelm")!].slice(0, limit);
}

export function formatBreakdownNotes(plan: TaskBreakdownPlan): string {
  const lines = [
    plan.encouragement,
    "",
    `Gentle plan (~${plan.totalMinutes} mins including ${plan.breakMinutes}-min breaks):`,
    ...plan.steps.map((step, index) => `${index + 1}. ${step.title} (~${step.minutes} mins)`),
    "",
    "After each step, take a short break. A reminder can nudge you to start the next one."
  ];
  return lines.join("\n");
}

export function buildBreakdownListItems(plan: TaskBreakdownPlan, now = Date.now()) {
  return plan.steps.map((step, index) => ({
    id: `step-${now}-${index}`,
    title: `${index + 1}. ${step.title}`,
    status: "open" as const
  }));
}

/**
 * Schedule start times for each step: active work + break before the next starts.
 * First step starts at `start`.
 */
export function buildStepReminderSchedule(plan: TaskBreakdownPlan, start = new Date()) {
  const schedule: Array<{ title: string; at: Date; speakingReminderText: string }> = [];
  let cursor = start.getTime();

  plan.steps.forEach((step, index) => {
    const at = new Date(cursor);
    schedule.push({
      title: `Next step: ${step.title}`,
      at,
      speakingReminderText:
        index === 0
          ? `When you are ready, start with ${step.title}.`
          : `Gentle nudge to start the next step: ${step.title}. A short break is fine first.`
    });
    cursor += (step.minutes + (index < plan.steps.length - 1 ? plan.breakMinutes : 0)) * 60_000;
  });

  return schedule;
}
