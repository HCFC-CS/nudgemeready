import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import {
  defaultHomeSettings,
  type HomeSettings,
  type HomeThresholdMeters
} from "../services/homeSettingsStorage";
import { loadHomeSettings, saveHomeSettings } from "../services/homeSettingsStorage";

type HomeSettingsContextValue = {
  homeSettings: HomeSettings;
  isReady: boolean;
  setEnabled: (enabled: boolean) => void;
  setLabel: (label: string) => void;
  setCoordinates: (latitude: number, longitude: number) => void;
  clearCoordinates: () => void;
  setThresholdMeters: (thresholdMeters: HomeThresholdMeters) => void;
  setChecklistItems: (checklistItems: string[]) => void;
  updateChecklistItem: (index: number, value: string) => void;
  addChecklistItem: () => void;
  removeChecklistItem: (index: number) => void;
};

const HomeSettingsContext = createContext<HomeSettingsContextValue | undefined>(undefined);

export function HomeSettingsProvider({ children }: PropsWithChildren) {
  const [homeSettings, setHomeSettings] = useState<HomeSettings>(defaultHomeSettings);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadHomeSettings()
      .then(setHomeSettings)
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) {
      saveHomeSettings(homeSettings);
    }
  }, [homeSettings, isReady]);

  const patchSettings = useCallback((patch: Partial<HomeSettings>) => {
    setHomeSettings((current) => ({ ...current, ...patch }));
  }, []);

  const setEnabled = useCallback((enabled: boolean) => patchSettings({ enabled }), [patchSettings]);
  const setLabel = useCallback((label: string) => patchSettings({ label }), [patchSettings]);
  const setCoordinates = useCallback(
    (latitude: number, longitude: number) => patchSettings({ latitude, longitude }),
    [patchSettings]
  );
  const clearCoordinates = useCallback(
    () => patchSettings({ latitude: null, longitude: null }),
    [patchSettings]
  );
  const setThresholdMeters = useCallback(
    (thresholdMeters: HomeThresholdMeters) => patchSettings({ thresholdMeters }),
    [patchSettings]
  );
  const setChecklistItems = useCallback(
    (checklistItems: string[]) => patchSettings({ checklistItems }),
    [patchSettings]
  );

  const updateChecklistItem = useCallback((index: number, value: string) => {
    setHomeSettings((current) => ({
      ...current,
      checklistItems: current.checklistItems.map((item, itemIndex) => (itemIndex === index ? value : item))
    }));
  }, []);

  const addChecklistItem = useCallback(() => {
    setHomeSettings((current) => ({
      ...current,
      checklistItems: [...current.checklistItems, ""]
    }));
  }, []);

  const removeChecklistItem = useCallback((index: number) => {
    setHomeSettings((current) => {
      if (current.checklistItems.length <= 1) {
        return current;
      }
      return {
        ...current,
        checklistItems: current.checklistItems.filter((_, itemIndex) => itemIndex !== index)
      };
    });
  }, []);

  return (
    <HomeSettingsContext.Provider
      value={{
        homeSettings,
        isReady,
        setEnabled,
        setLabel,
        setCoordinates,
        clearCoordinates,
        setThresholdMeters,
        setChecklistItems,
        updateChecklistItem,
        addChecklistItem,
        removeChecklistItem
      }}
    >
      {children}
    </HomeSettingsContext.Provider>
  );
}

export function useHomeSettings() {
  const context = useContext(HomeSettingsContext);
  if (!context) {
    throw new Error("useHomeSettings must be used inside HomeSettingsProvider");
  }
  return context;
}
