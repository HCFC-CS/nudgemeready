import type { ReadyPackAffiliateCategory, ReadyPackShopPartnerId } from "../types/readyPacks";
import { findAffiliatePartner, withAffiliate, type AffiliatePartnerId } from "./affiliateLinks";

export const AFFILIATE_OFFER_LIMIT = 6;

/**
 * Queries that must never be ranked — NMR is not a dieting or medical-product app.
 * Ordinary wellbeing kit (water bottle, yoga mat) is allowed.
 */
export const HEALTH_UNSAFE_AFFILIATE_PATTERN =
  /\b(weight\s*loss|fat\s*burn(?:er)?s?|appetite\s*suppress(?:ant)?s?|diet\s*pills?|slimming\s*pills?|anabolic|steroids?|oxycodone|codeine|cannabis|marijuana|\bcbd\b|\bthc\b|vape\s*pens?|e-?cigarettes?)\b/i;

export type RankedAffiliateOffer = {
  id: string;
  label: string;
  url: string;
  partnerId: AffiliatePartnerId;
  categoryId: string;
  score: number;
};

const PARTNER_LABEL: Record<ReadyPackShopPartnerId, string> = {
  amazon: "Amazon",
  argos: "Argos",
  john_lewis: "John Lewis",
  etsy: "Etsy",
  ebay: "eBay",
  notonthehighstreet: "Notonthehighstreet",
  moonpig: "Moonpig"
};

export function shopSearchUrl(partnerId: ReadyPackShopPartnerId, query: string): string {
  const encoded = encodeURIComponent(query);
  if (partnerId === "amazon") {
    return `https://www.amazon.co.uk/s?k=${encoded}`;
  }
  if (partnerId === "argos") {
    return `https://www.argos.co.uk/search/${encoded}/`;
  }
  if (partnerId === "john_lewis") {
    return `https://www.johnlewis.com/search?search-term=${encoded}`;
  }
  if (partnerId === "etsy") {
    return `https://www.etsy.com/uk/search?q=${encoded}`;
  }
  if (partnerId === "ebay") {
    return `https://www.ebay.co.uk/sch/i.html?_nkw=${encoded}`;
  }
  if (partnerId === "moonpig") {
    return `https://www.moonpig.com/uk/search/?term=${encoded}`;
  }
  return `https://www.notonthehighstreet.com/search?q=${encoded}`;
}

export function isHealthUnsafeAffiliateText(...parts: Array<string | undefined>): boolean {
  return parts.some((part) => Boolean(part && HEALTH_UNSAFE_AFFILIATE_PATTERN.test(part)));
}

function tokenise(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

function scoreOffer(
  category: ReadyPackAffiliateCategory,
  categoryIndex: number,
  context: string
): number {
  let score = 80 - categoryIndex * 4;
  if (!context) {
    return score;
  }
  const haystack = new Set(tokenise(context));
  const needles = [...tokenise(category.title), ...tokenise(category.query)];
  let hits = 0;
  for (const needle of needles) {
    if (haystack.has(needle)) {
      hits += 1;
    }
  }
  return score + hits * 12;
}

export function expandAffiliateCategories(categories: ReadyPackAffiliateCategory[]): Array<{
  category: ReadyPackAffiliateCategory;
  categoryIndex: number;
  partnerId: ReadyPackShopPartnerId;
  url: string;
}> {
  const rows: Array<{
    category: ReadyPackAffiliateCategory;
    categoryIndex: number;
    partnerId: ReadyPackShopPartnerId;
    url: string;
  }> = [];
  categories.forEach((category, categoryIndex) => {
    if (isHealthUnsafeAffiliateText(category.title, category.query)) {
      return;
    }
    for (const partnerId of category.partners) {
      rows.push({
        category,
        categoryIndex,
        partnerId,
        url: withAffiliate(shopSearchUrl(partnerId, category.query))
      });
    }
  });
  return rows;
}

/**
 * Rank 3–6 find-it offers from pack categories.
 * Uses the existing `withAffiliate` helper only — no second tracker.
 */
export function rankAffiliateOffers(input: {
  categories: ReadyPackAffiliateCategory[];
  title?: string;
  notes?: string;
  limit?: number;
}): RankedAffiliateOffer[] {
  const limit = Math.min(AFFILIATE_OFFER_LIMIT, Math.max(1, input.limit ?? AFFILIATE_OFFER_LIMIT));
  const context = `${input.title ?? ""} ${input.notes ?? ""}`;
  const expanded = expandAffiliateCategories(input.categories);
  const scored: RankedAffiliateOffer[] = [];

  for (const row of expanded) {
    const partner = findAffiliatePartner(row.url);
    if (!partner) {
      continue;
    }
    scored.push({
      id: `${row.category.id}-${row.partnerId}`,
      label: `${PARTNER_LABEL[row.partnerId]} · ${row.category.title}`,
      url: row.url,
      partnerId: partner.id,
      categoryId: row.category.id,
      score: scoreOffer(row.category, row.categoryIndex, context)
    });
  }

  scored.sort((first, second) => {
    if (second.score !== first.score) {
      return second.score - first.score;
    }
    return first.id.localeCompare(second.id);
  });

  const picked: RankedAffiliateOffer[] = [];
  const usedPartners = new Set<string>();

  for (const offer of scored) {
    if (picked.length >= limit) {
      break;
    }
    if (usedPartners.has(offer.partnerId)) {
      continue;
    }
    picked.push(offer);
    usedPartners.add(offer.partnerId);
  }

  for (const offer of scored) {
    if (picked.length >= limit) {
      break;
    }
    if (picked.some((row) => row.id === offer.id)) {
      continue;
    }
    picked.push(offer);
  }

  return picked;
}
