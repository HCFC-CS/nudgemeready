/**
 * Soft triage (`what-helps`) → sibling template ids for Ready 4 packs.
 * Matching is case-insensitive substring against the checklist row title.
 */
const WHAT_HELPS_ROUTES: Record<string, Array<{ match: RegExp; templateIds: string[] }>> = {
  "ready4-study": [
    { match: /assignment|steps/i, templateIds: ["assignment-steps", "assignment-planner"] },
    { match: /revision/i, templateIds: ["revision-planner", "study-routine"] },
    { match: /class|lecture|prep for class/i, templateIds: ["lecture-prep", "class-follow-up"] },
    { match: /exam/i, templateIds: ["exam-countdown", "exam-night-before"] },
    { match: /budget|money/i, templateIds: ["weekly-budget"] },
    { match: /overwhelm|tiny step|one thing/i, templateIds: ["overwhelm"] },
    { match: /admin|form/i, templateIds: ["weekly-reset"] },
    { match: /rest/i, templateIds: [] }
  ],
  "ready4-home": [
    { match: /daily|reset/i, templateIds: ["daily-reset"] },
    { match: /leav|keys/i, templateIds: ["leaving-home"] },
    { match: /clean/i, templateIds: ["cleaning-planner"] },
    { match: /bin/i, templateIds: ["bin-day"] },
    { match: /maintenance|repair/i, templateIds: ["maintenance"] },
    { match: /bill/i, templateIds: ["bill-reminders"] },
    { match: /rest|overwhelm/i, templateIds: [] }
  ],
  "ready4-baby": [
    { match: /feed|rest check/i, templateIds: ["feed-rest", "parent-reset"] },
    { match: /bag|supplies/i, templateIds: ["bag-checklist"] },
    { match: /appointment/i, templateIds: ["appointment-prep"] },
    { match: /ask for help|help/i, templateIds: ["ask-help"] },
    { match: /visitor/i, templateIds: ["visitor-boundaries"] },
    { match: /rest/i, templateIds: ["parent-reset"] }
  ],
  "ready4-moving": [
    { match: /budget|afford/i, templateIds: ["move-budget"] },
    { match: /mortgage|deposit/i, templateIds: ["mortgage-readiness"] },
    { match: /search|property|shortlist/i, templateIds: ["house-search"] },
    { match: /viewing/i, templateIds: ["viewing-prep"] },
    { match: /offer/i, templateIds: ["offer-progress"] },
    { match: /pack/i, templateIds: ["packing"] },
    { match: /document|admin/i, templateIds: ["documents"] },
    { match: /move.?day|day plan/i, templateIds: ["move-day"] },
    { match: /address|service/i, templateIds: ["address-change"] },
    { match: /supplier|mover|box/i, templateIds: ["move-suppliers"] },
    { match: /settle/i, templateIds: ["settle-in"] },
    { match: /rest/i, templateIds: [] }
  ],
  "ready4-wedding": [
    { match: /budget/i, templateIds: ["budget"] },
    { match: /guest|rsvp/i, templateIds: ["guests"] },
    { match: /supplier/i, templateIds: ["suppliers"] },
    { match: /ceremony|reception/i, templateIds: ["ceremony-reception"] },
    { match: /legal|document|register/i, templateIds: ["legal-docs"] },
    { match: /venue/i, templateIds: ["venue-shortlist"] },
    { match: /outfit|dress|suit/i, templateIds: ["outfits"] },
    { match: /party|best man|bridesmaid/i, templateIds: ["wedding-party"] },
    { match: /honeymoon|after/i, templateIds: ["honeymoon", "after-wedding"] },
    { match: /rest|nothing urgent/i, templateIds: [] }
  ],
  "ready4-digital-life": [
    { match: /password/i, templateIds: ["password-review"] },
    { match: /update/i, templateIds: ["software-updates"] },
    { match: /subscription/i, templateIds: ["subscriptions"] },
    { match: /backup/i, templateIds: ["cloud-backup"] },
    { match: /device|health/i, templateIds: ["device-maintenance"] },
    { match: /inventory/i, templateIds: ["digital-inventory"] },
    { match: /rest/i, templateIds: [] }
  ],
  "ready4-finance": [
    { match: /bill/i, templateIds: ["bill-calendar"] },
    { match: /subscription/i, templateIds: ["subscriptions"] },
    { match: /renewal/i, templateIds: ["annual-renewals"] },
    { match: /budget|money/i, templateIds: ["budget-planner"] },
    { match: /pay|payment|saving/i, templateIds: ["payment-nudge", "savings-goals"] },
    { match: /rest/i, templateIds: [] }
  ]
};

/** True when this installed nudge is a soft-triage list that can open sibling tools. */
export function isWhatHelpsTemplate(sourceTemplateId?: string) {
  return sourceTemplateId === "what-helps";
}

/**
 * Resolve preferred sibling template ids for a what-helps checklist row.
 * Empty array means a valid rest/stop outcome (no navigation).
 * Undefined means no mapping for this pack/row.
 */
export function resolveWhatHelpsTemplateIds(
  sourcePackId: string | undefined,
  rowTitle: string
): string[] | undefined {
  if (!sourcePackId) {
    return undefined;
  }
  const routes = WHAT_HELPS_ROUTES[sourcePackId];
  if (!routes) {
    return undefined;
  }
  const title = rowTitle.trim();
  if (!title) {
    return undefined;
  }
  for (const route of routes) {
    if (route.match.test(title)) {
      return route.templateIds;
    }
  }
  return undefined;
}

/**
 * Pick the first installed sibling item id from templateItemIds map.
 */
export function resolveWhatHelpsItemId(
  sourcePackId: string | undefined,
  rowTitle: string,
  templateItemIds: Record<string, string> | undefined,
  itemsById?: Map<string, { id: string; status?: string }>
): { itemId?: string; restOutcome: boolean; templateId?: string } {
  const templateIds = resolveWhatHelpsTemplateIds(sourcePackId, rowTitle);
  if (templateIds === undefined) {
    return { restOutcome: false };
  }
  if (templateIds.length === 0) {
    return { restOutcome: true };
  }
  if (!templateItemIds) {
    return { restOutcome: false };
  }
  for (const templateId of templateIds) {
    const itemId = templateItemIds[templateId];
    if (!itemId) {
      continue;
    }
    const item = itemsById?.get(itemId);
    if (item && (item.status === "cancelled" || item.status === "done")) {
      continue;
    }
    return { itemId, restOutcome: false, templateId };
  }
  // Fall back to first mapped id even if done, so Open still works.
  for (const templateId of templateIds) {
    const itemId = templateItemIds[templateId];
    if (itemId) {
      return { itemId, restOutcome: false, templateId };
    }
  }
  return { restOutcome: false };
}
