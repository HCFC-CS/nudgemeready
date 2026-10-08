import { describe, expect, it } from "vitest";

import {
  detectAirport,
  getHolidayAssistanceLinks,
  getHolidayLoungeLinks,
  getHolidayMeetGreetLinks,
  getHolidayParkingLinks,
  getHolidayPriorityLinks,
  getHolidayStayLinks,
  getHolidayTaxiLinks,
  getHolidayTravelSections
} from "./holidayTravelLinks";

describe("holidayTravelLinks", () => {
  it("detects major UK airports from text", () => {
    expect(detectAirport("Parking at Heathrow")?.code).toBe("LHR");
    expect(detectAirport("Taxi to MAN")?.code).toBe("MAN");
    expect(detectAirport("Gatwick morning flight")?.code).toBe("LGW");
  });

  it("builds taxi links for an airport", () => {
    const links = getHolidayTaxiLinks("Book taxi", "Taxi to Gatwick");
    expect(links.some((link) => link.url.includes("maps"))).toBe(true);
    expect(links.some((link) => /uber/i.test(link.label))).toBe(true);
  });

  it("includes official parking when airport is known", () => {
    const links = getHolidayParkingLinks("Airport parking", "Heathrow Terminal 5");
    expect(links[0]?.label).toMatch(/Official Heathrow/i);
    expect(links.some((link) => /Holiday Extras/i.test(link.label))).toBe(true);
  });

  it("builds stay booking links", () => {
    const links = getHolidayStayLinks("Barcelona");
    expect(links.map((link) => link.label).join(" ")).toMatch(/Booking\.com/);
    expect(links.map((link) => link.label).join(" ")).toMatch(/Expedia/);
    expect(links.some((link) => link.url.includes("Barcelona"))).toBe(true);
  });

  it("includes official special assistance when airport is known", () => {
    const links = getHolidayAssistanceLinks("Arrange special assistance", "Gatwick");
    expect(links[0]?.label).toMatch(/Official Gatwick special assistance/i);
    expect(links[0]?.url).toContain("gatwickairport.com");
  });

  it("builds lounge, meet & greet and priority links", () => {
    expect(getHolidayLoungeLinks("Lounge", "Manchester").some((link) => /Holiday Extras/i.test(link.label))).toBe(
      true
    );
    expect(getHolidayMeetGreetLinks("Meet", "Heathrow").some((link) => /meet & greet/i.test(link.label))).toBe(true);
    expect(getHolidayPriorityLinks("Speedy", "Luton").some((link) => /speedy boarding/i.test(link.label))).toBe(true);
  });

  it("returns taxi and parking sections for the transport decision list", () => {
    const sections = getHolidayTravelSections({
      sourcePackId: "ready4-travel",
      sourceTemplateId: "need-transport",
      title: "Need transport to the airport?",
      notes: "Manchester Airport"
    });
    expect(sections.map((section) => section.id).sort()).toEqual(["parking", "taxi"]);
  });

  it("returns assistance and comfort sections for airport extras", () => {
    const sections = getHolidayTravelSections({
      sourcePackId: "ready4-travel",
      sourceTemplateId: "airport-extras",
      title: "Airport extras for this trip?",
      notes: "Heathrow"
    });
    expect(sections.map((section) => section.id).sort()).toEqual([
      "assistance",
      "lounge",
      "meet_greet",
      "priority"
    ]);
  });

  it("returns stay section for book-stay template", () => {
    const sections = getHolidayTravelSections({
      sourcePackId: "ready4-travel",
      sourceTemplateId: "book-stay",
      title: "Book or confirm your stay",
      notes: "Destination: Lisbon"
    });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.id).toBe("stay");
  });
});
