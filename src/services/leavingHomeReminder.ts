import type { PlaceKind } from "./homeSettingsStorage";

export const LEAVING_HOME_REMINDER_DEBOUNCE_MS = 5 * 60 * 1000;

const lastReminderAtByKind: Partial<Record<PlaceKind, number>> = {};

/** Per-place debounce so leaving work does not block a home nudge (and vice versa). */
export function shouldPlayLeavingHomeReminder(kind: PlaceKind = "home") {
  const now = Date.now();
  const last = lastReminderAtByKind[kind] ?? 0;
  if (now - last < LEAVING_HOME_REMINDER_DEBOUNCE_MS) {
    return false;
  }
  lastReminderAtByKind[kind] = now;
  return true;
}

export function resetLeavingHomeReminderDebounce(kind?: PlaceKind) {
  if (kind) {
    delete lastReminderAtByKind[kind];
    return;
  }
  for (const key of Object.keys(lastReminderAtByKind) as PlaceKind[]) {
    delete lastReminderAtByKind[key];
  }
}
