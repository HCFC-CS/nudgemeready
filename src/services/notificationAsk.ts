import { ensureNotificationPermission } from "./notifications";
import { loadAppPreferences, saveAppPreferences } from "./appPreferencesStorage";

export async function shouldOfferGentleNudgeAsk(): Promise<boolean> {
  const prefs = await loadAppPreferences();
  return !prefs.pushNotifications && !prefs.notificationAskOffered;
}

export async function markGentleNudgeAskOffered(): Promise<void> {
  const prefs = await loadAppPreferences();
  await saveAppPreferences({ ...prefs, notificationAskOffered: true });
}

/** Turn on lock-screen nudges + a morning look at the day. Ask only once. */
export async function enableGentleNudges(): Promise<boolean> {
  const granted = await ensureNotificationPermission();
  const prefs = await loadAppPreferences();
  await saveAppPreferences({
    ...prefs,
    pushNotifications: granted,
    dailySummary: granted ? true : prefs.dailySummary,
    notificationAskOffered: true
  });
  return granted;
}
