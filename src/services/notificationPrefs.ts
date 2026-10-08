import { loadAppPreferences } from "./appPreferencesStorage";

/** Quiet hours: 21:00–07:00 local time when enabled. */
export function isInQuietHours(now = new Date(), quietHoursEnabled = true) {
  if (!quietHoursEnabled) {
    return false;
  }
  const hour = now.getHours();
  return hour >= 21 || hour < 7;
}

export async function shouldAllowNotifications(now = new Date()) {
  const prefs = await loadAppPreferences();
  if (!prefs.pushNotifications) {
    return { allow: false as const, reason: "push-off" as const, prefs };
  }
  if (isInQuietHours(now, prefs.quietHours)) {
    return { allow: false as const, reason: "quiet-hours" as const, prefs };
  }
  return { allow: true as const, reason: null, prefs };
}

/** Shift a reminder into the next allowed window (after quiet hours). */
export function adjustDateForQuietHours(date: Date, quietHoursEnabled: boolean) {
  if (!quietHoursEnabled || !isInQuietHours(date, true)) {
    return date;
  }
  const next = new Date(date);
  if (next.getHours() >= 21) {
    next.setDate(next.getDate() + 1);
  }
  next.setHours(7, 0, 0, 0);
  return next;
}
