import { withAffiliate } from "./affiliateLinks";

export type PackShopLink = {
  id: string;
  label: string;
  url: string;
};

export type PackShopSection = {
  id: string;
  title: string;
  hint: string;
  links: PackShopLink[];
};

function amazon(query: string, id: string, label: string): PackShopLink {
  return {
    id,
    label,
    url: withAffiliate(`https://www.amazon.co.uk/s?k=${encodeURIComponent(query)}`)
  };
}

function argos(pathOrQuery: string, id: string, label: string): PackShopLink {
  const url = pathOrQuery.startsWith("http")
    ? pathOrQuery
    : `https://www.argos.co.uk/search/${encodeURIComponent(pathOrQuery)}/`;
  return { id, label, url: withAffiliate(url) };
}

function johnLewis(query: string, id: string, label: string): PackShopLink {
  return {
    id,
    label,
    url: withAffiliate(`https://www.johnlewis.com/search?search-term=${encodeURIComponent(query)}`)
  };
}

function etsy(query: string, id: string, label: string): PackShopLink {
  return {
    id,
    label,
    url: withAffiliate(`https://www.etsy.com/uk/search?q=${encodeURIComponent(query)}`)
  };
}

function ebay(query: string, id: string, label: string): PackShopLink {
  return {
    id,
    label,
    url: withAffiliate(`https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(query)}`)
  };
}

const DISCLOSURE_HINT =
  "Optional partner shop links (affiliate). We may earn a small commission if you buy — at no extra cost to you. Nothing here is required.";

const HEALTH_SHOP_HINT =
  `${DISCLOSURE_HINT} Organisational support only — these are not medical products or prescriptions.`;

type PackShopCatalogueEntry = {
  packId: string;
  templateIds: string[];
  keywords: RegExp;
  section: PackShopSection;
};

/** Lean Edition 1 Ready 4 shop sections. Travel keeps its dedicated airport UI. */
const packShopCatalogue: PackShopCatalogueEntry[] = [
  {
    packId: "ready4-home",
    templateIds: ["daily-reset", "cleaning-planner", "maintenance", "leaving-home"],
    keywords: /\b(cleaning|bin|home|keys|shop|supplies|maintenance)\b/i,
    section: {
      id: "home-shop",
      title: "Shop home organisation extras",
      hint: DISCLOSURE_HINT,
      links: [
        amazon("cleaning supplies kit", "home-amz-clean", "Amazon · cleaning supplies"),
        amazon("key hook organiser", "home-amz-keys", "Amazon · key organisers"),
        amazon("laundry basket", "home-amz-laundry", "Amazon · laundry"),
        argos("cleaning", "home-argos-clean", "Argos · cleaning"),
        johnLewis("laundry basket", "home-jl-laundry", "John Lewis · laundry")
      ]
    }
  },
  {
    packId: "ready4-shopping",
    templateIds: ["main-list", "household-essentials", "before-you-go", "meal-ingredients"],
    keywords: /\b(shopping|list|bag|essentials|shop|supplies)\b/i,
    section: {
      id: "shopping-shop",
      title: "Shop reusable bags & list helpers",
      hint: DISCLOSURE_HINT,
      links: [
        amazon("reusable shopping bags", "shop-amz-bags", "Amazon · shopping bags"),
        amazon("insulated shopping bag", "shop-amz-cool", "Amazon · cool bags"),
        amazon("notepad shopping list", "shop-amz-list", "Amazon · list pads"),
        argos("shopping-bag", "shop-argos-bags", "Argos · bags"),
        johnLewis("reusable bag", "shop-jl-bags", "John Lewis · bags")
      ]
    }
  },
  {
    packId: "ready4-wellbeing",
    templateIds: ["hydration", "movement", "sleep-routine", "morning-reset"],
    keywords: /\b(water|yoga|sleep|journal|shop|supplies|wellbeing)\b/i,
    section: {
      id: "wellbeing-shop",
      title: "Shop gentle wellbeing extras",
      hint: HEALTH_SHOP_HINT,
      links: [
        amazon("insulated water bottle", "wb-amz-water", "Amazon · water bottles"),
        amazon("yoga mat beginner", "wb-amz-mat", "Amazon · yoga mats"),
        amazon("sleep mask", "wb-amz-mask", "Amazon · sleep masks"),
        amazon("gratitude journal", "wb-amz-journal", "Amazon · journals"),
        argos("water-bottle", "wb-argos-water", "Argos · water bottles"),
        johnLewis("yoga mat", "wb-jl-mat", "John Lewis · yoga mats")
      ]
    }
  },
  {
    packId: "ready4-medication",
    templateIds: ["med-schedule", "prescription-tracker", "med-times", "pharmacy-collection"],
    keywords: /\b(pill|medication|pharmacy|organiser|shop|supplies)\b/i,
    section: {
      id: "med-shop",
      title: "Shop medication organisation extras",
      hint: HEALTH_SHOP_HINT,
      links: [
        amazon("weekly pill organiser", "med-amz-pill", "Amazon · pill organisers"),
        amazon("medication reminder box", "med-amz-box", "Amazon · reminder boxes"),
        argos("pill-organiser", "med-argos-pill", "Argos · pill organisers"),
        ebay("pill organiser weekly", "med-ebay-pill", "eBay · pill organisers")
      ]
    }
  },
  {
    packId: "ready4-pets",
    templateIds: ["daily-care", "vet-planner", "grooming", "pet-records", "pet-medication"],
    keywords: /\b(pet|vet|lead|litter|groom|shop|supplies)\b/i,
    section: {
      id: "pets-shop",
      title: "Shop pet care extras",
      hint: DISCLOSURE_HINT,
      links: [
        amazon("dog lead", "pet-amz-lead", "Amazon · leads"),
        amazon("cat litter", "pet-amz-litter", "Amazon · litter"),
        amazon("pet grooming brush", "pet-amz-brush", "Amazon · grooming"),
        amazon("pet first aid kit", "pet-amz-kit", "Amazon · pet first aid"),
        argos("pet", "pet-argos", "Argos · pet supplies"),
        etsy("pet bandana", "pet-etsy", "Etsy · pet accessories")
      ]
    }
  },
  {
    packId: "ready4-emergencies",
    templateIds: ["grab-bag", "home-plan", "emergency-contacts", "annual-review"],
    keywords: /\b(grab bag|torch|emergency|smoke alarm|shop|supplies)\b/i,
    section: {
      id: "emergency-shop",
      title: "Shop emergency prep extras",
      hint: HEALTH_SHOP_HINT,
      links: [
        amazon("emergency torch", "em-amz-torch", "Amazon · torches"),
        amazon("power bank portable charger", "em-amz-power", "Amazon · power banks"),
        amazon("smoke alarm battery", "em-amz-alarm", "Amazon · smoke alarms"),
        amazon("first aid kit home", "em-amz-firstaid", "Amazon · first aid kits"),
        argos("torch", "em-argos-torch", "Argos · torches"),
        johnLewis("first aid kit", "em-jl-firstaid", "John Lewis · first aid")
      ]
    }
  },
  {
    packId: "ready4-study",
    templateIds: ["assignment-steps", "revision-planner", "exam-countdown", "lecture-prep"],
    keywords: /\b(stationery|planner|study|revision|exam|shop|supplies)\b/i,
    section: {
      id: "study-shop",
      title: "Shop study supplies",
      hint: DISCLOSURE_HINT,
      links: [
        amazon("student stationery set", "study-amz-stat", "Amazon · stationery"),
        amazon("study planner notebook", "study-amz-planner", "Amazon · planners"),
        amazon("noise cancelling headphones study", "study-amz-headphones", "Amazon · headphones"),
        argos("stationery", "study-argos-stat", "Argos · stationery"),
        johnLewis("noise cancelling headphones", "study-jl-headphones", "John Lewis · headphones")
      ]
    }
  },
  {
    packId: "ready4-family",
    templateIds: ["school-hub", "meal-planner", "family-week"],
    keywords: /\b(lunch|school|label|family|shop|supplies)\b/i,
    section: {
      id: "family-shop",
      title: "Shop family day-to-day supplies",
      hint: DISCLOSURE_HINT,
      links: [
        amazon("kids lunch box", "fam-amz-lunch", "Amazon · lunch boxes"),
        amazon("reusable water bottle kids", "fam-amz-water", "Amazon · water bottles"),
        amazon("name labels school", "fam-amz-labels", "Amazon · name labels"),
        argos("lunch-box", "fam-argos-lunch", "Argos · lunch boxes"),
        johnLewis("lunch box", "fam-jl-lunch", "John Lewis · lunch boxes")
      ]
    }
  },
  {
    packId: "ready4-independence",
    templateIds: ["morning-routine", "evening-routine", "safety-checks", "essential-tasks"],
    keywords: /\b(routine|safety|keys|laundry|shop|supplies)\b/i,
    section: {
      id: "independence-shop",
      title: "Shop independent living helpers",
      hint: DISCLOSURE_HINT,
      links: [
        amazon("weekly pill organiser", "ind-amz-pill", "Amazon · organisers"),
        amazon("key finder bluetooth", "ind-amz-keys", "Amazon · key finders"),
        amazon("large button phone elderly", "ind-amz-phone", "Amazon · simple phones"),
        argos("laundry-basket", "ind-argos-laundry", "Argos · laundry"),
        johnLewis("night light", "ind-jl-night", "John Lewis · night lights")
      ]
    }
  }
];

/**
 * Partner shop sections for ReadyPack item detail screens.
 * Ready 4 Travel keeps its dedicated airport / stay link UI.
 */
export function getReadyPackShopSections(item: {
  sourcePackId?: string;
  sourceTemplateId?: string;
  title: string;
  notes?: string;
}): PackShopSection[] {
  const packId = item.sourcePackId;
  if (!packId || packId === "ready4-travel" || packId === "holiday-planner") {
    return [];
  }

  const entry = packShopCatalogue.find((row) => row.packId === packId);
  if (!entry) {
    return [];
  }

  const templateId = item.sourceTemplateId ?? "";
  const blob = `${item.title} ${item.notes ?? ""}`;
  const match =
    entry.templateIds.includes(templateId) ||
    templateId === "pack-shop" ||
    entry.keywords.test(blob);

  if (!match) {
    return [];
  }

  return [entry.section];
}

export function listPacksWithShopLinks(): string[] {
  return packShopCatalogue.map((entry) => entry.packId);
}

export function getShopSectionForPack(packId: string): PackShopSection | undefined {
  return packShopCatalogue.find((entry) => entry.packId === packId)?.section;
}
