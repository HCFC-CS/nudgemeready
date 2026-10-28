/** Ready4 Planner — specialist planners over shared engines (nudges, calendar, rewards). */

export type PlannerViewId =
  | "today"
  | "week"
  | "calendar"
  | "timeline"
  | "checklist"
  | "milestones"
  | "budget"
  | "documents"
  | "crew"
  | "rewards"
  | "classes"
  | "assignments"
  | "revision";

export type PlannerItemType =
  | "task"
  | "event"
  | "deadline"
  | "milestone"
  | "study"
  | "class"
  | "assignment"
  | "revision"
  | "appointment"
  | "payment"
  | "document"
  | "reminder"
  | "custom";

export type PlannerItemStatus = "planned" | "in_progress" | "done" | "moved" | "not_needed";

export type PlannerPriority = "low" | "normal" | "important";

export type PlannerSectionId = string;

export type PlannerSection = {
  id: PlannerSectionId;
  title: string;
  subtitle?: string;
  /** Soft accent within brand palette */
  accent: "blue" | "taupe" | "gold" | "grey";
  suggestedItemTypes: PlannerItemType[];
  suggestedTitles?: string[];
};

export type Ready4PlannerConfig = {
  packId: string;
  title: string;
  shortLabel: string;
  plannerSections: PlannerSection[];
  supportsCalendar: boolean;
  supportsRewards: boolean;
  supportsCrew: boolean;
  supportsBudget: boolean;
  supportsDocuments: boolean;
  defaultViews: PlannerViewId[];
};

export type PlannerItem = {
  id: string;
  ready4PackId: string;
  sectionId: PlannerSectionId | null;
  type: PlannerItemType;
  title: string;
  description?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  dueAt?: string | null;
  durationMinutes?: number | null;
  recurring?: boolean;
  recurrenceLabel?: string | null;
  subject?: string | null;
  bringList?: string[];
  status: PlannerItemStatus;
  priority: PlannerPriority;
  notes?: string | null;
  calendarEventId?: string | null;
  nudgeItemId?: string | null;
  rewardNote?: string | null;
  budgetItemId?: string | null;
  crewMemberIds?: string[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlannerState = {
  version: 1;
  items: PlannerItem[];
  /** Soft dismissals e.g. tip ids */
  dismissedTips: string[];
  createdAt: string;
  updatedAt: string;
};

export type PlannerDayGroup = {
  dateKey: string;
  label: string;
  items: PlannerItem[];
};
