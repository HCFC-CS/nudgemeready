export type RepeatRule = "none" | "daily" | "weekly" | "monthly" | "annual" | "custom";
export type EncouragementStyle = "calm" | "cheerleader" | "funny" | "straightforward";
export type TrustedRole = "viewer" | "contributor" | "cheerleader" | "coach";
export type VillageMemberType =
  | "family"
  | "friends"
  | "healthcare"
  | "carer"
  | "socialServices"
  | "school"
  | "church";
export type RequestStatus = "pending" | "accepted" | "declined" | "later";
export type TaskClassification =
  | "home"
  | "health"
  | "school"
  | "work"
  | "clubs";
export type TaskType =
  | "taskJob"
  | "project"
  | "reminder"
  | "appointment"
  | "event"
  | "list"
  | "alert"
  | "occasion"
  | "chore";
export type CardDeliveryMethod = "post" | "person";
export type CalendarSyncMode = "off" | "appointments" | "reminders" | "all";

export interface TaskItem {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string;
  reminderAt?: string;
  keepRemindingEvery15UntilDone?: boolean;
  customRepeatRule?: string;
  appointmentAt?: string;
  occasionName?: string;
  occasionDate?: string;
  remindForGift?: boolean;
  giftReminderAt?: string;
  remindForCard?: boolean;
  cardReminderAt?: string;
  cardDeliveryMethod?: CardDeliveryMethod;
  cardPosted?: boolean;
  classification: TaskClassification;
  taskType: TaskType;
  listItems?: string[];
  syncToCalendar?: boolean;
  durationMinutes: number;
  usesTaskBuddy: boolean;
  workMinutes: number;
  breakMinutes: number;
  repeatRule: RepeatRule;
  encouragementStyle: EncouragementStyle;
  isCompleted: boolean;
  createdAt: string;
}

export interface TrustedPerson {
  id: string;
  name: string;
  memberType: VillageMemberType;
  roles: TrustedRole[];
  role?: TrustedRole;
  contact?: string;
}

export interface ReminderRequest {
  id: string;
  fromName: string;
  title: string;
  suggestedTime?: string;
  repeatRule: RepeatRule;
  message?: string;
  status: RequestStatus;
}
