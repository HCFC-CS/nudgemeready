import * as Notifications from "expo-notifications";

import { loadAppPreferences } from "./appPreferencesStorage";
import { adjustDateForQuietHours, shouldAllowNotifications } from "./notificationPrefs";

const DAILY_SUMMARY_ID = "nudge-daily-summary";

export async function syncDailySummaryNotification() {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_SUMMARY_ID);
  } catch {
    // Ignore if not scheduled.
  }

  const prefs = await loadAppPreferences();
  if (!prefs.pushNotifications || !prefs.dailySummary) {
    return;
  }

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_SUMMARY_ID,
    content: {
      title: "Your day ahead",
      body: "Open Nudge me Ready for a calm look at what’s waiting.",
      data: { role: "daily-summary" }
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: prefs.quietHours ? 8 : 8,
      minute: 0
    }
  });
}

export { adjustDateForQuietHours, shouldAllowNotifications };
