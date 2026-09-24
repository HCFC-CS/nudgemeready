import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("expo-location", () => ({
  geocodeAsync: vi.fn(async () => [])
}));

vi.mock("./placeSearch", () => ({
  searchPlaces: vi.fn(async () => [])
}));

import {
  filterAddressesByHouseNumber,
  formatUkPostcode,
  isLikelyUkPostcode,
  lookupPostcodeArea,
  resolveHouseAtPostcode,
  searchAddressesForPostcode,
  type HomeAddressOption
} from "./homeAddressLookup";

describe("UK postcode helpers", () => {
  it("formats and validates UK postcodes", () => {
    expect(formatUkPostcode("l392dt")).toBe("L39 2DT");
    expect(isLikelyUkPostcode("L39 2DT")).toBe(true);
    expect(isLikelyUkPostcode("L39")).toBe(false);
  });
});

describe("lookupPostcodeArea", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an area from postcodes.io", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("api.postcodes.io")) {
          return {
            ok: true,
            json: async () => ({
              status: 200,
              result: { postcode: "L39 2DT", latitude: 53.57, longitude: -2.86 }
            })
          } as Response;
        }
        if (url.includes("nominatim.openstreetmap.org/reverse")) {
          return {
            ok: true,
            json: async () => ({
              display_name: "Greetby Hill, Ormskirk, L39 2DT",
              address: { road: "Greetby Hill", town: "Ormskirk", postcode: "L39 2DT" }
            })
          } as Response;
        }
        return { ok: false, json: async () => ({}) } as Response;
      })
    );

    const result = await lookupPostcodeArea("l392dt");
    expect(result.error).toBeUndefined();
    expect(result.area?.postcode).toBe("L39 2DT");
    expect(result.area?.street).toBe("Greetby Hill");
    expect(result.area?.summary).toContain("Greetby Hill");
  });

  it("rejects unknown postcodes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ status: 404, result: null })
      }) as unknown as typeof fetch)
    );

    const result = await lookupPostcodeArea("ZZ1 1ZZ");
    expect(result.area).toBeUndefined();
    expect(result.error).toMatch(/not found/i);
  });
});

describe("searchAddressesForPostcode", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a selectable address list for a postcode", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("api.postcodes.io")) {
          return {
            ok: true,
            json: async () => ({
              status: 200,
              result: { postcode: "L39 2DT", latitude: 53.57, longitude: -2.86 }
            })
          } as Response;
        }
        if (url.includes("nominatim.openstreetmap.org/reverse")) {
          return {
            ok: true,
            json: async () => ({
              display_name: "Greetby Hill, Ormskirk, L39 2DT",
              address: { road: "Greetby Hill", town: "Ormskirk", postcode: "L39 2DT" }
            })
          } as Response;
        }
        if (url.includes("overpass-api.de")) {
          expect(String(init?.body ?? "")).toContain("L39%202DT");
          return {
            ok: true,
            json: async () => ({
              elements: [
                {
                  type: "node",
                  lat: 53.571,
                  lon: -2.861,
                  tags: {
                    "addr:housenumber": "12",
                    "addr:street": "Greetby Hill",
                    "addr:postcode": "L39 2DT"
                  }
                },
                {
                  type: "node",
                  lat: 53.572,
                  lon: -2.862,
                  tags: {
                    "addr:housenumber": "14",
                    "addr:street": "Greetby Hill",
                    "addr:postcode": "L39 2DT"
                  }
                }
              ]
            })
          } as Response;
        }
        return { ok: true, json: async () => [] } as Response;
      })
    );

    const result = await searchAddressesForPostcode("l392dt");
    expect(result.error).toBeUndefined();
    expect(result.addresses).toHaveLength(2);
    expect(result.addresses[0]?.label).toBe("12 Greetby Hill");
    expect(result.addresses[1]?.label).toBe("14 Greetby Hill");
  });

  it("filters the address list by house number text", () => {
    const addresses: HomeAddressOption[] = [
      {
        houseNumber: "12",
        street: "Greetby Hill",
        label: "12 Greetby Hill",
        address: "12 Greetby Hill, L39 2DT",
        postcode: "L39 2DT",
        latitude: 1,
        longitude: 2
      },
      {
        houseNumber: "14",
        street: "Greetby Hill",
        label: "14 Greetby Hill",
        address: "14 Greetby Hill, L39 2DT",
        postcode: "L39 2DT",
        latitude: 3,
        longitude: 4
      }
    ];
    expect(filterAddressesByHouseNumber(addresses, "14")).toHaveLength(1);
    expect(filterAddressesByHouseNumber(addresses, "14")[0]?.houseNumber).toBe("14");
  });
});

describe("resolveHouseAtPostcode", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to postcode centroid when geocoders return nothing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => []
      }) as unknown as typeof fetch)
    );

    const result = await resolveHouseAtPostcode("12", "L39 2DT", {
      postcode: "L39 2DT",
      latitude: 53.57,
      longitude: -2.86,
      street: "Greetby Hill",
      locality: "Ormskirk",
      summary: "Greetby Hill, Ormskirk, L39 2DT"
    });

    expect(result.error).toBeUndefined();
    expect(result.address?.houseNumber).toBe("12");
    expect(result.address?.label).toBe("12 Greetby Hill");
    expect(result.address?.postcode).toBe("L39 2DT");
    expect(result.address?.latitude).toBe(53.57);
    expect(result.address?.longitude).toBe(-2.86);
  });
});
