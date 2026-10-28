import * as Location from "expo-location";
import * as Speech from "expo-speech";
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { useHomeSettings } from "./useHomeSettings";
import {
  buildLeavingPlaceSpeechText,
  distanceMeters,
  getPlaceChecklist,
  getPlaceThresholdMeters,
  getReminderPlaces,
  hasReminderPlaces,
  PLACE_KINDS,
  type PlaceKind
} from "../services/homeSettingsStorage";
import { syncLeavingHomeGeofence } from "../services/leavingHomeGeofence";
import { shouldPlayLeavingHomeReminder } from "../services/leavingHomeReminder";

const WATCH_DISTANCE_METERS = 25;
const WATCH_TIME_MS = 5000;

function playLeavingReminder(kind: PlaceKind, text: string) {
  if (!shouldPlayLeavingHomeReminder(kind)) {
    return;
  }
  Speech.stop();
  Speech.speak(text);
}

function createAtPlaceMap(value: boolean): Record<PlaceKind, boolean> {
  return {
    home: value,
    work: value,
    school: value,
    safe: value
  };
}

/**
 * Foreground backup: speak a place’s own checklist only when GPS leaves
 * that place beyond its selected distance — never as a daily reminder.
 */
export function useLeavingHomeMonitor() {
  const { homeSettings, isReady } = useHomeSettings();
  const atPlaceRef = useRef<Record<PlaceKind, boolean>>(createAtPlaceMap(true));
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    syncLeavingHomeGeofence(homeSettings).catch((error) => {
      console.warn("Could not sync leaving-place geofence:", error);
    });
  }, [homeSettings, isReady]);

  useEffect(() => {
    if (!isReady || !homeSettings.enabled || !hasReminderPlaces(homeSettings)) {
      atPlaceRef.current = createAtPlaceMap(true);
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      return;
    }

    let cancelled = false;
    const reminderPlaces = getReminderPlaces(homeSettings);

    async function startWatch() {
      const foreground = await Location.getForegroundPermissionsAsync();
      if (!foreground.granted || cancelled) {
        return;
      }

      subscriptionRef.current?.remove();
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: WATCH_DISTANCE_METERS,
          timeInterval: WATCH_TIME_MS
        },
        (position) => {
          const { latitude, longitude } = position.coords;

          for (const place of reminderPlaces) {
            const threshold = getPlaceThresholdMeters(place);
            const enterThreshold = threshold * 0.75;
            const distance = distanceMeters(latitude, longitude, place.latitude!, place.longitude!);
            const wasInside = atPlaceRef.current[place.kind];

            if (distance <= enterThreshold) {
              atPlaceRef.current[place.kind] = true;
              continue;
            }

            if (distance > threshold && wasInside) {
              playLeavingReminder(
                place.kind,
                buildLeavingPlaceSpeechText(place.kind, getPlaceChecklist(place))
              );
            }

            if (distance > threshold) {
              atPlaceRef.current[place.kind] = false;
            }
          }
        }
      );
    }

    startWatch().catch((error) => {
      console.warn("Could not watch location for leaving reminders:", error);
    });

    return () => {
      cancelled = true;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [homeSettings, isReady]);

  useEffect(() => {
    function handleAppState(nextState: AppStateStatus) {
      if (nextState !== "active" || !homeSettings.enabled || !hasReminderPlaces(homeSettings)) {
        return;
      }

      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        .then((position) => {
          for (const kind of PLACE_KINDS) {
            const place = homeSettings.places[kind];
            if (!place.reminderEnabled || place.latitude == null || place.longitude == null) {
              atPlaceRef.current[kind] = true;
              continue;
            }
            const threshold = getPlaceThresholdMeters(place) * 0.75;
            const distance = distanceMeters(
              position.coords.latitude,
              position.coords.longitude,
              place.latitude,
              place.longitude
            );
            atPlaceRef.current[kind] = distance <= threshold;
          }
        })
        .catch(() => undefined);
    }

    const subscription = AppState.addEventListener("change", handleAppState);
    return () => subscription.remove();
  }, [homeSettings]);
}
