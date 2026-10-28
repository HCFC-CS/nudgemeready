import type { ExpoSpeechRecognitionOptions } from "expo-speech-recognition";

export function buildSpeechStartOptions(options?: {
  persistRecording?: boolean;
  onDevice?: boolean;
}): ExpoSpeechRecognitionOptions {
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
    case "aborted":
      return "The microphone stopped. You can type it instead.";
    default:
      return message?.trim() || "Voice didn't catch that. You can type it instead.";
  }
}

export function isSpeechTargetActive(activeId: string | null | undefined, targetId: string) {
  return Boolean(activeId && activeId === targetId);
}

/** Another field is already listening, so this speak button should not start or steal. */
export function canStartSpeechTarget(activeId: string | null | undefined, targetId: string) {
  return !activeId || activeId === targetId;
}

export function speakToggleAccessibilityLabel(isListening: boolean, idleLabel = "Tap to speak") {
  return isListening ? "Tap again to capture" : idleLabel;
}

export function speakListeningHint(useSpeech = true) {
  return useSpeech
    ? "Listening… tap the same button again to capture."
    : "Type what you would say, then tap the same button again.";
}

export function resultTranscript(event: { results?: Array<{ transcript?: string }> } | null | undefined): string {
  return (event?.results ?? [])
    .map((result) => result?.transcript ?? "")
    .join(" ")
    .trim();
}

export type SpeechPhase = "idle" | "starting" | "listening" | "finishing" | "heard";

/** One shared capture. Generation changes whenever a session ends, so late events cannot land in the next field. */
export type SpeechSession = {
  phase: SpeechPhase;
  targetId: string | null;
  generation: number;
  transcript: string;
  error: string | null;
  errorTargetId: string | null;
};

export function createSpeechSession(): SpeechSession {
  return {
    phase: "idle",
    targetId: null,
    generation: 0,
    transcript: "",
    error: null,
    errorTargetId: null
  };
}

function sameGeneration(session: SpeechSession, generation: number) {
  return session.generation === generation && session.phase !== "idle";
}

export function requestSpeechStart(session: SpeechSession, targetId: string) {
  if (session.phase !== "idle") {
    return { session, accepted: false as const };
  }
  return {
    accepted: true as const,
    session: {
      phase: "starting" as const,
      targetId,
      generation: session.generation + 1,
      transcript: "",
      error: null,
      errorTargetId: null
    }
  };
}

export function confirmSpeechStart(session: SpeechSession, generation: number): SpeechSession {
  if (session.generation !== generation || session.phase !== "starting") {
    return session;
  }
  return { ...session, phase: "listening", error: null };
}

export function failSpeechSession(session: SpeechSession, generation: number, error: string): SpeechSession {
  if (!sameGeneration(session, generation)) {
    return session;
  }
  return {
    phase: "idle",
    targetId: null,
    generation: session.generation + 1,
    transcript: "",
    error,
    errorTargetId: session.targetId
  };
}

export function applySpeechResult(session: SpeechSession, generation: number, text: string): SpeechSession {
  const transcript = text.trim();
  if (!transcript || session.generation !== generation) {
    return session;
  }
  if (
    session.phase !== "starting" &&
    session.phase !== "listening" &&
    session.phase !== "finishing" &&
    session.phase !== "heard"
  ) {
    return session;
  }
  return { ...session, transcript, error: null };
}

export function requestSpeechFinish(session: SpeechSession, targetId: string) {
  const ownsSession = Boolean(session.targetId && session.targetId === targetId);
  if (!ownsSession || (session.phase !== "listening" && session.phase !== "heard")) {
    return { session, accepted: false as const, generation: session.generation };
  }
  return {
    accepted: true as const,
    generation: session.generation,
    session: { ...session, phase: "finishing" as const }
  };
}

export function completeSpeechFinish(session: SpeechSession, generation: number) {
  if (session.generation !== generation || session.phase !== "finishing") {
    return { session, applied: false as const, capturedText: "" };
  }
  const capturedText = session.transcript.trim();
  const errorTargetId = session.targetId;
  if (!capturedText) {
    return {
      applied: true as const,
      capturedText: "",
      session: {
        phase: "idle" as const,
        targetId: null,
        generation: session.generation + 1,
        transcript: "",
        error: speechErrorCopy("no-speech"),
        errorTargetId
      }
    };
  }
  return {
    applied: true as const,
    capturedText,
    session: {
      phase: "idle" as const,
      targetId: null,
      generation: session.generation + 1,
      transcript: "",
      error: null,
      errorTargetId: null
    }
  };
}

/** The recognizer stopped on its own. Keep any words for the same button; release the mic when there were none. */
export function noteSpeechEngineEnd(session: SpeechSession, generation: number): SpeechSession {
  if (session.generation !== generation) {
    return session;
  }
  if (session.phase === "finishing" || session.phase === "heard") {
    return session;
  }
  if (session.phase !== "listening" && session.phase !== "starting") {
    return session;
  }
  if (session.transcript.trim()) {
    return { ...session, phase: "heard" };
  }
  return {
    phase: "idle",
    targetId: null,
    generation: session.generation + 1,
    transcript: "",
    error: speechErrorCopy("no-speech"),
    errorTargetId: session.targetId
  };
}

/**
 * Drop this capture without writing text into a field.
 * A target id limits the abort to that field, so a different microphone cannot clear it.
 * Omit the id when the app leaves the foreground.
 */
export function abortSpeechSession(session: SpeechSession, ownerTargetId?: string): SpeechSession {
  if (session.phase === "idle") {
    return session;
  }
  if (ownerTargetId && session.targetId !== ownerTargetId) {
    return session;
  }
  return {
    phase: "idle",
    targetId: null,
    generation: session.generation + 1,
    transcript: "",
    error: speechErrorCopy("aborted"),
    errorTargetId: session.targetId
  };
}
