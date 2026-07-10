import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import {
  loadVoiceCaptureEnabled,
  saveVoiceCaptureEnabled
} from "../services/voiceCaptureStorage";

type VoiceCaptureSettingsContextValue = {
  enabled: boolean;
  isReady: boolean;
  setEnabled: (enabled: boolean) => void;
};

const VoiceCaptureSettingsContext = createContext<VoiceCaptureSettingsContextValue | undefined>(
  undefined
);

export function VoiceCaptureSettingsProvider({ children }: PropsWithChildren) {
  const [enabled, setEnabledState] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadVoiceCaptureEnabled()
      .then(setEnabledState)
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) {
      void saveVoiceCaptureEnabled(enabled);
    }
  }, [enabled, isReady]);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
  }, []);

  return (
    <VoiceCaptureSettingsContext.Provider value={{ enabled, isReady, setEnabled }}>
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
