import type { NudgeLocation } from "../types/nudge";

export type TravelEstimate = {
  minutes: number;
  /** Raw driving seconds from the router before rounding. */
  durationSeconds: number;
  source: "osrm";
};

function hasCoords(location?: NudgeLocation) {
  return location?.latitude != null && location?.longitude != null;
}

/** Round up to the next 5 minutes so leave time stays a little generous. */
export function roundTravelMinutesUp(durationSeconds: number) {
  const minutes = Math.max(1, Math.ceil(durationSeconds / 60));
  return Math.max(5, Math.ceil(minutes / 5) * 5);
}

/**
 * Estimate driving time between two places (OSRM public router).
 * Returns undefined when coordinates are missing or the route fails.
 */
export async function estimateDrivingTravel(
  from?: NudgeLocation,
  to?: NudgeLocation
): Promise<TravelEstimate | undefined> {
  if (!hasCoords(from) || !hasCoords(to) || !from || !to) {
    return undefined;
  }

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
    `?overview=false`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "NudgeMeReady/1.0"
    }
  });

  if (!response.ok) {
    return undefined;
  }

  const data = (await response.json()) as {
    code?: string;
    routes?: Array<{ duration?: number }>;
  };

  const durationSeconds = data.routes?.[0]?.duration;
  if (data.code !== "Ok" || durationSeconds == null || !Number.isFinite(durationSeconds)) {
    return undefined;
  }

  return {
    minutes: roundTravelMinutesUp(durationSeconds),
    durationSeconds,
    source: "osrm"
  };
}
