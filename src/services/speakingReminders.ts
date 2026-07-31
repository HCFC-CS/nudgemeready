import * as Notifications from "expo-notifications";
import * as Speech from "expo-speech";

import { resolveItemCreator } from "./itemPermissions";
import type { NudgeItem } from "../types/nudge";

const TEN_MINUTES_SECONDS = 10 * 60;

export function getSpeakingReminderText(item: NudgeItem) {
  return item.speakingReminderText?.trim() || item.notes?.trim() || item.title;
}

export function hasSpeakingReminder(item: NudgeItem) {
  return Boolean(item.speakingReminderText?.trim() || item.voiceNoteUrl);
}

export function playSpeakingReminder(item: NudgeItem) {
  const text = getSpeakingReminderText(item);
  if (!text) {
    return;
  }
  Speech.stop();
  Speech.speak(text);
}

export async function cancelSpeakingReminderNotifications(item: NudgeItem) {
  const ids = new Set(item.reminderNotificationIds ?? []);

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const entry of scheduled) {
      const data = entry.content.data as { itemId?: string } | undefined;
      if (data?.itemId === item.id) {
        ids.add(entry.identifier);
      }
    }
  } catch {
    // Fall back to stored ids only.
  }

  await Promise.all(
    [...ids].map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined))
  );
}

export async function syncSpeakingReminderNotifications(item: NudgeItem): Promise<string[]> {
  await cancelSpeakingReminderNotifications(item);

  if (item.type !== "reminder" || item.status === "done" || item.status === "cancelled") {
    return [];
  }

  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    return [];
  }

  const speakingText = getSpeakingReminderText(item);
  const creator = resolveItemCreator(item);
  const ids: string[] = [];

  const reminderDate = item.reminderDate ? new Date(item.reminderDate) : undefined;
  const hasValidDate = reminderDate && !Number.isNaN(reminderDate.getTime());

  if (hasValidDate && reminderDate.getTime() > Date.now()) {
    ids.push(
      await Notifications.scheduleNotificationAsync({
        content: buildNudgeeNotificationContent(item, speakingText, "initial"),
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate }
      })
    );
  }

  if (item.nudgeEveryTenMinutesUntilDone) {
    ids.push(
      await Notifications.scheduleNotificationAsync({
        content: buildNudgeeNotificationContent(item, speakingText, "repeat"),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: TEN_MINUTES_SECONDS,
          repeats: true
        }
      })
    );
  }

  if (item.notifyNudgerIfNotDone) {
    ids.push(
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Still waiting",
          body: `${item.title} has not been marked done yet.`,
          data: {
            itemId: item.id,
            role: "nudger",
            nudgerId: creator.id,
            nudgerName: creator.name
          }
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: TEN_MINUTES_SECONDS,
          repeats: true
        }
      })
    );
  }

  return ids.filter(Boolean);
}

export function handleSpeakingReminderNotification(
  notification: Notifications.Notification,
  items: NudgeItem[],
  actorId: string
): NudgeItem | undefined {
  const data = notification.request.content.data as {
    itemId?: string;
    role?: "nudgee" | "nudger";
    speakText?: string;
    nudgerId?: string;
  };

  if (data.role === "nudger") {
    if (data.nudgerId && data.nudgerId !== actorId) {
      return undefined;
    }
    if (data.itemId) {
      return items.find((candidate) => candidate.id === data.itemId);
    }
    return undefined;
  }

  if (data.itemId) {
    const item = items.find((candidate) => candidate.id === data.itemId);
    if (item && (item.status === "done" || item.status === "cancelled")) {
      void cancelSpeakingReminderNotifications(item);
      return undefined;
    }
    if (item) {
      playSpeakingReminder(item);
      return item;
    }
  }

  const speakText = data.speakText ?? notification.request.content.body;
  if (speakText) {
    Speech.stop();
    Speech.speak(String(speakText));
  }
  return undefined;
}

function buildNudgeeNotificationContent(
  item: NudgeItem,
  speakingText: string,
  phase: "initial" | "repeat"
) {
  const title = phase === "initial" ? item.title : `Reminder: ${item.title}`;
  const body =
    speakingText ||
    (phase === "repeat"
      ? "This reminder repeats every 10 minutes until you mark it done."
      : "Your reminder is ready.");

  return {
    title,
    body,
    sound: true,
    data: {
      itemId: item.id,
      role: "nudgee",
      speakText: speakingText,
      phase
    }
  };
}

async function ensureNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}
