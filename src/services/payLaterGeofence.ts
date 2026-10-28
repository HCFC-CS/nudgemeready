import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import {
  getPayLaterPlace,
  geofenceRegionsForPayLater,
  selectPayLaterPlacesForGeofence
} from "./payLaterPlaces";
import { loadPayLaterSettings } from "./payLaterReminderStorage";
import { promptPayLaterVisitConfirm } from "./payLaterReminders";

export const PAY_LATER_GEOFENCE_TASK = "pay-later-geofence";

TaskManager.defineTask(PAY_LATER_GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    console.warn("Pay-later geofence task error:", error.message);
    return;
  }

  const payload = data as {
    eventType?: Location.GeofencingEventType;
    region?: { identifier?: string };
  } | undefined;

  // Ask on exit — GPS thinks they left a toll, parking, or charge-zone sample area.
  // Pay reminders only arm after the user confirms they used / visited it.
  if (payload?.eventType !== Location.GeofencingEventType.Exit) {
    return;
  }

  const settings = await loadPayLaterSettings();
  if (!settings.enabled) {
    return;
  }

  const placeId = payload.region?.identifier;
  if (!placeId) {
    return;
  }

  const place = getPayLaterPlace(placeId);
  if (!place) {
    return;
  }

  try {
    await promptPayLaterVisitConfirm(place);
  } catch (promptError) {
    console.warn("Could not prompt pay-later visit confirm:", promptError);
  }
});

export async function syncPayLaterGeofence(enabled: boolean) {
  const isRunning = await Location.hasStartedGeofencingAsync(PAY_LATER_GEOFENCE_TASK).catch(() => false);

  if (!enabled) {
    if (isRunning) {
      await Location.stopGeofencingAsync(PAY_LATER_GEOFENCE_TASK);
    }
    return;
  }

  const background = await Location.getBackgroundPermissionsAsync();
  if (!background.granted) {
    if (isRunning) {
      await Location.stopGeofencingAsync(PAY_LATER_GEOFENCE_TASK);
    }
    return;
  }

  let latitude: number | null = null;
  let longitude: number | null = null;
  try {
    const position =
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      }).catch(() => null));
    if (position) {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    }
  } catch {
    // Without a fix we skip registering regions — avoids watching unrelated places.
  }

  const places = selectPayLaterPlacesForGeofence(latitude, longitude);
  const regions = geofenceRegionsForPayLater(places);
  if (regions.length === 0) {
    if (isRunning) {
      await Location.stopGeofencingAsync(PAY_LATER_GEOFENCE_TASK);
    }
    return;
  }

  await Location.startGeofencingAsync(PAY_LATER_GEOFENCE_TASK, regions);
}
