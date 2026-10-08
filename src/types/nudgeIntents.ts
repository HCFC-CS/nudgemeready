import type { IoniconName } from "../components/iconTypes";
import type { NudgeItemType, NudgeRepeatRule } from "./nudge";

/** Six core “What do you want to do?” categories — always available. */
export type NudgeIntent =
  | "plan"
  | "remember"
  | "do"
  | "book_go"
  | "buy_pay"
  | "life_people";

export type NudgeActionKind = "create" | "route" | "crew";

export type CoreNudgeAction = {
  id: string;
  label: string;
  intent: NudgeIntent;
  kind: NudgeActionKind;
  /** Draft type when creating a nudge. */
  itemType?: NudgeItemType;
  /** Prefill title for the draft. */
  defaultTitle?: string;
  notes?: string;
  listItems?: string[];
  repeatRule?: NudgeRepeatRule;
  /** Navigate to an existing screen instead of ItemDetails. */
  route?: string;
  icon?: IoniconName;
};

export type Ready4NudgeExtension = {
  id: string;
  label: string;
  intent: NudgeIntent;
  packId: string;
  itemType?: NudgeItemType;
  defaultTitle?: string;
  /** Optional ReadyPack template to open after create (preview / install flow). */
  templateId?: string;
  route?: string;
  icon?: IoniconName;
};

export type Ready4NudgeExtensionPack = {
  packId: string;
  extensions: Ready4NudgeExtension[];
};

export type NudgeIntentCategory = {
  intent: NudgeIntent;
  title: string;
  subtitle: string;
  icon: IoniconName;
};
