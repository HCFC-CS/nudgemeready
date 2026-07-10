import AsyncStorage from "@react-native-async-storage/async-storage";

export const HOME_SETTINGS_KEY = "nudge-me:home-settings";

export const HOME_THRESHOLD_OPTIONS = [100, 200, 500] as const;
export type HomeThresholdMeters = (typeof HOME_THRESHOLD_OPTIONS)[number];

export type HomeSettings = {
  enabled: boolean;
  label: string;
  latitude: number | null;
  longitude: number | null;
  thresholdMeters: HomeThresholdMeters;
  checklistItems: string[];
};

export const defaultHomeSettings: HomeSettings = {
  enabled: false,
  label: "",
  latitude: null,
  longitude: null,
  thresholdMeters: 200,
  checklistItems: ["phone", "wallet", "keys"]
};

export function buildLeavingHomeSpeechText(items: string[]) {
  const cleaned = items.map((item) => item.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return "Have you got everything you need?";
  }
  if (cleaned.length === 1) {
    return `Have you got your ${cleaned[0]}?`;
  }
  const last = cleaned[cleaned.length - 1];
  const rest = cleaned.slice(0, -1);
  return `Have you got your ${rest.join(", your ")}, and your ${last}?`;
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

export function hasHomeCoordinates(settings: HomeSettings) {
  return settings.latitude != null && settings.longitude != null;
}

export async function loadHomeSettings(): Promise<HomeSettings> {
  const raw = await AsyncStorage.getItem(HOME_SETTINGS_KEY);
  if (!raw) {
    return defaultHomeSettings;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<HomeSettings>;
    const thresholdMeters = HOME_THRESHOLD_OPTIONS.includes(parsed.thresholdMeters as HomeThresholdMeters)
      ? (parsed.thresholdMeters as HomeThresholdMeters)
      : defaultHomeSettings.thresholdMeters;
    const checklistItems =
      Array.isArray(parsed.checklistItems) && parsed.checklistItems.length > 0
        ? parsed.checklistItems.map(String)
        : defaultHomeSettings.checklistItems;

    return {
      ...defaultHomeSettings,
      ...parsed,
      thresholdMeters,
      checklistItems
    };
  } catch {
    return defaultHomeSettings;
  }
}

export async function saveHomeSettings(settings: HomeSettings) {
  await AsyncStorage.setItem(HOME_SETTINGS_KEY, JSON.stringify(settings));
}
