import { describe, expect, it } from "vitest";

import { roundTravelMinutesUp } from "./travelEstimate";

describe("roundTravelMinutesUp", () => {
  it("rounds up to the next 5 minutes with a calm buffer", () => {
    expect(roundTravelMinutesUp(60)).toBe(5);
    expect(roundTravelMinutesUp(12 * 60)).toBe(15);
    expect(roundTravelMinutesUp(42 * 60)).toBe(45);
    expect(roundTravelMinutesUp(45 * 60)).toBe(45);
    expect(roundTravelMinutesUp(61 * 60)).toBe(65);
  });
});
