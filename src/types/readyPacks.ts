import type { NudgeItemType, NudgeRepeatRule } from "./nudge";

export type ReadyPackKind = "content" | "theme" | "voice" | "character";

export type ReadyPackCategory =
  | "wellbeing"
  | "neurodiversity"
  | "health"
  | "family"
  | "work"
  | "education"
  | "lifestyle"
  | "events"
  | "theme"
  | "voice"
  | "character";

export type ReadyPackMeta = {
  id: string;
  version: string;
  icon: string;
  category: ReadyPackCategory;
  title: string;
  summary: string;
  kind: ReadyPackKind;
  /** Store product id when paid; omit or empty for free packs. */
  productId?: string;
  /** Organisational support only — not medical advice. */
  healthDisclaimer?: string;
  features: string[];
};

export type ReadyPackListRow = {
  title: string;
};

export type ReadyPackTemplate = {
  id: string;
  title: string;
  type: NudgeItemType;
  notes?: string;
  speakingReminderText?: string;
  repeatRule?: NudgeRepeatRule;
  /** Days from install date for due/reminder (optional). */
  dueInDays?: number;
  reminderInDays?: number;
  listItems?: ReadyPackListRow[];
  priority?: "not_urgent" | "soon" | "important" | "needs_attention";
};

export type ReadyPackBadgeDef = {
  id: string;
  title: string;
  description: string;
};

export type ReadyPackCrewRecommendation = {
  roleHint: string;
  reason: string;
};

export type ThemePackPayload = {
  appearanceKey: string;
  background: string;
  surface: string;
  primary: string;
  accent: string;
  text: string;
};

export type VoicePackPayload = {
  voiceKey: string;
  label: string;
  language: string;
  pitch: number;
  rate: number;
};

export type CharacterPackPayload = {
  characterKey: string;
  displayName: string;
  avatarSymbol: string;
  stickers: string[];
  wallpapers: string[];
  quotes: string[];
  voiceKey: string;
};

export type ReadyPackContent = {
  templates: ReadyPackTemplate[];
  aiCoachPrompts?: string[];
  badges?: ReadyPackBadgeDef[];
  crewRecommendations?: ReadyPackCrewRecommendation[];
  theme?: ThemePackPayload;
  voice?: VoicePackPayload;
  character?: CharacterPackPayload;
};

export type ReadyPack = ReadyPackMeta & {
  content: ReadyPackContent;
};

export type InstalledPackRecord = {
  packId: string;
  version: string;
  installedAt: string;
  templateItemIds: Record<string, string>;
};

export type ReadyPackInstallState = {
  installed: Record<string, InstalledPackRecord>;
};

export type UninstallMode = "unedited_only" | "all_from_pack";

export type ReadyPackPreview = {
  pack: ReadyPack;
  templateCount: number;
  templates: ReadyPackTemplate[];
  isInstalled: boolean;
  installedVersion?: string;
  canInstall: boolean;
  entitlementReason?: string;
};
