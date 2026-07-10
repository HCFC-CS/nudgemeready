export const LEAVING_HOME_REMINDER_DEBOUNCE_MS = 5 * 60 * 1000;

let lastReminderAt = 0;

export function shouldPlayLeavingHomeReminder() {
  const now = Date.now();
  if (now - lastReminderAt < LEAVING_HOME_REMINDER_DEBOUNCE_MS) {
    return false;
  }
  lastReminderAt = now;
  return true;
}

export function resetLeavingHomeReminderDebounce() {
  lastReminderAt = 0;
}
