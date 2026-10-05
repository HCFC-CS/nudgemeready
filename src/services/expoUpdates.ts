import { Platform } from "react-native";

import { waitAfterPaint, waitForNativeModules } from "./expoNotifications";

/**
 * EAS Update client. Do not import expo-updates at App / NudgeApp load —
 * native check-on-launch is already disabled; JS must wait until splash has
 * painted so iOS 26 does not abort during the first ticks.
 */
type ExpoUpdates = typeof import("expo-updates");

export type RemoteUpdateClient = {
  isEnabled: boolean;
  checkForUpdateAsync: () => Promise<{ isAvailable: boolean }>;
  fetchUpdateAsync: () => Promise<{ isNew: boolean }>;
};

export type RemoteUpdateResult = "skipped" | "none" | "downloaded" | "failed";

let loaded: Promise<ExpoUpdates> | null = null;
let syncStarted = false;

export async function syncRemoteUpdate(client: RemoteUpdateClient): Promise<RemoteUpdateResult> {
  if (!client.isEnabled) {
    return "skipped";
  }
  try {
    const check = await client.checkForUpdateAsync();
    if (!check.isAvailable) {
      return "none";
    }
    const fetched = await client.fetchUpdateAsync();
    return fetched.isNew ? "downloaded" : "none";
  } catch {
    return "failed";
  }
}

async function loadExpoUpdates(): Promise<ExpoUpdates | null> {
  if (Platform.OS === "web") {
    return null;
  }
  await waitForNativeModules();
  if (!loaded) {
    loaded = import("expo-updates");
  }
  return loaded;
}

/**
 * Download a published JS update after the branded shell has painted.
 * The next cold start applies it — we do not reload mid-session (registration
 * and PIN setup must not be interrupted).
 */
export function installOtaUpdateSync() {
  if (syncStarted || Platform.OS === "web") {
    return;
  }
  syncStarted = true;
  void waitForNativeModules()
    .then(() => waitAfterPaint(2000))
    .then(() => loadExpoUpdates())
    .then((Updates) => {
      if (!Updates) {
        return "skipped" as const;
      }
      return syncRemoteUpdate(Updates);
    })
    .catch(() => "failed" as const);
}
