import { describe, expect, it } from "vitest";

import { findAffiliatePartner } from "./affiliateLinks";
import {
  getAdhdBedtimeAudioLinks,
  getAdhdDistractionSections,
  getAdhdPuzzleLinks,
  getAdhdSupplyLinks,
  getAdhdSupportResourceLinks
} from "./adhdDistractionLinks";

describe("adhdDistractionLinks", () => {
  it("offers several puzzle styles", () => {
    const links = getAdhdPuzzleLinks();
    expect(links.length).toBeGreaterThanOrEqual(6);
    expect(links.filter((link) => /sudoku/i.test(link.label)).length).toBeGreaterThanOrEqual(2);
    expect(links.some((link) => /word search/i.test(link.label))).toBe(true);
    expect(links.some((link) => /crossword|wordle|anagram/i.test(link.label))).toBe(true);
    expect(links[0]?.label).toMatch(/Sudoku/i);
  });

  it("offers bedtime binaural and similar playlist links", () => {
    const links = getAdhdBedtimeAudioLinks();
    expect(links.some((link) => /binaural/i.test(link.label))).toBe(true);
    expect(links.some((link) => /spotify/i.test(link.label))).toBe(true);
    expect(links.some((link) => /youtube/i.test(link.label))).toBe(true);
    expect(links.some((link) => /brown|pink noise/i.test(link.label))).toBe(true);
  });

  it("offers ADHD charity and support organisation links", () => {
    const links = getAdhdSupportResourceLinks();
    expect(links.some((link) => /ADHD UK/i.test(link.label))).toBe(true);
    expect(links.some((link) => /ADHD Foundation/i.test(link.label))).toBe(true);
    expect(links.some((link) => /NHS/i.test(link.label))).toBe(true);
    expect(links.some((link) => /Samaritans/i.test(link.label))).toBe(true);
    expect(links.every((link) => link.url.startsWith("https://"))).toBe(true);
  });

  it("offers optional supply shop links", () => {
    const links = getAdhdSupplyLinks();
    expect(links.some((link) => /Amazon/i.test(link.label))).toBe(true);
    expect(links.some((link) => /Argos/i.test(link.label))).toBe(true);
    expect(links.some((link) => /Etsy/i.test(link.label))).toBe(true);
    expect(links.some((link) => /eBay/i.test(link.label))).toBe(true);
    expect(links.some((link) => /Loop/i.test(link.label))).toBe(true);
    expect(links.some((link) => /John Lewis/i.test(link.label))).toBe(true);
    expect(links.some((link) => /Sensory Direct/i.test(link.label))).toBe(true);
    expect(links.every((link) => findAffiliatePartner(link.url))).toBeTruthy();
  });

  it("shows puzzle sections for puzzle and overwhelm templates", () => {
    const fromPuzzle = getAdhdDistractionSections({
      sourcePackId: "adhd-starter",
      sourceTemplateId: "puzzle-distraction",
      title: "Puzzle distraction break"
    });
    expect(fromPuzzle).toHaveLength(1);
    expect(fromPuzzle[0]?.links.length).toBeGreaterThan(0);

    const fromOverwhelm = getAdhdDistractionSections({
      sourcePackId: "adhd-starter",
      sourceTemplateId: "overwhelm-timeout",
      title: "Timeout — feeling overwhelmed"
    });
    expect(fromOverwhelm).toHaveLength(1);
  });

  it("shows bedtime audio for bedtime and evening templates", () => {
    const fromBedtime = getAdhdDistractionSections({
      sourcePackId: "adhd-starter",
      sourceTemplateId: "bedtime-wind-down",
      title: "Bedtime wind-down"
    });
    expect(fromBedtime.map((section) => section.id)).toContain("bedtime-audio");

    const fromEvening = getAdhdDistractionSections({
      sourcePackId: "adhd-starter",
      sourceTemplateId: "evening-reset",
      title: "Evening reset"
    });
    expect(fromEvening.map((section) => section.id)).toContain("bedtime-audio");
  });

  it("shows support resources for support templates", () => {
    const sections = getAdhdDistractionSections({
      sourcePackId: "adhd-starter",
      sourceTemplateId: "support-resources",
      title: "ADHD support & charities"
    });
    expect(sections.map((section) => section.id)).toEqual(["support-resources"]);
    expect(sections[0]?.hint.toLowerCase()).toMatch(/not diagnose|support and learning/);
  });

  it("shows supply links for supplies templates", () => {
    const sections = getAdhdDistractionSections({
      sourcePackId: "adhd-starter",
      sourceTemplateId: "adhd-supplies",
      title: "ADHD-friendly supplies (optional)"
    });
    expect(sections.map((section) => section.id)).toEqual(["adhd-supplies"]);
    expect(sections[0]?.hint.toLowerCase()).toMatch(/affiliate|commission/);
    expect(sections[0]?.title.toLowerCase()).toMatch(/supplier|shop/);
  });

  it("does not show for unrelated packs", () => {
    expect(
      getAdhdDistractionSections({
        sourcePackId: "holiday-planner",
        sourceTemplateId: "packing-checklist",
        title: "Packing"
      })
    ).toHaveLength(0);
  });
});
