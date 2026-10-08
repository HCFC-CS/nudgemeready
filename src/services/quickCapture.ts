import type { NudgeItemType } from "../types/nudge";
import type { CaptureSuggestedFields } from "./classifyCaptureText";
import { formatWhenLabel } from "./reminderDates";

/**
 * A calm default “when” if the person did not pick a time.
 * Before evening → later today around 18:00 (or +2h if 18:00 is too soon).
 * Late evening → tomorrow morning.
 */
export function defaultWhenIso(now = new Date()): string {
  const later = new Date(now);
  later.setSeconds(0, 0);
  if (now.getHours() < 18) {
    later.setHours(18, 0, 0, 0);
    if (later.getTime() <= now.getTime() + 30 * 60 * 1000) {
      later.setHours(now.getHours() + 2, 0, 0, 0);
    }
  } else if (now.getHours() < 20) {
    later.setHours(now.getHours() + 2, 0, 0, 0);
    later.setMinutes(0, 0, 0);
  } else {
    later.setDate(later.getDate() + 1);
    later.setHours(9, 0, 0, 0);
  }
  return later.toISOString();
}

export function ensureFutureWhen(iso: string, now = new Date()): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) {
    return defaultWhenIso(now);
  }
  if (at.getTime() > now.getTime()) {
    return at.toISOString();
  }
  return defaultWhenIso(now);
}

function firstWhen(fields: CaptureSuggestedFields): string | undefined {
  return fields.reminderDate || fields.startDate || fields.dueDate;
}

/** Fill or repair a when so every captured nudge can land on Coming Up. */
export function applyDefaultWhen(
  fields: CaptureSuggestedFields,
  type: NudgeItemType,
  now = new Date()
): CaptureSuggestedFields {
  const existing = firstWhen(fields);
  const iso = existing ? ensureFutureWhen(existing, now) : defaultWhenIso(now);

  if (type === "appointment" || type === "event") {
    return {
      ...fields,
      startDate: fields.startDate ? ensureFutureWhen(fields.startDate, now) : iso,
      dueDate: fields.dueDate ? ensureFutureWhen(fields.dueDate, now) : iso,
      reminderDate: fields.reminderDate ? ensureFutureWhen(fields.reminderDate, now) : iso
    };
  }

  return {
    ...fields,
    reminderDate: fields.reminderDate ? ensureFutureWhen(fields.reminderDate, now) : iso,
    dueDate: fields.dueDate ? ensureFutureWhen(fields.dueDate, now) : type === "reminder" ? fields.dueDate : iso
  };
}

export function canQuickSave(title: string): boolean {
  return title.trim().length > 0;
}

export function formatNudgeWhen(iso?: string): string {
  if (!iso) {
    return "later today";
  }
  return formatWhenLabel(iso) || "later today";
}

export function whenIsoFromFields(fields: CaptureSuggestedFields): string | undefined {
  return firstWhen(fields);
}
