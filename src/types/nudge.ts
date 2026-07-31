export type NudgeItemType =
  | "task"
  | "project"
  | "subtask"
  | "appointment"
  | "reminder"
  | "routine"
  | "chore"
  | "list"
  | "event"
  | "occasion"
  | "special_day"
  | "note";

export type NudgeItemStatus = "open" | "done" | "paused" | "waiting" | "cancelled";

export type NudgePriority = "not_urgent" | "soon" | "important" | "needs_attention";
export type NudgeEnergyLevel = "low" | "medium" | "high";
export type NudgeEstimatedEffort = "tiny" | "small" | "medium" | "large";

export type NudgeRepeatRule = {
  frequency: "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
  customText?: string;
};

export type NudgeLocation = {
  label?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

export type DocumentCategory =
  | "identity"
  | "driving"
  | "mobility"
  | "access"
  | "tax"
  | "insurance"
  | "medical"
  | "other";

export type NudgeAttachment = {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
  category?: DocumentCategory;
  label?: string;
  addedAt?: string;
};

export type EventPrepStep = {
  id: string;
  title: string;
  durationMinutes: number;
  status?: NudgeItemStatus;
};

export type NudgeListItem = {
  id: string;
  title: string;
  status: NudgeItemStatus;
};

export type ListShare = {
  membershipId: string;
  memberName: string;
  sharedAt: string;
  canEdit: boolean;
};

export type AppointmentGuest = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source: "email" | "contact";
};

export type NudgeCreatorType = "nudgee" | "supporter";

export type NudgeCreator = {
  type: NudgeCreatorType;
  id: string;
  name: string;
};

export interface NudgeItem {
  id: string;
  title: string;
  type: NudgeItemType;
  status: NudgeItemStatus;
  createdBy?: NudgeCreator;
  isLocked?: boolean;
  parentId?: string;
  children: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  reminderDate?: string;
  repeatRule?: NudgeRepeatRule;
  location?: NudgeLocation;
  contactId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  voiceNoteUrl?: string;
  speakingReminderText?: string;
  nudgeEveryTenMinutesUntilDone?: boolean;
  notifyNudgerIfNotDone?: boolean;
  reminderNotificationIds?: string[];
  attachments: NudgeAttachment[];
  priority?: NudgePriority;
  energyLevel?: NudgeEnergyLevel;
  estimatedEffort?: NudgeEstimatedEffort;
  listItems: NudgeListItem[];
  sharedWith?: ListShare[];
  progress: number;
  needsCard?: boolean;
  needsPresent?: boolean;
  cardReminderAt?: string;
  giftReminderAt?: string;
  homeLocation?: NudgeLocation;
  eventTravelMinutes?: number;
  eventReadyMinutes?: number;
  eventPrepSteps?: EventPrepStep[];
  guests?: AppointmentGuest[];
  syncToCalendar?: boolean;
  calendarId?: string;
  calendarEventId?: string;
}

export type NudgeItemInput = Partial<
  Omit<NudgeItem, "id" | "children" | "attachments" | "listItems" | "progress">
> & {
  title: string;
  type: NudgeItemType;
  id?: string;
  children?: string[];
  attachments?: NudgeAttachment[];
  listItems?: NudgeListItem[];
  progress?: number;
};

export type NudgeItemWithParent = NudgeItem & {
  parentProjectName?: string;
};
