import { useMemo } from "react";

import { getReadyPackShopSections } from "../services/readyPackShopLinks";
import { SubtleOutboundLinks } from "./SubtleOutboundLinks";

export function ReadyPackShopLinks({
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
      getReadyPackShopSections({
        sourcePackId,
        sourceTemplateId,
        title,
        notes
      }),
    [sourcePackId, sourceTemplateId, title, notes]
  );

  return <SubtleOutboundLinks sections={sections} summaryLabel="Optional shops" previewCount={3} />;
}
