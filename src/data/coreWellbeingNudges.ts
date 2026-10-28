import type { NudgeRepeatRule } from "../types/nudge";

export type CoreWellbeingKind = "hydration" | "meal" | "movement";

export type CoreWellbeingNudge = {
  kind: CoreWellbeingKind;
  actionId: string;
  label: string;
  title: string;
  notes: string;
  listItems: string[];
  repeatRule?: NudgeRepeatRule;
  match: RegExp;
};

/**
 * Optional everyday wellbeing check-ins.
 * These are ordinary lists — not a diet, calorie, or fitness tracker.
 */
export const CORE_WELLBEING_NUDGES: CoreWellbeingNudge[] = [
  {
    kind: "hydration",
    actionId: "have-a-drink",
    label: "Have a drink of water",
    title: "Have a drink of water",
    notes:
      "A quiet check-in, not a target. Skip is fine. This is not a hydration tracker or medical advice.",
    repeatRule: { frequency: "daily" },
    listItems: ["I had a drink", "I'll have a sip when I remember", "Skip today — that's fine"],
    match: /\b(drink water|have a drink|hydration|glass of water|sip of water)\b/i
  },
  {
    kind: "meal",
    actionId: "ate-something",
    label: "I ate something",
    title: "I ate something",
    notes:
      "A gentle meal check. Not a calorie log. No macros, no deficit, no weigh-in. Skip is fine.",
    listItems: [
      "I ate something",
      "I had a drink",
      "I wasn't hungry and that's okay",
      "Skip today — that's fine"
    ],
    match: /\b(i ate|ate something|eat something|meal check|had breakfast|had lunch|had dinner)\b/i
  },
  {
    kind: "movement",
    actionId: "move-a-little",
    label: "Move a little",
    title: "Move a little",
    notes: "Whatever feels doable. Rest days are valid. Not a fitness or weight-loss programme.",
    listItems: ["Short walk", "Stretch", "Move at home", "Rest day — also valid"],
    match: /\b(move a little|short walk|stretch|gentle movement|move at home)\b/i
  }
];

const FORBIDDEN_WELLBEING_COPY =
  /calorie|macro|deficit|bmi|weight\s*loss|weigh-?in|fat burn|diet pill|fasting window/i;

export function matchCoreWellbeing(text: string): CoreWellbeingNudge | undefined {
  const trimmed = text.trim();
  if (!trimmed) {
    return undefined;
  }
  return CORE_WELLBEING_NUDGES.find((entry) => entry.match.test(trimmed));
}

export function assertWellbeingCopyIsSupportive(text: string): boolean {
  return !FORBIDDEN_WELLBEING_COPY.test(text);
}

export function getCoreWellbeing(kind: CoreWellbeingKind): CoreWellbeingNudge {
  return CORE_WELLBEING_NUDGES.find((entry) => entry.kind === kind)!;
}

export function wellbeingListRows(kind: CoreWellbeingKind) {
  return getCoreWellbeing(kind).listItems.map((title) => ({ title }));
}
