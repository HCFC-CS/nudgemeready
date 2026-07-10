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

export async function openInMaps(location?: NudgeLocation) {
  if (!location) {
    return false;
  }

  const label = encodeURIComponent(location.label || location.address || "Location");
  const query = encodeURIComponent(location.address || location.label || "");

  let url: string | undefined;
  if (location.latitude != null && location.longitude != null) {
    const { latitude, longitude } = location;
    url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${query})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    });
  } else if (location.address || location.label) {
    url = `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  if (!url) {
    return false;
  }

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query || label}`);
    return true;
  }
  await Linking.openURL(url);
  return true;
}
