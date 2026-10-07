import * as Notifications from "expo-notifications";

import type { NudgeItem } from "../types/nudge";
import { loadAppPreferences } from "./appPreferencesStorage";
import { buildDailySummaryBody } from "./dailySummaryCopy";
import { loadNudgeItems } from "./nudgeItemsStorage";

const DAILY_SUMMARY_ID = "nudge-daily-summary";

export async function syncDailySummaryNotification(items?: NudgeItem[]) {
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

  const list = items ?? (await loadNudgeItems()).items;
  const body = buildDailySummaryBody(list);
  if (!body) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_SUMMARY_ID,
    content: {
      title: "Your day ahead",
      body,
      data: { role: "daily-summary" }
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0
    }
  });
}

export { buildDailySummaryBody, itemsDueToday } from "./dailySummaryCopy";
