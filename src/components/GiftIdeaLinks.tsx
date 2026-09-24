import { useMemo } from "react";

import { getCardLinksForOccasion, getGiftLinksForOccasion } from "../services/giftLinks";
import { SubtleOutboundLinks } from "./SubtleOutboundLinks";

export function GiftIdeaLinks({
  title,
  giftIdeas = [],
  variant = "present"
}: {
  title: string;
  giftIdeas?: string[];
  variant?: "card" | "present";
}) {
  const links = useMemo(
    () => (variant === "card" ? getCardLinksForOccasion(title) : getGiftLinksForOccasion(title, giftIdeas)),
    [title, giftIdeas, variant]
  );

  if (!title.trim() || !links.length) {
    return null;
  }

  return (
    <SubtleOutboundLinks
      sections={[
        {
          id: variant,
          title: variant === "card" ? "Cards" : "Gifts",
          links
        }
      ]}
      summaryLabel={variant === "card" ? "Card ideas" : "Gift ideas"}
      previewCount={3}
      dismissKey={title.trim() ? `gift:${variant}:${title.trim().toLowerCase()}` : undefined}
    />
  );
}
