import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

import {
  buildLeavingPlaceSpeechText,
  getReminderPlaces,
  hasReminderPlaces,
  loadHomeSettings,
  PLACE_KINDS,
  PLACE_LABELS,
  type HomeSettings,
  type PlaceKind
} from "./homeSettingsStorage";
import { shouldPlayLeavingHomeReminder } from "./leavingHomeReminder";

export const LEAVING_HOME_GEOFENCE_TASK = "leaving-home-geofence";

function isPlaceKind(value: string | undefined): value is PlaceKind {
  return Boolean(value && PLACE_KINDS.includes(value as PlaceKind));
}

TaskManager.defineTask(LEAVING_HOME_GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    console.warn("Leaving-place geofence task error:", error.message);
    return;
  }

  const payload = data as {
    eventType?: Location.GeofencingEventType;
    region?: { identifier?: string };
  } | undefined;

  if (payload?.eventType !== Location.GeofencingEventType.Exit) {
    return;
  }

  const settings = await loadHomeSettings();
  if (!settings.enabled || !hasReminderPlaces(settings)) {
    return;
  }

  const identifier = payload.region?.identifier;
  const kind = isPlaceKind(identifier) ? identifier : "home";
  const place = settings.places[kind];
  if (!place.reminderEnabled) {
    return;
  }

  if (!shouldPlayLeavingHomeReminder()) {
    return;
  }

  const { shouldAllowNotifications } = await import("./notificationPrefs");
  const gate = await shouldAllowNotifications();
  if (!gate.allow) {
    return;
  }

  const speakText = buildLeavingPlaceSpeechText(kind, settings.checklistItems);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Leaving ${PLACE_LABELS[kind]}`,
      body: speakText,
      sound: true,
      data: {
        role: "nudgee",
        speakText,
        placeKind: kind
      }
    },
    trigger: null
  });
});

export async function syncLeavingHomeGeofence(settings: HomeSettings) {
  const isRunning = await Location.hasStartedGeofencingAsync(LEAVING_HOME_GEOFENCE_TASK).catch(() => false);
  const regions = getReminderPlaces(settings).map((place) => ({
    identifier: place.kind,
    latitude: place.latitude!,
    longitude: place.longitude!,
    radius: settings.thresholdMeters,
    notifyOnEnter: true,
    notifyOnExit: true
  }));

  if (!settings.enabled || regions.length === 0) {
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

  await Location.startGeofencingAsync(LEAVING_HOME_GEOFENCE_TASK, regions);
}
