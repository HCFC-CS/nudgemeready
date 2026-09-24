import * as Speech from "expo-speech";

let speaking = false;
let onIdle: (() => void) | undefined;

function setSpeaking(next: boolean) {
  speaking = next;
  if (!next) {
    onIdle?.();
    onIdle = undefined;
  }
}

export function isSpeaking() {
  return speaking;
}

/** Short cue so mic / speak buttons feel responsive when listening starts. */
export function announceVoiceReady() {
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve();
    };

    try {
      Speech.stop();
    } catch {
      // Ignore stop failures.
    }

    Speech.speak("Ready", {
      language: "en-GB",
      rate: 1.05,
      onDone: finish,
      onStopped: finish,
      onError: finish
    });

    // If speech never callbacks (some devices), continue after a short beat.
    setTimeout(finish, 1200);
  });
}

export async function speakText(text: string, options?: { onDone?: () => void }) {
  const cleaned = text.trim();
  if (!cleaned) {
    return false;
  }
  Speech.stop();
  onIdle = options?.onDone;
  setSpeaking(true);
  Speech.speak(cleaned, {
    onDone: () => setSpeaking(false),
    onStopped: () => setSpeaking(false),
    onError: () => setSpeaking(false)
  });
  return true;
}

export function stopSpeaking() {
  Speech.stop();
  setSpeaking(false);
}

export async function toggleSpeakText(text: string, options?: { onDone?: () => void }) {
  if (speaking) {
    stopSpeaking();
    return "stopped" as const;
  }
  const started = await speakText(text, options);
  return started ? ("speaking" as const) : ("empty" as const);
}
