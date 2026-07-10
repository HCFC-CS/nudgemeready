import type { NudgeItemType, NudgeRepeatRule } from "../types/nudge";

export type CaptureSuggestedFields = {
  dueDate?: string;
  startDate?: string;
  reminderDate?: string;
  repeatRule?: NudgeRepeatRule;
  listItems?: string[];
  contactName?: string;
  notes?: string;
};

export type CaptureClassification = {
  type: NudgeItemType;
  title: string;
  suggestedFields: CaptureSuggestedFields;
  confidence: number;
  extractedDate?: string;
  extractedTime?: string;
  repeatRule?: NudgeRepeatRule;
  suggestedReminder?: string;
};

const taskVerbs = ["book", "call", "pay", "send", "email", "buy", "renew", "chase"];
const chorePhrases = ["clean", "hoover", "vacuum", "laundry", "wash up", "take bins", "tidy", "mop", "chore", "bins out"];
const largeGoalPhrases = ["renovate kitchen", "move house", "plan holiday", "implement system"];

export function classifyCaptureText(input: string): CaptureClassification {
  const rawText = input.trim();
  const text = rawText.toLowerCase();
  const extractedDate = extractDate(text);
  const extractedTime = extractTime(text);
  const repeatRule = extractRepeatRule(text);
  const contactName = extractContactName(rawText);

  let type: NudgeItemType = "note";
  let confidence = 0.45;

  if (text.includes("remind me")) {
    type = "reminder";
    confidence = 0.92;
  } else if (largeGoalPhrases.some((phrase) => text.includes(phrase))) {
    type = "project";
    confidence = 0.9;
  } else if (chorePhrases.some((phrase) => text.includes(phrase))) {
    type = "chore";
    confidence = 0.87;
  } else if (repeatRule.frequency !== "none") {
    type = "routine";
    confidence = 0.88;
  } else if (text.includes("birthday") || text.includes("anniversary")) {
    type = "occasion";
    confidence = 0.9;
  } else if (
    text.includes("party") ||
    text.includes("concert") ||
    text.includes("wedding") ||
    text.includes("dinner") ||
    text.includes("event")
  ) {
    type = "event";
    confidence = 0.88;
  } else if (text.includes("list") || text.includes("shopping") || text.includes("packing")) {
    type = "list";
    confidence = 0.86;
  } else if (extractedDate && extractedTime) {
    type = "appointment";
    confidence = 0.86;
  } else if (taskVerbs.some((verb) => startsWithVerb(text, verb))) {
    type = "task";
    confidence = 0.82;
  } else if (extractedDate || extractedTime) {
    type = "reminder";
    confidence = 0.66;
  }

  const title = cleanTitle(rawText);
  const suggestedFields = buildSuggestedFields(type, {
    extractedDate,
    extractedTime,
    repeatRule,
    contactName,
    rawText
  });

  return {
    type,
    title,
    suggestedFields,
    confidence,
    extractedDate,
    extractedTime,
    repeatRule: repeatRule.frequency === "none" ? undefined : repeatRule,
    suggestedReminder: suggestedFields.reminderDate
  };
}

function buildSuggestedFields(
  type: NudgeItemType,
  context: {
    extractedDate?: string;
    extractedTime?: string;
    repeatRule: NudgeRepeatRule;
    contactName?: string;
    rawText: string;
  }
): CaptureSuggestedFields {
  const dateTime = combineDateAndTime(context.extractedDate, context.extractedTime);
  const suggestedFields: CaptureSuggestedFields = {
    notes: context.rawText
  };

  if (type === "appointment") {
    suggestedFields.startDate = dateTime;
    suggestedFields.reminderDate = dateTime;
  }
  if (type === "reminder") {
    suggestedFields.reminderDate = dateTime ?? context.extractedDate;
    suggestedFields.contactName = context.contactName;
  }
  if (type === "routine") {
    suggestedFields.repeatRule = context.repeatRule;
  }
  if (type === "occasion" || type === "special_day") {
    suggestedFields.dueDate = context.extractedDate;
    suggestedFields.repeatRule = { frequency: "yearly" };
  }
  if (type === "event") {
    suggestedFields.startDate = dateTime;
    suggestedFields.dueDate = context.extractedDate ?? dateTime;
  }
  if (type === "list") {
    suggestedFields.listItems = [];
  }
  return suggestedFields;
}

function startsWithVerb(text: string, verb: string) {
  return text === verb || text.startsWith(`${verb} `);
}

function cleanTitle(input: string) {
  const title = input
    .replace(/^remind me to\s+/i, "")
    .replace(/\bevery day\b/i, "")
    .replace(/\bevery morning\b/i, "")
    .replace(/\bweekly\b/i, "")
    .replace(/\bmonthly\b/i, "")
    .replace(/\btomorrow\b/i, "")
    .replace(/\btoday\b/i, "")
    .replace(/\b(tuesday|monday|wednesday|thursday|friday|saturday|sunday)\b/i, "")
    .replace(/\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const fallback = input.trim() || "Something for later";
  const resolvedTitle = title || fallback;
  return resolvedTitle.charAt(0).toUpperCase() + resolvedTitle.slice(1);
}

function extractDate(text: string) {
  const relativeMonth = text.match(/\bin\s+(\d+)\s+months?\b/);
  if (relativeMonth) {
    const date = new Date();
    date.setMonth(date.getMonth() + Number(relativeMonth[1]));
    return toIsoDate(date);
  }
  const relativeWeek = text.match(/\bin\s+(\d+)\s+weeks?\b/);
  if (relativeWeek) {
    const date = new Date();
    date.setDate(date.getDate() + Number(relativeWeek[1]) * 7);
    return toIsoDate(date);
  }
  if (text.includes("tomorrow")) {
    return offsetDate(1);
  }
  if (text.includes("today")) {
    return offsetDate(0);
  }
  const weekday = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].find((day) =>
    text.includes(day)
  );
  if (weekday) {
    return nextWeekdayDate(weekday);
  }
  const numericDate = text.match(/\b(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?\b/);
  if (numericDate) {
    const day = Number(numericDate[1]);
    const month = Number(numericDate[2]);
    const year = numericDate[3] ? normaliseYear(Number(numericDate[3])) : new Date().getFullYear();
    return toIsoDate(new Date(year, month - 1, day));
  }
  return undefined;
}

function extractTime(text: string) {
  const match = text.match(/\b(\d{1,2})(?::(\d{2}))?\s?(am|pm)\b/);
  if (!match) {
    return undefined;
  }
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  const meridiem = match[3];
  if (meridiem === "pm" && hour < 12) {
    hour += 12;
  }
  if (meridiem === "am" && hour === 12) {
    hour = 0;
  }
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function extractRepeatRule(text: string): NudgeRepeatRule {
  if (text.includes("every morning") || text.includes("every day")) {
    return { frequency: "daily", customText: text.includes("every morning") ? "Every morning" : undefined };
  }
  if (text.includes("weekly")) {
    return { frequency: "weekly" };
  }
  if (text.includes("monthly")) {
    return { frequency: "monthly" };
  }
  return { frequency: "none" };
}

function extractContactName(input: string) {
  const match = input.match(/\b(call|email|send|chase)\s+([A-Z][a-z]+)\b/);
  return match?.[2];
}

function combineDateAndTime(date?: string, time?: string) {
  if (!date && !time) {
    return undefined;
  }
  return `${date ?? offsetDate(0)}T${time ?? "09:00"}:00.000`;
}

function offsetDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

function nextWeekdayDate(weekday: string) {
  const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const target = weekdays.indexOf(weekday);
  const date = new Date();
  const current = date.getDay();
  const diff = (target - current + 7) % 7 || 7;
  date.setDate(date.getDate() + diff);
  return toIsoDate(date);
}

function normaliseYear(year: number) {
  return year < 100 ? 2000 + year : year;
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(
    2,
    "0"
  )}`;
}
