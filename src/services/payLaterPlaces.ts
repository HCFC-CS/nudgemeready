import { distanceMeters } from "./homeSettingsStorage";

export type PayLaterPlaceKind = "toll" | "drive_away_parking" | "congestion_zone";

export type PayLaterPlace = {
  id: string;
  name: string;
  kind: PayLaterPlaceKind;
  /** Short calm label for notifications */
  shortLabel: string;
  latitude: number;
  longitude: number;
  /** Metres — wide enough for a crossing, airport zone, or city charge area sample */
  radiusMeters: number;
  payUrl: string;
  /** Optional phone for pay-by-phone services */
  payPhone?: string;
  note?: string;
};

/** Keep background geofences under the OS region limit (leaving-home uses some too). */
export const PAY_LATER_MAX_GEOFENCE_REGIONS = 12;

/**
 * Known UK tolls, barrierless / drive-away parking, congestion and clean-air charge zones.
 * Coordinates are approximate centre / gateway points for GPS proximity (not legal boundaries).
 */
export const PAY_LATER_PLACES: PayLaterPlace[] = [
  {
    id: "toll-dartford",
    name: "Dartford Crossing (Dart Charge)",
    shortLabel: "the Dartford Crossing",
    kind: "toll",
    latitude: 51.4647,
    longitude: 0.2588,
    radiusMeters: 900,
    payUrl: "https://www.gov.uk/pay-dartford-crossing-charge",
    note: "Pay by midnight the day after you cross."
  },
  {
    id: "toll-mersey-gateway",
    name: "Mersey Gateway / Merseyflow",
    shortLabel: "Mersey Gateway",
    kind: "toll",
    latitude: 53.3548,
    longitude: -2.7549,
    radiusMeters: 800,
    payUrl: "https://www.merseyflow.co.uk/",
    note: "Pay online or set up an account so charges are taken automatically."
  },
  {
    id: "toll-mersey-tunnels",
    name: "Mersey Tunnels (Merseyflow)",
    shortLabel: "the Mersey Tunnels",
    kind: "toll",
    latitude: 53.4069,
    longitude: -3.0026,
    radiusMeters: 700,
    payUrl: "https://www.merseyflow.co.uk/"
  },
  {
    id: "toll-m6",
    name: "M6 Toll",
    shortLabel: "the M6 Toll",
    kind: "toll",
    latitude: 52.635,
    longitude: -1.85,
    radiusMeters: 1200,
    payUrl: "https://www.m6toll.co.uk/"
  },
  {
    id: "toll-tyne-tunnel",
    name: "Tyne Tunnel",
    shortLabel: "the Tyne Tunnel",
    kind: "toll",
    latitude: 54.9882,
    longitude: -1.4725,
    radiusMeters: 700,
    payUrl: "https://www.tt2.co.uk/"
  },
  {
    id: "toll-humber-bridge",
    name: "Humber Bridge",
    shortLabel: "the Humber Bridge",
    kind: "toll",
    latitude: 53.7069,
    longitude: -0.4502,
    radiusMeters: 700,
    payUrl: "https://www.humberbridge.co.uk/"
  },
  {
    id: "toll-silvertown",
    name: "Silvertown / Blackwall Tunnel charge",
    shortLabel: "the Silvertown Tunnel charge",
    kind: "toll",
    latitude: 51.5045,
    longitude: 0.0125,
    radiusMeters: 900,
    payUrl: "https://tfl.gov.uk/modes/driving/silvertown-tunnel"
  },
  {
    id: "parking-manchester-airport",
    name: "Manchester Airport (drive away & pay)",
    shortLabel: "Manchester Airport parking or drop-off",
    kind: "drive_away_parking",
    latitude: 53.3588,
    longitude: -2.2727,
    radiusMeters: 1200,
    payUrl: "https://pay.manchesterairport.co.uk/",
    payPhone: "0345 901 3318",
    note: "Barrierless ANPR — pay online by midnight the day after you leave."
  },
  {
    id: "parking-manchester-airport-t2",
    name: "Manchester Airport Terminal 2 (drive away & pay)",
    shortLabel: "Manchester Airport T2 parking or drop-off",
    kind: "drive_away_parking",
    latitude: 53.3595,
    longitude: -2.2928,
    radiusMeters: 900,
    payUrl: "https://pay.manchesterairport.co.uk/",
    payPhone: "0345 901 3318",
    note: "Includes barrierless Terminal 2 zones — same pay portal."
  },
  {
    id: "parking-heathrow-dropoff",
    name: "Heathrow drop-off / pick-up (pay later)",
    shortLabel: "Heathrow drop-off or pick-up",
    kind: "drive_away_parking",
    latitude: 51.47,
    longitude: -0.4543,
    radiusMeters: 1400,
    payUrl: "https://www.heathrow.com/transport-and-directions/heathrow-drop-off",
    note: "Check the official Heathrow page for current pay-later rules."
  },
  {
    id: "parking-gatwick-dropoff",
    name: "Gatwick drop-off / pick-up (pay later)",
    shortLabel: "Gatwick drop-off or pick-up",
    kind: "drive_away_parking",
    latitude: 51.1537,
    longitude: -0.1821,
    radiusMeters: 1100,
    payUrl: "https://www.gatwickairport.com/at-the-airport/parking-and-transport/drop-off-and-pick-up/"
  },
  {
    id: "parking-stansted-dropoff",
    name: "Stansted drop-off / pick-up (pay later)",
    shortLabel: "Stansted drop-off or pick-up",
    kind: "drive_away_parking",
    latitude: 51.886,
    longitude: 0.2389,
    radiusMeters: 1100,
    payUrl: "https://www.stanstedairport.com/getting-to-and-from/parking/drop-off-and-pick-up/"
  },
  {
    id: "zone-london-congestion",
    name: "London Congestion Charge",
    shortLabel: "the London Congestion Charge zone",
    kind: "congestion_zone",
    latitude: 51.5122,
    longitude: -0.122,
    radiusMeters: 2800,
    payUrl: "https://tfl.gov.uk/modes/driving/pay-to-drive-in-london",
    note: "Pay via TfL by midnight on the third charging day after travel, or set up Auto Pay."
  },
  {
    id: "zone-london-ulez-central",
    name: "London ULEZ (central)",
    shortLabel: "London’s Ultra Low Emission Zone",
    kind: "congestion_zone",
    latitude: 51.5074,
    longitude: -0.1278,
    radiusMeters: 4500,
    payUrl: "https://tfl.gov.uk/modes/driving/pay-to-drive-in-london",
    note: "Same TfL pay portal as Congestion Charge. Only needed if your vehicle does not meet ULEZ standards."
  },
  {
    id: "zone-london-ulez-north",
    name: "London ULEZ (north gateway)",
    shortLabel: "London’s Ultra Low Emission Zone",
    kind: "congestion_zone",
    latitude: 51.592,
    longitude: -0.135,
    radiusMeters: 3500,
    payUrl: "https://tfl.gov.uk/modes/driving/pay-to-drive-in-london",
    note: "ULEZ covers most of Greater London. Pay via TfL if your vehicle is charged."
  },
  {
    id: "zone-london-ulez-south",
    name: "London ULEZ (south gateway)",
    shortLabel: "London’s Ultra Low Emission Zone",
    kind: "congestion_zone",
    latitude: 51.43,
    longitude: -0.12,
    radiusMeters: 3500,
    payUrl: "https://tfl.gov.uk/modes/driving/pay-to-drive-in-london"
  },
  {
    id: "zone-london-ulez-east",
    name: "London ULEZ (east gateway)",
    shortLabel: "London’s Ultra Low Emission Zone",
    kind: "congestion_zone",
    latitude: 51.52,
    longitude: 0.05,
    radiusMeters: 3500,
    payUrl: "https://tfl.gov.uk/modes/driving/pay-to-drive-in-london"
  },
  {
    id: "zone-london-ulez-west",
    name: "London ULEZ (west gateway)",
    shortLabel: "London’s Ultra Low Emission Zone",
    kind: "congestion_zone",
    latitude: 51.51,
    longitude: -0.3,
    radiusMeters: 3500,
    payUrl: "https://tfl.gov.uk/modes/driving/pay-to-drive-in-london"
  },
  {
    id: "zone-birmingham-caz",
    name: "Birmingham Clean Air Zone",
    shortLabel: "Birmingham’s Clean Air Zone",
    kind: "congestion_zone",
    latitude: 52.4796,
    longitude: -1.9026,
    radiusMeters: 2200,
    payUrl: "https://www.gov.uk/clean-air-zones",
    payPhone: "0300 029 8888",
    note: "Check and pay on GOV.UK if your vehicle is charged."
  },
  {
    id: "zone-bristol-caz",
    name: "Bristol Clean Air Zone",
    shortLabel: "Bristol’s Clean Air Zone",
    kind: "congestion_zone",
    latitude: 51.4545,
    longitude: -2.5879,
    radiusMeters: 2000,
    payUrl: "https://www.gov.uk/clean-air-zones",
    payPhone: "0300 029 8888"
  },
  {
    id: "zone-bath-caz",
    name: "Bath Clean Air Zone",
    shortLabel: "Bath’s Clean Air Zone",
    kind: "congestion_zone",
    latitude: 51.3811,
    longitude: -2.359,
    radiusMeters: 1600,
    payUrl: "https://www.gov.uk/clean-air-zones",
    payPhone: "0300 029 8888"
  },
  {
    id: "zone-bradford-caz",
    name: "Bradford Clean Air Zone",
    shortLabel: "Bradford’s Clean Air Zone",
    kind: "congestion_zone",
    latitude: 53.796,
    longitude: -1.7594,
    radiusMeters: 2000,
    payUrl: "https://www.gov.uk/clean-air-zones",
    payPhone: "0300 029 8888"
  },
  {
    id: "zone-sheffield-caz",
    name: "Sheffield Clean Air Zone",
    shortLabel: "Sheffield’s Clean Air Zone",
    kind: "congestion_zone",
    latitude: 53.3811,
    longitude: -1.4701,
    radiusMeters: 2000,
    payUrl: "https://www.gov.uk/clean-air-zones",
    payPhone: "0300 029 8888"
  },
  {
    id: "zone-tyneside-caz",
    name: "Tyneside Clean Air Zone",
    shortLabel: "the Tyneside Clean Air Zone",
    kind: "congestion_zone",
    latitude: 54.973,
    longitude: -1.613,
    radiusMeters: 2200,
    payUrl: "https://www.gov.uk/clean-air-zones",
    payPhone: "0300 029 8888",
    note: "Covers Newcastle and Gateshead charging areas."
  },
  {
    id: "zone-portsmouth-caz",
    name: "Portsmouth Clean Air Zone",
    shortLabel: "Portsmouth’s Clean Air Zone",
    kind: "congestion_zone",
    latitude: 50.7989,
    longitude: -1.091,
    radiusMeters: 1600,
    payUrl: "https://www.gov.uk/clean-air-zones",
    payPhone: "0300 029 8888"
  },
  {
    id: "zone-glasgow-lez",
    name: "Glasgow Low Emission Zone",
    shortLabel: "Glasgow’s Low Emission Zone",
    kind: "congestion_zone",
    latitude: 55.8609,
    longitude: -4.2514,
    radiusMeters: 1800,
    payUrl: "https://www.lowemissionzones.scot/",
    note: "Scotland LEZ — check if your vehicle needs to pay."
  },
  {
    id: "zone-edinburgh-lez",
    name: "Edinburgh Low Emission Zone",
    shortLabel: "Edinburgh’s Low Emission Zone",
    kind: "congestion_zone",
    latitude: 55.9533,
    longitude: -3.1883,
    radiusMeters: 1800,
    payUrl: "https://www.lowemissionzones.scot/"
  },
  {
    id: "zone-aberdeen-lez",
    name: "Aberdeen Low Emission Zone",
    shortLabel: "Aberdeen’s Low Emission Zone",
    kind: "congestion_zone",
    latitude: 57.1497,
    longitude: -2.0943,
    radiusMeters: 1600,
    payUrl: "https://www.lowemissionzones.scot/"
  },
  {
    id: "zone-dundee-lez",
    name: "Dundee Low Emission Zone",
    shortLabel: "Dundee’s Low Emission Zone",
    kind: "congestion_zone",
    latitude: 56.462,
    longitude: -2.9707,
    radiusMeters: 1500,
    payUrl: "https://www.lowemissionzones.scot/"
  }
];

export const PAY_LATER_REMINDER_HOURS = [6, 12, 18] as const;
export type PayLaterReminderHour = (typeof PAY_LATER_REMINDER_HOURS)[number];

/** Do not re-arm the same place within this window (covers the 18h reminder span). */
export const PAY_LATER_RETRIGGER_COOLDOWN_MS = 20 * 60 * 60 * 1000;

/** After user says “No”, wait before asking again (tolls / parking). */
export const PAY_LATER_DECLINE_COOLDOWN_MS = 20 * 60 * 60 * 1000;

/** Longer quiet period for charge zones so residents are not asked every day. */
export const PAY_LATER_DECLINE_COOLDOWN_ZONE_MS = 7 * 24 * 60 * 60 * 1000;

/** Shared cooldown key for London ULEZ gateway samples — one visit should not fire five sets. */
const PLACE_COOLDOWN_ALIASES: Record<string, string> = {
  "zone-london-ulez-central": "zone-london-ulez",
  "zone-london-ulez-north": "zone-london-ulez",
  "zone-london-ulez-south": "zone-london-ulez",
  "zone-london-ulez-east": "zone-london-ulez",
  "zone-london-ulez-west": "zone-london-ulez"
};

export function payLaterCooldownKey(placeId: string) {
  return PLACE_COOLDOWN_ALIASES[placeId] ?? placeId;
}

export function canArmPayLaterPlace(
  placeId: string,
  lastArmedAtByPlaceId: Record<string, string>,
  now = Date.now()
) {
  const key = payLaterCooldownKey(placeId);
  const last = lastArmedAtByPlaceId[key] ?? lastArmedAtByPlaceId[placeId];
  if (!last) {
    return true;
  }
  const lastMs = Date.parse(last);
  if (!Number.isFinite(lastMs)) {
    return true;
  }
  return now - lastMs >= PAY_LATER_RETRIGGER_COOLDOWN_MS;
}

/** After a Yes/No ask, do not re-ask the same place too soon. */
export function canPromptPayLaterPlace(
  placeId: string,
  opts: {
    lastArmedAtByPlaceId?: Record<string, string>;
    lastPromptedAtByPlaceId?: Record<string, string>;
    lastDeclinedAtByPlaceId?: Record<string, string>;
    kind?: PayLaterPlaceKind;
  },
  now = Date.now()
) {
  if (!canArmPayLaterPlace(placeId, opts.lastArmedAtByPlaceId ?? {}, now)) {
    return false;
  }

  const key = payLaterCooldownKey(placeId);
  const lastPrompted =
    opts.lastPromptedAtByPlaceId?.[key] ?? opts.lastPromptedAtByPlaceId?.[placeId];
  if (lastPrompted) {
    const promptedMs = Date.parse(lastPrompted);
    if (Number.isFinite(promptedMs) && now - promptedMs < PAY_LATER_RETRIGGER_COOLDOWN_MS) {
      return false;
    }
  }

  const lastDeclined =
    opts.lastDeclinedAtByPlaceId?.[key] ?? opts.lastDeclinedAtByPlaceId?.[placeId];
  if (lastDeclined) {
    const declinedMs = Date.parse(lastDeclined);
    const declineWindow =
      opts.kind === "congestion_zone"
        ? PAY_LATER_DECLINE_COOLDOWN_ZONE_MS
        : PAY_LATER_DECLINE_COOLDOWN_MS;
    if (Number.isFinite(declinedMs) && now - declinedMs < declineWindow) {
      return false;
    }
  }

  return true;
}

export function getPayLaterPlace(id: string) {
  return PAY_LATER_PLACES.find((place) => place.id === id);
}

export function payLaterKindLabel(kind: PayLaterPlaceKind) {
  if (kind === "toll") {
    return "Toll";
  }
  if (kind === "drive_away_parking") {
    return "Drive-away parking";
  }
  return "Congestion / clean air";
}

export function buildPayLaterConfirmQuestion(place: PayLaterPlace) {
  if (place.kind === "toll") {
    return `GPS thinks you may have used ${place.shortLabel}. Did you?`;
  }
  if (place.kind === "congestion_zone") {
    return `GPS thinks you may have been in ${place.shortLabel}. Were you there?`;
  }
  return `GPS thinks you may have used ${place.shortLabel}. Did you?`;
}

export function buildPayLaterConfirmTitle(place: PayLaterPlace) {
  if (place.kind === "toll") {
    return "Were you on this toll?";
  }
  if (place.kind === "congestion_zone") {
    return "Have you visited this charge zone?";
  }
  return "Did you use this pay-later parking?";
}

export function buildPayLaterConfirmBody(place: PayLaterPlace) {
  return `${buildPayLaterConfirmQuestion(place)} Tap Yes only if you did — then we’ll nudge you gently later to pay. No daily reminders for places you didn’t use.`;
}

export function buildPayLaterConfirmSpeech(place: PayLaterPlace) {
  return `${buildPayLaterConfirmTitle(place)} ${buildPayLaterConfirmQuestion(place)} You can say yes if you used it, or no thanks if you didn’t.`;
}

export function findPayLaterPlacesNear(
  latitude: number,
  longitude: number,
  places: PayLaterPlace[] = PAY_LATER_PLACES
) {
  return places
    .map((place) => ({
      place,
      distance: distanceMeters(latitude, longitude, place.latitude, place.longitude)
    }))
    .filter(({ place, distance }) => distance <= place.radiusMeters)
    .sort((a, b) => a.distance - b.distance);
}

/** Nearest places for background geofencing (OS region limit). */
export function selectPayLaterPlacesForGeofence(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
  places: PayLaterPlace[] = PAY_LATER_PLACES,
  limit = PAY_LATER_MAX_GEOFENCE_REGIONS
) {
  // Without a fix, do not register arbitrary far-away places (avoids noisy false visits).
  if (latitude == null || longitude == null || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return [];
  }
  return [...places]
    .map((place) => ({
      place,
      distance: distanceMeters(latitude, longitude, place.latitude, place.longitude)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ place }) => place);
}

export function buildPayLaterSpeechText(place: PayLaterPlace, hours: PayLaterReminderHour) {
  let kindPhrase: string;
  if (place.kind === "toll") {
    kindPhrase = `If you used ${place.shortLabel}, you may still need to pay the toll.`;
  } else if (place.kind === "congestion_zone") {
    kindPhrase = `If you drove in ${place.shortLabel}, you may still need to pay a daily charge.`;
  } else {
    kindPhrase = `If you used ${place.shortLabel}, you may still need to pay for parking or drop-off.`;
  }
  return `${hours} hour reminder. ${kindPhrase} You can pay online when you are ready. No rush — just a gentle nudge.`;
}

export function buildPayLaterNotificationBody(place: PayLaterPlace, hours: PayLaterReminderHour) {
  const tip = place.note ? ` ${place.note}` : "";
  return `${hours}h after visiting ${place.shortLabel}: pay online if you still need to.${tip}`;
}

export function buildPayLaterNotificationTitle(place: PayLaterPlace) {
  if (place.kind === "toll") {
    return "Toll payment nudge";
  }
  if (place.kind === "congestion_zone") {
    return "Zone charge nudge";
  }
  return "Parking payment nudge";
}

export function geofenceRegionsForPayLater(places: PayLaterPlace[] = PAY_LATER_PLACES) {
  return places.map((place) => ({
    identifier: place.id,
    latitude: place.latitude,
    longitude: place.longitude,
    radius: Math.min(place.radiusMeters, 5000),
    notifyOnEnter: true,
    notifyOnExit: true
  }));
}
