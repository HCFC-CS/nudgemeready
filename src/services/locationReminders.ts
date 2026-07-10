import * as Location from "expo-location";

export async function requestLocationReminderPermission() {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Location.requestForegroundPermissionsAsync();
  return requested.granted;
}

export async function requestBackgroundLocationPermission() {
  const foreground = await Location.getForegroundPermissionsAsync();
  if (!foreground.granted) {
    const requestedForeground = await Location.requestForegroundPermissionsAsync();
    if (!requestedForeground.granted) {
      return false;
    }
  }

  const current = await Location.getBackgroundPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Location.requestBackgroundPermissionsAsync();
  return requested.granted;
}

export async function getCurrentCoordinates() {
  const granted = await requestLocationReminderPermission();
  if (!granted) {
    return null;
  }
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced
  });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  };
}

export const locationReminderExamples = [
  "Leaving home? Got your keys, wallet, and phone?",
  "Arriving nearby? Take a breath, then choose one next step."
];
