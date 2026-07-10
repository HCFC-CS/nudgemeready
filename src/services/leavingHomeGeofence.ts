import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

import {
  buildLeavingHomeSpeechText,
  hasHomeCoordinates,
  loadHomeSettings,
  type HomeSettings
} from "./homeSettingsStorage";
import { shouldPlayLeavingHomeReminder } from "./leavingHomeReminder";

export const LEAVING_HOME_GEOFENCE_TASK = "leaving-home-geofence";

TaskManager.defineTask(LEAVING_HOME_GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    console.warn("Leaving-home geofence task error:", error.message);
    return;
  }

  const payload = data as { eventType?: Location.GeofencingEventType } | undefined;
  if (payload?.eventType !== Location.GeofencingEventType.Exit) {
    return;
  }

  const settings = await loadHomeSettings();
  if (!settings.enabled || !hasHomeCoordinates(settings)) {
    return;
  }

  if (!shouldPlayLeavingHomeReminder()) {
    return;
  }

  const speakText = buildLeavingHomeSpeechText(settings.checklistItems);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: settings.label.trim() || "Leaving home",
      body: speakText,
      sound: true,
      data: {
        role: "nudgee",
        speakText
      }
    },
    trigger: null
  });
});

export async function syncLeavingHomeGeofence(settings: HomeSettings) {
  const isRunning = await Location.hasStartedGeofencingAsync(LEAVING_HOME_GEOFENCE_TASK).catch(() => false);

  if (!settings.enabled || !hasHomeCoordinates(settings)) {
    if (isRunning) {
      await Location.stopGeofencingAsync(LEAVING_HOME_GEOFENCE_TASK);
    }
    return;
  }

  const background = await Location.getBackgroundPermissionsAsync();
  if (!background.granted) {
    if (isRunning) {
      await Location.stopGeofencingAsync(LEAVING_HOME_GEOFENCE_TASK);
    }
    return;
  }

  await Location.startGeofencingAsync(LEAVING_HOME_GEOFENCE_TASK, [
    {
      identifier: "home",
      latitude: settings.latitude!,
      longitude: settings.longitude!,
      radius: settings.thresholdMeters,
      notifyOnEnter: true,
      notifyOnExit: true
    }
  ]);
}
