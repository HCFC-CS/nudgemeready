import { describe, expect, it } from "vitest";

import type { HorizonEntry } from "../types/nudgeHorizon";
import {
  addMonths,
  buildMonthCells,
  buildWeekDateKeys,
  buildYearMonths,
  calendarWeekdayLabels,
  countByDateKey,
  entriesForDateKey,
  formatMonthTitle
} from "./calendarGrid";
import { localDateKey } from "./nudgeHorizonEngine";

function entry(title: string, at: Date): HorizonEntry {
  return {
    id: title,
    sourceKind: "nudge",
    sourceId: title,
    title,
    at: at.toISOString(),
    flexibility: "fixed",
    label: "DO"
  };
}

describe("calendarGrid", () => {
  const now = new Date(2026, 8, 23, 12, 0, 0, 0);

  it("uses Monday-first weekday labels", () => {
    expect(calendarWeekdayLabels()[0]).toBe("Mon");
    expect(calendarWeekdayLabels()[6]).toBe("Sun");
  });

  it("builds a 42-cell month grid and marks today plus item counts", () => {
    const dentist = entry("Dentist", new Date(2026, 8, 23, 14, 30, 0, 0));
    const bins = entry("Bins", new Date(2026, 8, 23, 19, 0, 0, 0));
    const later = entry("Book removals", new Date(2026, 9, 1, 9, 0, 0, 0));
    const counts = countByDateKey([dentist, bins, later]);
    const selected = localDateKey(now);
    const cells = buildMonthCells(now, selected, counts, now);

    expect(cells).toHaveLength(42);
    expect(cells[0]?.dateKey.endsWith("-31") || cells[0]?.dateKey.endsWith("-01")).toBe(true);
    const today = cells.find((cell) => cell.isToday);
    expect(today?.day).toBe(23);
    expect(today?.isSelected).toBe(true);
    expect(today?.count).toBe(2);
    expect(formatMonthTitle(now)).toBe("September 2026");
  });

  it("changes displayed month dates when the month changes", () => {
    const october = addMonths(now, 1);
    const cells = buildMonthCells(october, "2026-10-01", new Map(), now);
    const inMonth = cells.filter((cell) => cell.inMonth);
    expect(inMonth[0]?.dateKey).toBe("2026-10-01");
    expect(inMonth.at(-1)?.dateKey).toBe("2026-10-31");
    expect(cells.some((cell) => cell.dateKey === "2026-09-23" && cell.inMonth)).toBe(false);
  });

  it("returns sorted items for a selected date", () => {
    const morning = entry("Pilates", new Date(2026, 8, 23, 9, 0, 0, 0));
    const afternoon = entry("Dentist", new Date(2026, 8, 23, 14, 30, 0, 0));
    const other = entry("Call solicitor", new Date(2026, 8, 24, 10, 0, 0, 0));
    const day = entriesForDateKey([afternoon, other, morning], "2026-09-23");
    expect(day.map((item) => item.title)).toEqual(["Pilates", "Dentist"]);
  });

  it("builds a Monday-start week and year month counts", () => {
    const week = buildWeekDateKeys(now);
    expect(week[0]).toBe("2026-09-21");
    expect(week[2]).toBe("2026-09-23");
    const counts = countByDateKey([
      entry("A", new Date(2026, 8, 23, 9, 0, 0, 0)),
      entry("B", new Date(2026, 9, 1, 9, 0, 0, 0))
    ]);
    const year = buildYearMonths(now, counts);
    expect(year).toHaveLength(12);
    expect(year[8]?.count).toBe(1);
    expect(year[9]?.count).toBe(1);
  });
});
