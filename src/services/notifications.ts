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

export async function scheduleTaskReminder(task: TaskItem) {
  const reminderDates = [
    task.reminderAt,
    task.remindForGift ? task.giftReminderAt : undefined,
    task.remindForCard ? task.cardReminderAt : undefined
  ].filter(Boolean) as string[];

  if (!reminderDates.length) {
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
        return [undefined];
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
        : undefined;

      return [firstReminder, keepNudging];
    })
  );

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
