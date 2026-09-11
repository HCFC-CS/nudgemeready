import { useMemo } from "react";

import { getHolidayTravelSections } from "../services/holidayTravelLinks";
import { SubtleOutboundLinks } from "./SubtleOutboundLinks";

export function HolidayTravelLinks({
  sourcePackId,
  sourceTemplateId,
  title,
  notes,
  locationLabel
}: {
  sourcePackId?: string;
  sourceTemplateId?: string;
  title: string;
  notes?: string;
  locationLabel?: string;
}) {
  const sections = useMemo(
    () =>
      getHolidayTravelSections({
        sourcePackId,
        sourceTemplateId,
        title,
        notes,
        locationLabel
      }),
    [sourcePackId, sourceTemplateId, title, notes, locationLabel]
  );

  return <SubtleOutboundLinks sections={sections} summaryLabel="Travel ideas" dismissKey={sourcePackId ? `travel:${sourcePackId}:${sourceTemplateId ?? "item"}` : undefined} sourcePackId={sourcePackId} />;
}
