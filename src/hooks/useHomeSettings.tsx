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
  type HomeLocationSource,
  type HomeSettings,
  type HomeThresholdMeters,
  type PlaceKind,
  type SavedPlace
} from "../services/homeSettingsStorage";
import { loadHomeSettings, saveHomeSettings } from "../services/homeSettingsStorage";

type PlaceInput = {
  label: string;
  address?: string;
  postcode?: string;
  houseNumber?: string;
  latitude: number;
  longitude: number;
  locationSource: HomeLocationSource;
  reminderEnabled?: boolean;
};

type HomeSettingsContextValue = {
  homeSettings: HomeSettings;
  isReady: boolean;
  setEnabled: (enabled: boolean) => void;
  setPlace: (kind: PlaceKind, place: PlaceInput) => void;
  clearPlace: (kind: PlaceKind) => void;
  setPlaceReminder: (kind: PlaceKind, reminderEnabled: boolean) => void;
  setAllPlaceReminders: (reminderEnabled: boolean) => void;
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

  const patchPlace = useCallback((kind: PlaceKind, patch: Partial<SavedPlace>) => {
    setHomeSettings((current) => ({
      ...current,
      places: {
        ...current.places,
        [kind]: {
          ...current.places[kind],
          ...patch,
          kind
        }
      }
    }));
  }, []);

  const setEnabled = useCallback((enabled: boolean) => patchSettings({ enabled }), [patchSettings]);

  const setPlace = useCallback(
    (kind: PlaceKind, place: PlaceInput) =>
      patchPlace(kind, {
        label: place.label,
        address: place.address ?? "",
        postcode: place.postcode ?? "",
        houseNumber: place.houseNumber ?? "",
        latitude: place.latitude,
        longitude: place.longitude,
        locationSource: place.locationSource,
        ...(typeof place.reminderEnabled === "boolean" ? { reminderEnabled: place.reminderEnabled } : {})
      }),
    [patchPlace]
  );

  const clearPlace = useCallback(
    (kind: PlaceKind) =>
      patchPlace(kind, {
        label: "",
        address: "",
        postcode: "",
        houseNumber: "",
        latitude: null,
        longitude: null,
        locationSource: null
      }),
    [patchPlace]
  );

  const setPlaceReminder = useCallback(
    (kind: PlaceKind, reminderEnabled: boolean) => patchPlace(kind, { reminderEnabled }),
    [patchPlace]
  );

  const setAllPlaceReminders = useCallback((reminderEnabled: boolean) => {
    setHomeSettings((current) => ({
      ...current,
      places: {
        home: { ...current.places.home, reminderEnabled },
        work: { ...current.places.work, reminderEnabled },
        school: { ...current.places.school, reminderEnabled },
        safe: { ...current.places.safe, reminderEnabled }
      }
    }));
  }, []);

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
        setPlace,
        clearPlace,
        setPlaceReminder,
        setAllPlaceReminders,
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
