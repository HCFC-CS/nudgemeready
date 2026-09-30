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
  thresholdMeters?: HomeThresholdMeters;
  checklistItems?: string[];
};

type HomeSettingsContextValue = {
  homeSettings: HomeSettings;
  isReady: boolean;
  setEnabled: (enabled: boolean) => void;
  setPlace: (kind: PlaceKind, place: PlaceInput) => void;
  clearPlace: (kind: PlaceKind) => void;
  setPlaceReminder: (kind: PlaceKind, reminderEnabled: boolean) => void;
  setAllPlaceReminders: (reminderEnabled: boolean) => void;
  setPlaceThreshold: (kind: PlaceKind, thresholdMeters: HomeThresholdMeters) => void;
  setPlaceChecklist: (kind: PlaceKind, checklistItems: string[]) => void;
  updatePlaceChecklistItem: (kind: PlaceKind, index: number, value: string) => void;
  addPlaceChecklistItem: (kind: PlaceKind) => void;
  removePlaceChecklistItem: (kind: PlaceKind, index: number) => void;
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
        ...(typeof place.reminderEnabled === "boolean" ? { reminderEnabled: place.reminderEnabled } : {}),
        ...(typeof place.thresholdMeters === "number" ? { thresholdMeters: place.thresholdMeters } : {}),
        ...(place.checklistItems ? { checklistItems: place.checklistItems } : {})
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

  const setPlaceThreshold = useCallback(
    (kind: PlaceKind, thresholdMeters: HomeThresholdMeters) => patchPlace(kind, { thresholdMeters }),
    [patchPlace]
  );

  const setPlaceChecklist = useCallback(
    (kind: PlaceKind, checklistItems: string[]) => patchPlace(kind, { checklistItems }),
    [patchPlace]
  );

  const updatePlaceChecklistItem = useCallback((kind: PlaceKind, index: number, value: string) => {
    setHomeSettings((current) => ({
      ...current,
      places: {
        ...current.places,
        [kind]: {
          ...current.places[kind],
          checklistItems: current.places[kind].checklistItems.map((item, itemIndex) =>
            itemIndex === index ? value : item
          )
        }
      }
    }));
  }, []);

  const addPlaceChecklistItem = useCallback((kind: PlaceKind) => {
    setHomeSettings((current) => ({
      ...current,
      places: {
        ...current.places,
        [kind]: {
          ...current.places[kind],
          checklistItems: [...current.places[kind].checklistItems, ""]
        }
      }
    }));
  }, []);

  const removePlaceChecklistItem = useCallback((kind: PlaceKind, index: number) => {
    setHomeSettings((current) => {
      const items = current.places[kind].checklistItems;
      if (items.length <= 1) {
        return current;
      }
      return {
        ...current,
        places: {
          ...current.places,
          [kind]: {
            ...current.places[kind],
            checklistItems: items.filter((_, itemIndex) => itemIndex !== index)
          }
        }
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
        setPlaceThreshold,
        setPlaceChecklist,
        updatePlaceChecklistItem,
        addPlaceChecklistItem,
        removePlaceChecklistItem
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
