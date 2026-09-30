import { loadExpoNotifications } from "./expoNotifications";
import { shouldAllowNotifications } from "./notificationPrefs";

let handlerInstalled = false;

function quietBehavior() {
  return {
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false
  };
}

/**
 * Install after splash has painted. Importing expo-notifications during JS
 * startup can throw a native exception on iOS 26 and kill Hermes.
 */
export function installNotificationHandler() {
  if (handlerInstalled) {
    return;
  }
  handlerInstalled = true;
  void loadExpoNotifications()
    .then((Notifications) => {
      Notifications.setNotificationHandler({
        handleNotification: async () => {
          try {
            const gate = await shouldAllowNotifications();
            const allow = gate.allow;
            return {
              shouldShowBanner: allow,
              shouldShowList: allow,
              shouldPlaySound: allow,
              shouldSetBadge: false
            };
          } catch {
            return quietBehavior();
          }
        }
      });
    })
    .catch(() => {
      handlerInstalled = false;
    });
}

export async function ensureNotificationPermission() {
  const Notifications = await loadExpoNotifications();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}
