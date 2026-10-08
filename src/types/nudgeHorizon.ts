/** Universal Nudge Horizon — one life view over core nudges, planner, budget. */

export type NudgeHorizonId = "today" | "week" | "month" | "quarter" | "year" | "later";

export type HorizonFlexibility = "fixed" | "flexible";

export type HorizonBand =
  | "next"
  | "timed"
  | "anytime"
  | "dont_forget"
  | "nice_if"
  | "still_need"
  | "day"
  | "month_bucket"
  | "overview";

export type HorizonSourceKind = "nudge" | "planner" | "budget";

export type HorizonEntry = {
  id: string;
  sourceKind: HorizonSourceKind;
  /** Canonical source id in its store */
  sourceId: string;
  title: string;
  at: string | null;
  endAt?: string | null;
  flexibility: HorizonFlexibility;
  bandHint?: HorizonBand;
  label: string;
  packId?: string | null;
  nudgeIntent?: string | null;
  priority?: "low" | "normal" | "important";
  leaveByAt?: string | null;
  durationMinutes?: number | null;
  linkedNudgeId?: string | null;
  /** Extra provenance for detail, not for duplicate cards */
  alsoLinked?: string[];
};

export type HorizonDayGroup = {
  dateKey: string;
  label: string;
  count: number;
  entries: HorizonEntry[];
  collapsedDefault?: boolean;
};

export type HorizonMonthGroup = {
  monthKey: string;
  label: string;
  count: number;
  entries: HorizonEntry[];
};

export type TodayHorizonView = {
  summary: string;
  next: HorizonEntry | null;
  timed: HorizonEntry[];
  anytime: HorizonEntry[];
  dontForget: HorizonEntry[];
  niceIf: HorizonEntry[];
  stillNeed: HorizonEntry[];
  tomorrowCount: number;
  totalCount: number;
  fixedCount: number;
  flexibleCount: number;
};

export type WeekHorizonView = {
  summary: string;
  days: HorizonDayGroup[];
  totalCount: number;
  busiestDayLabel: string | null;
  overwhelm: boolean;
  whatMattersMost: HorizonEntry[];
  moreCount: number;
};

export type MonthHorizonView = {
  summary: string;
  thisWeek: HorizonEntry[];
  nextWeek: HorizonEntry[];
  laterMonth: HorizonEntry[];
  totalCount: number;
};

export type QuarterHorizonView = {
  summary: string;
  entries: HorizonEntry[];
  totalCount: number;
};

export type YearHorizonView = {
  summary: string;
  months: HorizonMonthGroup[];
  nextBig: HorizonEntry | null;
  totalCount: number;
};

export type LaterHorizonView = {
  summary: string;
  entries: HorizonEntry[];
  totalCount: number;
};

export type SimplifyMode =
  | "essentials"
  | "fixed_only"
  | "hide_optional"
  | "as_is";
