import { useCallback, useEffect, useRef, useState } from "react";

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
          const text = event.results
            .map((result) => result.transcript)
            .join(" ")
            .trim();
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
        module.addListener("error", (event) => {
          setError(event.message ?? event.error);
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

    const supportsRecording =
      typeof module.supportsRecording === "function" && module.supportsRecording();

    module.start({
      lang: "en-GB",
      interimResults: true,
      continuous: false,
      ...(supportsRecording
        ? {
            recordingOptions: {
              persist: true
            }
          }
        : {})
    });

    return true;
  }, [reset]);

  const finish = useCallback(() => {
    stop();
    const capturedText = transcriptRef.current.trim();
    const voiceNoteUrl = recordingUriRef.current || `voice://${Date.now()}`;
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
