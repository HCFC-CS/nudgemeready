import type { AffiliatePartnerId } from "../services/affiliateLinks";

export const SAVED_THINGS_COMPARE_LIMIT = 3;

export type SavedThing = {
  id: string;
  title: string;
  url: string;
  partnerId?: AffiliatePartnerId;
  partnerLabel?: string;
  sourcePackId?: string;
  savedAt: string;
};

export type SavedThingsState = {
  items: SavedThing[];
  compareIds: string[];
  alreadyHaveKeys: string[];
};
