import type {
  ReadyPack,
  ReadyPackBadgeDef,
  ReadyPackCrewRecommendation,
  ReadyPackKind,
  ReadyPackMeta,
  ReadyPackTemplate,
  CharacterPackPayload,
  ThemePackPayload,
  VoicePackPayload
} from "../../types/readyPacks";

export function defineContentPack(input: {
  meta: Omit<ReadyPackMeta, "kind"> & { kind?: ReadyPackKind };
  templates: ReadyPackTemplate[];
  aiCoachPrompts?: string[];
  badges?: ReadyPackBadgeDef[];
  crewRecommendations?: ReadyPackCrewRecommendation[];
}): ReadyPack {
  return {
    ...input.meta,
    kind: input.meta.kind ?? "content",
    content: {
      templates: input.templates,
      aiCoachPrompts: input.aiCoachPrompts ?? [],
      badges: input.badges ?? [],
      crewRecommendations: input.crewRecommendations ?? []
    }
  };
}

export function defineThemePack(
  meta: Partial<ReadyPackMeta> & Pick<ReadyPackMeta, "id" | "version" | "icon" | "title" | "summary">,
  theme: ThemePackPayload
): ReadyPack {
  return {
    ...meta,
    kind: "theme",
    category: meta.category ?? "theme",
    features: meta.features ?? ["Colour theme"],
    content: { templates: [], theme }
  };
}

export function defineVoicePack(
  meta: Partial<ReadyPackMeta> & Pick<ReadyPackMeta, "id" | "version" | "icon" | "title" | "summary">,
  voice: VoicePackPayload
): ReadyPack {
  return {
    ...meta,
    kind: "voice",
    category: meta.category ?? "voice",
    features: meta.features ?? ["Spoken voice profile"],
    content: { templates: [], voice }
  };
}

export function defineCharacterPack(
  meta: Partial<ReadyPackMeta> & Pick<ReadyPackMeta, "id" | "version" | "icon" | "title" | "summary">,
  character: CharacterPackPayload
): ReadyPack {
  return {
    ...meta,
    kind: "character",
    category: meta.category ?? "character",
    features: meta.features ?? ["Avatar", "Stickers", "Quotes", "Voice"],
    content: { templates: [], character }
  };
}

export const organisationalHealthNote =
  "Organisational support only. This pack does not diagnose, prescribe, or change medication. Follow advice from your clinician.";

type Ready4PackInput = {
  /** Short slug after `ready4-`, e.g. `study` → id `ready4-study`. */
  slug: string;
  /** Display name after “Ready 4 ”, e.g. `Study`. */
  name: string;
  summary: string;
  category: ReadyPackMeta["category"];
  icon: string;
  features: string[];
  templates: ReadyPackTemplate[];
  /** Omit or leave undefined for free packs. */
  productId?: string;
  healthDisclaimer?: string;
  version?: string;
  aiCoachPrompts?: string[];
  badges?: ReadyPackBadgeDef[];
  crewRecommendations?: ReadyPackCrewRecommendation[];
};

/** Edition 1 catalogue helper — consistent Ready 4 ids, titles and product ids. */
export function ready4Pack(input: Ready4PackInput): ReadyPack {
  const id = `ready4-${input.slug}`;
  return defineContentPack({
    meta: {
      id,
      version: input.version ?? "1.0.0",
      icon: input.icon,
      category: input.category,
      title: `Ready 4 ${input.name}`,
      summary: input.summary,
      features: input.features,
      productId: input.productId,
      healthDisclaimer: input.healthDisclaimer
    },
    templates: input.templates,
    aiCoachPrompts: input.aiCoachPrompts,
    badges: input.badges,
    crewRecommendations: input.crewRecommendations
  });
}
