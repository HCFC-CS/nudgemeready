import { describe, expect, it } from "vitest";

import {
  expandAffiliateCategories,
  isHealthUnsafeAffiliateText,
  rankAffiliateOffers,
  shopSearchUrl
} from "./affiliateRecommendationEngine";
import { findAffiliatePartner } from "./affiliateLinks";
import type { ReadyPackAffiliateCategory } from "../types/readyPacks";

const categories: ReadyPackAffiliateCategory[] = [
  { id: "clean", title: "cleaning supplies", query: "cleaning supplies kit", partners: ["amazon", "argos"] },
  { id: "keys", title: "key organisers", query: "key hook organiser", partners: ["amazon"] },
  { id: "laundry", title: "laundry", query: "laundry basket", partners: ["amazon", "john_lewis"] },
  {
    id: "unsafe",
    title: "weight loss pills",
    query: "fat burner diet pills",
    partners: ["amazon", "ebay"]
  }
];

describe("affiliateRecommendationEngine", () => {
  it("builds search URLs that still resolve through withAffiliate partners", () => {
    const amazon = shopSearchUrl("amazon", "yoga mat");
    expect(findAffiliatePartner(amazon)?.id).toBe("amazon");
    expect(findAffiliatePartner(shopSearchUrl("argos", "water bottle"))?.id).toBe("argos");
    expect(findAffiliatePartner(shopSearchUrl("john_lewis", "lunch box"))?.id).toBe("john_lewis");
  });

  it("blocks health-unsafe product language from ranking", () => {
    expect(isHealthUnsafeAffiliateText("fat burner capsules")).toBe(true);
    expect(isHealthUnsafeAffiliateText("yoga mat beginner")).toBe(false);
    const expanded = expandAffiliateCategories(categories);
    expect(expanded.some((row) => row.category.id === "unsafe")).toBe(false);
    expect(expanded.some((row) => /weight loss|fat burner/i.test(row.category.query))).toBe(false);
  });

  it("returns at most six ranked offers and prefers partner diversity", () => {
    const offers = rankAffiliateOffers({ categories, title: "Tidy the kitchen", notes: "Need cleaning kit" });
    expect(offers.length).toBeGreaterThanOrEqual(3);
    expect(offers.length).toBeLessThanOrEqual(6);
    expect(offers.every((offer) => findAffiliatePartner(offer.url))).toBe(true);
    const partners = new Set(offers.map((offer) => offer.partnerId));
    expect(partners.has("amazon")).toBe(true);
    expect(partners.size).toBeGreaterThanOrEqual(2);
    expect(offers.some((offer) => /weight|fat burner|diet pill/i.test(offer.label))).toBe(false);
  });

  it("boosts the category that matches the nudge title", () => {
    const offers = rankAffiliateOffers({
      categories,
      title: "Hang the laundry",
      notes: "Basket by the machine"
    });
    expect(offers[0]?.categoryId).toBe("laundry");
  });
});
