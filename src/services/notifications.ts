import * as Notifications from "expo-notifications";

import { shouldAllowNotifications } from "./notificationPrefs";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    const gate = await shouldAllowNotifications();
    const allow = gate.allow;
    return {
      shouldShowAlert: allow,
      shouldShowBanner: allow,
      shouldShowList: allow,
      shouldPlaySound: allow,
      shouldSetBadge: false
    };
  }
});

export async function ensureNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}
