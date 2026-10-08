import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { findPayLaterPlacesNear, PAY_LATER_PLACES } from "../services/payLaterPlaces";
import { syncPayLaterGeofence } from "../services/payLaterGeofence";
import {
  loadPayLaterSettings,
  savePayLaterSettings,
  subscribePayLaterSettings,
  type PayLaterSettings
} from "../services/payLaterReminderStorage";
import { ensurePayLaterConfirmCategory, promptPayLaterVisitConfirm } from "../services/payLaterReminders";

const WATCH_DISTANCE_METERS = 40;
const WATCH_TIME_MS = 8000;

/**
 * Foreground backup for pay-later geofences: when the user leaves a known
 * toll, congestion/clean-air zone, or drive-away parking area, ask
 * “Did you use this?” before any pay reminders.
 */
export function usePayLaterMonitor() {
  const [settings, setSettings] = useState<PayLaterSettings | null>(null);
  const insideRef = useRef<Record<string, boolean>>({});
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let active = true;
    loadPayLaterSettings().then((loaded) => {
      if (active) {
        setSettings(loaded);
      }
    });
    const unsubscribe = subscribePayLaterSettings((next) => {
      setSettings(next);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!settings) {
      return;
    }
    syncPayLaterGeofence(settings.enabled).catch((error) => {
      console.warn("Could not sync pay-later geofence:", error);
    });
    if (settings.enabled) {
      ensurePayLaterConfirmCategory().catch(() => undefined);
    }
  }, [settings]);

  useEffect(() => {
    if (!settings?.enabled) {
      insideRef.current = {};
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
          const nearby = findPayLaterPlacesNear(latitude, longitude);
          const nearbyIds = new Set(nearby.map(({ place }) => place.id));

          for (const place of PAY_LATER_PLACES) {
            const isInside = nearbyIds.has(place.id);
            const wasInside = insideRef.current[place.id] === true;

            if (isInside) {
              insideRef.current[place.id] = true;
              continue;
            }

            if (wasInside && !isInside) {
              void promptPayLaterVisitConfirm(place).catch((error) => {
                console.warn("Pay-later confirm prompt failed:", error);
              });
            }

            insideRef.current[place.id] = false;
          }
        }
      );
    }

    startWatch().catch((error) => {
      console.warn("Could not watch location for pay-later reminders:", error);
    });

    return () => {
      cancelled = true;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [settings?.enabled]);

  useEffect(() => {
    function handleAppState(nextState: AppStateStatus) {
      if (nextState !== "active") {
        return;
      }
      void loadPayLaterSettings().then(setSettings);
    }

    const subscription = AppState.addEventListener("change", handleAppState);
    return () => subscription.remove();
  }, []);
}

/** Used by Settings to persist and refresh geofencing without remounting App. */
export async function persistPayLaterEnabled(enabled: boolean) {
  const current = await loadPayLaterSettings();
  const next = { ...current, enabled };
  await savePayLaterSettings(next);
  await syncPayLaterGeofence(enabled);
  return next;
}
