import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import {
  abortSpeechSession,
  applySpeechResult,
  buildSpeechStartOptions,
  completeSpeechFinish,
  confirmSpeechStart,
  createSpeechSession,
  failSpeechSession,
  noteSpeechEngineEnd,
  requestSpeechFinish,
  requestSpeechStart,
  resultTranscript,
  speechErrorCopy,
  type SpeechSession
} from "../services/speechCapture";
import {
  getSpeechRecognitionModule,
  isSpeechRecognitionSupported
} from "../services/speechRecognition";

const FINISH_SETTLE_MS = 350;

export function useSpeechToText() {
  const [session, setSession] = useState<SpeechSession>(createSpeechSession);
  const [isAvailable, setIsAvailable] = useState(false);
  const sessionRef = useRef(session);
  const recordingUriRef = useRef("");
  const armedGenerationRef = useRef<number | null>(null);

  const commit = useCallback((next: SpeechSession) => {
    sessionRef.current = next;
    setSession(next);
    return next;
  }, []);

  const disarm = useCallback(() => {
    armedGenerationRef.current = null;
  }, []);

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

      const acceptEngineEvent = () => {
        const current = sessionRef.current;
        return (
          armedGenerationRef.current !== null &&
          armedGenerationRef.current === current.generation &&
          current.phase !== "idle"
        );
      };

      const listeners = [
        module.addListener("start", () => {
          if (!acceptEngineEvent()) {
            return;
          }
          commit(confirmSpeechStart(sessionRef.current, sessionRef.current.generation));
        }),
        module.addListener("end", () => {
          if (!acceptEngineEvent()) {
            return;
          }
          const next = noteSpeechEngineEnd(sessionRef.current, sessionRef.current.generation);
          if (next.phase === "idle") {
            disarm();
          }
          commit(next);
        }),
        module.addListener("result", (event) => {
          if (!acceptEngineEvent()) {
            return;
          }
          const text = resultTranscript(event);
          commit(applySpeechResult(sessionRef.current, sessionRef.current.generation, text));
        }),
        module.addListener("audioend", (event) => {
          if (!event.uri || !acceptEngineEvent()) {
            return;
          }
          recordingUriRef.current = event.uri;
        }),
        module.addListener("nomatch", () => {
          if (!acceptEngineEvent()) {
            return;
          }
          const current = sessionRef.current;
          if (current.phase === "finishing" || current.phase === "heard") {
            return;
          }
          disarm();
          commit(failSpeechSession(current, current.generation, speechErrorCopy("nomatch")));
        }),
        module.addListener("error", (event) => {
          if (!acceptEngineEvent()) {
            return;
          }
          const current = sessionRef.current;
          if (current.phase === "finishing" || current.phase === "heard") {
            return;
          }
          disarm();
          commit(failSpeechSession(current, current.generation, speechErrorCopy(event.error, event.message)));
        })
      ];

      return () => {
        listeners.forEach((listener) => listener.remove());
      };
    } catch {
      setIsAvailable(false);
    }
  }, [commit, disarm]);

  const stop = useCallback(() => {
    const module = getSpeechRecognitionModule();
    if (!module) {
      return;
    }
    try {
      module.stop();
    } catch {
      // The session state already says whether capture is still open.
    }
  }, []);

  const begin = useCallback(
    async (targetId: string) => {
      const requested = requestSpeechStart(sessionRef.current, targetId);
      if (!requested.accepted) {
        return false;
      }
      const generation = requested.session.generation;
      commit(requested.session);
      recordingUriRef.current = "";
      disarm();

      const module = getSpeechRecognitionModule();
      if (!module || !isSpeechRecognitionSupported()) {
        if (sessionRef.current.generation === generation) {
          commit(
            failSpeechSession(
              sessionRef.current,
              generation,
              "Speech recognition needs a development build of this app."
            )
          );
        }
        return false;
      }

      const permission = await module.requestPermissionsAsync();
      if (sessionRef.current.generation !== generation) {
        return false;
      }
      if (!permission.granted) {
        commit(failSpeechSession(sessionRef.current, generation, speechErrorCopy("not-allowed")));
        return false;
      }

      if (Platform.OS === "ios" && typeof module.requestSpeechRecognizerPermissionsAsync === "function") {
        try {
          const speechPermission = await module.requestSpeechRecognizerPermissionsAsync();
          if (sessionRef.current.generation !== generation) {
            return false;
          }
          if (speechPermission.restricted) {
            commit(
              failSpeechSession(
                sessionRef.current,
                generation,
                speechErrorCopy("service-not-allowed")
              )
            );
            return false;
          }
        } catch {
          // On-device capture can still work with microphone permission only.
        }
      }

      if (sessionRef.current.generation !== generation) {
        return false;
      }

      const persistRecording =
        typeof module.supportsRecording === "function" && module.supportsRecording();

      if (Platform.OS === "ios") {
        try {
          if (typeof module.setCategoryIOS === "function") {
            module.setCategoryIOS({
              category: "playAndRecord",
              categoryOptions: ["defaultToSpeaker", "allowBluetooth"],
              mode: "measurement"
            });
          }
          if (typeof module.setAudioSessionActiveIOS === "function") {
            module.setAudioSessionActiveIOS(true, { notifyOthersOnDeactivation: true });
          }
        } catch {
          // start() still sets playAndRecord via iosCategory.
        }
      }

      if (sessionRef.current.generation !== generation) {
        return false;
      }

      try {
        armedGenerationRef.current = generation;
        module.start(buildSpeechStartOptions({ persistRecording, onDevice: false }));
        if (sessionRef.current.generation !== generation) {
          if (armedGenerationRef.current === generation) {
            disarm();
            stop();
          }
          return false;
        }
        if (sessionRef.current.phase === "heard") {
          return true;
        }
        if (sessionRef.current.phase !== "starting") {
          return sessionRef.current.phase === "listening";
        }
        commit(confirmSpeechStart(sessionRef.current, generation));
        return true;
      } catch {
        disarm();
        if (sessionRef.current.generation === generation) {
          commit(failSpeechSession(sessionRef.current, generation, speechErrorCopy("audio-capture")));
        }
        return false;
      }
    },
    [commit, disarm, stop]
  );

  const finish = useCallback(
    async (targetId: string) => {
      const requested = requestSpeechFinish(sessionRef.current, targetId);
      if (!requested.accepted) {
        return { capturedText: "", voiceNoteUrl: "" };
      }
      const generation = requested.generation;
      commit(requested.session);
      stop();
      await new Promise((resolve) => setTimeout(resolve, FINISH_SETTLE_MS));
      const completed = completeSpeechFinish(sessionRef.current, generation);
      if (!completed.applied) {
        return { capturedText: "", voiceNoteUrl: "" };
      }
      disarm();
      commit(completed.session);
      if (!completed.capturedText) {
        recordingUriRef.current = "";
        return { capturedText: "", voiceNoteUrl: "" };
      }
      const voiceNoteUrl = recordingUriRef.current || `voice://${Date.now()}`;
      recordingUriRef.current = "";
      return { capturedText: completed.capturedText, voiceNoteUrl };
    },
    [commit, disarm, stop]
  );

  const abort = useCallback(
    (ownerTargetId?: string) => {
      const next = abortSpeechSession(sessionRef.current, ownerTargetId);
      if (next === sessionRef.current) {
        return;
      }
      disarm();
      commit(next);
      recordingUriRef.current = "";
      stop();
    },
    [commit, disarm, stop]
  );

  return {
    session,
    isAvailable,
    begin,
    finish,
    abort
  };
}
