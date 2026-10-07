import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { loadAppSecuritySettings } from "./appSecurity";
import { getEncryptedItem } from "./encryptedStorage";

const DATA_KEY_STORE = "nudge.security.dataKey.v1";
const PROFILE_KEY = "do-enough-done:profile";
const NUDGES_HINT_KEYS = ["nudge-me:nudge-items-v2", "nudge-me:nudge-items-v1"];

export type DevAdminDiagnostics = {
  lockEnabled: boolean;
  hasCredential: boolean;
  credentialType: string;
  biometricsEnabled: boolean;
  hasRecoveryCode: boolean;
  hasRecoveryEmail: boolean;
  recoveryEmailMasked: string | null;
  dataKeyPresent: boolean;
  profileReadable: boolean;
  nudgeStorePresent: boolean;
  asyncStorageKeyCount: number;
  /** Explicit policy statement for support/dev UI */
  dataRetentionPolicy: string;
};

/** Dev tools only. Never available in production / App Store builds (`__DEV__` only). */
export function isDevAdminAvailable() {
  return typeof __DEV__ !== "undefined" && __DEV__;
}

function maskEmail(email: string | null) {
  if (!email) {
    return null;
  }
  const [user, domain] = email.split("@");
  if (!domain) {
    return "***";
  }
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}***@${domain}`;
}

export async function collectDevAdminDiagnostics(): Promise<DevAdminDiagnostics> {
  const settings = await loadAppSecuritySettings();
  const dataKeyPresent = Boolean(await SecureStore.getItemAsync(DATA_KEY_STORE));

  let profileReadable = false;
  try {
    const profile = await getEncryptedItem(PROFILE_KEY);
    profileReadable = Boolean(profile);
  } catch {
    profileReadable = false;
  }

  let nudgeStorePresent = false;
  for (const key of NUDGES_HINT_KEYS) {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        nudgeStorePresent = true;
        break;
      }
    } catch {
      // keep scanning
    }
  }

  let asyncStorageKeyCount = 0;
  try {
    asyncStorageKeyCount = (await AsyncStorage.getAllKeys()).length;
  } catch {
    asyncStorageKeyCount = 0;
  }

  return {
    lockEnabled: settings.lockEnabled,
    hasCredential: settings.hasCredential,
    credentialType: settings.credentialType,
    biometricsEnabled: settings.biometricsEnabled,
    hasRecoveryCode: settings.hasRecoveryCode,
    hasRecoveryEmail: settings.hasRecoveryEmail,
    recoveryEmailMasked: maskEmail(settings.recoveryEmail),
    dataKeyPresent,
    profileReadable,
    nudgeStorePresent,
    asyncStorageKeyCount,
    dataRetentionPolicy:
      "Recovery and admin lock reset never delete nudges, profile, crew, or attachments. Data stays on this phone until the user uninstalls the app (or uses an explicit Clear nudges action in Settings)."
  };
}
