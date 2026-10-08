import type { NudgeItem } from "../types/nudge";
import { getPrimaryDate } from "./nudgeItems";
import { localDateKey } from "./nudgeHorizonEngine";

export function countTodayProgress(items: NudgeItem[], now = new Date()) {
  const key = localDateKey(now);
  const forDay = items.filter((item) => {
    if (item.status === "cancelled") {
      return false;
    }
    const date = getPrimaryDate(item);
    return Boolean(date && localDateKey(date) === key);
  });
  const done = forDay.filter((item) => item.status === "done").length;
  return {
    total: forDay.length,
    done,
    left: forDay.length - done
  };
}
