import { ready4Pack } from "../packFactory";

export const ready4WorkPack = ready4Pack({
  slug: "work",
  name: "Work",
  icon: "briefcase-outline",
  category: "work",
  summary:
    "Top 3 priorities, meeting prep, follow-ups and breaks — structured workdays without overwhelm.",
  features: [
    "Daily planner",
    "Top 3 focus",
    "Meeting prep",
    "Project tracker",
    "Email follow-up",
    "Breaks"
  ],
  productId: "ready.pack.ready4_work",
  templates: [
    {
      id: "daily-planner",
      title: "Workday start",
      type: "routine",
      repeatRule: { frequency: "daily" },
      notes: "Glance at the calendar, then pick your Top 3. Skip what does not fit.",
      speakingReminderText: "A soft start for your workday.",
      listItems: [
        { title: "Open calendar" },
        { title: "Note any hard deadlines" },
        { title: "Pick Top 3" },
        { title: "One kind check-in with yourself" }
      ]
    },
    {
      id: "top-3",
      title: "Today's Top 3",
      type: "list",
      repeatRule: { frequency: "daily" },
      notes: "Only three. If everything feels urgent, pick the kindest useful three.",
      listItems: [
        { title: "Top 1 — (edit me)" },
        { title: "Top 2 — (edit me)" },
        { title: "Top 3 — (edit me)" }
      ]
    },
    {
      id: "meeting-prep",
      title: "Meeting prep checklist",
      type: "list",
      notes: "Agenda, links, follow-ups. Edit freely.",
      listItems: [
        { title: "Confirm time and link / place" },
        { title: "Notes or agenda ready" },
        { title: "Questions listed" },
        { title: "Follow-up owner noted" }
      ]
    },
    {
      id: "project-tracker",
      title: "Project milestones",
      type: "list",
      notes: "One project at a time is fine.",
      listItems: [
        { title: "Next milestone" },
        { title: "Blocked on? (edit)" },
        { title: "Who needs an update" },
        { title: "Review date noted" }
      ]
    },
    {
      id: "email-follow-up",
      title: "Follow-up actions",
      type: "list",
      notes: "Capture replies and actions before they fade.",
      listItems: [
        { title: "Reply owed" },
        { title: "Action from meeting" },
        { title: "Waiting on someone else" }
      ]
    },
    {
      id: "break-nudge",
      title: "Break & stretch",
      type: "reminder",
      notes: "Stand, stretch, drink water. A break is part of the plan.",
      speakingReminderText: "Time for a short break when you can."
    }
  ],
  aiCoachPrompts: [
    "Help me choose three priorities for today without pressure.",
    "Suggest a short meeting-prep checklist."
  ]
});
