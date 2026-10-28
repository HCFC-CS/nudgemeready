import { describe, expect, it } from "vitest";

import {
  buildPayLaterConfirmQuestion,
  buildPayLaterConfirmTitle,
  buildPayLaterSpeechText,
  canArmPayLaterPlace,
  canPromptPayLaterPlace,
  findPayLaterPlacesNear,
  getPayLaterPlace,
  PAY_LATER_DECLINE_COOLDOWN_ZONE_MS,
  PAY_LATER_PLACES,
  PAY_LATER_REMINDER_HOURS,
  payLaterCooldownKey,
  payLaterKindLabel,
  selectPayLaterPlacesForGeofence
} from "./payLaterPlaces";

describe("payLaterPlaces", () => {
  it("includes Manchester Airport drive-away pay portal", () => {
    const man = getPayLaterPlace("parking-manchester-airport");
    expect(man?.kind).toBe("drive_away_parking");
    expect(man?.payUrl).toContain("pay.manchesterairport.co.uk");
    expect(PAY_LATER_REMINDER_HOURS).toEqual([6, 12, 18]);
  });

  it("includes major UK tolls", () => {
    expect(getPayLaterPlace("toll-dartford")?.kind).toBe("toll");
    expect(getPayLaterPlace("toll-mersey-gateway")?.payUrl).toContain("merseyflow");
  });

  it("includes congestion and clean air zones", () => {
    const congestion = getPayLaterPlace("zone-london-congestion");
    expect(congestion?.kind).toBe("congestion_zone");
    expect(congestion?.payUrl).toContain("tfl.gov.uk");
    expect(getPayLaterPlace("zone-birmingham-caz")?.payUrl).toContain("clean-air-zones");
    expect(getPayLaterPlace("zone-glasgow-lez")?.payUrl).toContain("lowemissionzones.scot");
    expect(payLaterKindLabel("congestion_zone")).toMatch(/Congestion/i);
  });

  it("shares cooldown across London ULEZ gateway samples", () => {
    expect(payLaterCooldownKey("zone-london-ulez-north")).toBe("zone-london-ulez");
    expect(payLaterCooldownKey("zone-london-congestion")).toBe("zone-london-congestion");
  });

  it("finds nearby places within radius", () => {
    const man = getPayLaterPlace("parking-manchester-airport")!;
    const near = findPayLaterPlacesNear(man.latitude, man.longitude);
    expect(near.some(({ place }) => place.id === man.id)).toBe(true);

    const far = findPayLaterPlacesNear(51.5, -0.12);
    expect(far.some(({ place }) => place.id === man.id)).toBe(false);
  });

  it("selects nearest places for geofencing only when location is known", () => {
    expect(selectPayLaterPlacesForGeofence(null, null, PAY_LATER_PLACES, 5)).toEqual([]);
    const selected = selectPayLaterPlacesForGeofence(51.51, -0.12, PAY_LATER_PLACES, 5);
    expect(selected).toHaveLength(5);
    expect(selected.some((place) => place.id.includes("london"))).toBe(true);
  });

  it("asks a calm confirm question before pay reminders", () => {
    const toll = getPayLaterPlace("toll-dartford")!;
    expect(buildPayLaterConfirmTitle(toll)).toMatch(/toll/i);
    expect(buildPayLaterConfirmQuestion(toll)).toMatch(/Dartford/i);
    expect(buildPayLaterConfirmQuestion(toll).toLowerCase()).not.toMatch(/forgot|fine|penalty/);

    const zone = getPayLaterPlace("zone-london-congestion")!;
    expect(buildPayLaterConfirmTitle(zone)).toMatch(/charge zone/i);
    expect(buildPayLaterConfirmQuestion(zone)).toMatch(/Congestion Charge/i);
  });

  it("builds warm non-shaming speech for zones", () => {
    const place = getPayLaterPlace("zone-london-congestion")!;
    const text = buildPayLaterSpeechText(place, 12);
    expect(text).toMatch(/12 hour/i);
    expect(text).toMatch(/daily charge/i);
    expect(text.toLowerCase()).not.toMatch(/forgot|late|penalty|fine/);
    expect(text).toMatch(/gentle nudge/i);
  });
});

describe("canArmPayLaterPlace", () => {
  it("allows first arm and blocks within cooldown", () => {
    expect(canArmPayLaterPlace("toll-dartford", {}, 1_000_000)).toBe(true);

    const lastArmed = {
      "toll-dartford": new Date(1_000_000).toISOString()
    };
    expect(canArmPayLaterPlace("toll-dartford", lastArmed, 1_000_000 + 60 * 60 * 1000)).toBe(false);
    expect(canArmPayLaterPlace("toll-dartford", lastArmed, 1_000_000 + 21 * 60 * 60 * 1000)).toBe(true);
  });

  it("blocks sibling ULEZ gateways after one arm", () => {
    const lastArmed = {
      "zone-london-ulez": new Date(1_000_000).toISOString()
    };
    expect(canArmPayLaterPlace("zone-london-ulez-east", lastArmed, 1_000_000 + 60 * 60 * 1000)).toBe(
      false
    );
  });
});

describe("canPromptPayLaterPlace", () => {
  it("blocks re-ask after a recent prompt", () => {
    expect(
      canPromptPayLaterPlace(
        "toll-dartford",
        {
          lastPromptedAtByPlaceId: {
            "toll-dartford": new Date(1_000_000).toISOString()
          }
        },
        1_000_000 + 60 * 60 * 1000
      )
    ).toBe(false);
  });

  it("uses a longer quiet period after declining a charge zone", () => {
    const declinedAt = 1_000_000;
    expect(
      canPromptPayLaterPlace(
        "zone-london-congestion",
        {
          kind: "congestion_zone",
          lastDeclinedAtByPlaceId: {
            "zone-london-congestion": new Date(declinedAt).toISOString()
          }
        },
        declinedAt + 2 * 24 * 60 * 60 * 1000
      )
    ).toBe(false);
    expect(
      canPromptPayLaterPlace(
        "zone-london-congestion",
        {
          kind: "congestion_zone",
          lastDeclinedAtByPlaceId: {
            "zone-london-congestion": new Date(declinedAt).toISOString()
          }
        },
        declinedAt + PAY_LATER_DECLINE_COOLDOWN_ZONE_MS + 1
      )
    ).toBe(true);
  });
});
