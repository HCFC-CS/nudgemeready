import { getEncryptedItem, setEncryptedItem } from "./encryptedStorage";

export const HOME_SETTINGS_KEY = "nudge-me:home-settings-v2";
const LEGACY_HOME_SETTINGS_KEY = "nudge-me:home-settings";

export const HOME_THRESHOLD_OPTIONS = [5, 10, 25, 50, 100] as const;
export type HomeThresholdMeters = (typeof HOME_THRESHOLD_OPTIONS)[number];

export type HomeLocationSource = "gps" | "address";

export const PLACE_KINDS = ["home", "work", "school", "safe"] as const;
export type PlaceKind = (typeof PLACE_KINDS)[number];

export const PLACE_LABELS: Record<PlaceKind, string> = {
  home: "Home",
  work: "Work",
  school: "School",
  safe: "Safe place"
};

export type SavedPlace = {
  kind: PlaceKind;
  postcode: string;
  houseNumber: string;
  address: string;
  label: string;
  latitude: number | null;
  longitude: number | null;
  locationSource: HomeLocationSource | null;
  reminderEnabled: boolean;
};

export type HomeSettings = {
  enabled: boolean;
  places: Record<PlaceKind, SavedPlace>;
  thresholdMeters: HomeThresholdMeters;
  checklistItems: string[];
};

function emptyPlace(kind: PlaceKind, reminderEnabled = kind === "home"): SavedPlace {
  return {
    kind,
    postcode: "",
    houseNumber: "",
    address: "",
    label: "",
    latitude: null,
    longitude: null,
    locationSource: null,
    reminderEnabled
  };
}

export function createDefaultPlaces(): Record<PlaceKind, SavedPlace> {
  return {
    home: emptyPlace("home", true),
    work: emptyPlace("work", false),
    school: emptyPlace("school", false),
    safe: emptyPlace("safe", false)
  };
}

export const defaultHomeSettings: HomeSettings = {
  enabled: false,
  places: createDefaultPlaces(),
  thresholdMeters: 25,
  checklistItems: ["phone", "wallet", "keys"]
};

export function buildLeavingHomeSpeechText(items: string[]) {
  return buildLeavingPlaceSpeechText("home", items);
}

export function buildLeavingPlaceSpeechText(kind: PlaceKind, items: string[]) {
  const placeName = PLACE_LABELS[kind].toLowerCase();
  const cleaned = items.map((item) => item.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return `Have you got everything you need before leaving ${placeName}?`;
  }
  if (cleaned.length === 1) {
    return `Have you got your ${cleaned[0]} before leaving ${placeName}?`;
  }
  const last = cleaned[cleaned.length - 1];
  const rest = cleaned.slice(0, -1);
  return `Have you got your ${rest.join(", your ")}, and your ${last} before leaving ${placeName}?`;
}

export function distanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
) {
  const earthRadiusMeters = 6371000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLatitude = toRadians(latitudeB - latitudeA);
  const deltaLongitude = toRadians(longitudeB - longitudeA);
  const latA = toRadians(latitudeA);
  const latB = toRadians(latitudeB);
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(deltaLongitude / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine));
}

export function hasPlaceCoordinates(place?: SavedPlace | null) {
  return Boolean(place && place.latitude != null && place.longitude != null);
}

export function getPlaceSummary(place: SavedPlace) {
  if (!hasPlaceCoordinates(place)) {
    return "Not set";
  }
  if (place.locationSource === "gps") {
    return place.label.trim() || "Current location";
  }
  return (
    place.label.trim() ||
    [place.houseNumber, place.postcode].filter(Boolean).join(", ") ||
    PLACE_LABELS[place.kind]
  );
}

export function getReminderPlaces(settings: HomeSettings) {
  return PLACE_KINDS.map((kind) => settings.places[kind]).filter(
    (place) => place.reminderEnabled && hasPlaceCoordinates(place)
  );
}

export function hasReminderPlaces(settings: HomeSettings) {
  return getReminderPlaces(settings).length > 0;
}

/** True when any saved place has coordinates (for UI status). */
export function hasHomeCoordinates(settings: HomeSettings) {
  return PLACE_KINDS.some((kind) => hasPlaceCoordinates(settings.places[kind]));
}

function normalizePlace(kind: PlaceKind, value?: Partial<SavedPlace>): SavedPlace {
  return {
    ...emptyPlace(kind, kind === "home"),
    ...value,
    kind,
    postcode: typeof value?.postcode === "string" ? value.postcode : "",
    houseNumber: typeof value?.houseNumber === "string" ? value.houseNumber : "",
    address: typeof value?.address === "string" ? value.address : "",
    label: typeof value?.label === "string" ? value.label : "",
    latitude: typeof value?.latitude === "number" ? value.latitude : null,
    longitude: typeof value?.longitude === "number" ? value.longitude : null,
    locationSource: value?.locationSource === "gps" || value?.locationSource === "address" ? value.locationSource : null,
    reminderEnabled: typeof value?.reminderEnabled === "boolean" ? value.reminderEnabled : kind === "home"
  };
}

function migrateLegacySettings(parsed: Record<string, unknown>): HomeSettings {
  const places = createDefaultPlaces();
  const latitude = typeof parsed.latitude === "number" ? parsed.latitude : null;
  const longitude = typeof parsed.longitude === "number" ? parsed.longitude : null;
  places.home = normalizePlace("home", {
    label: typeof parsed.label === "string" ? parsed.label : "",
    postcode: typeof parsed.postcode === "string" ? parsed.postcode : "",
    houseNumber: typeof parsed.houseNumber === "string" ? parsed.houseNumber : "",
    address: typeof parsed.address === "string" ? parsed.address : "",
    latitude,
    longitude,
    locationSource:
      parsed.locationSource === "gps" || parsed.locationSource === "address"
        ? parsed.locationSource
        : null,
    reminderEnabled: true
  });

  const thresholdMeters = HOME_THRESHOLD_OPTIONS.includes(parsed.thresholdMeters as HomeThresholdMeters)
    ? (parsed.thresholdMeters as HomeThresholdMeters)
    : defaultHomeSettings.thresholdMeters;
  const checklistItems =
    Array.isArray(parsed.checklistItems) && parsed.checklistItems.length > 0
      ? parsed.checklistItems.map(String)
      : defaultHomeSettings.checklistItems;

  return {
    enabled: Boolean(parsed.enabled),
    places,
    thresholdMeters,
    checklistItems
  };
}

function normalizeSettings(parsed: Partial<HomeSettings> & Record<string, unknown>): HomeSettings {
  if (!parsed.places || typeof parsed.places !== "object") {
    return migrateLegacySettings(parsed);
  }

  const places = createDefaultPlaces();
  for (const kind of PLACE_KINDS) {
    places[kind] = normalizePlace(kind, (parsed.places as Record<PlaceKind, SavedPlace>)[kind]);
  }

  const thresholdMeters = HOME_THRESHOLD_OPTIONS.includes(parsed.thresholdMeters as HomeThresholdMeters)
    ? (parsed.thresholdMeters as HomeThresholdMeters)
    : defaultHomeSettings.thresholdMeters;
  const checklistItems =
    Array.isArray(parsed.checklistItems) && parsed.checklistItems.length > 0
      ? parsed.checklistItems.map(String)
      : defaultHomeSettings.checklistItems;

  return {
    enabled: Boolean(parsed.enabled),
    places,
    thresholdMeters,
    checklistItems
  };
}

export async function loadHomeSettings(): Promise<HomeSettings> {
  const raw =
    (await getEncryptedItem(HOME_SETTINGS_KEY)) ?? (await getEncryptedItem(LEGACY_HOME_SETTINGS_KEY));
  if (!raw) {
    return defaultHomeSettings;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<HomeSettings> & Record<string, unknown>;
    const normalized = normalizeSettings(parsed);
    await saveHomeSettings(normalized);
    return normalized;
  } catch {
    return defaultHomeSettings;
  }
}

export async function saveHomeSettings(settings: HomeSettings) {
  await setEncryptedItem(HOME_SETTINGS_KEY, JSON.stringify(settings));
}
