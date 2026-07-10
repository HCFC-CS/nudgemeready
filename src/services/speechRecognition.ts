type SpeechRecognitionLib = typeof import("expo-speech-recognition");
type SpeechRecognitionModule = SpeechRecognitionLib["ExpoSpeechRecognitionModule"];

let cachedModule: SpeechRecognitionModule | null | undefined;

export function getSpeechRecognitionModule(): SpeechRecognitionModule | null {
  if (cachedModule !== undefined) {
    return cachedModule;
  }

  try {
    const lib = require("expo-speech-recognition") as SpeechRecognitionLib;
    cachedModule = lib.ExpoSpeechRecognitionModule;
    return cachedModule;
  } catch {
    cachedModule = null;
    return null;
  }
}

export function isSpeechRecognitionSupported() {
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
