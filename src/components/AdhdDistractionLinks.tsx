import { useMemo } from "react";

import { getAdhdDistractionSections } from "../services/adhdDistractionLinks";
import { SubtleOutboundLinks } from "./SubtleOutboundLinks";

export function AdhdDistractionLinks({
  sourcePackId,
  sourceTemplateId,
  title,
  notes
}: {
  sourcePackId?: string;
  sourceTemplateId?: string;
  title: string;
  notes?: string;
}) {
  const sections = useMemo(
    () =>
      getAdhdDistractionSections({
        sourcePackId,
        sourceTemplateId,
        title,
        notes
      }),
    [sourcePackId, sourceTemplateId, title, notes]
  );

  const showAffiliateNote = sections.some((section) =>
    section.links.some((link) =>
      Boolean(
        link.url.match(
          /amazon\.|spotify\.|argos\.|etsy\.|ebay\.|johnlewis\.|loopearplugs\.|sensorydirect\.|notonthehighstreet\./i
        )
      )
    )
  );

  return (
    <SubtleOutboundLinks
      sections={sections}
      summaryLabel="Helpful ideas"
      showAffiliateNote={showAffiliateNote}
      previewCount={3}
    />
  );
}
