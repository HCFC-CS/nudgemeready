import type { NudgeItemType, NudgeRepeatRule } from "../types/nudge";
import type {
  CoreNudgeAction,
  NudgeIntent,
  Ready4NudgeExtension
} from "../types/nudgeIntents";
import { CORE_NUDGE_ACTIONS, coreActionsForIntent, getIntentCategory } from "./coreNudgeActions";
import { extensionsForInstalledPacks } from "./ready4NudgeExtensions";
import { classifyCaptureText } from "./classifyCaptureText";
import { matchCoreWellbeing } from "../data/coreWellbeingNudges";

export type UnifiedNudgeAction = {
  id: string;
  label: string;
  intent: NudgeIntent;
  source: "core" | "ready4";
  packId?: string;
  itemType?: NudgeItemType;
  defaultTitle?: string;
  notes?: string;
  listItems?: string[];
  repeatRule?: NudgeRepeatRule;
  templateId?: string;
  route?: string;
  kind: "create" | "route" | "crew";
};

export function actionsForIntent(
  intent: NudgeIntent,
  installedPackIds: string[]
): { core: UnifiedNudgeAction[]; pack: UnifiedNudgeAction[] } {
  const core = coreActionsForIntent(intent).map(fromCore);
  const pack = extensionsForInstalledPacks(installedPackIds)
    .filter((entry) => entry.intent === intent)
    .map(fromExtension);
  return { core, pack };
}

function fromCore(action: CoreNudgeAction): UnifiedNudgeAction {
  return {
    id: action.id,
    label: action.label,
    intent: action.intent,
    source: "core",
    itemType: action.itemType,
    defaultTitle: action.defaultTitle,
    notes: action.notes,
    listItems: action.listItems,
    repeatRule: action.repeatRule,
    route: action.route,
    kind: action.kind
  };
}

function fromExtension(action: Ready4NudgeExtension): UnifiedNudgeAction {
  return {
    id: action.id,
    label: action.label,
    intent: action.intent,
    source: "ready4",
    packId: action.packId,
    itemType: action.itemType,
    defaultTitle: action.defaultTitle,
    templateId: action.templateId,
    route: action.route,
    kind: action.route ? "route" : "create"
  };
}

export type SomethingElseResult = {
  intent: NudgeIntent;
  title: string;
  itemType: NudgeItemType;
  /** Only set when the matching Ready4 pack is installed. */
  packId?: string;
  suggestedFields: ReturnType<typeof classifyCaptureText>["suggestedFields"];
};

/**
 * Free-text / voice “Something else”.
 * Always creates a core nudge. Links a Ready4 pack only if installed.
 */
export function resolveSomethingElse(
  text: string,
  installedPackIds: string[]
): SomethingElseResult {
  const classification = classifyCaptureText(text);
  const wellbeing = matchCoreWellbeing(text);
  const intent = inferIntentFromText(text, wellbeing ? "list" : classification.type);
  const installed = new Set(installedPackIds);
  const packHint = detectPackHint(text);
  const packId = packHint && installed.has(packHint) ? packHint : undefined;

  return {
    intent,
    title: wellbeing?.title || classification.title || text.trim(),
    itemType: wellbeing ? "list" : classification.type,
    packId,
    suggestedFields: wellbeing
      ? {
          ...classification.suggestedFields,
          notes: wellbeing.notes,
          listItems: wellbeing.listItems,
          repeatRule: wellbeing.repeatRule
        }
      : classification.suggestedFields
  };
}

function inferIntentFromText(text: string, type: NudgeItemType): NudgeIntent {
  const lower = text.toLowerCase();
  if (
    /\b(birthday|anniversary|contact|message|crew|celebration|family|friend)\b/.test(lower)
  ) {
    return "life_people";
  }
  if (/\b(buy|pay|bill|renew|shop|cancel|subscription|mortgage|solicitor cost)\b/.test(lower)) {
    return "buy_pay";
  }
  if (
    /\b(appointment|meeting|event|booking|flight|hotel|leave by|somewhere to (be|go))\b/.test(
      lower
    ) ||
    type === "appointment" ||
    type === "event"
  ) {
    return "book_go";
  }
  if (
    /\b(remind|remember|don't forget|follow up|bring|take|check)\b/.test(lower) ||
    type === "reminder"
  ) {
    return "remember";
  }
  if (/\b(plan|prepare|organise|organize|checklist|decide|budget)\b/.test(lower) || type === "project" || type === "list") {
    return "plan";
  }
  return "do";
}

/** Soft hints only — never force a pack if not installed. */
function detectPackHint(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (/\b(mov(e|ing)|solicitor|mortgage|removal|packing)\b/.test(lower)) {
    return "ready4-moving";
  }
  if (/\b(baby|hospital bag|pram|nursery|christening|baptism|sip\s*&\s*see)\b/.test(lower)) {
    return "ready4-baby";
  }
  if (/\b(wedding|bride|groom|hen |stag )\b/.test(lower)) {
    return "ready4-wedding";
  }
  if (/\b(exam|assignment|revision|study|coursework)\b/.test(lower)) {
    return "ready4-study";
  }
  if (/\b(flight|hotel|passport|airport|holiday|trip)\b/.test(lower)) {
    return "ready4-travel";
  }
  if (/\b(medication|prescription|pharmacy|dose)\b/.test(lower)) {
    return "ready4-medication";
  }
  return undefined;
}

export function describeIntent(intent: NudgeIntent) {
  return getIntentCategory(intent);
}

export function allCoreActionIds() {
  return CORE_NUDGE_ACTIONS.map((action) => action.id);
}
