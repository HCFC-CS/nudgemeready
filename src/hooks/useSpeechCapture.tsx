import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef
} from "react";
import { AppState } from "react-native";

import { canStartSpeechTarget, isSpeechTargetActive } from "../services/speechCapture";
import { useSpeechToText } from "./useSpeechToText";

type FinishResult = {
  capturedText: string;
  voiceNoteUrl: string;
};

type SpeechCaptureContextValue = {
  phase: string;
  targetId: string | null;
  transcript: string;
  error: string | null;
  errorTargetId: string | null;
  isAvailable: boolean;
  startFor: (id: string) => Promise<boolean>;
  finishFor: (id: string) => Promise<FinishResult>;
  abort: (ownerTargetId?: string) => void;
};

const SpeechCaptureContext = createContext<SpeechCaptureContextValue | undefined>(undefined);

export function SpeechCaptureProvider({ children }: PropsWithChildren) {
  const { session, isAvailable, begin, finish, abort } = useSpeechToText();
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "background") {
        abort();
      }
    });
    return () => subscription.remove();
  }, [abort]);

  const startFor = useCallback(
    async (id: string) => {
      if (!canStartSpeechTarget(sessionRef.current.targetId, id)) {
        return false;
      }
      return begin(id);
    },
    [begin]
  );

  const finishFor = useCallback(
    async (id: string) => {
      if (!isSpeechTargetActive(sessionRef.current.targetId, id)) {
        return { capturedText: "", voiceNoteUrl: "" };
      }
      return finish(id);
    },
    [finish]
  );

  const value = useMemo(
    () => ({
      phase: session.phase,
      targetId: session.targetId,
      transcript: session.transcript,
      error: session.error,
      errorTargetId: session.errorTargetId,
      isAvailable,
      startFor,
      finishFor,
      abort
    }),
    [session, isAvailable, startFor, finishFor, abort]
  );

  return <SpeechCaptureContext.Provider value={value}>{children}</SpeechCaptureContext.Provider>;
}

export function useSpeechCaptureStatus() {
  const context = useContext(SpeechCaptureContext);
  return { isAvailable: context?.isAvailable ?? false };
}

export function useSpeechCapture(targetId: string) {
  const context = useContext(SpeechCaptureContext);
  if (!context) {
    throw new Error("useSpeechCapture must be used within SpeechCaptureProvider");
  }

  const mine = isSpeechTargetActive(context.targetId, targetId);
  const active = context.phase !== "idle";
  return {
    isListening: mine && (context.phase === "listening" || context.phase === "heard"),
    isEngaged: mine && active,
    isBusyElsewhere: active && !mine,
    transcript: mine ? context.transcript : "",
    error: context.errorTargetId === targetId ? context.error : null,
    isAvailable: context.isAvailable,
    start: () => context.startFor(targetId),
    finish: () => context.finishFor(targetId),
    reset: () => context.abort(targetId)
  };
}
