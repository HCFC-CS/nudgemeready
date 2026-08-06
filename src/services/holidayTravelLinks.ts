import { withAffiliate } from "./affiliateLinks";

export type TravelShopLink = {
  id: string;
  label: string;
  url: string;
  group: "taxi" | "parking" | "stay" | "compare" | "assistance" | "lounge" | "meet_greet" | "priority";
};

type AirportInfo = {
  code: string;
  name: string;
  aliases: string[];
  /** Official or common parking booking page */
  parkingUrl: string;
  specialAssistanceUrl: string;
  city: string;
};

const ukAirports: AirportInfo[] = [
  {
    code: "LHR",
    name: "Heathrow",
    aliases: ["heathrow", "lhr"],
    parkingUrl: "https://www.heathrow.com/transport-and-directions/heathrow-parking",
    specialAssistanceUrl: "https://www.heathrow.com/at-the-airport/special-assistance",
    city: "London"
  },
  {
    code: "LGW",
    name: "Gatwick",
    aliases: ["gatwick", "lgw"],
    parkingUrl: "https://www.gatwickairport.com/parking/",
    specialAssistanceUrl: "https://www.gatwickairport.com/at-the-airport/passenger-services/special-assistance/",
    city: "London"
  },
  {
    code: "MAN",
    name: "Manchester",
    aliases: ["manchester airport", "man airport", "manchester"],
    parkingUrl: "https://www.manchesterairport.co.uk/parking/",
    specialAssistanceUrl: "https://www.manchesterairport.co.uk/at-the-airport/special-assistance/",
    city: "Manchester"
  },
  {
    code: "BHX",
    name: "Birmingham",
    aliases: ["birmingham airport", "bhx"],
    parkingUrl: "https://www.birminghamairport.co.uk/parking/",
    specialAssistanceUrl: "https://www.birminghamairport.co.uk/at-the-airport/special-assistance/",
    city: "Birmingham"
  },
  {
    code: "EDI",
    name: "Edinburgh",
    aliases: ["edinburgh airport", "edi"],
    parkingUrl: "https://www.edinburghairport.com/parking",
    specialAssistanceUrl: "https://www.edinburghairport.com/at-the-airport/special-assistance",
    city: "Edinburgh"
  },
  {
    code: "GLA",
    name: "Glasgow",
    aliases: ["glasgow airport", "gla"],
    parkingUrl: "https://www.glasgowairport.com/parking/",
    specialAssistanceUrl: "https://www.glasgowairport.com/at-the-airport/special-assistance/",
    city: "Glasgow"
  },
  {
    code: "BRS",
    name: "Bristol",
    aliases: ["bristol airport", "brs"],
    parkingUrl: "https://www.bristolairport.co.uk/parking/",
    specialAssistanceUrl: "https://www.bristolairport.co.uk/at-the-airport/passenger-services/special-assistance/",
    city: "Bristol"
  },
  {
    code: "STN",
    name: "Stansted",
    aliases: ["stansted", "stn"],
    parkingUrl: "https://www.stanstedairport.com/parking/",
    specialAssistanceUrl: "https://www.stanstedairport.com/at-the-airport/special-assistance/",
    city: "London"
  },
  {
    code: "LTN",
    name: "Luton",
    aliases: ["luton", "ltn"],
    parkingUrl: "https://www.london-luton.co.uk/parking",
    specialAssistanceUrl: "https://www.london-luton.co.uk/at-the-airport/special-assistance",
    city: "Luton"
  }
];

export function detectAirport(text: string): AirportInfo | undefined {
  const normalised = text.trim().toLowerCase();
  if (!normalised) {
    return undefined;
  }
  return ukAirports.find(
    (airport) =>
      airport.aliases.some((alias) => normalised.includes(alias)) ||
      normalised.includes(airport.code.toLowerCase())
  );
}

function searchBlob(title: string, notes?: string, locationLabel?: string) {
  return [title, notes ?? "", locationLabel ?? ""].filter(Boolean).join(" ");
}

export function getHolidayTaxiLinks(title: string, notes?: string, locationLabel?: string): TravelShopLink[] {
  const blob = searchBlob(title, notes, locationLabel);
  const airport = detectAirport(blob);
  const place = airport ? `${airport.name} Airport` : locationLabel?.trim() || "airport";
  const query = encodeURIComponent(`taxi to ${place}`);
  const mapsQuery = encodeURIComponent(`${place} taxi rank`);

  return [
    {
      id: "taxi-maps",
      label: `Find local taxis near ${place}`,
      url: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
      group: "taxi"
    },
    {
      id: "taxi-search",
      label: `Search taxis / private hire to ${place}`,
      url: `https://www.google.com/search?q=${query}`,
      group: "taxi"
    },
    {
      id: "taxi-uber",
      label: "Open Uber (if available in your area)",
      url: withAffiliate("https://m.uber.com/"),
      group: "taxi"
    }
  ];
}

export function getHolidayParkingLinks(title: string, notes?: string, locationLabel?: string): TravelShopLink[] {
  const blob = searchBlob(title, notes, locationLabel);
  const airport = detectAirport(blob);
  const airportName = airport?.name ?? "airport";
  const compareQuery = encodeURIComponent(`${airportName} airport parking`);

  const links: TravelShopLink[] = [
    {
      id: "parking-compare-holiday-extras",
      label: "Compare parking — Holiday Extras",
      url: withAffiliate("https://www.holidayextras.com/airport-parking.html"),
      group: "compare"
    },
    {
      id: "parking-compare-looking4",
      label: "Compare parking — Looking4Parking",
      url: withAffiliate("https://www.looking4parking.com/"),
      group: "compare"
    },
    {
      id: "parking-compare-aph",
      label: "Compare parking — APH",
      url: withAffiliate("https://www.aph.com/"),
      group: "compare"
    },
    {
      id: "parking-search",
      label: `Search ${airportName} airport parking`,
      url: `https://www.google.com/search?q=${compareQuery}`,
      group: "parking"
    }
  ];

  if (airport) {
    links.unshift({
      id: `parking-official-${airport.code}`,
      label: `Official ${airport.name} parking`,
      url: airport.parkingUrl,
      group: "parking"
    });
  }

  return links;
}

export function getHolidayStayLinks(destinationHint?: string): TravelShopLink[] {
  const place = destinationHint?.trim() || "your destination";
  const q = encodeURIComponent(place);

  return [
    {
      id: "stay-booking",
      label: "Search stays on Booking.com",
      url: withAffiliate(`https://www.booking.com/searchresults.html?ss=${q}`),
      group: "stay"
    },
    {
      id: "stay-expedia",
      label: "Search stays on Expedia",
      url: withAffiliate(`https://www.expedia.co.uk/Hotel-Search?destination=${q}`),
      group: "stay"
    },
    {
      id: "stay-hotels",
      label: "Search stays on Hotels.com",
      url: withAffiliate(`https://uk.hotels.com/Hotel-Search?destination=${q}`),
      group: "stay"
    }
  ];
}

export function getHolidayAssistanceLinks(title: string, notes?: string, locationLabel?: string): TravelShopLink[] {
  const blob = searchBlob(title, notes, locationLabel);
  const airport = detectAirport(blob);
  const airportName = airport?.name ?? "airport";
  const searchQuery = encodeURIComponent(`${airportName} airport special assistance`);

  const links: TravelShopLink[] = [
    {
      id: "assistance-search",
      label: `Search ${airportName} special assistance`,
      url: `https://www.google.com/search?q=${searchQuery}`,
      group: "assistance"
    },
    {
      id: "assistance-airline",
      label: "Ask your airline about assistance (search)",
      url: `https://www.google.com/search?q=${encodeURIComponent("airline special assistance request")}`,
      group: "assistance"
    }
  ];

  if (airport) {
    links.unshift({
      id: `assistance-official-${airport.code}`,
      label: `Official ${airport.name} special assistance`,
      url: airport.specialAssistanceUrl,
      group: "assistance"
    });
  }

  return links;
}

export function getHolidayLoungeLinks(title: string, notes?: string, locationLabel?: string): TravelShopLink[] {
  const blob = searchBlob(title, notes, locationLabel);
  const airport = detectAirport(blob);
  const airportName = airport?.name ?? "airport";

  return [
    {
      id: "lounge-holiday-extras",
      label: "Book lounge access — Holiday Extras",
      url: withAffiliate("https://www.holidayextras.com/airport-lounges.html"),
      group: "lounge"
    },
    {
      id: "lounge-no1",
      label: "Browse No1 Lounges",
      url: withAffiliate("https://www.no1lounges.com/"),
      group: "lounge"
    },
    {
      id: "lounge-priority-pass",
      label: "Priority Pass lounges",
      url: withAffiliate("https://www.prioritypass.com/"),
      group: "lounge"
    },
    {
      id: "lounge-search",
      label: `Search ${airportName} airport lounges`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`${airportName} airport lounge booking`)}`,
      group: "lounge"
    }
  ];
}

export function getHolidayMeetGreetLinks(title: string, notes?: string, locationLabel?: string): TravelShopLink[] {
  const blob = searchBlob(title, notes, locationLabel);
  const airport = detectAirport(blob);
  const airportName = airport?.name ?? "airport";

  return [
    {
      id: "meet-holiday-extras",
      label: "Book meet & greet — Holiday Extras",
      url: withAffiliate("https://www.holidayextras.com/meet-and-greet.html"),
      group: "meet_greet"
    },
    {
      id: "meet-search",
      label: `Search ${airportName} meet and greet`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`${airportName} airport meet and greet`)}`,
      group: "meet_greet"
    }
  ];
}

export function getHolidayPriorityLinks(title: string, notes?: string, locationLabel?: string): TravelShopLink[] {
  const blob = searchBlob(title, notes, locationLabel);
  const airport = detectAirport(blob);
  const airportName = airport?.name ?? "airport";

  return [
    {
      id: "priority-holiday-extras",
      label: "Fast track / priority options — Holiday Extras",
      url: withAffiliate("https://www.holidayextras.com/"),
      group: "priority"
    },
    {
      id: "priority-speedy-search",
      label: `Search ${airportName} speedy boarding`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`${airportName} speedy boarding`)}`,
      group: "priority"
    },
    {
      id: "priority-fast-track-search",
      label: `Search ${airportName} fast track security`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`${airportName} airport fast track security`)}`,
      group: "priority"
    },
    {
      id: "priority-airline",
      label: "Check your airline for priority / speedy boarding",
      url: `https://www.google.com/search?q=${encodeURIComponent("airline speedy boarding priority boarding")}`,
      group: "priority"
    }
  ];
}

export type HolidayTravelLinkSection = {
  id: string;
  title: string;
  hint: string;
  links: TravelShopLink[];
};

/** Which travel link sections to show for a Holiday Planner item. */
export function getHolidayTravelSections(item: {
  sourcePackId?: string;
  sourceTemplateId?: string;
  title: string;
  notes?: string;
  locationLabel?: string;
}): HolidayTravelLinkSection[] {
  if (item.sourcePackId !== "ready4-travel" && item.sourcePackId !== "holiday-planner") {
    return [];
  }

  const templateId = item.sourceTemplateId ?? "";
  const blob = `${item.title} ${item.notes ?? ""}`.toLowerCase();
  const sections: HolidayTravelLinkSection[] = [];

  const wantsTaxi =
    templateId === "need-transport" ||
    templateId === "airport-taxi" ||
    /\btaxi\b|\bprivate hire\b|\buber\b|\btransport\b/.test(blob);

  const wantsParking =
    templateId === "need-transport" ||
    templateId === "airport-parking" ||
    /\bparking\b|\bpark and (ride|fly)\b/.test(blob);

  const wantsStay =
    templateId === "book-stay" ||
    /\bhotel\b|\bstay\b|\baccommodation\b|\bbooking\.com\b|\bexpedia\b/.test(blob);

  const wantsAssistance =
    templateId === "airport-extras" ||
    templateId === "special-assistance" ||
    /\bspecial assistance\b|\baccessibility\b|\bwheelchair\b|\bPRM\b/i.test(blob);

  const wantsLounge =
    templateId === "airport-extras" ||
    templateId === "lounge-access" ||
    templateId === "airport-comfort" ||
    /\blounge\b/.test(blob);

  const wantsMeetGreet =
    templateId === "airport-extras" ||
    templateId === "meet-and-greet" ||
    templateId === "airport-comfort" ||
    /\bmeet\s*(and|&)\s*greet\b/.test(blob);

  const wantsPriority =
    templateId === "airport-extras" ||
    templateId === "speedy-boarding" ||
    templateId === "airport-comfort" ||
    /\bspeedy boarding\b|\bfast track\b|\bpriority boarding\b|\bsecurity fast/.test(blob);

  if (wantsTaxi) {
    sections.push({
      id: "taxi",
      title: "Local taxi / private hire",
      hint: "Add your airport or destination in the title or notes to refine these links.",
      links: getHolidayTaxiLinks(item.title, item.notes, item.locationLabel)
    });
  }

  if (wantsParking) {
    sections.push({
      id: "parking",
      title: "Airport parking",
      hint: "Mention Heathrow, Gatwick, Manchester, etc. in the title or notes for official parking links.",
      links: getHolidayParkingLinks(item.title, item.notes, item.locationLabel)
    });
  }

  if (wantsStay) {
    const destination =
      item.locationLabel?.trim() ||
      item.notes?.match(/destination:\s*(.+)/i)?.[1]?.trim() ||
      undefined;
    sections.push({
      id: "stay",
      title: "Book a stay",
      hint: "Opens Booking.com, Expedia or Hotels.com so you can compare options.",
      links: getHolidayStayLinks(destination)
    });
  }

  if (wantsAssistance) {
    sections.push({
      id: "assistance",
      title: "Special assistance",
      hint: "Add your airport name for official assistance pages. Also tell your airline when you book or check in.",
      links: getHolidayAssistanceLinks(item.title, item.notes, item.locationLabel)
    });
  }

  if (wantsLounge) {
    sections.push({
      id: "lounge",
      title: "Lounge access",
      hint: "Compare lounge passes and airport lounges. Availability depends on terminal and flight time.",
      links: getHolidayLoungeLinks(item.title, item.notes, item.locationLabel)
    });
  }

  if (wantsMeetGreet) {
    sections.push({
      id: "meet_greet",
      title: "Meet & greet",
      hint: "Someone meets you and helps with parking or terminal transfer — useful for a calmer start.",
      links: getHolidayMeetGreetLinks(item.title, item.notes, item.locationLabel)
    });
  }

  if (wantsPriority) {
    sections.push({
      id: "priority",
      title: "Speedy boarding & fast track",
      hint: "Often sold by your airline or as an airport add-on. Check both before you buy twice.",
      links: getHolidayPriorityLinks(item.title, item.notes, item.locationLabel)
    });
  }

  return sections;
}
