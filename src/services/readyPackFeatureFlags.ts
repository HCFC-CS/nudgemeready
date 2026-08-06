import type { ReadyPackKind } from "../types/readyPacks";

/**
 * Theme / voice / character packs write preference keys but do not yet drive the live UI.
 * Keep them out of the shop until overlays and voice selection are wired end-to-end.
 */
export const READY_PACK_COSMETICS_ENABLED = false;

/**
 * AI coach prompts, badges and crew tips are stored on content packs for a future release.
 * Hide them from preview so we do not overpromise unfinished features.
 */
export const READY_PACK_PREVIEW_EXTRAS_ENABLED = false;

export function isCatalogueKindVisible(kind: ReadyPackKind): boolean {
  if (kind === "content") {
    return true;
  }
  return READY_PACK_COSMETICS_ENABLED;
}

export function isCosmeticPackKind(kind: ReadyPackKind): boolean {
  return kind === "theme" || kind === "voice" || kind === "character";
}
