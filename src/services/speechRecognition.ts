import { requireOptionalNativeModule } from "expo";

type SpeechRecognitionLib = typeof import("expo-speech-recognition");
type SpeechRecognitionModule = SpeechRecognitionLib["ExpoSpeechRecognitionModule"];

let cachedModule: SpeechRecognitionModule | null | undefined;

/**
 * Safe for Expo Go: never loads expo-speech-recognition unless the native
 * module is already present in the binary.
 */
export function getSpeechRecognitionModule(): SpeechRecognitionModule | null {
  if (cachedModule !== undefined) {
    return cachedModule;
  }

  try {
    const native = requireOptionalNativeModule("ExpoSpeechRecognition");
    if (!native) {
      cachedModule = null;
      return null;
    }

    const lib = require("expo-speech-recognition") as SpeechRecognitionLib;
    cachedModule = lib.ExpoSpeechRecognitionModule;
    return cachedModule;
  } catch {
    cachedModule = null;
    return null;
  }
}

export function isSpeechRecognitionSupported() {
  try {
    if (!requireOptionalNativeModule("ExpoSpeechRecognition")) {
      return false;
    }
  } catch {
    return false;
  }

  const module = getSpeechRecognitionModule();
  if (!module) {
    return false;
  }

  try {
    return module.isRecognitionAvailable();
  } catch {
    return false;
  }
}
