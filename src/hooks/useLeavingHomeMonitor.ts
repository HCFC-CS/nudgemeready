import * as Location from "expo-location";
import * as Speech from "expo-speech";
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { useHomeSettings } from "./useHomeSettings";
import {
  buildLeavingHomeSpeechText,
  distanceMeters,
  hasHomeCoordinates
} from "../services/homeSettingsStorage";
import { syncLeavingHomeGeofence } from "../services/leavingHomeGeofence";
import { shouldPlayLeavingHomeReminder } from "../services/leavingHomeReminder";

const WATCH_DISTANCE_METERS = 25;
const WATCH_TIME_MS = 5000;

function playLeavingHomeReminder(text: string) {
  if (!shouldPlayLeavingHomeReminder()) {
    return;
  }
  Speech.stop();
  Speech.speak(text);
}

export function useLeavingHomeMonitor() {
  const { homeSettings, isReady } = useHomeSettings();
  const isAtHomeRef = useRef(true);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    syncLeavingHomeGeofence(homeSettings).catch((error) => {
      console.warn("Could not sync leaving-home geofence:", error);
    });
  }, [homeSettings, isReady]);

  useEffect(() => {
    if (!isReady || !homeSettings.enabled || !hasHomeCoordinates(homeSettings)) {
      isAtHomeRef.current = true;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      return;
    }

    let cancelled = false;

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
          const distance = distanceMeters(
            latitude,
            longitude,
            homeSettings.latitude!,
            homeSettings.longitude!
          );
          const threshold = homeSettings.thresholdMeters;
          const enterThreshold = threshold * 0.75;
          const wasAtHome = isAtHomeRef.current;

          if (distance <= enterThreshold) {
            isAtHomeRef.current = true;
            return;
          }

          if (distance > threshold && wasAtHome) {
            playLeavingHomeReminder(buildLeavingHomeSpeechText(homeSettings.checklistItems));
          }

          if (distance > threshold) {
            isAtHomeRef.current = false;
          }
        }
      );
    }

    startWatch().catch((error) => {
      console.warn("Could not watch location for leaving-home reminders:", error);
    });

    return () => {
      cancelled = true;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [homeSettings, isReady]);

  useEffect(() => {
    function handleAppState(nextState: AppStateStatus) {
      if (nextState === "active" && homeSettings.enabled && hasHomeCoordinates(homeSettings)) {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          .then((position) => {
            const distance = distanceMeters(
              position.coords.latitude,
              position.coords.longitude,
              homeSettings.latitude!,
              homeSettings.longitude!
            );
            isAtHomeRef.current = distance <= homeSettings.thresholdMeters * 0.75;
          })
          .catch(() => undefined);
      }
    }

    const subscription = AppState.addEventListener("change", handleAppState);
    return () => subscription.remove();
  }, [homeSettings]);
}
