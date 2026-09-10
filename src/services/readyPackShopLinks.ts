import { getPack } from "../data/readyPacks/catalogue";
import { listPacksWithAffiliateCategories } from "../data/readyPacks/affiliateCategories";
import { rankAffiliateOffers } from "./affiliateRecommendationEngine";

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

function keywordMatch(blob: string, keywords: string[]) {
  const haystack = blob.toLowerCase();
  return keywords.some((keyword) => {
    const needle = keyword.toLowerCase();
    if (!needle) {
      return false;
    }
    return new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(haystack);
  });
}

/**
 * Partner shop sections for Ready4 item detail screens.
 * Packs declare `affiliateCategories`; ranking uses the shared `withAffiliate` engine.
 * Ready4 Travel keeps its dedicated airport / stay link UI.
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

  const affiliate = getPack(packId)?.content.affiliate;
  if (!affiliate) {
    return [];
  }

  const templateId = item.sourceTemplateId ?? "";
  const blob = `${item.title} ${item.notes ?? ""}`;
  const match =
    affiliate.templateIds.includes(templateId) ||
    templateId === "pack-shop" ||
    keywordMatch(blob, affiliate.keywords);

  if (!match) {
    return [];
  }

  const offers = rankAffiliateOffers({
    categories: affiliate.categories,
    title: item.title,
    notes: item.notes,
    limit: 6
  });
  if (!offers.length) {
    return [];
  }

  return [
    {
      id: `${packId}-shop`,
      title: affiliate.sectionTitle,
      hint: affiliate.hint,
      links: offers.map((offer) => ({
        id: offer.id,
        label: offer.label,
        url: offer.url
      }))
    }
  ];
}

export function listPacksWithShopLinks(): string[] {
  return listPacksWithAffiliateCategories();
}

export function getShopSectionForPack(packId: string): PackShopSection | undefined {
  const affiliate = getPack(packId)?.content.affiliate;
  if (!affiliate) {
    return undefined;
  }
  const offers = rankAffiliateOffers({
    categories: affiliate.categories,
    limit: 6
  });
  return {
    id: `${packId}-shop`,
    title: affiliate.sectionTitle,
    hint: affiliate.hint,
    links: offers.map((offer) => ({
      id: offer.id,
      label: offer.label,
      url: offer.url
    }))
  };
}
