import * as Location from "expo-location";

import { searchPlaces, type PlaceResult } from "./placeSearch";

export type HomeAddressOption = {
  houseNumber: string;
  street: string;
  label: string;
  address: string;
  postcode: string;
  latitude: number;
  longitude: number;
};

export type PostcodeArea = {
  postcode: string;
  latitude: number;
  longitude: number;
  street: string;
  locality: string;
  summary: string;
};

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  address?: {
    house_number?: string;
    house_name?: string;
    road?: string;
    residential?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
  };
};

type OverpassElement = {
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const NOMINATIM_HEADERS = {
  Accept: "application/json",
  "User-Agent": "NudgeMeReady/1.0 (home-address-lookup; support@nudgemeready.app)"
};

export function formatUkPostcode(value: string) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (compact.length < 5) {
    return compact;
  }
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

export function isLikelyUkPostcode(value: string) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(compact);
}

export async function lookupUkPostcode(postcode: string): Promise<{
  postcode: string;
  latitude: number;
  longitude: number;
} | null> {
  const compact = postcode.trim().replace(/\s+/g, "");
  if (compact.length < 5) {
    return null;
  }

  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(compact)}`);
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as {
      status: number;
      result?: { postcode: string; latitude: number; longitude: number };
    };
    if (payload.status !== 200 || !payload.result) {
      return null;
    }
    return {
      postcode: payload.result.postcode,
      latitude: payload.result.latitude,
      longitude: payload.result.longitude
    };
  } catch {
    return null;
  }
}

async function nominatimSearch(params: Record<string, string>): Promise<NominatimResult[]> {
  const search = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    countrycodes: "gb",
    limit: "50",
    ...params
  });

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${search.toString()}`, {
      headers: NOMINATIM_HEADERS
    });
    if (!response.ok) {
      return [];
    }
    const payload = (await response.json()) as NominatimResult[] | { error?: string };
    return Array.isArray(payload) ? payload : [];
  } catch {
    return [];
  }
}

async function nominatimReverse(latitude: number, longitude: number): Promise<NominatimResult | null> {
  const search = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    zoom: "18",
    lat: String(latitude),
    lon: String(longitude)
  });

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${search.toString()}`, {
      headers: NOMINATIM_HEADERS
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as NominatimResult;
  } catch {
    return null;
  }
}

function streetFromNominatim(result: NominatimResult | null) {
  if (!result) {
    return "";
  }
  return (
    result.address?.road?.trim() ||
    result.address?.residential?.trim() ||
    result.name?.trim() ||
    ""
  );
}

function localityFromNominatim(result: NominatimResult | null) {
  if (!result) {
    return "";
  }
  return (
    result.address?.suburb?.trim() ||
    result.address?.village?.trim() ||
    result.address?.town?.trim() ||
    result.address?.city?.trim() ||
    ""
  );
}

function toAddressOption(
  houseNumber: string,
  street: string,
  postcode: string,
  latitude: number,
  longitude: number,
  fullAddress?: string,
  locality?: string
): HomeAddressOption {
  const formatted = formatUkPostcode(postcode);
  const label = [houseNumber.trim(), street.trim()].filter(Boolean).join(" ") || formatted;
  return {
    houseNumber: houseNumber.trim(),
    street: street.trim(),
    label,
    address:
      fullAddress?.trim() ||
      [label, locality?.trim(), formatted].filter(Boolean).join(", "),
    postcode: formatted,
    latitude,
    longitude
  };
}

function addressKey(option: HomeAddressOption) {
  return [
    option.houseNumber.replace(/\s+/g, "").toLowerCase(),
    option.street.replace(/\s+/g, "").toLowerCase(),
    option.postcode.replace(/\s+/g, "").toLowerCase()
  ].join("|");
}

function sortAddresses(addresses: HomeAddressOption[]) {
  return [...addresses].sort((a, b) => {
    const aNum = Number.parseInt(a.houseNumber, 10);
    const bNum = Number.parseInt(b.houseNumber, 10);
    if (Number.isFinite(aNum) && Number.isFinite(bNum) && aNum !== bNum) {
      return aNum - bNum;
    }
    return a.label.localeCompare(b.label, "en", { numeric: true, sensitivity: "base" });
  });
}

function dedupeAddresses(addresses: HomeAddressOption[]) {
  const seen = new Set<string>();
  const next: HomeAddressOption[] = [];
  for (const entry of addresses) {
    const key = addressKey(entry);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    next.push(entry);
  }
  return sortAddresses(next);
}

function optionFromNominatim(result: NominatimResult, fallbackPostcode: string): HomeAddressOption | null {
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }
  const houseNumber = result.address?.house_number?.trim() || result.address?.house_name?.trim() || "";
  const street = streetFromNominatim(result);
  const postcode = result.address?.postcode?.trim() || fallbackPostcode;
  if (!houseNumber && !street) {
    return null;
  }
  return toAddressOption(
    houseNumber,
    street,
    postcode,
    latitude,
    longitude,
    result.display_name,
    localityFromNominatim(result)
  );
}

async function fetchAddressesFromOverpass(postcode: string): Promise<HomeAddressOption[]> {
  const formatted = formatUkPostcode(postcode);
  const compact = formatted.replace(/\s+/g, "");
  const query = `
[out:json][timeout:25];
(
  node["addr:postcode"="${formatted}"];
  way["addr:postcode"="${formatted}"];
  relation["addr:postcode"="${formatted}"];
  node["addr:postcode"="${compact}"];
  way["addr:postcode"="${compact}"];
  relation["addr:postcode"="${compact}"];
);
out center tags;
`.trim();

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "User-Agent": NOMINATIM_HEADERS["User-Agent"]
      },
      body: `data=${encodeURIComponent(query)}`
    });
    if (!response.ok) {
      return [];
    }
    const payload = (await response.json()) as { elements?: OverpassElement[] };
    const elements = Array.isArray(payload.elements) ? payload.elements : [];
    return elements
      .map((element) => {
        const tags = element.tags ?? {};
        const latitude = element.lat ?? element.center?.lat;
        const longitude = element.lon ?? element.center?.lon;
        if (latitude == null || longitude == null || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null;
        }
        const houseNumber = (tags["addr:housenumber"] || tags["addr:housename"] || "").trim();
        const street = (tags["addr:street"] || tags["addr:place"] || "").trim();
        const pc = (tags["addr:postcode"] || formatted).trim();
        if (!houseNumber && !street) {
          return null;
        }
        return toAddressOption(
          houseNumber,
          street,
          pc,
          latitude,
          longitude,
          undefined,
          tags["addr:city"] || tags["addr:town"] || tags["addr:suburb"] || ""
        );
      })
      .filter((entry): entry is HomeAddressOption => Boolean(entry));
  } catch {
    return [];
  }
}

async function fetchAddressesFromNominatim(postcode: string): Promise<HomeAddressOption[]> {
  const formatted = formatUkPostcode(postcode);
  const results = [
    ...(await nominatimSearch({ postalcode: formatted, country: "United Kingdom" })),
    ...(await nominatimSearch({ q: `${formatted}, United Kingdom` }))
  ];
  return results
    .map((entry) => optionFromNominatim(entry, formatted))
    .filter((entry): entry is HomeAddressOption => Boolean(entry));
}

/**
 * Validate a UK postcode and return the area (street/locality + centroid).
 */
export async function lookupPostcodeArea(postcode: string): Promise<{
  area?: PostcodeArea;
  error?: string;
}> {
  if (!isLikelyUkPostcode(postcode)) {
    return { error: "Enter a full UK postcode." };
  }

  const validated = await lookupUkPostcode(postcode);
  if (!validated) {
    return { error: "That postcode was not found. Check it and try again." };
  }

  const reverse = await nominatimReverse(validated.latitude, validated.longitude);
  const street = streetFromNominatim(reverse);
  const locality = localityFromNominatim(reverse);
  const summaryParts = [street, locality, validated.postcode].filter(Boolean);

  return {
    area: {
      postcode: validated.postcode,
      latitude: validated.latitude,
      longitude: validated.longitude,
      street,
      locality,
      summary: summaryParts.join(", ")
    }
  };
}

/**
 * Look up a UK postcode and return addresses in that postcode for the user to pick from.
 */
export async function searchAddressesForPostcode(postcode: string): Promise<{
  postcode: string;
  addresses: HomeAddressOption[];
  area?: PostcodeArea;
  error?: string;
}> {
  const areaResult = await lookupPostcodeArea(postcode);
  if (!areaResult.area) {
    return {
      postcode: formatUkPostcode(postcode),
      addresses: [],
      error: areaResult.error
    };
  }

  const area = areaResult.area;
  const fromOverpass = await fetchAddressesFromOverpass(area.postcode);
  const fromNominatim = fromOverpass.length >= 3 ? [] : await fetchAddressesFromNominatim(area.postcode);
  const addresses = dedupeAddresses([...fromOverpass, ...fromNominatim]);

  if (!addresses.length) {
    // Always offer the postcode centre so leaving reminders can still be set.
    return {
      postcode: area.postcode,
      area,
      addresses: [
        toAddressOption(
          "",
          area.street || "Postcode centre",
          area.postcode,
          area.latitude,
          area.longitude,
          area.summary,
          area.locality
        )
      ]
    };
  }

  return {
    postcode: area.postcode,
    area,
    addresses
  };
}

export function filterAddressesByHouseNumber(addresses: HomeAddressOption[], houseNumber: string) {
  const needle = houseNumber.trim().replace(/\s+/g, "").toLowerCase();
  if (!needle) {
    return addresses;
  }
  return addresses.filter((entry) => {
    const haystack = `${entry.houseNumber} ${entry.label} ${entry.address}`
      .replace(/\s+/g, "")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

async function geocodeWithDevice(query: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const results = await Location.geocodeAsync(query);
    const first = results[0];
    if (!first) {
      return null;
    }
    if (Number.isNaN(first.latitude) || Number.isNaN(first.longitude)) {
      return null;
    }
    return { latitude: first.latitude, longitude: first.longitude };
  } catch {
    return null;
  }
}

function matchesHouseNumber(candidate: string | undefined, houseNumber: string) {
  if (!candidate) {
    return false;
  }
  const a = candidate.replace(/\s+/g, "").toLowerCase();
  const b = houseNumber.replace(/\s+/g, "").toLowerCase();
  return a === b || a.startsWith(b) || b.startsWith(a);
}

/**
 * Resolve a house number at a known postcode (fallback when list search is empty).
 */
export async function resolveHouseAtPostcode(
  houseNumber: string,
  postcode: string,
  knownArea?: PostcodeArea | null
): Promise<{ address?: HomeAddressOption; error?: string }> {
  const number = houseNumber.trim();
  if (!number) {
    return { error: "Enter a house number or name." };
  }

  const areaResult = knownArea ? { area: knownArea } : await lookupPostcodeArea(postcode);
  if (!areaResult.area) {
    return { error: areaResult.error ?? "Enter a valid UK postcode." };
  }

  const area = areaResult.area;
  const queries = [
    `${number} ${area.street} ${area.postcode}`.replace(/\s+/g, " ").trim(),
    `${number}, ${area.postcode}`,
    `${number} ${area.postcode}`
  ].filter((query, index, all) => all.indexOf(query) === index);

  for (const query of queries) {
    const device = await geocodeWithDevice(query);
    if (device) {
      return {
        address: toAddressOption(
          number,
          area.street,
          area.postcode,
          device.latitude,
          device.longitude,
          [number, area.street, area.locality, area.postcode].filter(Boolean).join(", "),
          area.locality
        )
      };
    }
  }

  const nominatimQueries: Record<string, string>[] = [
    { q: `${number}, ${area.street}, ${area.postcode}, UK` },
    { street: `${number} ${area.street}`.trim(), postalcode: area.postcode },
    { q: `${number}, ${area.postcode}, UK` }
  ];

  for (const params of nominatimQueries) {
    const results = await nominatimSearch(params);
    const match =
      results.find((entry) =>
        matchesHouseNumber(entry.address?.house_number || entry.address?.house_name, number)
      ) ?? results[0];
    if (!match) {
      continue;
    }
    const option = optionFromNominatim(match, area.postcode);
    if (option) {
      return { address: option };
    }
  }

  const places = await searchPlaces(`${number} ${area.postcode}`);
  const place = places[0] as PlaceResult | undefined;
  if (place) {
    return {
      address: toAddressOption(
        number,
        area.street || place.label,
        area.postcode,
        place.latitude,
        place.longitude,
        place.address,
        area.locality
      )
    };
  }

  return {
    address: toAddressOption(
      number,
      area.street,
      area.postcode,
      area.latitude,
      area.longitude,
      [number, area.street, area.locality, area.postcode].filter(Boolean).join(", "),
      area.locality
    )
  };
}

/** @deprecated Prefer resolveHouseAtPostcode. */
export async function lookupHouseAtPostcode(houseNumber: string, postcode: string): Promise<{
  address?: HomeAddressOption;
  error?: string;
}> {
  return resolveHouseAtPostcode(houseNumber, postcode);
}
