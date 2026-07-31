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

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  type?: string;
  class?: string;
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

const NOMINATIM_HEADERS = {
  Accept: "application/json",
  "User-Agent": "NudgeMeReady/1.0 (home-address-lookup)"
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

function toAddressOption(result: NominatimResult, fallbackPostcode: string): HomeAddressOption | null {
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  const houseNumber = (result.address?.house_number || result.address?.house_name || "").trim();
  const street =
    result.address?.road?.trim() ||
    result.address?.residential?.trim() ||
    result.name?.trim() ||
    "";
  const postcode = (result.address?.postcode || fallbackPostcode).trim();
  const labelParts = [houseNumber, street].filter(Boolean);
  const label = labelParts.join(" ") || result.display_name.split(",")[0]?.trim() || postcode;

  return {
    houseNumber: houseNumber || label,
    street,
    label,
    address: result.display_name,
    postcode: formatUkPostcode(postcode),
    latitude,
    longitude
  };
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
    return (await response.json()) as NominatimResult[];
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

function dedupeAddresses(options: HomeAddressOption[]) {
  const seen = new Set<string>();
  const unique: HomeAddressOption[] = [];
  for (const option of options) {
    const key = `${option.houseNumber.toLowerCase()}|${option.street.toLowerCase()}|${option.postcode}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(option);
  }
  return unique.sort((a, b) => a.houseNumber.localeCompare(b.houseNumber, undefined, { numeric: true }));
}

function preferHouseResults(options: HomeAddressOption[]) {
  const withNumbers = options.filter((entry) => /\d/.test(entry.houseNumber));
  return withNumbers.length ? withNumbers : options;
}

export async function searchAddressesForPostcode(postcode: string): Promise<{
  postcode: string;
  addresses: HomeAddressOption[];
  error?: string;
}> {
  const validated = await lookupUkPostcode(postcode);
  if (!validated) {
    return { postcode: formatUkPostcode(postcode), addresses: [], error: "Enter a valid UK postcode." };
  }

  const formatted = validated.postcode;
  const compact = formatted.replace(/\s+/g, "");

  const [byPostal, byQuery, byUkQuery, byAddressLayer] = await Promise.all([
    nominatimSearch({ postalcode: formatted }),
    nominatimSearch({ q: formatted }),
    nominatimSearch({ q: `${formatted}, United Kingdom` }),
    nominatimSearch({ q: compact, layer: "address" })
  ]);

  const reverse = await nominatimReverse(validated.latitude, validated.longitude);
  const combined = [...byPostal, ...byQuery, ...byUkQuery, ...byAddressLayer, ...(reverse ? [reverse] : [])]
    .map((result) => toAddressOption(result, formatted))
    .filter((entry): entry is HomeAddressOption => Boolean(entry))
    .filter((entry) => {
      const optionPostcode = entry.postcode.replace(/\s+/g, "").toUpperCase();
      return !optionPostcode || optionPostcode === compact;
    });

  const addresses = preferHouseResults(dedupeAddresses(combined));
  return { postcode: formatted, addresses };
}

export async function lookupHouseAtPostcode(houseNumber: string, postcode: string): Promise<{
  address?: HomeAddressOption;
  error?: string;
}> {
  const number = houseNumber.trim();
  const validated = await lookupUkPostcode(postcode);
  if (!validated) {
    return { error: "Enter a valid UK postcode." };
  }
  if (!number) {
    return { error: "Enter a house number." };
  }

  const formatted = validated.postcode;
  const [direct, streeted, places] = await Promise.all([
    nominatimSearch({ q: `${number}, ${formatted}, UK` }),
    nominatimSearch({ street: number, postalcode: formatted }),
    searchPlaces(`${number} ${formatted}`)
  ]);

  const mapped = [...direct, ...streeted]
    .map((result) => toAddressOption(result, formatted))
    .filter((entry): entry is HomeAddressOption => Boolean(entry));

  const normalizedNumber = number.replace(/\s+/g, "").toLowerCase();
  const exact = mapped.find(
    (entry) => entry.houseNumber.replace(/\s+/g, "").toLowerCase() === normalizedNumber
  );
  if (exact) {
    return { address: exact };
  }
  if (mapped[0]) {
    return { address: { ...mapped[0], houseNumber: number, label: `${number} ${mapped[0].street}`.trim() } };
  }

  const place = places[0] as PlaceResult | undefined;
  if (!place) {
    return { error: "No address found for that house number." };
  }

  return {
    address: {
      houseNumber: number,
      street: place.label,
      label: `${number} ${place.label}`.trim(),
      address: place.address,
      postcode: formatted,
      latitude: place.latitude,
      longitude: place.longitude
    }
  };
}

export function filterAddressesByHouseNumber(addresses: HomeAddressOption[], houseNumber: string) {
  const needle = houseNumber.trim().replace(/\s+/g, "").toLowerCase();
  if (!needle) {
    return addresses;
  }
  return addresses.filter((entry) => entry.houseNumber.replace(/\s+/g, "").toLowerCase().startsWith(needle));
}
