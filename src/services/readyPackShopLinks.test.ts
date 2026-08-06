import { describe, expect, it } from "vitest";

import { findAffiliatePartner } from "./affiliateLinks";
import {
  getReadyPackShopSections,
  getShopSectionForPack,
  listPacksWithShopLinks
} from "./readyPackShopLinks";

describe("readyPackShopLinks", () => {
  const packIds = listPacksWithShopLinks();

  it("covers Ready 4 packs that offer shop links", () => {
    expect(packIds).toEqual(
      expect.arrayContaining([
        "ready4-home",
        "ready4-shopping",
        "ready4-wellbeing",
        "ready4-medication",
        "ready4-pets",
        "ready4-emergencies",
        "ready4-study",
        "ready4-family",
        "ready4-independence"
      ])
    );
    expect(packIds).not.toContain("ready4-travel");
  });

  it.each(packIds)("returns affiliate-ready shop links for %s via pack-shop template", (packId) => {
    const sections = getReadyPackShopSections({
      sourcePackId: packId,
      sourceTemplateId: "pack-shop",
      title: "Optional shop",
      notes: "Affiliate links"
    });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.links.length).toBeGreaterThanOrEqual(4);
    for (const link of sections[0]!.links) {
      expect(findAffiliatePartner(link.url)).toBeTruthy();
    }
  });

  it("keeps health-related shop hints organisational", () => {
    for (const packId of ["ready4-medication", "ready4-wellbeing", "ready4-emergencies"]) {
      const section = getShopSectionForPack(packId);
      expect(section?.hint.toLowerCase()).toMatch(/organisational|not medical/);
      expect(section?.hint.toLowerCase()).toMatch(/affiliate|commission/);
    }
  });

  it("does not show shop links for unrelated templates", () => {
    const sections = getReadyPackShopSections({
      sourcePackId: "ready4-study",
      sourceTemplateId: "weekly-reset",
      title: "Week ahead glance",
      notes: "One calm look at the week."
    });
    expect(sections).toHaveLength(0);
  });

  it("shows pet care shop links", () => {
    const section = getShopSectionForPack("ready4-pets");
    const labels = section?.links.map((link) => link.label).join(" ") ?? "";
    expect(labels).toMatch(/Amazon/);
    expect(labels).toMatch(/Argos|Etsy/);
  });

  it("shows study stationery links", () => {
    const section = getShopSectionForPack("ready4-study");
    const labels = section?.links.map((link) => link.label).join(" ") ?? "";
    expect(labels).toMatch(/stationery|planners|headphones/i);
  });
});
