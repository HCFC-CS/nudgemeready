import AsyncStorage from "@react-native-async-storage/async-storage";

import { getEncryptedItem, removeEncryptedItem, setEncryptedItem } from "./encryptedStorage";

const VOICE_CAPTURE_KEY = "nudge.voiceCapture.enabled";
const READ_ALOUD_KEY = "nudge.voice.readAloud.enabled";

async function loadFlag(key: string, fallback = true) {
  const encrypted = await getEncryptedItem(key);
  if (encrypted !== null) {
    return encrypted === "true";
  }

  // Migrate legacy plaintext prefs into encrypted storage.
  const legacy = await AsyncStorage.getItem(key);
  if (legacy === null) {
    return fallback;
  }
  const enabled = legacy === "true";
  await setEncryptedItem(key, enabled ? "true" : "false");
  await AsyncStorage.removeItem(key);
  return enabled;
}

async function saveFlag(key: string, enabled: boolean) {
  await setEncryptedItem(key, enabled ? "true" : "false");
  await AsyncStorage.removeItem(key);
}

export async function loadVoiceCaptureEnabled() {
  return loadFlag(VOICE_CAPTURE_KEY, true);
}

export async function saveVoiceCaptureEnabled(enabled: boolean) {
  await saveFlag(VOICE_CAPTURE_KEY, enabled);
}

export async function loadReadAloudEnabled() {
  return loadFlag(READ_ALOUD_KEY, true);
}

export async function saveReadAloudEnabled(enabled: boolean) {
  await saveFlag(READ_ALOUD_KEY, enabled);
}

export async function clearVoiceCapturePrefs() {
  await Promise.all([removeEncryptedItem(VOICE_CAPTURE_KEY), removeEncryptedItem(READ_ALOUD_KEY)]);
  await Promise.all([AsyncStorage.removeItem(VOICE_CAPTURE_KEY), AsyncStorage.removeItem(READ_ALOUD_KEY)]);
}

export function appendSpokenText(current: string, spoken: string) {
  const next = spoken.trim();
  if (!next) {
    return current;
  }
  if (!current.trim()) {
    return next;
  }
  return `${current.trimEnd()} ${next}`;
}
