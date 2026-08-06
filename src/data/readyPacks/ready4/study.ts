import { ready4Pack } from "../packFactory";

export const ready4StudyPack = ready4Pack({
  slug: "study",
  name: "Study",
  icon: "school-outline",
  category: "education",
  summary:
    "Assignments, revision, exams and calm study routines — without shame around deadlines.",
  features: [
    "Assignment planner",
    "Revision planner",
    "Exam countdown",
    "Lecture prep",
    "Study routine",
    "Weekly reset"
  ],
  productId: "ready.pack.ready4_study",
  templates: [
    {
      id: "what-helps",
      title: "What would help today?",
      type: "list",
      notes: "Pick one. Missing a deadline does not mean you failed — edit and restart.",
      listItems: [
        { title: "Break one assignment into steps" },
        { title: "A short revision block" },
        { title: "Prep for class" },
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
      id: "study-routine",
      title: "Study routine block",
      type: "reminder",
      notes: "A short focus window. A break afterwards is part of the plan.",
      speakingReminderText: "Study time when you are ready.",
      priority: "soon"
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
