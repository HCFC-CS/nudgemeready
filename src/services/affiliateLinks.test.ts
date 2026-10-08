import { describe, expect, it } from "vitest";

import {
  applyAffiliateParams,
  findAffiliatePartner,
  getAffiliateDisclosureLong,
  getAffiliateDisclosureShort,
  hasLiveAffiliateCommissionTracking,
  resolveAffiliateLink,
  withAffiliate
} from "./affiliateLinks";
import { getGiftLinksForOccasion } from "./giftLinks";
import { getHolidayParkingLinks, getHolidayStayLinks } from "./holidayTravelLinks";

describe("affiliateLinks", () => {
  it("recognises commercial partners by host", () => {
    expect(findAffiliatePartner("https://www.amazon.co.uk/s?k=flowers")?.id).toBe("amazon");
    expect(findAffiliatePartner("https://www.booking.com/searchresults.html?ss=Rome")?.id).toBe("booking");
    expect(findAffiliatePartner("https://www.holidayextras.com/airport-parking.html")?.id).toBe("holiday_extras");
    expect(findAffiliatePartner("https://www.heathrow.com/at-the-airport/special-assistance")).toBeUndefined();
    expect(findAffiliatePartner("https://www.google.com/search?q=taxi")).toBeUndefined();
  });

  it("appends configured params and skips empty ones", () => {
    const withTag = applyAffiliateParams("https://www.amazon.co.uk/s?k=mug", {
      id: "amazon",
      label: "Amazon",
      hosts: ["amazon.co.uk"],
      params: { tag: "nudgemeready-21", empty: "" },
      enabled: true
    });
    expect(withTag).toContain("tag=nudgemeready-21");
    expect(withTag).not.toContain("empty=");
    expect(withTag).toContain("utm_campaign=nudge_me_ready");
  });

  it("still adds configured soft attribution when programme IDs are empty", () => {
    const url = "https://www.booking.com/searchresults.html?ss=Lisbon";
    const resolved = withAffiliate(url);
    expect(resolved).toContain("ss=Lisbon");
    expect(resolved).toContain("label=nudgemeready");
    expect(resolved).toContain("utm_campaign=nudge_me_ready");
    // Programme aid stays off until configured
    expect(resolved).not.toContain("aid=");
  });

  it("uses pending disclosure while programme IDs are empty", () => {
    expect(hasLiveAffiliateCommissionTracking()).toBe(false);
    expect(getAffiliateDisclosureShort()).toMatch(/not fully active|may not earn/i);
    expect(getAffiliateDisclosureLong()).toMatch(/organisational support only/i);
  });
});

describe("gift and travel links use affiliate wrapper", () => {
  it("routes gift shops through affiliate-capable hosts", () => {
    const links = getGiftLinksForOccasion("Mum's Birthday", ["Flowers"]);
    expect(links.some((link) => link.url.includes("amazon.co.uk"))).toBe(true);
    expect(links.every((link) => findAffiliatePartner(link.url))).toBeTruthy();
  });

  it("routes commercial travel partners through affiliate-capable hosts", () => {
    const parking = getHolidayParkingLinks("Parking", "Heathrow");
    const stays = getHolidayStayLinks("Barcelona");
    expect(parking.some((link) => findAffiliatePartner(link.url)?.id === "holiday_extras")).toBe(true);
    expect(stays.every((link) => findAffiliatePartner(link.url))).toBeTruthy();
  });
});
