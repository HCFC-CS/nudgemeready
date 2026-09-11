import type { ReadyPackAffiliateConfig } from "../../types/readyPacks";

const DISCLOSURE_HINT =
  "Optional partner shop links (affiliate). We may earn a small commission if you buy — at no extra cost to you. Nothing here is required.";

const HEALTH_SHOP_HINT =
  `${DISCLOSURE_HINT} Organisational support only — these are not medical products or prescriptions.`;

const PACK_AFFILIATE: Record<string, ReadyPackAffiliateConfig> = {
  "ready4-home": {
    sectionTitle: "Shop home organisation extras",
    hint: DISCLOSURE_HINT,
    templateIds: ["daily-reset", "cleaning-planner", "maintenance", "leaving-home"],
    keywords: ["cleaning", "bin", "home", "keys", "shop", "supplies", "maintenance"],
    categories: [
      { id: "clean", title: "cleaning supplies", query: "cleaning supplies kit", partners: ["amazon", "argos"] },
      { id: "keys", title: "key organisers", query: "key hook organiser", partners: ["amazon"] },
      { id: "laundry", title: "laundry", query: "laundry basket", partners: ["amazon", "john_lewis"] }
    ]
  },
  "ready4-shopping": {
    sectionTitle: "Shop reusable bags & list helpers",
    hint: DISCLOSURE_HINT,
    templateIds: ["main-list", "household-essentials", "before-you-go", "meal-ingredients"],
    keywords: ["shopping", "list", "bag", "essentials", "shop", "supplies"],
    categories: [
      { id: "bags", title: "shopping bags", query: "reusable shopping bags", partners: ["amazon", "argos"] },
      { id: "cool", title: "cool bags", query: "insulated shopping bag", partners: ["amazon"] },
      { id: "pads", title: "list pads", query: "notepad shopping list", partners: ["amazon", "john_lewis"] }
    ]
  },
  "ready4-wellbeing": {
    sectionTitle: "Shop gentle wellbeing extras",
    hint: HEALTH_SHOP_HINT,
    templateIds: ["hydration", "meal-check", "movement", "sleep-routine", "morning-reset"],
    keywords: ["water", "yoga", "sleep", "journal", "shop", "supplies", "wellbeing"],
    categories: [
      { id: "water", title: "water bottles", query: "insulated water bottle", partners: ["amazon", "argos"] },
      { id: "mat", title: "yoga mats", query: "yoga mat beginner", partners: ["amazon", "john_lewis"] },
      { id: "sleep", title: "sleep masks", query: "sleep mask", partners: ["amazon"] },
      { id: "journal", title: "journals", query: "gratitude journal", partners: ["amazon"] }
    ]
  },
  "ready4-medication": {
    sectionTitle: "Shop medication organisation extras",
    hint: HEALTH_SHOP_HINT,
    templateIds: ["med-schedule", "prescription-tracker", "med-times", "pharmacy-collection"],
    keywords: ["pill", "medication", "pharmacy", "organiser", "shop", "supplies"],
    categories: [
      { id: "pill", title: "pill organisers", query: "weekly pill organiser", partners: ["amazon", "argos", "ebay"] },
      { id: "box", title: "reminder boxes", query: "medication reminder box", partners: ["amazon"] }
    ]
  },
  "ready4-pets": {
    sectionTitle: "Shop pet care extras",
    hint: DISCLOSURE_HINT,
    templateIds: ["daily-care", "vet-planner", "grooming", "pet-records", "pet-medication"],
    keywords: ["pet", "vet", "lead", "litter", "groom", "shop", "supplies"],
    categories: [
      { id: "lead", title: "leads", query: "dog lead", partners: ["amazon"] },
      { id: "litter", title: "litter", query: "cat litter", partners: ["amazon"] },
      { id: "groom", title: "grooming", query: "pet grooming brush", partners: ["amazon"] },
      { id: "kit", title: "pet first aid", query: "pet first aid kit", partners: ["amazon"] },
      { id: "argos", title: "pet supplies", query: "pet", partners: ["argos"] },
      { id: "etsy", title: "pet accessories", query: "pet bandana", partners: ["etsy"] }
    ]
  },
  "ready4-emergencies": {
    sectionTitle: "Shop emergency prep extras",
    hint: HEALTH_SHOP_HINT,
    templateIds: ["grab-bag", "home-plan", "emergency-contacts", "annual-review"],
    keywords: ["grab bag", "torch", "emergency", "smoke alarm", "shop", "supplies"],
    categories: [
      { id: "torch", title: "torches", query: "emergency torch", partners: ["amazon", "argos"] },
      { id: "power", title: "power banks", query: "power bank portable charger", partners: ["amazon"] },
      { id: "alarm", title: "smoke alarms", query: "smoke alarm battery", partners: ["amazon"] },
      { id: "firstaid", title: "first aid kits", query: "first aid kit home", partners: ["amazon", "john_lewis"] }
    ]
  },
  "ready4-study": {
    sectionTitle: "Shop study supplies",
    hint: DISCLOSURE_HINT,
    templateIds: ["assignment-steps", "revision-planner", "exam-countdown", "lecture-prep"],
    keywords: ["stationery", "planner", "study", "revision", "exam", "shop", "supplies"],
    categories: [
      { id: "stat", title: "stationery", query: "student stationery set", partners: ["amazon", "argos"] },
      { id: "planner", title: "planners", query: "study planner notebook", partners: ["amazon"] },
      { id: "headphones", title: "headphones", query: "noise cancelling headphones study", partners: ["amazon", "john_lewis"] }
    ]
  },
  "ready4-family": {
    sectionTitle: "Shop family day-to-day supplies",
    hint: DISCLOSURE_HINT,
    templateIds: ["school-hub", "meal-planner", "family-week"],
    keywords: ["lunch", "school", "label", "family", "shop", "supplies"],
    categories: [
      { id: "lunch", title: "lunch boxes", query: "kids lunch box", partners: ["amazon", "argos", "john_lewis"] },
      { id: "water", title: "water bottles", query: "reusable water bottle kids", partners: ["amazon"] },
      { id: "labels", title: "name labels", query: "name labels school", partners: ["amazon"] }
    ]
  },
  "ready4-independence": {
    sectionTitle: "Shop independent living helpers",
    hint: DISCLOSURE_HINT,
    templateIds: ["morning-routine", "evening-routine", "safety-checks", "essential-tasks"],
    keywords: ["routine", "safety", "keys", "laundry", "shop", "supplies"],
    categories: [
      { id: "org", title: "organisers", query: "weekly pill organiser", partners: ["amazon"] },
      { id: "keys", title: "key finders", query: "key finder bluetooth", partners: ["amazon"] },
      { id: "phone", title: "simple phones", query: "large button phone elderly", partners: ["amazon"] },
      { id: "laundry", title: "laundry", query: "laundry-basket", partners: ["argos"] },
      { id: "night", title: "night lights", query: "night light", partners: ["john_lewis"] }
    ]
  },
  "ready4-baby": {
    sectionTitle: "Shop early-days bag extras",
    hint: HEALTH_SHOP_HINT,
    templateIds: ["bag-checklist", "what-helps", "parent-reset"],
    keywords: ["baby", "napp", "bag", "feed", "supplies"],
    categories: [
      { id: "bag", title: "changing bags", query: "baby changing bag", partners: ["amazon", "argos", "john_lewis"] },
      { id: "nappy", title: "nappy wallets", query: "nappy wallet travel", partners: ["amazon"] },
      { id: "muslin", title: "muslins", query: "muslin cloths", partners: ["amazon"] }
    ]
  },
  "ready4-moving": {
    sectionTitle: "Shop packing & move extras",
    hint: DISCLOSURE_HINT,
    templateIds: ["packing", "move-suppliers", "what-helps", "move-day"],
    keywords: ["mov", "pack", "box", "mover", "storage"],
    categories: [
      { id: "boxes", title: "packing boxes", query: "removal packing boxes", partners: ["amazon", "argos", "ebay"] },
      { id: "wrap", title: "bubble wrap", query: "bubble wrap packing", partners: ["amazon"] },
      { id: "blankets", title: "furniture blankets", query: "furniture blankets", partners: ["amazon"] }
    ]
  },
  "ready4-wedding": {
    sectionTitle: "Shop wedding planning extras",
    hint: DISCLOSURE_HINT,
    templateIds: ["suppliers", "outfits", "what-helps", "guests"],
    keywords: ["wedding", "guest", "outfit", "supplier", "venue"],
    categories: [
      { id: "binder", title: "planner binders", query: "wedding planner binder", partners: ["amazon"] },
      { id: "stat", title: "stationery", query: "wedding stationery", partners: ["etsy"] },
      { id: "guest", title: "guest books", query: "guest book wedding", partners: ["amazon"] },
      { id: "gifts", title: "gifts", query: "wedding gifts", partners: ["john_lewis"] },
      { id: "favour", title: "favours", query: "wedding favour ideas", partners: ["etsy"] }
    ]
  }
};

export function affiliateConfigForPack(packId: string): ReadyPackAffiliateConfig | undefined {
  return PACK_AFFILIATE[packId];
}

export function listPacksWithAffiliateCategories(): string[] {
  return Object.keys(PACK_AFFILIATE);
}
