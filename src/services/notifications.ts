import * as Notifications from "expo-notifications";

import { shouldAllowNotifications } from "./notificationPrefs";

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      try {
        const gate = await shouldAllowNotifications();
        const allow = gate.allow;
        return {
          shouldShowAlert: allow,
          shouldShowBanner: allow,
          shouldShowList: allow,
          shouldPlaySound: allow,
          shouldSetBadge: false
        };
      } catch {
        return {
          shouldShowAlert: false,
          shouldShowBanner: false,
          shouldShowList: false,
          shouldPlaySound: false,
          shouldSetBadge: false
        };
      }
    }
  });
} catch {
  // Native notifications may be unavailable; splash must still load.
}

export async function ensureNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}
