/**
 * Delay native modules until after splash has painted and the first JS tree has settled.
 *
 * Importing expo-notifications at JS startup evaluates DevicePushTokenAutoRegistration.fx.js,
 * which immediately calls native addListener / getRegistrationInfoAsync. On iOS 26 that
 * native exception path can abort the process. Keychain (expo-secure-store) and push-token
 * registration must also not stampede in the same tick as NudgeApp first mount.
 */
const SPLASH_NATIVE_DELAY_MS = 2500;
const NATIVE_SETTLE_MS = 2000;

type ExpoNotifications = typeof import("expo-notifications");

let splashReady: Promise<void> | null = null;
let nativeReady: Promise<void> | null = null;
let loaded: Promise<ExpoNotifications> | null = null;

export function waitForSplashNative(): Promise<void> {
  if (!splashReady) {
    splashReady = new Promise((resolve) => {
      setTimeout(resolve, SPLASH_NATIVE_DELAY_MS);
    });
  }
  return splashReady;
}

/** Splash delay plus a settle window so NudgeApp can paint before native modules run. */
export function waitForNativeModules(): Promise<void> {
  if (!nativeReady) {
    nativeReady = waitForSplashNative().then(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, NATIVE_SETTLE_MS);
        })
    );
  }
  return nativeReady;
}

export async function loadExpoNotifications(): Promise<ExpoNotifications> {
  await waitForNativeModules();
  if (!loaded) {
    loaded = import("expo-notifications");
  }
  return loaded;
}
