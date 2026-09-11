import { Linking, Platform } from "react-native";

import type { NudgeLocation } from "../types/nudge";

export type PlaceResult = {
  label: string;
  address: string;
  latitude: number;
  longitude: number;
};

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) {
    return [];
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=6&addressdetails=1`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "NudgeMeReady/1.0"
    }
  });

  if (!response.ok) {
    return [];
  }

  const results = (await response.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
    name?: string;
  }>;

  return results
    .map((result) => {
      const latitude = Number(result.lat);
      const longitude = Number(result.lon);
      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return undefined;
      }
      return {
        label: result.name?.trim() || result.display_name.split(",")[0]?.trim() || trimmed,
        address: result.display_name,
        latitude,
        longitude
      };
    })
    .filter((result): result is PlaceResult => Boolean(result));
}

export function toNudgeLocation(result: PlaceResult): NudgeLocation {
  return {
    label: result.label,
    address: result.address,
    latitude: result.latitude,
    longitude: result.longitude
  };
}

export function getLocationLabel(location?: NudgeLocation) {
  return location?.label ?? location?.address ?? "";
}

function destinationText(location: NudgeLocation) {
  return (location.address || location.label || "").trim();
}

function hasCoordinates(location: NudgeLocation) {
  return location.latitude != null && location.longitude != null;
}

/** Place pin / search URL for Apple Maps or Google Maps. */
export function buildMapsPlaceUrl(location: NudgeLocation, platform: typeof Platform.OS = Platform.OS) {
  const label = encodeURIComponent(location.label || location.address || "Location");
  const query = encodeURIComponent(destinationText(location));

  if (hasCoordinates(location)) {
    const { latitude, longitude } = location;
    if (platform === "ios") {
      return `maps:0,0?q=${label}@${latitude},${longitude}`;
    }
    if (platform === "android") {
      return `geo:${latitude},${longitude}?q=${latitude},${longitude}(${query})`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }

  if (!query) {
    return undefined;
  }
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/** Turn-by-turn directions to the venue (Apple Maps on iOS, Google Maps elsewhere). */
export function buildDirectionsUrl(location: NudgeLocation, platform: typeof Platform.OS = Platform.OS) {
  const text = destinationText(location);
  if (hasCoordinates(location)) {
    const { latitude, longitude } = location;
    if (platform === "ios") {
      return `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
  if (!text) {
    return undefined;
  }
  if (platform === "ios") {
    return `http://maps.apple.com/?daddr=${encodeURIComponent(text)}&dirflg=d`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(text)}`;
}

/** Waze navigate link (opens the app when installed). */
export function buildWazeUrl(location: NudgeLocation) {
  if (hasCoordinates(location)) {
    return `https://waze.com/ul?ll=${location.latitude},${location.longitude}&navigate=yes`;
  }
  const text = destinationText(location);
  if (!text) {
    return undefined;
  }
  return `https://waze.com/ul?q=${encodeURIComponent(text)}&navigate=yes`;
}

async function openNavigationUrl(url: string | undefined, webFallback?: string) {
  if (!url && !webFallback) {
    return false;
  }
  const preferred = url ?? webFallback!;
  try {
    const canOpen = await Linking.canOpenURL(preferred);
    if (canOpen) {
      await Linking.openURL(preferred);
      return true;
    }
  } catch {
    // Fall through to web fallback.
  }
  if (webFallback && webFallback !== preferred) {
    await Linking.openURL(webFallback);
    return true;
  }
  if (url) {
    await Linking.openURL(url);
    return true;
  }
  return false;
}

export async function openInMaps(location?: NudgeLocation) {
  if (!location) {
    return false;
  }
  const query = encodeURIComponent(destinationText(location));
  const label = encodeURIComponent(location.label || location.address || "Location");
  const url = buildMapsPlaceUrl(location);
  const webFallback = hasCoordinates(location)
    ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
    : query
      ? `https://www.google.com/maps/search/?api=1&query=${query}`
      : `https://www.google.com/maps/search/?api=1&query=${label}`;
  return openNavigationUrl(url, webFallback);
}

export async function openDirections(location?: NudgeLocation) {
  if (!location) {
    return false;
  }
  const text = destinationText(location);
  const url = buildDirectionsUrl(location);
  const webFallback = hasCoordinates(location)
    ? `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
    : text
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(text)}`
      : undefined;
  return openNavigationUrl(url, webFallback);
}

export async function openInWaze(location?: NudgeLocation) {
  if (!location) {
    return false;
  }
  const url = buildWazeUrl(location);
  return openNavigationUrl(url);
}
