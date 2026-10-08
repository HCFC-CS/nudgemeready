import type { BudgetCategoryKind, BudgetFrequency, BudgetItemType, ParsedBudgetDraft } from "../types/budget";
import { parseMoneyToMinor } from "./budgetMoney";

const MONTH_NAMES: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11
};

function detectFrequency(text: string): { frequency: BudgetFrequency; customInterval: number | null } {
  const lower = text.toLowerCase();
  if (/\b(every\s+day|daily)\b/.test(lower)) {
    return { frequency: "custom", customInterval: null };
  }
  if (/\b(fortnight|every\s+2\s+weeks|bi-?weekly)\b/.test(lower)) {
    return { frequency: "fortnightly", customInterval: null };
  }
  if (/\b(every\s+4\s+weeks|four-?weekly)\b/.test(lower)) {
    return { frequency: "every_4_weeks", customInterval: null };
  }
  const weeks = lower.match(/\bevery\s+(\d+)\s+weeks?\b/);
  if (weeks) {
    return { frequency: "every_x_weeks", customInterval: Number(weeks[1]) };
  }
  const months = lower.match(/\bevery\s+(\d+)\s+months?\b/);
  if (months) {
    return { frequency: "every_x_months", customInterval: Number(months[1]) };
  }
  if (/\b(weekly|every\s+week)\b/.test(lower)) {
    return { frequency: "weekly", customInterval: null };
  }
  if (/\b(quarterly|every\s+3\s+months)\b/.test(lower)) {
    return { frequency: "quarterly", customInterval: null };
  }
  if (/\b(six[-\s]?monthly|every\s+6\s+months|twice\s+a\s+year)\b/.test(lower)) {
    return { frequency: "six_monthly", customInterval: null };
  }
  if (/\b(annual|annually|yearly|every\s+year|a\s+year)\b/.test(lower)) {
    return { frequency: "annually", customInterval: null };
  }
  if (/\b(month|monthly|a\s+month|per\s+month)\b/.test(lower)) {
    return { frequency: "monthly", customInterval: null };
  }
  if (/\b(once|one[-\s]?off|this\s+month|due)\b/.test(lower) && !/\bevery\b/.test(lower)) {
    return { frequency: "one_off", customInterval: null };
  }
  return { frequency: "monthly", customInterval: null };
}

function detectItemType(text: string): BudgetItemType {
  const lower = text.toLowerCase();
  if (/\b(salary|wage|wages|income|benefit|pension|paid|earn)\b/.test(lower)) {
    return "income";
  }
  if (/\b(save|saving|savings|put\s+aside|emergency\s+fund|holiday\s+fund)\b/.test(lower)) {
    return "saving";
  }
  return "expense";
}

function detectCategory(text: string, itemType: BudgetItemType): BudgetCategoryKind {
  const lower = text.toLowerCase();
  if (itemType === "income") {
    return "income";
  }
  if (itemType === "saving" || /\b(save|holiday|christmas|gift)\b/.test(lower)) {
    return "savings";
  }
  if (/\b(rent|mortgage|council\s+tax|gas|electric|water|home\s+insurance)\b/.test(lower)) {
    return "home";
  }
  if (/\b(grocer|food|takeaway|lunch|toiletr)\b/.test(lower)) {
    return "food";
  }
  if (/\b(car|fuel|petrol|diesel|mot|parking|taxi|train|bus|travel)\b/.test(lower)) {
    return "travel";
  }
  if (/\b(netflix|spotify|streaming|broadband|mobile|phone|subscription|membership)\b/.test(lower)) {
    return "bills";
  }
  if (/\b(gym|dentist|optician|prescription|medication|therapy)\b/.test(lower)) {
    return "health";
  }
  if (/\b(dog|cat|pet|vet|child|school|childcare)\b/.test(lower)) {
    return "family";
  }
  if (/\b(loan|credit\s+card|overdraft|bnpl|repay)\b/.test(lower)) {
    return "debt";
  }
  if (/\b(coffee|restaurant|hobby|clothes|cinema|social)\b/.test(lower)) {
    return "fun";
  }
  return "other";
}

function detectDueDate(text: string, now = new Date()): string | null {
  const lower = text.toLowerCase();
  const dayMonth = lower.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/);
  if (dayMonth) {
    const day = Number(dayMonth[1]);
    const month = MONTH_NAMES[dayMonth[2]];
    if (month != null && day >= 1 && day <= 31) {
      let year = now.getFullYear();
      const candidate = new Date(year, month, day);
      if (candidate.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
        year += 1;
      }
      return new Date(year, month, day).toISOString().slice(0, 10);
    }
  }
  const monthOnly = lower.match(/\bin\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/);
  if (monthOnly) {
    const month = MONTH_NAMES[monthOnly[1]];
    if (month != null) {
      let year = now.getFullYear();
      if (month < now.getMonth() || (month === now.getMonth() && now.getDate() > 15)) {
        year += 1;
      }
      return new Date(year, month, 1).toISOString().slice(0, 10);
    }
  }
  if (/\b(friday|monday|tuesday|wednesday|thursday|saturday|sunday)\b/.test(lower) && /\b(next|this|due)\b/.test(lower)) {
    return null;
  }
  return null;
}

function extractName(text: string): string {
  let name = text
    .replace(/£\s?[\d,]+(?:\.\d{1,2})?/gi, " ")
    .replace(/\b(every|each|a|per)\s+(week|fortnight|month|year|day)s?\b/gi, " ")
    .replace(/\bevery\s+\d+\s+(weeks?|months?)\b/gi, " ")
    .replace(/\b(weekly|monthly|annually|yearly|quarterly|fortnightly)\b/gi, " ")
    .replace(/\b(for|due|on|in|the|first|of)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!name) {
    name = text.trim().slice(0, 40) || "Something";
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Best-effort natural language parse for Quick Add.
 * Always returns a draft for the user to confirm — never silently commits.
 */
export function parseBudgetQuickAdd(raw: string, now = new Date()): ParsedBudgetDraft {
  const text = raw.trim();
  const amountMatch = text.match(/£\s?([\d,]+(?:\.\d{1,2})?)/) || text.match(/\b([\d,]+(?:\.\d{1,2})?)\s*(?:a|per|every|\/)/i);
  const amountMinor = amountMatch ? parseMoneyToMinor(amountMatch[1]) : parseMoneyToMinor(text);
  const { frequency, customInterval } = detectFrequency(text);
  const itemType = detectItemType(text);
  const suggestedCategoryKind = detectCategory(text, itemType);
  const dueDate = detectDueDate(text, now);
  const isSubscription = /\b(netflix|spotify|disney|subscription|streaming|membership)\b/i.test(text);

  return {
    name: extractName(text),
    amountMinor,
    itemType,
    frequency,
    customInterval,
    dueDate,
    suggestedCategoryKind,
    isSubscription,
    notes: null,
    raw: text
  };
}
