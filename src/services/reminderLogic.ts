import type { NudgeItem, NudgeRepeatRule } from "../types/nudge";

export type ReminderType =
  | "one_off"
  | "repeating"
  | "linked_to_due_date"
  | "linked_to_appointment"
  | "linked_to_special_day"
  | "linked_to_routine";

export type ReminderOption =
  | "no_reminder"
  | "at_time"
  | "15_minutes_before"
  | "1_hour_before"
  | "1_day_before"
  | "1_week_before"
  | "1_month_before"
  | "2_weeks_before"
  | "tomorrow"
  | "next_week"
  | "custom";

export type ScheduledReminder = {
  id: string;
  itemId: string;
  itemTitle: string;
  type: ReminderType;
  option: ReminderOption;
  scheduledFor?: string;
  repeatRule?: NudgeRepeatRule;
  notificationId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ScheduleReminderInput = {
  item: NudgeItem;
  option: ReminderOption;
  type?: ReminderType;
  customDate?: string;
  repeatRule?: NudgeRepeatRule;
  notificationId?: string;
  now?: Date;
};

export const generalReminderOptions: ReminderOption[] = [
  "no_reminder",
  "at_time",
  "15_minutes_before",
  "1_hour_before",
  "1_day_before",
  "1_week_before",
  "custom"
];

export const specialDayReminderOptions: ReminderOption[] = [
  "1_month_before",
  "2_weeks_before",
  "1_week_before",
  "1_day_before"
];

export const appointmentReminderOptions: ReminderOption[] = ["1_day_before", "1_hour_before"];
export const taskReminderOptions: ReminderOption[] = ["tomorrow", "next_week", "custom"];

export function scheduleReminder(reminders: ScheduledReminder[], input: ScheduleReminderInput) {
  const now = input.now ?? new Date();
  const reminder = buildReminder(input, now);
  if (!reminder.scheduledFor && reminder.option !== "no_reminder") {
    return reminders;
  }
  return [...reminders.filter((existingReminder) => existingReminder.id !== reminder.id), reminder];
}

export function cancelReminder(reminders: ScheduledReminder[], reminderId: string) {
  return reminders.map((reminder) =>
    reminder.id === reminderId
      ? { ...reminder, isActive: false, updatedAt: new Date().toISOString() }
      : reminder
  );
}

export function updateReminder(
  reminders: ScheduledReminder[],
  reminderId: string,
  updates: Partial<Omit<ScheduledReminder, "id" | "createdAt">>
) {
  return reminders.map((reminder) =>
    reminder.id === reminderId
      ? {
          ...reminder,
          ...updates,
          id: reminder.id,
          createdAt: reminder.createdAt,
          updatedAt: new Date().toISOString()
        }
      : reminder
  );
}

export function getDueReminders(reminders: ScheduledReminder[], now = new Date()) {
  const nowTime = now.getTime();
  return reminders.filter((reminder) => {
    if (!reminder.isActive || !reminder.scheduledFor) {
      return false;
    }
    const reminderTime = new Date(reminder.scheduledFor).getTime();
    return !Number.isNaN(reminderTime) && reminderTime <= nowTime;
  });
}

export function getReminderTypeForItem(item: NudgeItem): ReminderType {
  if (item.type === "appointment") {
    return "linked_to_appointment";
  }
  if (item.type === "occasion" || item.type === "special_day") {
    return "linked_to_special_day";
  }
  if (item.type === "event") {
    return "one_off";
  }
  if (item.type === "routine") {
    return "linked_to_routine";
  }
  if (item.repeatRule && item.repeatRule.frequency !== "none") {
    return "repeating";
  }
  if (item.dueDate) {
    return "linked_to_due_date";
  }
  return "one_off";
}

export function getReminderOptionsForItem(item: NudgeItem): ReminderOption[] {
  if (item.type === "occasion" || item.type === "special_day" || item.type === "event") {
    return specialDayReminderOptions;
  }
  if (item.type === "appointment") {
    return appointmentReminderOptions;
  }
  if (item.type === "task" || item.type === "subtask") {
    return taskReminderOptions;
  }
  return generalReminderOptions;
}

function buildReminder(input: ScheduleReminderInput, now: Date): ScheduledReminder {
  const reminderType = input.type ?? getReminderTypeForItem(input.item);
  const timestamp = now.toISOString();
  return {
    id: `${input.item.id}:${input.option}`,
    itemId: input.item.id,
    itemTitle: input.item.title,
    type: reminderType,
    option: input.option,
    scheduledFor: getScheduledFor(input.item, input.option, input.customDate, now),
    repeatRule: input.repeatRule ?? input.item.repeatRule,
    notificationId: input.notificationId,
    isActive: input.option !== "no_reminder",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function getScheduledFor(item: NudgeItem, option: ReminderOption, customDate?: string, now = new Date()) {
  if (option === "no_reminder") {
    return undefined;
  }
  if (option === "custom") {
    return customDate;
  }
  if (option === "tomorrow") {
    return offsetFromDate(now, 1, "day");
  }
  if (option === "next_week") {
    return offsetFromDate(now, 7, "day");
  }

  const baseDate = getBaseDateForReminder(item);
  if (!baseDate) {
    return undefined;
  }
  if (option === "at_time") {
    return baseDate.toISOString();
  }
  if (option === "15_minutes_before") {
    return offsetFromDate(baseDate, -15, "minute");
  }
  if (option === "1_hour_before") {
    return offsetFromDate(baseDate, -1, "hour");
  }
  if (option === "1_day_before") {
    return offsetFromDate(baseDate, -1, "day");
  }
  if (option === "1_week_before") {
    return offsetFromDate(baseDate, -7, "day");
  }
  if (option === "2_weeks_before") {
    return offsetFromDate(baseDate, -14, "day");
  }
  if (option === "1_month_before") {
    return offsetFromDate(baseDate, -1, "month");
  }
  return undefined;
}

function getBaseDateForReminder(item: NudgeItem) {
  const value = item.startDate ?? item.dueDate ?? item.reminderDate ?? item.endDate;
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function offsetFromDate(date: Date, amount: number, unit: "minute" | "hour" | "day" | "month") {
  const nextDate = new Date(date);
  if (unit === "minute") {
    nextDate.setMinutes(nextDate.getMinutes() + amount);
  }
  if (unit === "hour") {
    nextDate.setHours(nextDate.getHours() + amount);
  }
  if (unit === "day") {
    nextDate.setDate(nextDate.getDate() + amount);
  }
  if (unit === "month") {
    nextDate.setMonth(nextDate.getMonth() + amount);
  }
  return nextDate.toISOString();
}
