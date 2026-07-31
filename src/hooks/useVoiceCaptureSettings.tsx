import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import {
  loadReadAloudEnabled,
  loadVoiceCaptureEnabled,
  saveReadAloudEnabled,
  saveVoiceCaptureEnabled
} from "../services/voiceCaptureStorage";

type VoiceCaptureSettingsContextValue = {
  enabled: boolean;
  readAloudEnabled: boolean;
  isReady: boolean;
  setEnabled: (enabled: boolean) => void;
  setReadAloudEnabled: (enabled: boolean) => void;
};

const VoiceCaptureSettingsContext = createContext<VoiceCaptureSettingsContextValue | undefined>(
  undefined
);

export function VoiceCaptureSettingsProvider({ children }: PropsWithChildren) {
  const [enabled, setEnabledState] = useState(true);
  const [readAloudEnabled, setReadAloudEnabledState] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    Promise.all([loadVoiceCaptureEnabled(), loadReadAloudEnabled()])
      .then(([capture, readAloud]) => {
        setEnabledState(capture);
        setReadAloudEnabledState(readAloud);
      })
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) {
      void saveVoiceCaptureEnabled(enabled);
    }
  }, [enabled, isReady]);

  useEffect(() => {
    if (isReady) {
      void saveReadAloudEnabled(readAloudEnabled);
    }
  }, [readAloudEnabled, isReady]);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
  }, []);

  const setReadAloudEnabled = useCallback((next: boolean) => {
    setReadAloudEnabledState(next);
  }, []);

  return (
    <VoiceCaptureSettingsContext.Provider
      value={{ enabled, readAloudEnabled, isReady, setEnabled, setReadAloudEnabled }}
    >
      {children}
    </VoiceCaptureSettingsContext.Provider>
  );
}

export function useVoiceCaptureSettings() {
  const context = useContext(VoiceCaptureSettingsContext);
  if (!context) {
    throw new Error("useVoiceCaptureSettings must be used within VoiceCaptureSettingsProvider");
  }
  return context;
}

export function useOptionalVoiceCaptureSettings() {
  return useContext(VoiceCaptureSettingsContext);
}
