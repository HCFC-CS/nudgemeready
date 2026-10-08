export function buildSpeechStartOptions(options?: {
  persistRecording?: boolean;
  onDevice?: boolean;
}) {
  return {
    lang: "en-GB",
    interimResults: true,
    continuous: true,
    addsPunctuation: true,
    iosTaskHint: "dictation" as const,
    requiresOnDeviceRecognition: Boolean(options?.onDevice),
    iosCategory: {
      category: "playAndRecord" as const,
      categoryOptions: ["defaultToSpeaker", "allowBluetooth"],
      mode: "measurement" as const
    },
    iosVoiceProcessingEnabled: true,
    ...(options?.persistRecording
      ? {
          recordingOptions: {
            persist: true
          }
        }
      : {})
  };
}

export function speechErrorCopy(code?: string, message?: string): string {
  switch (code) {
    case "no-speech":
    case "speech-timeout":
    case "nomatch":
      return "I didn't catch that. Try again when you're ready.";
    case "audio-capture":
    case "busy":
      return "The microphone didn't start. Try once more.";
    case "not-allowed":
      return "Microphone permission is needed for voice input.";
    case "network":
      return "Voice needs a moment of internet on this phone. You can type it instead.";
    case "interrupted":
      return "Something interrupted the microphone. Try again when you're ready.";
    case "language-not-supported":
    case "service-not-allowed":
      return "Voice isn't available on this phone right now. You can type it instead.";
    default:
      return message?.trim() || "Voice didn't catch that. You can type it instead.";
  }
}

export function isSpeechTargetActive(activeId: string | null | undefined, targetId: string) {
  return Boolean(activeId && activeId === targetId);
}

export function resultTranscript(event: { results?: Array<{ transcript?: string }> } | null | undefined): string {
  return (event?.results ?? [])
    .map((result) => result?.transcript ?? "")
    .join(" ")
    .trim();
}
