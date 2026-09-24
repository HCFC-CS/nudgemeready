/**
 * Load expo-notifications after splash has painted.
 *
 * Importing the package at JS startup evaluates DevicePushTokenAutoRegistration.fx.js,
 * which immediately calls native addListener / getRegistrationInfoAsync. On iOS 26 that
 * native exception path can SIGSEGV Hermes during the first half-second (splash).
 */
const SPLASH_NATIVE_DELAY_MS = 2500;

type ExpoNotifications = typeof import("expo-notifications");

let splashReady: Promise<void> | null = null;
let loaded: Promise<ExpoNotifications> | null = null;

export function waitForSplashNative(): Promise<void> {
  if (!splashReady) {
    splashReady = new Promise((resolve) => {
      setTimeout(resolve, SPLASH_NATIVE_DELAY_MS);
    });
  }
  return splashReady;
}

export async function loadExpoNotifications(): Promise<ExpoNotifications> {
  await waitForSplashNative();
  if (!loaded) {
    loaded = import("expo-notifications");
  }
  return loaded;
}
