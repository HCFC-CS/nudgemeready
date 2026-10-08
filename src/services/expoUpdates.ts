import { Platform } from "react-native";

/**
 * EAS Update client. Do not import expo-updates at App load — native
 * check-on-launch is already disabled. JS waits until after the first paint
 * so splash / registration is not blocked, and we never reload mid-session.
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

function waitAfterPaint(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const start = () => setTimeout(resolve, ms);
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => requestAnimationFrame(start));
    } else {
      start();
    }
  });
}

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
  void waitAfterPaint(2000)
    .then(() => loadExpoUpdates())
    .then((Updates) => {
      if (!Updates) {
        return "skipped" as const;
      }
      return syncRemoteUpdate(Updates);
    })
    .catch(() => "failed" as const);
}
