import type { BudgetFrequency } from "../types/budget";

/** Parse £ strings / numbers into integer pence. Avoids float money math. */
export function parseMoneyToMinor(input: string | number | null | undefined): number | null {
  if (input == null) {
    return null;
  }
  if (typeof input === "number") {
    if (!Number.isFinite(input)) {
      return null;
    }
    return Math.round(input * 100);
  }
  const cleaned = input
    .trim()
    .replace(/£/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, "");
  if (!cleaned) {
    return null;
  }
  const match = cleaned.match(/^(-?\d+)(?:\.(\d{1,2}))?$/);
  if (!match) {
    const asFloat = Number(cleaned);
    if (!Number.isFinite(asFloat)) {
      return null;
    }
    return Math.round(asFloat * 100);
  }
  const pounds = Number(match[1]);
  const pencePart = (match[2] ?? "00").padEnd(2, "0").slice(0, 2);
  const pence = Number(pencePart);
  const sign = pounds < 0 || cleaned.startsWith("-") ? -1 : 1;
  return sign * (Math.abs(pounds) * 100 + pence);
}

export function formatMoneyMinor(minor: number, currency = "GBP"): string {
  const negative = minor < 0;
  const abs = Math.abs(minor);
  const pounds = Math.floor(abs / 100);
  const pence = abs % 100;
  const body = `${pounds.toLocaleString("en-GB")}.${String(pence).padStart(2, "0")}`;
  const prefix = currency === "GBP" ? "£" : "";
  return `${negative ? "-" : ""}${prefix}${body}`;
}

/**
 * Convert a recurring amount into a monthly equivalent (pence).
 * Keeps original frequency elsewhere — this is for the dashboard only.
 */
export function toMonthlyEquivalentMinor(
  amountMinor: number,
  frequency: BudgetFrequency,
  customInterval: number | null = null
): number {
  if (!Number.isFinite(amountMinor)) {
    return 0;
  }
  switch (frequency) {
    case "one_off":
      return 0;
    case "weekly":
      return Math.round((amountMinor * 52) / 12);
    case "fortnightly":
      return Math.round((amountMinor * 26) / 12);
    case "every_4_weeks":
      return Math.round((amountMinor * 13) / 12);
    case "monthly":
      return amountMinor;
    case "every_x_weeks": {
      const weeks = customInterval && customInterval > 0 ? customInterval : 1;
      return Math.round((amountMinor * (52 / weeks)) / 12);
    }
    case "every_x_months": {
      const months = customInterval && customInterval > 0 ? customInterval : 1;
      return Math.round(amountMinor / months);
    }
    case "quarterly":
      return Math.round(amountMinor / 3);
    case "six_monthly":
      return Math.round(amountMinor / 6);
    case "annually":
      return Math.round(amountMinor / 12);
    case "custom":
      return amountMinor;
    default:
      return amountMinor;
  }
}

export function frequencyLabel(frequency: BudgetFrequency, customInterval: number | null = null): string {
  switch (frequency) {
    case "one_off":
      return "One-off";
    case "weekly":
      return "Every week";
    case "fortnightly":
      return "Every fortnight";
    case "every_4_weeks":
      return "Every 4 weeks";
    case "monthly":
      return "Every month";
    case "every_x_weeks":
      return `Every ${customInterval ?? "?"} weeks`;
    case "every_x_months":
      return `Every ${customInterval ?? "?"} months`;
    case "quarterly":
      return "Every 3 months";
    case "six_monthly":
      return "Every 6 months";
    case "annually":
      return "Every year";
    case "custom":
      return "Custom";
    default:
      return "Monthly";
  }
}

export function annualEquivalentMinor(
  amountMinor: number,
  frequency: BudgetFrequency,
  customInterval: number | null = null
): number {
  return toMonthlyEquivalentMinor(amountMinor, frequency, customInterval) * 12;
}
