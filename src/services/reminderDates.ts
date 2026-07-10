export type RemindBeforeOption = {
  id: string;
  label: string;
  minutes: number;
};

export const occasionRemindBeforeOptions: RemindBeforeOption[] = [
  { id: "month", label: "1 month before", minutes: 30 * 24 * 60 },
  { id: "two-weeks", label: "2 weeks before", minutes: 14 * 24 * 60 },
  { id: "week", label: "1 week before", minutes: 7 * 24 * 60 },
  { id: "day", label: "1 day before", minutes: 24 * 60 }
];

export function getReminderParts(reminderAt?: string) {
  if (!reminderAt) {
    return { date: "", time: "" };
  }
  const date = new Date(reminderAt);
  if (Number.isNaN(date.getTime())) {
    return { date: "", time: "" };
  }
  return {
    date: formatDateInput(date),
    time: formatTimeInput(date)
  };
}

export function getReminderAt(dateText: string, timeText: string) {
  if (!dateText.trim() || !timeText.trim()) {
    return undefined;
  }
  const dateParts = parseDateInput(dateText);
  if (!dateParts) {
    return undefined;
  }
  const { year, month, day } = dateParts;
  const [hour, minute] = timeText.split(":").map(Number);
  const reminderDate = new Date(year, month - 1, day, hour, minute, 0);
  if (Number.isNaN(reminderDate.getTime())) {
    return undefined;
  }
  return reminderDate.toISOString();
}

export function applyReminderOffset(
  baseDateText: string,
  baseTimeText: string,
  offsetMinutes: number,
  setDateText: (value: string) => void,
  setTimeText: (value: string) => void
) {
  const baseDate = getReminderAt(baseDateText, baseTimeText || "09:00");
  if (!baseDate) {
    return;
  }
  const nextDate = new Date(baseDate);
  nextDate.setMinutes(nextDate.getMinutes() - offsetMinutes);
  setDateText(formatDateInput(nextDate));
  setTimeText(formatTimeInput(nextDate));
}

export function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
}

export function formatTimeInput(date: Date) {
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function parseDateInput(dateText: string) {
  const parts = dateText.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return undefined;
  }
  const [first, second, third] = parts;
  if (first > 31) {
    return { year: first, month: second, day: third };
  }
  return { year: third, month: second, day: first };
}

export function getDateFromInput(dateText: string) {
  const dateParts = parseDateInput(dateText);
  if (!dateParts) {
    return undefined;
  }
  const date = new Date(dateParts.year, dateParts.month - 1, dateParts.day);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date;
}

export function getCalendarDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const mondayStartOffset = (firstDay.getDay() + 6) % 7;
  return [
    ...Array.from({ length: mondayStartOffset }, () => 0),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1)
  ];
}

export function formatMonthTitle(date: Date) {
  return date.toLocaleString("en-GB", { month: "long", year: "numeric" });
}

export function isSameSelectedDay(day: number, visibleMonth: Date, selectedDate?: Date) {
  return (
    selectedDate?.getFullYear() === visibleMonth.getFullYear() &&
    selectedDate?.getMonth() === visibleMonth.getMonth() &&
    selectedDate?.getDate() === day
  );
}
