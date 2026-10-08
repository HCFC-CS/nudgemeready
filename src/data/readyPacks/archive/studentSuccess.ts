import { defineContentPack } from "../packFactory";

export const studentSuccessPack = defineContentPack({
  meta: {
    id: "student-success",
    version: "1.2.0",
    icon: "school-outline",
    category: "education",
    title: "Student Success",
    summary:
      "Assignments, lectures, revision, exams and a gentle budget glance — without shame around deadlines.",
    features: [
      "Assignment tracker",
      "Lecture prep",
      "Revision blocks",
      "Exam day checklist",
      "Weekly budget",
      "Weekly reset",
      "Overwhelm timeout",
      "Partner shop links"
    ],
    productId: "ready.pack.student_success"
  },
  templates: [
    {
      id: "what-would-help",
      title: "What would help today?",
      type: "list",
      notes: "Pick one. Missing a deadline does not mean you failed — edit and restart.",
      listItems: [
        { title: "Break one assignment into steps" },
        { title: "A short revision block" },
        { title: "Prep for class" },
        { title: "Admin / form catch-up" },
        { title: "Rest — also valid" }
      ],
      priority: "soon"
    },
    {
      id: "assignment-tracker",
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
        { title: "Write one messy paragraph / outline" },
        { title: "Find one source" },
        { title: "Ask for help if stuck" },
        { title: "Submit when ready" }
      ],
      priority: "soon"
    },
    {
      id: "lecture-prep",
      title: "Lecture / class prep",
      type: "reminder",
      notes: "Bag, charger, reading glance. Skip what you do not need.",
      speakingReminderText: "Reminder to prep for class when you are ready.",
      priority: "soon"
    },
    {
      id: "lecture-checklist",
      title: "Class bag checklist",
      type: "list",
      listItems: [
        { title: "Notebook / laptop" },
        { title: "Charger" },
        { title: "Student ID" },
        { title: "Water / snack" },
        { title: "Reading open (optional)" }
      ],
      priority: "not_urgent"
    },
    {
      id: "revision-block",
      title: "Revision block",
      type: "reminder",
      notes: "Short session with a clear topic. Start tiny.",
      speakingReminderText: "Revision time when you are ready.",
      priority: "soon"
    },
    {
      id: "revision-plan",
      title: "Revision topic list",
      type: "list",
      listItems: [
        { title: "Topic 1" },
        { title: "Topic 2" },
        { title: "Practice question" },
        { title: "Break" }
      ],
      priority: "soon"
    },
    {
      id: "exam-countdown",
      title: "Exam day checklist",
      type: "list",
      listItems: [
        { title: "Confirm time and room" },
        { title: "Pack ID and stationery" },
        { title: "Plan travel" },
        { title: "Rest and water" },
        { title: "Phone on silent / left outside if required" }
      ],
      dueInDays: 3,
      priority: "important"
    },
    {
      id: "budget",
      title: "Weekly budget check",
      type: "reminder",
      notes: "Glance at spending and upcoming costs. No judgement.",
      repeatRule: { frequency: "weekly" },
      speakingReminderText: "A soft weekly budget glance.",
      priority: "not_urgent"
    },
    {
      id: "weekly-reset",
      title: "Sunday reset (or any day)",
      type: "list",
      notes: "One calm look at the week ahead.",
      listItems: [
        { title: "Note deadlines this week" },
        { title: "Note any classes to prep" },
        { title: "Plan one revision slot (optional)" },
        { title: "Rest / social time" }
      ],
      repeatRule: { frequency: "weekly" },
      priority: "soon"
    },
    {
      id: "overwhelm-timeout",
      title: "Timeout when overwhelmed",
      type: "reminder",
      notes: "Permission to pause. Come back to one tiny step later.",
      speakingReminderText: "Timeout. It is okay to pause your studies for a bit.",
      priority: "needs_attention"
    },
    {
      id: "pack-shop",
      title: "Optional study supplies shop",
      type: "list",
      notes:
        "Browse partner suppliers (Amazon, Argos, John Lewis). Affiliate links — we may earn a small commission if you buy, at no extra cost to you. Nothing required.",
      listItems: [
        { title: "Stationery / planner" },
        { title: "Headphones" },
        { title: "Desk lamp" },
        { title: "Nothing right now" }
      ],
      priority: "not_urgent"
    }
  ],
  aiCoachPrompts: [
    "Help me turn one assignment into three tiny steps.",
    "Suggest a calm exam-day checklist.",
    "Help me plan a short revision block without pressure."
  ],
  badges: [
    { id: "student-started", title: "Started studying", description: "Showing up for the work." },
    { id: "student-tiny-step", title: "Tiny step done", description: "Small progress counts." },
    { id: "student-reset", title: "Week glanced", description: "You looked ahead kindly." }
  ],
  crewRecommendations: [
    { roleHint: "cheerleader", reason: "Encouragement around deadlines without nagging." },
    { roleHint: "guardian", reason: "Someone who can check in on exam day." }
  ]
});
