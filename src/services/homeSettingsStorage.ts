import { getEncryptedItem, setEncryptedItem } from "./encryptedStorage";

export const HOME_SETTINGS_KEY = "nudge-me:home-settings-v2";
const LEGACY_HOME_SETTINGS_KEY = "nudge-me:home-settings";

/** Leaving-place distance scale (metres). */
export const HOME_THRESHOLD_MIN_METERS = 1;
export const HOME_THRESHOLD_MAX_METERS = 50;
export const HOME_THRESHOLD_DEFAULT_METERS = 25;

/** @deprecated Prefer the 1–50 m scale; kept for older UI references. */
export const HOME_THRESHOLD_OPTIONS = [1, 10, 25, 50] as const;

export type HomeThresholdMeters = number;

export function clampHomeThresholdMeters(
  value: unknown,
  min = HOME_THRESHOLD_MIN_METERS,
  max = HOME_THRESHOLD_MAX_METERS
): HomeThresholdMeters {
  const raw = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(raw)) {
    return HOME_THRESHOLD_DEFAULT_METERS;
  }
  return Math.min(max, Math.max(min, Math.round(raw)));
}

export type HomeLocationSource = "gps" | "address";

export const PLACE_KINDS = ["home", "work", "school", "safe"] as const;
export type PlaceKind = (typeof PLACE_KINDS)[number];

export const PLACE_LABELS: Record<PlaceKind, string> = {
  home: "Home",
  work: "Work",
  school: "School",
  safe: "Safe place"
};

/** Suggested “don’t forget” items — editable per place. */
export const DEFAULT_PLACE_CHECKLISTS: Record<PlaceKind, string[]> = {
  home: ["keys", "phone", "wallet"],
  work: ["laptop", "notes", "charger"],
  school: ["homework", "gym kit", "lunch"],
  safe: ["phone", "keys"]
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
  /** When on, GPS leave at this place’s distance fires that place’s checklist only. */
  reminderEnabled: boolean;
  /** Metres from this place before a leaving nudge. */
  thresholdMeters: HomeThresholdMeters;
  /** Items to mention only when leaving this place. */
  checklistItems: string[];
};

export type HomeSettings = {
  /** Master switch — no daily “forget something” schedule; GPS leave only. */
  enabled: boolean;
  places: Record<PlaceKind, SavedPlace>;
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
    reminderEnabled,
    thresholdMeters: HOME_THRESHOLD_DEFAULT_METERS,
    checklistItems: [...DEFAULT_PLACE_CHECKLISTS[kind]]
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
  places: createDefaultPlaces()
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

export function getPlaceChecklist(place: SavedPlace) {
  const cleaned = place.checklistItems.map((item) => item.trim()).filter(Boolean);
  return cleaned.length ? cleaned : DEFAULT_PLACE_CHECKLISTS[place.kind];
}

export function getPlaceThresholdMeters(place: SavedPlace) {
  return clampHomeThresholdMeters(place.thresholdMeters);
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

function normalizeChecklist(value: unknown, kind: PlaceKind): string[] {
  if (Array.isArray(value) && value.length > 0) {
    return value.map(String);
  }
  return [...DEFAULT_PLACE_CHECKLISTS[kind]];
}

function normalizePlace(
  kind: PlaceKind,
  value: Partial<SavedPlace> | undefined,
  legacy?: { thresholdMeters?: unknown; checklistItems?: unknown }
): SavedPlace {
  const hasOwnChecklist = Array.isArray(value?.checklistItems) && value.checklistItems.length > 0;
  const checklistItems = hasOwnChecklist
    ? normalizeChecklist(value?.checklistItems, kind)
    : kind === "home" && legacy?.checklistItems != null
      ? normalizeChecklist(legacy.checklistItems, kind)
      : [...DEFAULT_PLACE_CHECKLISTS[kind]];

  const hasOwnThreshold = typeof value?.thresholdMeters === "number";
  const thresholdMeters = clampHomeThresholdMeters(
    hasOwnThreshold ? value?.thresholdMeters : legacy?.thresholdMeters
  );

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
    locationSource:
      value?.locationSource === "gps" || value?.locationSource === "address" ? value.locationSource : null,
    reminderEnabled: typeof value?.reminderEnabled === "boolean" ? value.reminderEnabled : kind === "home",
    thresholdMeters,
    checklistItems
  };
}

function migrateLegacySettings(parsed: Record<string, unknown>): HomeSettings {
  const legacy = {
    thresholdMeters: parsed.thresholdMeters,
    checklistItems: parsed.checklistItems
  };
  const places = createDefaultPlaces();
  const latitude = typeof parsed.latitude === "number" ? parsed.latitude : null;
  const longitude = typeof parsed.longitude === "number" ? parsed.longitude : null;
  places.home = normalizePlace(
    "home",
    {
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
    },
    legacy
  );

  for (const kind of PLACE_KINDS) {
    if (kind === "home") {
      continue;
    }
    places[kind] = normalizePlace(kind, places[kind], { thresholdMeters: legacy.thresholdMeters });
  }

  return {
    enabled: Boolean(parsed.enabled),
    places
  };
}

function normalizeSettings(parsed: Partial<HomeSettings> & Record<string, unknown>): HomeSettings {
  if (!parsed.places || typeof parsed.places !== "object") {
    return migrateLegacySettings(parsed);
  }

  const legacy = {
    thresholdMeters: parsed.thresholdMeters,
    checklistItems: parsed.checklistItems
  };

  const places = createDefaultPlaces();
  for (const kind of PLACE_KINDS) {
    places[kind] = normalizePlace(
      kind,
      (parsed.places as Record<PlaceKind, SavedPlace>)[kind],
      legacy
    );
  }

  return {
    enabled: Boolean(parsed.enabled),
    places
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
