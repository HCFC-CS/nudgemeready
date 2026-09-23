import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import type { NudgeItem } from "../types/nudge";
import type { PlannerItem, PlannerItemStatus, PlannerState } from "../types/ready4Planner";
import { useReadyPacks } from "./useReadyPacks";
import {
  ASSIGNMENT_BREAKDOWN_STEPS,
  createPlannerId,
  createDefaultPlannerState,
  itemsForThisWeek,
  itemsForToday,
  resetFlexibleWeek
} from "../services/ready4PlannerEngine";
import {
  draftToPlannerItem,
  parsePlannerQuickAdd,
  type ParsedPlannerDraft
} from "../services/ready4PlannerParse";
import {
  getPlannerConfig,
  plannerConfigsForInstalledPacks
} from "../services/ready4PlannerConfigs";
import { loadPlannerState, savePlannerState } from "../services/ready4PlannerStorage";
import { useNudgeActor } from "./useNudgeActor";
import { useNudgeItems } from "./useNudgeItems";
import { useRewardBank } from "./useRewardBank";
import {
  buildLinkedNudgeFromPlanner,
  findLinkedNudge,
  plannerNeedsNudgeCompletionSync,
  plannerPatchFromNudge
} from "../services/plannerNudgeLink";

type PlannerContextValue = {
  state: PlannerState;
  isReady: boolean;
  installedConfigs: ReturnType<typeof plannerConfigsForInstalledPacks>;
  todayItems: PlannerItem[];
  weekItems: PlannerItem[];
  addItem: (item: Omit<PlannerItem, "id" | "createdAt" | "updatedAt" | "archived"> & Partial<PlannerItem>) => PlannerItem;
  addFromDraft: (draft: ParsedPlannerDraft) => PlannerItem;
  updateItem: (id: string, patch: Partial<PlannerItem>) => void;
  setStatus: (id: string, status: PlannerItemStatus) => void;
  archiveItem: (id: string) => void;
  resetWeek: () => void;
  addAssignmentBreakdown: (parentTitle: string, dueAt: string | null, packId?: string) => PlannerItem[];
  linkNudge: (itemId: string, itemOverride?: PlannerItem) => { nudgeDraftId: string; draft?: NudgeItem };
};

const PlannerContext = createContext<PlannerContextValue | undefined>(undefined);

export function Ready4PlannerProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<PlannerState>(createDefaultPlannerState);
  const [isReady, setIsReady] = useState(false);
  const { packs, isInstalled } = useReadyPacks();
  const actor = useNudgeActor();
  const { saveItem, items: nudgeItems, completeNudgeItem, setItemStatus } = useNudgeItems();
  const { earn } = useRewardBank();

  useEffect(() => {
    loadPlannerState()
      .then(setState)
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    void savePlannerState(state);
  }, [state, isReady]);

  const installedPackIds = useMemo(
    () => packs.filter((pack) => pack.kind === "content" && isInstalled(pack.id)).map((pack) => pack.id),
    [packs, isInstalled]
  );

  const installedConfigs = useMemo(
    () => plannerConfigsForInstalledPacks(installedPackIds),
    [installedPackIds]
  );

  const todayItems = useMemo(() => itemsForToday(state.items), [state.items]);
  const weekItems = useMemo(() => itemsForThisWeek(state.items), [state.items]);

  const persist = useCallback((updater: (current: PlannerState) => PlannerState) => {
    setState((current) => ({ ...updater(current), updatedAt: new Date().toISOString() }));
  }, []);

  const addItem: PlannerContextValue["addItem"] = useCallback(
    (input) => {
      const at = new Date().toISOString();
      const item: PlannerItem = {
        id: createPlannerId(),
        ready4PackId: input.ready4PackId,
        sectionId: input.sectionId ?? null,
        type: input.type,
        title: input.title.trim() || "Planner item",
        description: input.description ?? null,
        startAt: input.startAt ?? null,
        endAt: input.endAt ?? null,
        dueAt: input.dueAt ?? null,
        durationMinutes: input.durationMinutes ?? null,
        recurring: Boolean(input.recurring),
        recurrenceLabel: input.recurrenceLabel ?? null,
        subject: input.subject ?? null,
        bringList: input.bringList ?? [],
        status: input.status ?? "planned",
        priority: input.priority ?? "normal",
        notes: input.notes ?? null,
        calendarEventId: input.calendarEventId ?? null,
        nudgeItemId: input.nudgeItemId ?? null,
        rewardNote: input.rewardNote ?? null,
        budgetItemId: input.budgetItemId ?? null,
        crewMemberIds: input.crewMemberIds ?? [],
        archived: false,
        createdAt: at,
        updatedAt: at
      };
      persist((current) => ({ ...current, items: [...current.items, item] }));
      return item;
    },
    [persist]
  );

  const addFromDraft = useCallback(
    (draft: ParsedPlannerDraft) => {
      const item = draftToPlannerItem(draft);
      // Prefer an installed pack; fall back only if that pack is installed or sole option.
      if (!installedPackIds.includes(item.ready4PackId) && installedPackIds[0]) {
        item.ready4PackId = installedPackIds[0];
        const config = getPlannerConfig(item.ready4PackId);
        item.sectionId = config?.plannerSections[0]?.id ?? item.sectionId;
      }
      persist((current) => ({ ...current, items: [...current.items, item] }));
      return item;
    },
    [installedPackIds, persist]
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<PlannerItem>) => {
      let updated: PlannerItem | undefined;
      persist((current) => ({
        ...current,
        items: current.items.map((item) => {
          if (item.id !== id) {
            return item;
          }
          updated = { ...item, ...patch, updatedAt: new Date().toISOString() };
          return updated;
        })
      }));
      if (updated?.nudgeItemId) {
        const existing = findLinkedNudge(nudgeItems, updated);
        if (existing) {
          saveItem(buildLinkedNudgeFromPlanner(updated, actor, existing));
        }
      }
    },
    [actor, nudgeItems, persist, saveItem]
  );

  const setStatus = useCallback(
    (id: string, status: PlannerItemStatus) => {
      updateItem(id, { status });
      const item = state.items.find((entry) => entry.id === id);
      const linkedId = item?.nudgeItemId;
      if (!linkedId) {
        return;
      }
      if (status === "done") {
        completeNudgeItem(linkedId);
        earn({
          difficulty: "normal",
          title: item.title,
          kind: "task",
          packId: item.ready4PackId,
          sourceItemId: linkedId
        });
        return;
      }
      if (status === "not_needed") {
        setItemStatus(linkedId, "cancelled");
      }
    },
    [completeNudgeItem, earn, setItemStatus, state.items, updateItem]
  );

  const archiveItem = useCallback(
    (id: string) => {
      const item = state.items.find((entry) => entry.id === id);
      updateItem(id, { archived: true });
      if (item?.nudgeItemId) {
        setItemStatus(item.nudgeItemId, "cancelled");
      }
    },
    [setItemStatus, state.items, updateItem]
  );

  const resetWeek = useCallback(() => {
    persist((current) => ({
      ...current,
      items: resetFlexibleWeek(current.items)
    }));
  }, [persist]);

  const addAssignmentBreakdown = useCallback(
    (parentTitle: string, dueAt: string | null, packId = "ready4-study") => {
      const created: PlannerItem[] = [];
      const steps = ASSIGNMENT_BREAKDOWN_STEPS;
      steps.forEach((step, index) => {
        const at = new Date().toISOString();
        let stepDue: string | null = null;
        if (dueAt) {
          const dueMs = Date.parse(dueAt);
          if (Number.isFinite(dueMs)) {
            const offsetDays = Math.max(0, steps.length - index - 1);
            const date = new Date(dueMs);
            date.setDate(date.getDate() - offsetDays);
            stepDue = date.toISOString();
          }
        }
        const item: PlannerItem = {
          id: createPlannerId(),
          ready4PackId: packId,
          sectionId: "assignments",
          type: "task",
          title: `${step} — ${parentTitle}`,
          description: null,
          startAt: null,
          endAt: null,
          dueAt: stepDue,
          durationMinutes: null,
          recurring: false,
          recurrenceLabel: null,
          subject: parentTitle,
          bringList: [],
          status: "planned",
          priority: "normal",
          notes: null,
          calendarEventId: null,
          nudgeItemId: null,
          rewardNote: null,
          budgetItemId: null,
          crewMemberIds: [],
          archived: false,
          createdAt: at,
          updatedAt: at
        };
        created.push(item);
      });
      persist((current) => ({ ...current, items: [...current.items, ...created] }));
      return created;
    },
    [persist]
  );

  const linkNudge = useCallback(
    (itemId: string, itemOverride?: PlannerItem) => {
      const fromState = state.items.find((entry) => entry.id === itemId);
      const item = itemOverride ?? fromState;
      if (!item) {
        return { nudgeDraftId: "" };
      }
      const existing = findLinkedNudge(nudgeItems, item);
      const draft = buildLinkedNudgeFromPlanner(item, actor, existing);
      saveItem(draft);
      persist((current) => {
        const exists = current.items.some((entry) => entry.id === itemId);
        const at = new Date().toISOString();
        return {
          ...current,
          items: exists
            ? current.items.map((entry) =>
                entry.id === itemId ? { ...entry, nudgeItemId: draft.id, updatedAt: at } : entry
              )
            : [...current.items, { ...item, nudgeItemId: draft.id, updatedAt: at }]
        };
      });
      return { nudgeDraftId: draft.id, draft };
    },
    [actor, nudgeItems, persist, saveItem, state.items]
  );

  useEffect(() => {
    if (!isReady) {
      return;
    }
    setState((current) => {
      let changed = false;
      const nextItems = current.items.map((item) => {
        const linked = findLinkedNudge(nudgeItems, item);
        if (!linked || !plannerNeedsNudgeCompletionSync(item, linked)) {
          return item;
        }
        const patch = plannerPatchFromNudge(linked);
        changed = true;
        return {
          ...item,
          ...patch,
          nudgeItemId: item.nudgeItemId ?? linked.id,
          updatedAt: new Date().toISOString()
        };
      });
      if (!changed) {
        return current;
      }
      return { ...current, items: nextItems, updatedAt: new Date().toISOString() };
    });
  }, [isReady, nudgeItems]);

  const value: PlannerContextValue = {
    state,
    isReady,
    installedConfigs,
    todayItems,
    weekItems,
    addItem,
    addFromDraft,
    updateItem,
    setStatus,
    archiveItem,
    resetWeek,
    addAssignmentBreakdown,
    linkNudge
  };

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function useReady4Planner() {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error("useReady4Planner must be used inside Ready4PlannerProvider");
  }
  return context;
}

export { parsePlannerQuickAdd };
