import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from "react";

import { isSpeechTargetActive } from "../services/speechCapture";
import { useSpeechToText } from "./useSpeechToText";

type FinishResult = {
  capturedText: string;
  voiceNoteUrl: string;
};

type SpeechCaptureContextValue = {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isAvailable: boolean;
  activeId: string | null;
  startFor: (id: string) => Promise<boolean>;
  finishFor: (id: string) => Promise<FinishResult>;
  resetActive: () => void;
};

const SpeechCaptureContext = createContext<SpeechCaptureContextValue | undefined>(undefined);

export function SpeechCaptureProvider({ children }: PropsWithChildren) {
  const { isListening, transcript, error, isAvailable, start, finish, reset } = useSpeechToText();
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const startFor = useCallback(
    async (id: string) => {
      if (activeIdRef.current && activeIdRef.current !== id) {
        reset();
      }
      activeIdRef.current = id;
      setActiveId(id);
      const ok = await start();
      if (!ok) {
        activeIdRef.current = null;
        setActiveId(null);
      }
      return ok;
    },
    [reset, start]
  );

  const finishFor = useCallback(
    async (id: string) => {
      if (!isSpeechTargetActive(activeIdRef.current, id)) {
        return { capturedText: "", voiceNoteUrl: "" };
      }
      const result = await finish();
      activeIdRef.current = null;
      setActiveId(null);
      return result;
    },
    [finish]
  );

  const resetActive = useCallback(() => {
    reset();
    activeIdRef.current = null;
    setActiveId(null);
  }, [reset]);

  const value = useMemo(
    () => ({
      isListening,
      transcript,
      error,
      isAvailable,
      activeId,
      startFor,
      finishFor,
      resetActive
    }),
    [isListening, transcript, error, isAvailable, activeId, startFor, finishFor, resetActive]
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

  const mine = isSpeechTargetActive(context.activeId, targetId);
  return {
    isListening: context.isListening && mine,
    transcript: mine ? context.transcript : "",
    error: mine ? context.error : null,
    isAvailable: context.isAvailable,
    start: () => context.startFor(targetId),
    finish: () => context.finishFor(targetId),
    reset: context.resetActive
  };
}
