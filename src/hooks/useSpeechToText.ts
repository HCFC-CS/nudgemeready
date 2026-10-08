import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import { buildSpeechStartOptions, resultTranscript, speechErrorCopy } from "../services/speechCapture";
import {
  getSpeechRecognitionModule,
  isSpeechRecognitionSupported
} from "../services/speechRecognition";

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const transcriptRef = useRef("");
  const recordingUriRef = useRef("");

  useEffect(() => {
    try {
      if (!isSpeechRecognitionSupported()) {
        setIsAvailable(false);
        return;
      }

      const module = getSpeechRecognitionModule();
      setIsAvailable(Boolean(module));

      if (!module) {
        return;
      }

      const listeners = [
        module.addListener("start", () => {
          setIsListening(true);
          setError(null);
        }),
        module.addListener("end", () => {
          setIsListening(false);
        }),
        module.addListener("result", (event) => {
          const text = resultTranscript(event);
          if (!text) {
            return;
          }
          transcriptRef.current = text;
          setTranscript(text);
        }),
        module.addListener("audioend", (event) => {
          if (event.uri) {
            recordingUriRef.current = event.uri;
          }
        }),
        module.addListener("nomatch", () => {
          setError(speechErrorCopy("nomatch"));
          setIsListening(false);
        }),
        module.addListener("error", (event) => {
          setError(speechErrorCopy(event.error, event.message));
          setIsListening(false);
        })
      ];

      return () => {
        listeners.forEach((listener) => listener.remove());
      };
    } catch {
      setIsAvailable(false);
    }
  }, []);

  const reset = useCallback(() => {
    transcriptRef.current = "";
    recordingUriRef.current = "";
    setTranscript("");
    setError(null);
    setIsListening(false);
  }, []);

  const stop = useCallback(() => {
    const module = getSpeechRecognitionModule();
    if (!module) {
      setIsListening(false);
      return;
    }

    try {
      module.stop();
    } catch {
      setIsListening(false);
    }
  }, []);

  const start = useCallback(async () => {
    reset();

    const module = getSpeechRecognitionModule();
    if (!module || !isSpeechRecognitionSupported()) {
      setError("Speech recognition needs a development build of this app.");
      return false;
    }

    const permission = await module.requestPermissionsAsync();
    if (!permission.granted) {
      setError("Microphone permission is needed for voice input.");
      return false;
    }

    if (Platform.OS === "ios" && typeof module.requestSpeechRecognizerPermissionsAsync === "function") {
      try {
        const speechPermission = await module.requestSpeechRecognizerPermissionsAsync();
        if (speechPermission.restricted) {
          setError("Voice isn't available on this phone right now. You can type it instead.");
          return false;
        }
      } catch {
        // On-device capture can still work with microphone permission only.
      }
    }

    const persistRecording =
      typeof module.supportsRecording === "function" && module.supportsRecording();
    const onDevice =
      Platform.OS === "ios" &&
      typeof module.supportsOnDeviceRecognition === "function" &&
      module.supportsOnDeviceRecognition();

    try {
      module.start(buildSpeechStartOptions({ persistRecording, onDevice }));
      setIsListening(true);
      return true;
    } catch {
      try {
        module.start(buildSpeechStartOptions({ persistRecording, onDevice: false }));
        setIsListening(true);
        return true;
      } catch {
        setError("The microphone didn't start. Try once more.");
        return false;
      }
    }
  }, [reset]);

  const finish = useCallback(async () => {
    stop();
    await new Promise((resolve) => setTimeout(resolve, 350));
    const capturedText = transcriptRef.current.trim();
    const voiceNoteUrl = recordingUriRef.current || `voice://${Date.now()}`;
    if (!capturedText) {
      setIsListening(false);
      setError(speechErrorCopy("no-speech"));
      return { capturedText: "", voiceNoteUrl };
    }
    reset();
    return { capturedText, voiceNoteUrl };
  }, [reset, stop]);

  return {
    isListening,
    transcript,
    error,
    isAvailable,
    start,
    stop,
    finish,
    reset
  };
}
