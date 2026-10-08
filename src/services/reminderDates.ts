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
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return undefined;
  }
  const reminderDate = makeLocalDate(year, month - 1, day, hour, minute);
  if (!reminderDate) {
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

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function hasExplicitTime(value?: string) {
  if (!value) {
    return false;
  }
  return /T\d{1,2}:\d{2}/.test(value) || /\bat\s+\d{1,2}:\d{2}/i.test(value) || /^\d{1,2}:\d{2}$/.test(value.trim());
}

function parseFlexibleDate(value?: string) {
  if (!value?.trim()) {
    return undefined;
  }
  const trimmed = value.trim();
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(trimmed) || /^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
    const fromInput = getDateFromInput(trimmed);
    if (fromInput) {
      return fromInput;
    }
  }
  const atMatch = trimmed.match(/^(.+?)\s+at\s+(\d{1,2}:\d{2})$/i);
  if (atMatch) {
    const datePart = getDateFromInput(atMatch[1]) ?? new Date(atMatch[1]);
    if (!Number.isNaN(datePart.getTime())) {
      const [hour, minute] = atMatch[2].split(":").map(Number);
      return new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), hour, minute, 0);
    }
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed;
}

/** Display date: 21 Jul 2026 */
export function formatDisplayDate(value?: string) {
  const date = parseFlexibleDate(value);
  if (!date) {
    return value?.trim() || "";
  }
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

/** Compact date: 21 Jul */
export function formatDisplayDateShort(value?: string) {
  const date = parseFlexibleDate(value);
  if (!date) {
    return value?.trim() || "";
  }
  return `${date.getDate()} ${monthNames[date.getMonth()]}`;
}

/** Display time: 09:00 */
export function formatDisplayTime(value?: string) {
  if (!value?.trim()) {
    return "";
  }
  const pureTime = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (pureTime) {
    return `${pureTime[1].padStart(2, "0")}:${pureTime[2]}`;
  }
  const date = parseFlexibleDate(value);
  if (!date || !hasExplicitTime(value)) {
    return "";
  }
  return formatTimeInput(date);
}

/** Date + time: 21 Jul 2026 · 09:00 */
export function formatDisplayDateTime(value?: string) {
  const date = parseFlexibleDate(value);
  if (!date) {
    return value?.trim() || "";
  }
  const time = formatDisplayTime(value);
  return time ? `${formatDisplayDate(value)} · ${time}` : formatDisplayDate(value);
}

/** Friendly when label for lists: Today · 09:00 / 21 Jul · 09:00 */
export function formatWhenLabel(value?: string) {
  const date = parseFlexibleDate(value);
  if (!date) {
    return value?.trim() || "";
  }
  const time = formatDisplayTime(value);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfDay.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) {
    return time ? `Today · ${time}` : "Today";
  }
  if (diffDays === 1) {
    return time ? `Tomorrow · ${time}` : "Tomorrow";
  }
  if (diffDays === -1) {
    return time ? `Yesterday · ${time}` : "Yesterday";
  }
  return time ? `${formatDisplayDateShort(value)} · ${time}` : formatDisplayDateShort(value);
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
  return makeLocalDate(dateParts.year, dateParts.month - 1, dateParts.day);
}

export function getCalendarDays(monthDate: Date): Array<number | null> {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // JS getDay(): 0=Sun … 6=Sat. Convert so Monday is the first column.
  const mondayStartOffset = (firstDay.getDay() + 6) % 7;
  const cells: Array<number | null> = [
    ...Array.from({ length: mondayStartOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1)
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
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

export function isCalendarToday(day: number, visibleMonth: Date, today = new Date()) {
  return (
    today.getFullYear() === visibleMonth.getFullYear() &&
    today.getMonth() === visibleMonth.getMonth() &&
    today.getDate() === day
  );
}

/** Build a local calendar date and reject rollover (e.g. 31 Feb). */
export function makeLocalDate(year: number, monthIndex: number, day: number, hour = 0, minute = 0) {
  const date = new Date(year, monthIndex, day, hour, minute, 0, 0);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}
