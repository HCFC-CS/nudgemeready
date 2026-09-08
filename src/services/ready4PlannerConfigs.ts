import type { Ready4PlannerConfig } from "../types/ready4Planner";

export const READY4_STUDY_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-study",
  title: "Study planner",
  shortLabel: "STUDY",
  supportsCalendar: true,
  supportsRewards: true,
  supportsCrew: true,
  supportsBudget: false,
  supportsDocuments: true,
  defaultViews: ["today", "week", "classes", "assignments", "revision", "milestones", "rewards"],
  plannerSections: [
    {
      id: "classes",
      title: "My classes",
      subtitle: "Timetable, rooms and what to bring",
      accent: "blue",
      suggestedItemTypes: ["class"],
      suggestedTitles: ["Biology", "Maths", "English", "Lecture"]
    },
    {
      id: "assignments",
      title: "Assignments",
      subtitle: "Essays, coursework and deadlines",
      accent: "taupe",
      suggestedItemTypes: ["assignment", "deadline"],
      suggestedTitles: ["Essay", "Coursework", "Presentation", "Group project"]
    },
    {
      id: "revision",
      title: "Revision",
      subtitle: "Short sessions — move or shorten anytime",
      accent: "blue",
      suggestedItemTypes: ["revision", "study"],
      suggestedTitles: ["Revision block", "Quiz practice", "Reading"]
    },
    {
      id: "milestones",
      title: "Milestones",
      subtitle: "Exams, deadlines and big steps — add a date so lists can link here",
      accent: "gold",
      suggestedItemTypes: ["deadline", "milestone"],
      suggestedTitles: ["Exam", "Exam week", "First assignment submitted", "Term reset"]
    },
    {
      id: "custom",
      title: "Something else",
      subtitle: "Placement, clubs, your wording",
      accent: "grey",
      suggestedItemTypes: ["custom", "task", "reminder"],
      suggestedTitles: []
    }
  ]
};

export const READY4_WORK_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-work",
  title: "Work planner",
  shortLabel: "WORK",
  supportsCalendar: true,
  supportsRewards: true,
  supportsCrew: true,
  supportsBudget: false,
  supportsDocuments: true,
  defaultViews: ["today", "week", "timeline", "milestones"],
  plannerSections: [
    {
      id: "week",
      title: "My week",
      subtitle: "Meetings, focus and follow-ups",
      accent: "blue",
      suggestedItemTypes: ["event", "task", "deadline"],
      suggestedTitles: ["Meeting", "Focus block", "Follow-up"]
    },
    {
      id: "projects",
      title: "Projects",
      accent: "taupe",
      suggestedItemTypes: ["task", "milestone", "deadline"],
      suggestedTitles: ["Project milestone", "Deadline"]
    },
    {
      id: "admin",
      title: "Work admin",
      accent: "grey",
      suggestedItemTypes: ["task", "reminder"],
      suggestedTitles: ["Expenses", "Timesheet", "Training"]
    }
  ]
};

export const READY4_HOME_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-home",
  title: "Home planner",
  shortLabel: "HOME",
  supportsCalendar: true,
  supportsRewards: true,
  supportsCrew: true,
  supportsBudget: true,
  supportsDocuments: false,
  defaultViews: ["today", "week", "checklist"],
  plannerSections: [
    {
      id: "this-week",
      title: "Home this week",
      accent: "taupe",
      suggestedItemTypes: ["task", "reminder"],
      suggestedTitles: ["Bins", "Laundry", "Cleaning", "Shopping"]
    },
    {
      id: "recurring",
      title: "Recurring",
      accent: "grey",
      suggestedItemTypes: ["reminder", "task"],
      suggestedTitles: ["Bin day", "Bedding", "Boiler service"]
    },
    {
      id: "projects",
      title: "Home projects",
      accent: "blue",
      suggestedItemTypes: ["task", "milestone"],
      suggestedTitles: ["Decorating", "Repairs", "Garden"]
    }
  ]
};

export const READY4_FINANCE_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-finance",
  title: "Finance planner",
  shortLabel: "MONEY",
  supportsCalendar: true,
  supportsRewards: false,
  supportsCrew: true,
  supportsBudget: true,
  supportsDocuments: true,
  defaultViews: ["today", "week", "budget", "calendar"],
  plannerSections: [
    {
      id: "this-month",
      title: "This month",
      accent: "taupe",
      suggestedItemTypes: ["payment", "reminder"],
      suggestedTitles: ["Bill", "Subscription", "Payday check"]
    },
    {
      id: "coming-up",
      title: "Coming up",
      accent: "gold",
      suggestedItemTypes: ["deadline", "payment"],
      suggestedTitles: ["Car insurance", "MOT", "Annual renewal"]
    }
  ]
};

export const READY4_APPOINTMENTS_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-appointments",
  title: "Appointments planner",
  shortLabel: "APPT",
  supportsCalendar: true,
  supportsRewards: false,
  supportsCrew: true,
  supportsBudget: false,
  supportsDocuments: true,
  defaultViews: ["today", "week", "calendar", "checklist"],
  plannerSections: [
    {
      id: "upcoming",
      title: "Upcoming",
      accent: "blue",
      suggestedItemTypes: ["appointment", "reminder"],
      suggestedTitles: ["Appointment", "Follow-up"]
    },
    {
      id: "prep",
      title: "Before / after",
      accent: "taupe",
      suggestedItemTypes: ["task", "reminder"],
      suggestedTitles: ["Things to bring", "Questions to ask", "Collect prescription"]
    }
  ]
};

export const READY4_MOVING_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-moving",
  title: "Moving planner",
  shortLabel: "MOVE",
  supportsCalendar: true,
  supportsRewards: true,
  supportsCrew: true,
  supportsBudget: true,
  supportsDocuments: true,
  defaultViews: ["timeline", "today", "week", "milestones", "budget"],
  plannerSections: [
    {
      id: "before",
      title: "Before move",
      accent: "blue",
      suggestedItemTypes: ["task", "deadline", "appointment"],
      suggestedTitles: ["Viewing", "Solicitor", "Packing"]
    },
    {
      id: "week",
      title: "Moving week",
      accent: "taupe",
      suggestedItemTypes: ["task", "event"],
      suggestedTitles: ["Keys", "Removals", "Meters"]
    },
    {
      id: "day",
      title: "Moving day",
      accent: "gold",
      suggestedItemTypes: ["task", "event", "milestone"],
      suggestedTitles: ["Essential bag", "Key collection"]
    },
    {
      id: "after",
      title: "After move",
      accent: "grey",
      suggestedItemTypes: ["task", "reminder"],
      suggestedTitles: ["Unpacking", "Council tax", "Utilities"]
    }
  ]
};

export const READY4_WEDDING_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-wedding",
  title: "Wedding planner",
  shortLabel: "WEDDING",
  supportsCalendar: true,
  supportsRewards: true,
  supportsCrew: true,
  supportsBudget: true,
  supportsDocuments: true,
  defaultViews: ["timeline", "milestones", "week", "budget", "crew"],
  plannerSections: [
    {
      id: "countdown",
      title: "Countdown",
      accent: "gold",
      suggestedItemTypes: ["milestone", "deadline"],
      suggestedTitles: ["Venue booked", "Invites sent"]
    },
    {
      id: "vendors",
      title: "Venue & people",
      accent: "blue",
      suggestedItemTypes: ["appointment", "task", "payment"],
      suggestedTitles: ["Venue", "Photography", "Catering"]
    },
    {
      id: "custom",
      title: "Something else",
      accent: "grey",
      suggestedItemTypes: ["custom", "task"],
      suggestedTitles: ["Dogs", "Hen / stag"]
    }
  ]
};

export const READY4_BABY_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-baby",
  title: "Baby planner",
  shortLabel: "BABY",
  supportsCalendar: true,
  supportsRewards: true,
  supportsCrew: true,
  supportsBudget: true,
  supportsDocuments: true,
  defaultViews: ["timeline", "week", "checklist", "milestones"],
  plannerSections: [
    {
      id: "prep",
      title: "Preparation",
      accent: "blue",
      suggestedItemTypes: ["appointment", "task"],
      suggestedTitles: ["Scan", "Classes", "Hospital bag"]
    },
    {
      id: "events",
      title: "Events",
      accent: "gold",
      suggestedItemTypes: ["event", "milestone"],
      suggestedTitles: ["Baby shower", "Sip & See"]
    },
    {
      id: "kit",
      title: "Baby prep",
      accent: "taupe",
      suggestedItemTypes: ["task", "custom"],
      suggestedTitles: ["Clothes", "Feeding", "Travel"]
    }
  ]
};

export const READY4_TRAVEL_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-travel",
  title: "Travel planner",
  shortLabel: "TRAVEL",
  supportsCalendar: true,
  supportsRewards: true,
  supportsCrew: true,
  supportsBudget: true,
  supportsDocuments: true,
  defaultViews: ["timeline", "checklist", "week", "budget"],
  plannerSections: [
    {
      id: "timeline",
      title: "Trip timeline",
      accent: "blue",
      suggestedItemTypes: ["deadline", "event", "payment"],
      suggestedTitles: ["Flights", "Check-in", "Insurance"]
    },
    {
      id: "days",
      title: "Daily itinerary",
      accent: "taupe",
      suggestedItemTypes: ["event", "custom"],
      suggestedTitles: ["Morning", "Afternoon", "Evening"]
    },
    {
      id: "packing",
      title: "Packing",
      accent: "grey",
      suggestedItemTypes: ["task", "reminder"],
      suggestedTitles: ["Packing list"]
    }
  ]
};

export const READY4_WELLBEING_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-wellbeing",
  title: "Wellbeing planner",
  shortLabel: "WELL",
  supportsCalendar: true,
  supportsRewards: true,
  supportsCrew: true,
  supportsBudget: false,
  supportsDocuments: false,
  defaultViews: ["today", "week", "rewards"],
  plannerSections: [
    {
      id: "week",
      title: "My week",
      accent: "blue",
      suggestedItemTypes: ["event", "task", "custom"],
      suggestedTitles: ["Walk", "Gym", "Quiet time", "Therapy"]
    }
  ]
};

export const READY4_FAMILY_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-family",
  title: "Family planner",
  shortLabel: "FAMILY",
  supportsCalendar: true,
  supportsRewards: false,
  supportsCrew: true,
  supportsBudget: true,
  supportsDocuments: false,
  defaultViews: ["today", "week", "calendar", "crew"],
  plannerSections: [
    {
      id: "calendar",
      title: "Family calendar",
      accent: "blue",
      suggestedItemTypes: ["event", "appointment", "reminder"],
      suggestedTitles: ["School", "Club", "Childcare", "Birthday"]
    }
  ]
};

export const READY4_SHOPPING_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-shopping",
  title: "Shopping planner",
  shortLabel: "SHOP",
  supportsCalendar: false,
  supportsRewards: false,
  supportsCrew: true,
  supportsBudget: true,
  supportsDocuments: false,
  defaultViews: ["checklist", "budget"],
  plannerSections: [
    {
      id: "lists",
      title: "Shopping",
      accent: "taupe",
      suggestedItemTypes: ["task", "payment", "custom"],
      suggestedTitles: ["Needed", "Gift", "Repeat buy"]
    }
  ]
};

export const READY4_MEDICATION_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-medication",
  title: "Medication planner",
  shortLabel: "MEDS",
  supportsCalendar: true,
  supportsRewards: false,
  supportsCrew: true,
  supportsBudget: false,
  supportsDocuments: true,
  defaultViews: ["today", "week", "checklist"],
  plannerSections: [
    {
      id: "today",
      title: "Today",
      accent: "blue",
      suggestedItemTypes: ["reminder", "appointment", "task"],
      suggestedTitles: ["Dose", "Collection", "Prescription"]
    }
  ]
};

export const READY4_INDEPENDENCE_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-independence",
  title: "Independence planner",
  shortLabel: "LIFE",
  supportsCalendar: true,
  supportsRewards: true,
  supportsCrew: true,
  supportsBudget: true,
  supportsDocuments: true,
  defaultViews: ["today", "week", "checklist", "crew"],
  plannerSections: [
    {
      id: "daily",
      title: "Daily & support",
      accent: "taupe",
      suggestedItemTypes: ["task", "appointment", "reminder", "custom"],
      suggestedTitles: ["Meals", "Travel", "Shopping", "Appointments"]
    }
  ]
};

export const READY4_PETS_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-pets",
  title: "Pets planner",
  shortLabel: "PETS",
  supportsCalendar: true,
  supportsRewards: true,
  supportsCrew: true,
  supportsBudget: true,
  supportsDocuments: true,
  defaultViews: ["today", "week", "checklist"],
  plannerSections: [
    {
      id: "care",
      title: "Daily care",
      subtitle: "Feeding, walks, and gentle routines",
      accent: "taupe",
      suggestedItemTypes: ["task", "reminder", "custom"],
      suggestedTitles: ["Feed", "Walk", "Medication"]
    },
    {
      id: "vet",
      title: "Vet & health",
      accent: "blue",
      suggestedItemTypes: ["appointment", "deadline", "reminder"],
      suggestedTitles: ["Vet", "Vaccination", "Grooming"]
    }
  ]
};

export const READY4_DIGITAL_LIFE_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-digital-life",
  title: "Digital Life planner",
  shortLabel: "DIGITAL",
  supportsCalendar: false,
  supportsRewards: false,
  supportsCrew: true,
  supportsBudget: true,
  supportsDocuments: true,
  defaultViews: ["checklist", "week"],
  plannerSections: [
    {
      id: "admin",
      title: "Digital admin",
      subtitle: "Passwords, updates, backups — one small step",
      accent: "grey",
      suggestedItemTypes: ["task", "reminder", "custom"],
      suggestedTitles: ["Password review", "Update", "Backup", "Subscription"]
    }
  ]
};

export const READY4_LIFE_ADMIN_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-life-admin",
  title: "Life Admin planner",
  shortLabel: "ADMIN",
  supportsCalendar: true,
  supportsRewards: false,
  supportsCrew: true,
  supportsBudget: false,
  supportsDocuments: true,
  defaultViews: ["week", "checklist", "timeline"],
  plannerSections: [
    {
      id: "renewals",
      title: "Renewals & paperwork",
      accent: "gold",
      suggestedItemTypes: ["deadline", "reminder", "document", "task"],
      suggestedTitles: ["Renewal", "Form", "Vehicle", "Insurance"]
    },
    {
      id: "household",
      title: "Household admin",
      accent: "taupe",
      suggestedItemTypes: ["task", "reminder", "custom"],
      suggestedTitles: ["Council", "Utilities", "Post"]
    }
  ]
};

export const READY4_EMERGENCIES_PLANNER: Ready4PlannerConfig = {
  packId: "ready4-emergencies",
  title: "Emergencies planner",
  shortLabel: "READY",
  supportsCalendar: false,
  supportsRewards: false,
  supportsCrew: true,
  supportsBudget: false,
  supportsDocuments: true,
  defaultViews: ["checklist", "documents", "crew"],
  plannerSections: [
    {
      id: "prep",
      title: "Preparation",
      subtitle: "Peace of mind — not panic",
      accent: "gold",
      suggestedItemTypes: ["task", "document", "reminder", "custom"],
      suggestedTitles: ["Contacts", "Grab bag", "Home plan", "Documents"]
    }
  ]
};

/** All pack planner registrations — only load when pack is installed. */
export const READY4_PLANNER_CONFIGS: Ready4PlannerConfig[] = [
  READY4_STUDY_PLANNER,
  READY4_WORK_PLANNER,
  READY4_HOME_PLANNER,
  READY4_FINANCE_PLANNER,
  READY4_APPOINTMENTS_PLANNER,
  READY4_MOVING_PLANNER,
  READY4_WEDDING_PLANNER,
  READY4_BABY_PLANNER,
  READY4_TRAVEL_PLANNER,
  READY4_WELLBEING_PLANNER,
  READY4_FAMILY_PLANNER,
  READY4_SHOPPING_PLANNER,
  READY4_MEDICATION_PLANNER,
  READY4_INDEPENDENCE_PLANNER,
  READY4_PETS_PLANNER,
  READY4_DIGITAL_LIFE_PLANNER,
  READY4_LIFE_ADMIN_PLANNER,
  READY4_EMERGENCIES_PLANNER
];

export function plannerConfigsForInstalledPacks(installedPackIds: string[]): Ready4PlannerConfig[] {
  const installed = new Set(installedPackIds);
  return READY4_PLANNER_CONFIGS.filter((config) => installed.has(config.packId));
}

export function getPlannerConfig(packId: string): Ready4PlannerConfig | undefined {
  return READY4_PLANNER_CONFIGS.find((config) => config.packId === packId);
}
