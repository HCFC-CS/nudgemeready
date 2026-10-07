import * as Notifications from "expo-notifications";
import { Alert, AppState } from "react-native";

import { ensureNotificationPermission } from "./notifications";
import { adjustDateForQuietHours, shouldAllowNotifications } from "./notificationPrefs";
import {
  buildPayLaterConfirmBody,
  buildPayLaterConfirmSpeech,
  buildPayLaterConfirmTitle,
  buildPayLaterNotificationBody,
  buildPayLaterNotificationTitle,
  buildPayLaterSpeechText,
  canArmPayLaterPlace,
  canPromptPayLaterPlace,
  getPayLaterPlace,
  PAY_LATER_REMINDER_HOURS,
  type PayLaterPlace,
  type PayLaterReminderHour
} from "./payLaterPlaces";
import {
  loadPayLaterSettings,
  markPayLaterPlaceArmed,
  markPayLaterPlaceDeclined,
  markPayLaterPlacePrompted
} from "./payLaterReminderStorage";

export { canArmPayLaterPlace, canPromptPayLaterPlace } from "./payLaterPlaces";

export const PAY_LATER_NOTIFICATION_ROLE = "pay-later";
export const PAY_LATER_CONFIRM_ROLE = "pay-later-confirm";
export const PAY_LATER_CONFIRM_CATEGORY = "pay-later-confirm";
export const PAY_LATER_ACTION_YES = "PAY_LATER_YES";
export const PAY_LATER_ACTION_NO = "PAY_LATER_NO";

function notificationIdFor(placeId: string, hours: PayLaterReminderHour) {
  return `pay-later:${placeId}:${hours}h`;
}

function confirmNotificationId(placeId: string) {
  return `pay-later-confirm:${placeId}`;
}

let confirmCategoryReady: Promise<void> | null = null;

export async function ensurePayLaterConfirmCategory() {
  if (!confirmCategoryReady) {
    confirmCategoryReady = Notifications.setNotificationCategoryAsync(PAY_LATER_CONFIRM_CATEGORY, [
      {
        identifier: PAY_LATER_ACTION_YES,
        buttonTitle: "Yes, remind me",
        options: { opensAppToForeground: true }
      },
      {
        identifier: PAY_LATER_ACTION_NO,
        buttonTitle: "No thanks",
        options: { opensAppToForeground: false }
      }
    ]).then(() => undefined);
  }
  await confirmCategoryReady;
}

export async function cancelPayLaterRemindersForPlace(placeId: string) {
  await Promise.all([
    ...PAY_LATER_REMINDER_HOURS.map((hours) =>
      Notifications.cancelScheduledNotificationAsync(notificationIdFor(placeId, hours)).catch(
        () => undefined
      )
    ),
    Notifications.cancelScheduledNotificationAsync(confirmNotificationId(placeId)).catch(() => undefined)
  ]);
}

export async function cancelAllPayLaterReminders() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((entry) => {
          const data = entry.content.data as { role?: string } | undefined;
          return (
            data?.role === PAY_LATER_NOTIFICATION_ROLE ||
            data?.role === PAY_LATER_CONFIRM_ROLE ||
            entry.identifier.startsWith("pay-later:")
          );
        })
        .map((entry) =>
          Notifications.cancelScheduledNotificationAsync(entry.identifier).catch(() => undefined)
        )
    );
  } catch {
    // Ignore — next arm will overwrite known ids.
  }
}

/**
 * GPS detected a possible visit/exit. Ask the user before any pay reminders.
 * Never schedules daily reminders for places they did not confirm using.
 */
export async function promptPayLaterVisitConfirm(
  place: PayLaterPlace,
  options?: { force?: boolean; detectedAt?: Date }
) {
  const settings = await loadPayLaterSettings();
  if (!settings.enabled) {
    return { prompted: false as const, reason: "disabled" as const };
  }

  const detectedAt = options?.detectedAt ?? new Date();
  if (
    !options?.force &&
    !canPromptPayLaterPlace(
      place.id,
      {
        lastArmedAtByPlaceId: settings.lastArmedAtByPlaceId,
        lastPromptedAtByPlaceId: settings.lastPromptedAtByPlaceId,
        lastDeclinedAtByPlaceId: settings.lastDeclinedAtByPlaceId,
        kind: place.kind
      },
      detectedAt.getTime()
    )
  ) {
    return { prompted: false as const, reason: "cooldown" as const };
  }

  const gate = await shouldAllowNotifications(detectedAt);
  if (!gate.prefs.pushNotifications) {
    return { prompted: false as const, reason: "push-off" as const };
  }

  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    return { prompted: false as const, reason: "no-permission" as const };
  }

  await markPayLaterPlacePrompted(place.id, detectedAt);
  await ensurePayLaterConfirmCategory();

  const title = buildPayLaterConfirmTitle(place);
  const body = buildPayLaterConfirmBody(place);
  const speakText = buildPayLaterConfirmSpeech(place);

  // Foreground: calm in-app ask so we do not rely only on the notification tray.
  if (AppState.currentState === "active") {
    Alert.alert(title, body, [
      {
        text: "No thanks",
        style: "cancel",
        onPress: () => {
          void declinePayLaterVisit(place.id);
        }
      },
      {
        text: "Yes, remind me",
        onPress: () => {
          void confirmPayLaterVisit(place.id);
        }
      }
    ]);
    return { prompted: true as const, reason: "alert" as const };
  }

  await Notifications.scheduleNotificationAsync({
    identifier: confirmNotificationId(place.id),
    content: {
      title,
      body,
      sound: true,
      categoryIdentifier: PAY_LATER_CONFIRM_CATEGORY,
      data: {
        role: PAY_LATER_CONFIRM_ROLE,
        placeId: place.id,
        payUrl: place.payUrl,
        speakText
      }
    },
    trigger: null
  });

  return { prompted: true as const, reason: "notification" as const };
}

/** User confirmed they used / visited the place — schedule 6h / 12h / 18h pay nudges. */
export async function confirmPayLaterVisit(placeId: string) {
  const place = getPayLaterPlace(placeId);
  if (!place) {
    return { armed: false as const, reason: "unknown-place" as const };
  }
  await Notifications.cancelScheduledNotificationAsync(confirmNotificationId(placeId)).catch(
    () => undefined
  );
  return armPayLaterRemindersForPlace(place, { force: true });
}

/** User said they did not use the place — no pay reminders. */
export async function declinePayLaterVisit(placeId: string) {
  await Notifications.cancelScheduledNotificationAsync(confirmNotificationId(placeId)).catch(
    () => undefined
  );
  await cancelPayLaterRemindersForPlace(placeId);
  await markPayLaterPlaceDeclined(placeId);
  return { declined: true as const };
}

/**
 * After the user confirms a visit at a known toll, zone, or drive-away car park,
 * schedule calm pay reminders at 6, 12 and 18 hours.
 */
export async function armPayLaterRemindersForPlace(
  place: PayLaterPlace,
  options?: { force?: boolean; detectedAt?: Date }
) {
  const settings = await loadPayLaterSettings();
  if (!settings.enabled) {
    return { armed: false as const, reason: "disabled" as const };
  }

  const detectedAt = options?.detectedAt ?? new Date();
  if (!options?.force && !canArmPayLaterPlace(place.id, settings.lastArmedAtByPlaceId, detectedAt.getTime())) {
    return { armed: false as const, reason: "cooldown" as const };
  }

  const gate = await shouldAllowNotifications(detectedAt);
  if (!gate.prefs.pushNotifications) {
    return { armed: false as const, reason: "push-off" as const };
  }

  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    return { armed: false as const, reason: "no-permission" as const };
  }

  await cancelPayLaterRemindersForPlace(place.id);

  const quiet = gate.prefs.quietHours;

  await Promise.all(
    PAY_LATER_REMINDER_HOURS.map(async (hours) => {
      const rawFireAt = new Date(detectedAt.getTime() + hours * 60 * 60 * 1000);
      const fireAt = adjustDateForQuietHours(rawFireAt, quiet);
      const speakText = buildPayLaterSpeechText(place, hours);
      await Notifications.scheduleNotificationAsync({
        identifier: notificationIdFor(place.id, hours),
        content: {
          title: buildPayLaterNotificationTitle(place),
          body: buildPayLaterNotificationBody(place, hours),
          sound: true,
          data: {
            role: PAY_LATER_NOTIFICATION_ROLE,
            placeId: place.id,
            hours,
            payUrl: place.payUrl,
            speakText
          }
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireAt
        }
      });
    })
  );

  await markPayLaterPlaceArmed(place.id, detectedAt);
  return { armed: true as const, reason: null };
}

export async function armPayLaterRemindersForPlaceId(placeId: string) {
  const place = getPayLaterPlace(placeId);
  if (!place) {
    return { armed: false as const, reason: "unknown-place" as const };
  }
  return armPayLaterRemindersForPlace(place);
}

export async function handlePayLaterConfirmResponse(actionIdentifier: string, placeId?: string) {
  if (!placeId) {
    return false;
  }
  if (actionIdentifier === PAY_LATER_ACTION_YES) {
    await confirmPayLaterVisit(placeId);
    return true;
  }
  if (actionIdentifier === PAY_LATER_ACTION_NO) {
    await declinePayLaterVisit(placeId);
    return true;
  }
  return false;
}
