import { defineContentPack } from "../packFactory";

export const universityStarterPack = defineContentPack({
  meta: {
    id: "university-starter",
    version: "1.2.0",
    icon: "library-outline",
    category: "education",
    title: "University Starter",
    summary:
      "Enrolment, finance, laundry, halls life and coursework — settling in without overwhelm.",
    features: [
      "Enrolment",
      "Finance",
      "Laundry",
      "Coursework",
      "Halls / flat life",
      "Support contacts",
      "First-week plan",
      "Partner shop links"
    ],
    productId: "ready.pack.university_starter"
  },
  templates: [
    {
      id: "enrolment",
      title: "Enrolment / freshers checklist",
      type: "list",
      listItems: [
        { title: "Complete enrolment steps" },
        { title: "Collect student ID" },
        { title: "Join key platforms (email, VLE)" },
        { title: "Note support contacts" },
        { title: "Module registration checked" }
      ],
      dueInDays: 7,
      priority: "important"
    },
    {
      id: "first-week",
      title: "First-week calm plan",
      type: "list",
      notes: "Do what you can. Rest counts.",
      listItems: [
        { title: "Find campus landmarks" },
        { title: "Attend one welcome session (optional)" },
        { title: "Meet flat / corridor people (optional)" },
        { title: "Locate library / cafe" },
        { title: "Protect one rest evening" }
      ],
      dueInDays: 5,
      priority: "soon"
    },
    {
      id: "finance",
      title: "Student finance check",
      type: "reminder",
      notes: "Loan, bursary, rent, and weekly spending glance. Not financial advice.",
      dueInDays: 3,
      speakingReminderText: "A soft nudge to glance at student finance.",
      priority: "important"
    },
    {
      id: "budget-list",
      title: "Money glance list",
      type: "list",
      listItems: [
        { title: "Rent / halls payment noted" },
        { title: "Food budget idea" },
        { title: "Transport / books buffer" },
        { title: "Emergency contact for money questions" }
      ],
      priority: "soon"
    },
    {
      id: "laundry",
      title: "Laundry day",
      type: "reminder",
      notes: "Detergent, coins or card, and drying space.",
      repeatRule: { frequency: "weekly" },
      speakingReminderText: "Laundry reminder when it suits you.",
      priority: "not_urgent"
    },
    {
      id: "halls-life",
      title: "Halls / flat settling checklist",
      type: "list",
      listItems: [
        { title: "Keys / fob / access" },
        { title: "Bedding / towels" },
        { title: "Basic kitchen kit" },
        { title: "Quiet hours noted" },
        { title: "Fire / safety info found" }
      ],
      dueInDays: 4,
      priority: "soon"
    },
    {
      id: "coursework",
      title: "Coursework planning",
      type: "task",
      notes: "List modules and next deadlines. Start tiny.",
      dueInDays: 5,
      priority: "soon"
    },
    {
      id: "module-list",
      title: "Modules and deadlines",
      type: "list",
      listItems: [
        { title: "Module 1 — next deadline noted" },
        { title: "Module 2 — next deadline noted" },
        { title: "Reading list opened once" },
        { title: "Office hours / tutor contact saved" }
      ],
      priority: "soon"
    },
    {
      id: "support-contacts",
      title: "Support contacts",
      type: "list",
      notes: "University support is often free — organisational links only.",
      listItems: [
        { title: "Student services / wellbeing" },
        { title: "Disability / accessibility support if relevant" },
        { title: "Personal tutor / advisor" },
        { title: "Trusted person at home" }
      ],
      priority: "important"
    },
    {
      id: "homesickness-note",
      title: "Homesick or lonely? Soft plan",
      type: "list",
      notes: "Normal feelings. Seek university wellbeing if you need more support.",
      listItems: [
        { title: "Message someone trusted" },
        { title: "One small outing or society glance" },
        { title: "Rest without guilt" },
        { title: "Know where wellbeing support is" }
      ],
      priority: "not_urgent"
    },
    {
      id: "pack-shop",
      title: "Optional halls essentials shop",
      type: "list",
      notes:
        "Browse partner suppliers for bedding, laundry and desk kit. Affiliate links — we may earn a small commission if you buy, at no extra cost to you. Nothing required.",
      listItems: [
        { title: "Bedding" },
        { title: "Laundry bag" },
        { title: "Kettle / desk lamp" },
        { title: "Nothing right now" }
      ],
      priority: "not_urgent"
    }
  ],
  aiCoachPrompts: [
    "Help me settle my first university week without overwhelm.",
    "Suggest a calm enrolment checklist.",
    "Help me plan laundry and food for halls life simply."
  ],
  badges: [
    { id: "uni-settled", title: "Settling in", description: "You tackled the admin." },
    { id: "uni-first-week", title: "First week started", description: "Showing up counts." },
    { id: "uni-support", title: "Support noted", description: "You know where help is." }
  ],
  crewRecommendations: [
    { roleHint: "cheerleader", reason: "Home support while you settle." },
    { roleHint: "guardian", reason: "Someone for practical questions in week one." }
  ]
});
