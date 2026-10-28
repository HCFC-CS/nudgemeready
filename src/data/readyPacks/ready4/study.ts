import { ready4Pack } from "../packFactory";

export const ready4StudyPack = ready4Pack({
  slug: "study",
  name: "Study",
  icon: "school-outline",
  category: "education",
  version: "1.1.0",
  summary:
    "Assignments, revision, exams and calm study routines — without shame around deadlines.",
  features: [
    "What would help today",
    "Assignment planner",
    "Revision planner",
    "Exam countdown",
    "Weekly budget glance",
    "I'm overwhelmed"
  ],
  productId: "ready.pack.ready4_study",
  templates: [
    {
      id: "what-helps",
      title: "What would help today?",
      type: "list",
      notes:
        "Pick one, then open that tool. Missing a deadline does not mean you failed — edit and restart.",
      listItems: [
        { title: "Break one assignment into steps" },
        { title: "A short revision block" },
        { title: "Prep for class" },
        { title: "Exam countdown" },
        { title: "Student budget glance" },
        { title: "I'm overwhelmed — one tiny step" },
        { title: "Admin / form catch-up" },
        { title: "Rest — also valid" }
      ]
    },
    {
      id: "assignment-planner",
      title: "Assignment due soon",
      type: "task",
      notes: "Break the work into smaller steps on this card. Edit the due date.",
      dueInDays: 7,
      priority: "important"
    },
    {
      id: "assignment-steps",
      title: "Assignment tiny steps",
      type: "list",
      listItems: [
        { title: "Open the brief" },
        { title: "Write one messy outline" },
        { title: "Find one source" },
        { title: "Ask for help if stuck" },
        { title: "Submit when ready" }
      ]
    },
    {
      id: "revision-planner",
      title: "Revision topic list",
      type: "list",
      notes: "Short sessions with a clear topic. Start tiny.",
      listItems: [
        { title: "Topic 1" },
        { title: "Topic 2" },
        { title: "Practice question" },
        { title: "Break" }
      ]
    },
    {
      id: "exam-countdown",
      title: "Exam day checklist",
      type: "list",
      dueInDays: 3,
      /** Same day as the exam you pick in the Study planner. */
      dueDaysBeforePlannerEvent: 0,
      priority: "important",
      listItems: [
        { title: "Confirm time and room" },
        { title: "Pack ID and stationery" },
        { title: "Plan travel" },
        { title: "Rest and water" },
        { title: "Phone on silent / left outside if required" }
      ]
    },
    {
      id: "exam-night-before",
      title: "Night before exam",
      type: "list",
      dueInDays: 1,
      /** Evening before the exam you pick in the Study planner. */
      dueDaysBeforePlannerEvent: 1,
      notes: "Gentle prep only — rest matters. Pick your exam in the planner to set this date.",
      listItems: [
        { title: "Bag ready by the door" },
        { title: "Alarm set (with buffer)" },
        { title: "Light review only if it helps" },
        { title: "Wind down / sleep when you can" }
      ]
    },
    {
      id: "lecture-prep",
      title: "Class bag checklist",
      type: "list",
      notes: "Bag, charger, reading glance. Skip what you do not need.",
      listItems: [
        { title: "Notebook / laptop" },
        { title: "Charger" },
        { title: "Student ID" },
        { title: "Water / snack" },
        { title: "Reading open (optional)" }
      ]
    },
    {
      id: "class-follow-up",
      title: "After class — anything to remember?",
      type: "note",
      notes: "One line is enough. Capture a date, task, or question while it is fresh."
    },
    {
      id: "study-routine",
      title: "Study routine block",
      type: "reminder",
      notes: "A short focus window. A break afterwards is part of the plan.",
      speakingReminderText: "Study time when you are ready.",
      priority: "soon"
    },
    {
      id: "weekly-budget",
      title: "Student money glance",
      type: "list",
      repeatRule: { frequency: "weekly" },
      notes: "A glance, not a lecture. Amounts optional — organisational only.",
      listItems: [
        { title: "Money in this week noted" },
        { title: "Must-pays noted" },
        { title: "Flexible spend comfort" },
        { title: "One money admin task (optional)" }
      ]
    },
    {
      id: "overwhelm",
      title: "I'm overwhelmed — one tiny step",
      type: "list",
      notes: "Shrink the day to one startable action. Everything else can wait.",
      listItems: [
        { title: "Name the one thing that matters most today" },
        { title: "Do the first 5–10 minutes only" },
        { title: "Take a short break" },
        { title: "Stop or continue — both are fine" }
      ]
    },
    {
      id: "weekly-reset",
      title: "Week ahead glance",
      type: "list",
      repeatRule: { frequency: "weekly" },
      notes: "One calm look at the week.",
      listItems: [
        { title: "Note deadlines this week" },
        { title: "Note classes to prep" },
        { title: "Plan one revision slot (optional)" },
        { title: "Rest / social time" }
      ]
    }
  ],
  aiCoachPrompts: [
    "Help me turn one assignment into three tiny steps.",
    "Suggest a calm exam-day checklist.",
    "Help me plan a short revision block without pressure."
  ]
});
