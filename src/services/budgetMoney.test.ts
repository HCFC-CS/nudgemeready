import { describe, expect, it } from "vitest";

import { formatMoneyMinor, parseMoneyToMinor } from "./budgetMoney";

describe("budgetMoney", () => {
  it("parses pounds, decimals, blanks and junk without NaN", () => {
    expect(parseMoneyToMinor("0")).toBe(0);
    expect(parseMoneyToMinor("£12.50")).toBe(1250);
    expect(parseMoneyToMinor("1,200")).toBe(120000);
    expect(parseMoneyToMinor("")).toBeNull();
    expect(parseMoneyToMinor("   ")).toBeNull();
    expect(parseMoneyToMinor("abc")).toBeNull();
    expect(parseMoneyToMinor(Number.NaN)).toBeNull();
  });

  it("formats remaining including a calm overspend minus", () => {
    expect(formatMoneyMinor(0)).toBe("£0.00");
    expect(formatMoneyMinor(1250)).toBe("£12.50");
    expect(formatMoneyMinor(-400)).toBe("-£4.00");
    expect(formatMoneyMinor(1_000_000_00)).toBe("£1,000,000.00");
  });
});
