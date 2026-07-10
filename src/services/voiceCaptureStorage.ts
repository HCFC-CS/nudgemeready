import AsyncStorage from "@react-native-async-storage/async-storage";

const VOICE_CAPTURE_KEY = "nudge.voiceCapture.enabled";

export async function loadVoiceCaptureEnabled() {
  const raw = await AsyncStorage.getItem(VOICE_CAPTURE_KEY);
  if (raw === null) {
    return true;
  }
  return raw === "true";
}

export async function saveVoiceCaptureEnabled(enabled: boolean) {
  await AsyncStorage.setItem(VOICE_CAPTURE_KEY, enabled ? "true" : "false");
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
