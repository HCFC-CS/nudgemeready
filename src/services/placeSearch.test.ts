import { describe, expect, it } from "vitest";

import { buildDirectionsUrl, buildMapsPlaceUrl, buildWazeUrl } from "./placeSearch";
import type { NudgeLocation } from "../types/nudge";

const withCoords: NudgeLocation = {
  label: "AO Arena",
  address: "AO Arena, Manchester",
  latitude: 53.4855,
  longitude: -2.2399
};

const textOnly: NudgeLocation = {
  label: "AO Arena Manchester",
  address: "AO Arena Manchester"
};

describe("buildDirectionsUrl", () => {
  it("builds Apple Maps directions on iOS", () => {
    expect(buildDirectionsUrl(withCoords, "ios")).toBe(
      "http://maps.apple.com/?daddr=53.4855,-2.2399&dirflg=d"
    );
  });

  it("builds Google directions elsewhere", () => {
    expect(buildDirectionsUrl(withCoords, "android")).toContain(
      "google.com/maps/dir/?api=1&destination=53.4855,-2.2399"
    );
  });

  it("encodes address when there are no coordinates", () => {
    expect(buildDirectionsUrl(textOnly, "android")).toContain(
      encodeURIComponent("AO Arena Manchester")
    );
  });
});

describe("buildWazeUrl", () => {
  it("navigates by coordinates when available", () => {
    expect(buildWazeUrl(withCoords)).toBe(
      "https://waze.com/ul?ll=53.4855,-2.2399&navigate=yes"
    );
  });

  it("falls back to a place query", () => {
    expect(buildWazeUrl(textOnly)).toBe(
      "https://waze.com/ul?q=AO%20Arena%20Manchester&navigate=yes"
    );
  });
});

describe("buildMapsPlaceUrl", () => {
  it("uses Apple Maps pin on iOS", () => {
    expect(buildMapsPlaceUrl(withCoords, "ios")).toContain("maps:0,0?q=");
    expect(buildMapsPlaceUrl(withCoords, "ios")).toContain("53.4855,-2.2399");
  });
});
