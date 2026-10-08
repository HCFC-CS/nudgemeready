import type { PlannerItem, PlannerState } from "../types/ready4Planner";
import { createDefaultPlannerState } from "./ready4PlannerEngine";
import { getEncryptedItem, setEncryptedItem } from "./encryptedStorage";

const PLANNER_STATE_KEY = "nudge-me:ready4-planner-v1";

function normalize(parsed: Partial<PlannerState> | null | undefined): PlannerState {
  if (!parsed || parsed.version !== 1) {
    return createDefaultPlannerState();
  }
  return {
    version: 1,
    items: Array.isArray(parsed.items) ? (parsed.items as PlannerItem[]) : [],
    dismissedTips: Array.isArray(parsed.dismissedTips) ? parsed.dismissedTips.map(String) : [],
    createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : new Date().toISOString(),
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString()
  };
}

export async function loadPlannerState(): Promise<PlannerState> {
  const raw = await getEncryptedItem(PLANNER_STATE_KEY);
  if (!raw) {
    const fresh = createDefaultPlannerState();
    await savePlannerState(fresh);
    return fresh;
  }
  try {
    return normalize(JSON.parse(raw) as Partial<PlannerState>);
  } catch {
    return createDefaultPlannerState();
  }
}

export async function savePlannerState(state: PlannerState) {
  const next = { ...state, updatedAt: new Date().toISOString() };
  await setEncryptedItem(PLANNER_STATE_KEY, JSON.stringify(next));
  return next;
}
