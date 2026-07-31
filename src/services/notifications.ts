import * as Notifications from "expo-notifications";

import type { RepeatRule, TaskItem } from "../types/models";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export async function ensureNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelTaskReminderNotifications(taskId: string, knownIds: Array<string | undefined> = []) {
  const ids = new Set(knownIds.filter(Boolean) as string[]);

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const entry of scheduled) {
      const data = entry.content.data as { taskId?: string } | undefined;
      if (data?.taskId === taskId) {
        ids.add(entry.identifier);
      }
    }
  } catch {
    // Fall back to known ids only.
  }

  await Promise.all(
    [...ids].map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined))
  );
}

export async function scheduleTaskReminder(task: TaskItem) {
  await cancelTaskReminderNotifications(task.id);

  if (task.isCompleted) {
    return undefined;
  }

  const reminderDates = [
    task.reminderAt,
    task.remindForGift ? task.giftReminderAt : undefined,
    task.remindForCard ? task.cardReminderAt : undefined
  ].filter(Boolean) as string[];

  if (!reminderDates.length && !task.keepRemindingEvery15UntilDone) {
    return undefined;
  }

  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    return undefined;
  }

  const notificationIds = await Promise.all(
    reminderDates.flatMap((reminderAt) => {
      const reminderDate = new Date(reminderAt);
      if (Number.isNaN(reminderDate.getTime())) {
        return [Promise.resolve(undefined)];
      }
      const firstReminder = Notifications.scheduleNotificationAsync({
          content: {
            title: task.title,
            body: "Reminder for this item.",
            data: { taskId: task.id }
          },
          trigger: getTrigger(task.repeatRule, reminderDate)
        });
      const keepNudging = task.keepRemindingEvery15UntilDone
        ? Notifications.scheduleNotificationAsync({
            content: {
              title: task.title,
              body: "Repeating reminder every 15 minutes until marked done.",
              data: { taskId: task.id }
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 15 * 60,
              repeats: true
            }
          })
        : Promise.resolve(undefined);

      return [firstReminder, keepNudging];
    })
  );

  // If only keep-nudging is on and there was no date, still schedule the repeat.
  if (!reminderDates.length && task.keepRemindingEvery15UntilDone) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: task.title,
        body: "Repeating reminder every 15 minutes until marked done.",
        data: { taskId: task.id }
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 15 * 60,
        repeats: true
      }
    });
    return id;
  }

  return notificationIds.filter(Boolean)[0];
}

function getTrigger(repeatRule: RepeatRule, reminderDate: Date): Notifications.NotificationTriggerInput {
  const hour = reminderDate.getHours();
  const minute = reminderDate.getMinutes();

  if (repeatRule === "daily") {
    return { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute };
  }
  if (repeatRule === "weekly") {
    const weekday = reminderDate.getDay() + 1;
    return { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute };
  }
  if (repeatRule === "monthly") {
    return { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: reminderDate.getDate(), hour, minute };
  }
  if (repeatRule === "annual") {
    return {
      type: Notifications.SchedulableTriggerInputTypes.YEARLY,
      day: reminderDate.getDate(),
      month: reminderDate.getMonth() + 1,
      hour,
      minute
    };
  }
  return { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate };
}
