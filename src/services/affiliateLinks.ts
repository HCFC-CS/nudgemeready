/**
 * Central affiliate / partner-link configuration for commercial outbound URLs.
 *
 * Fill in `tag` / `params` when you have real programme IDs.
 * Empty tags leave the destination URL unchanged (still tracked as affiliate-eligible).
 *
 * Official airport pages, maps, Google search, WhatsApp, and Nudge Me Ready
 * first-party links are not monetised.
 */

export type AffiliatePartnerId =
  | "amazon"
  | "booking"
  | "expedia"
  | "hotels"
  | "holiday_extras"
  | "looking4parking"
  | "aph"
  | "moonpig"
  | "notonthehighstreet"
  | "uber"
  | "no1_lounges"
  | "priority_pass"
  | "spotify"
  | "etsy"
  | "ebay"
  | "argos"
  | "john_lewis"
  | "loop_earplugs"
  | "sensory_direct";

export type AffiliatePartnerConfig = {
  id: AffiliatePartnerId;
  label: string;
  /** Host substrings used to match destination URLs. */
  hosts: string[];
  /**
   * Query params appended when set.
   * Example Amazon: { tag: "nudgemeready-21" }
   * Example Booking: { aid: "1234567" }
   */
  params: Record<string, string>;
  enabled: boolean;
};

/** Edit these values when affiliate accounts are approved. */
export const affiliatePartners: AffiliatePartnerConfig[] = [
  {
    id: "amazon",
    label: "Amazon",
    hosts: ["amazon.co.uk", "amazon.com", "amzn.to"],
    params: {
      // Amazon Associates tag — replace when live
      tag: ""
    },
    enabled: true
  },
  {
    id: "booking",
    label: "Booking.com",
    hosts: ["booking.com"],
    params: {
      // Booking.com affiliate aid
      aid: "",
      label: "nudgemeready"
    },
    enabled: true
  },
  {
    id: "expedia",
    label: "Expedia",
    hosts: ["expedia.co.uk", "expedia.com"],
    params: {
      AFFCID: "",
      AFFNAME: "NudgeMeReady"
    },
    enabled: true
  },
  {
    id: "hotels",
    label: "Hotels.com",
    hosts: ["hotels.com"],
    params: {
      MDPCID: "",
      MDPtoken: "nudgemeready"
    },
    enabled: true
  },
  {
    id: "holiday_extras",
    label: "Holiday Extras",
    hosts: ["holidayextras.com"],
    params: {
      // Insert Holiday Extras partner code when available
      Aff: ""
    },
    enabled: true
  },
  {
    id: "looking4parking",
    label: "Looking4Parking",
    hosts: ["looking4parking.com"],
    params: {
      ref: "nudgemeready"
    },
    enabled: true
  },
  {
    id: "aph",
    label: "APH",
    hosts: ["aph.com"],
    params: {
      affiliate: "nudgemeready"
    },
    enabled: true
  },
  {
    id: "moonpig",
    label: "Moonpig",
    hosts: ["moonpig.com"],
    params: {
      utm_source: "nudgemeready",
      utm_medium: "affiliate"
    },
    enabled: true
  },
  {
    id: "notonthehighstreet",
    label: "Notonthehighstreet",
    hosts: ["notonthehighstreet.com"],
    params: {
      utm_source: "nudgemeready",
      utm_medium: "affiliate"
    },
    enabled: true
  },
  {
    id: "uber",
    label: "Uber",
    hosts: ["uber.com", "m.uber.com"],
    params: {
      // Uber affiliate / referral when available
      uclick_id: ""
    },
    enabled: true
  },
  {
    id: "no1_lounges",
    label: "No1 Lounges",
    hosts: ["no1lounges.com"],
    params: {
      utm_source: "nudgemeready",
      utm_medium: "affiliate"
    },
    enabled: true
  },
  {
    id: "spotify",
    label: "Spotify",
    hosts: ["spotify.com", "open.spotify.com"],
    params: {
      // Spotify affiliate / partner code when available
      si: "",
      utm_source: "nudgemeready",
      utm_medium: "affiliate"
    },
    enabled: true
  },
  {
    id: "etsy",
    label: "Etsy",
    hosts: ["etsy.com"],
    params: {
      // Etsy affiliate / impact code when available
      utm_source: "nudgemeready",
      utm_medium: "affiliate",
      utm_campaign: "adhd_supplies"
    },
    enabled: true
  },
  {
    id: "ebay",
    label: "eBay",
    hosts: ["ebay.co.uk", "ebay.com"],
    params: {
      // eBay Partner Network campaign id when available
      mkcid: "",
      mkrid: "",
      utm_source: "nudgemeready",
      utm_medium: "affiliate"
    },
    enabled: true
  },
  {
    id: "argos",
    label: "Argos",
    hosts: ["argos.co.uk"],
    params: {
      // Awin / Argos clickref when available
      clickref: "nudgemeready",
      utm_source: "nudgemeready",
      utm_medium: "affiliate"
    },
    enabled: true
  },
  {
    id: "john_lewis",
    label: "John Lewis",
    hosts: ["johnlewis.com"],
    params: {
      utm_source: "nudgemeready",
      utm_medium: "affiliate",
      utm_campaign: "adhd_supplies"
    },
    enabled: true
  },
  {
    id: "loop_earplugs",
    label: "Loop Earplugs",
    hosts: ["loopearplugs.com"],
    params: {
      // Loop / impact partner code when available
      utm_source: "nudgemeready",
      utm_medium: "affiliate"
    },
    enabled: true
  },
  {
    id: "sensory_direct",
    label: "Sensory Direct",
    hosts: ["sensorydirect.com"],
    params: {
      utm_source: "nudgemeready",
      utm_medium: "affiliate",
      utm_campaign: "adhd_supplies"
    },
    enabled: true
  },
  {
    id: "priority_pass",
    label: "Priority Pass",
    hosts: ["prioritypass.com"],
    params: {
      utm_source: "nudgemeready",
      utm_medium: "affiliate"
    },
    enabled: true
  }
];

export const AFFILIATE_DISCLOSURE_SHORT_ACTIVE =
  "Some links may be affiliate links. We may earn a small commission if you buy or book — at no extra cost to you.";

export const AFFILIATE_DISCLOSURE_LONG_ACTIVE =
  "Nudge Me Ready may earn a commission from qualifying purchases or bookings made through partner links (for example shops, travel parking, lounges, stays and similar services). This does not change the price you pay. Official airport assistance pages, maps and search results are not affiliate links.";

export const AFFILIATE_DISCLOSURE_SHORT_PENDING =
  "Some buttons open partner shops or booking sites. Affiliate programmes are not fully active yet, so we may not earn commission today. Using these links does not cost you extra.";

export const AFFILIATE_DISCLOSURE_LONG_PENDING =
  "Nudge Me Ready may open partner shops and booking sites (for example Amazon, travel parking, lounges or stays). Affiliate tracking and commission are only active when our partner programme IDs are configured. Until then, links still work as normal shopping/booking pages and do not cost you extra. Official airport assistance pages, maps and search results are never affiliate links. ReadyPack health content is organisational support only — it does not diagnose, prescribe, or change medication.";

const LIVE_PROGRAMME_PARAM_KEYS = new Set([
  "tag",
  "aid",
  "Aff",
  "AFFCID",
  "MDPCID",
  "uclick_id",
  "mkcid",
  "mkrid",
  "si"
]);

function hasUsableParamValue(value: string) {
  return Boolean(value && value.trim());
}

/** True when at least one partner has a real programme ID filled in. */
export function hasLiveAffiliateCommissionTracking(): boolean {
  return affiliatePartners.some((partner) =>
    Object.entries(partner.params).some(
      ([key, value]) => LIVE_PROGRAMME_PARAM_KEYS.has(key) && hasUsableParamValue(value)
    )
  );
}

export function getAffiliateDisclosureShort(): string {
  return hasLiveAffiliateCommissionTracking()
    ? AFFILIATE_DISCLOSURE_SHORT_ACTIVE
    : AFFILIATE_DISCLOSURE_SHORT_PENDING;
}

export function getAffiliateDisclosureLong(): string {
  return hasLiveAffiliateCommissionTracking()
    ? AFFILIATE_DISCLOSURE_LONG_ACTIVE
    : AFFILIATE_DISCLOSURE_LONG_PENDING;
}

/** Prefer getters in UI; these stay for existing imports and resolve at module load. */
export const AFFILIATE_DISCLOSURE_SHORT = AFFILIATE_DISCLOSURE_SHORT_PENDING;
export const AFFILIATE_DISCLOSURE_LONG = AFFILIATE_DISCLOSURE_LONG_PENDING;

export function findAffiliatePartner(url: string): AffiliatePartnerConfig | undefined {
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return undefined;
  }
  return affiliatePartners.find(
    (partner) => partner.enabled && partner.hosts.some((candidate) => host === candidate || host.endsWith(`.${candidate}`))
  );
}

/**
 * Append partner query params to a commercial destination URL.
 * Skips empty param values so unfinished IDs do not break destinations.
 */
export function applyAffiliateParams(url: string, partner = findAffiliatePartner(url)): string {
  if (!partner) {
    return url;
  }

  const usableEntries = Object.entries(partner.params).filter(([, value]) => hasUsableParamValue(value));
  if (!usableEntries.length) {
    return url;
  }

  try {
    const parsed = new URL(url);
    for (const [key, value] of usableEntries) {
      if (!parsed.searchParams.has(key)) {
        parsed.searchParams.set(key, value.trim());
      }
    }
    // Light attribution even when programme-specific IDs are empty elsewhere
    if (!parsed.searchParams.has("utm_campaign")) {
      parsed.searchParams.set("utm_campaign", "nudge_me_ready");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export type AffiliateResolvedLink = {
  url: string;
  originalUrl: string;
  partnerId?: AffiliatePartnerId;
  isAffiliate: boolean;
};

export function resolveAffiliateLink(url: string): AffiliateResolvedLink {
  const partner = findAffiliatePartner(url);
  if (!partner) {
    return { url, originalUrl: url, isAffiliate: false };
  }
  return {
    url: applyAffiliateParams(url, partner),
    originalUrl: url,
    partnerId: partner.id,
    isAffiliate: true
  };
}

/** Convenience: resolve then return the outbound URL only. */
export function withAffiliate(url: string): string {
  return resolveAffiliateLink(url).url;
}

export function listConfiguredAffiliatePartners(): AffiliatePartnerConfig[] {
  return affiliatePartners.filter((partner) =>
    Object.values(partner.params).some((value) => hasUsableParamValue(value))
  );
}
