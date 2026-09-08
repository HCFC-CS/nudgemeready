import { describe, expect, it } from "vitest";

import {
  buildEventPrepTimeline,
  getPrepStartTime,
  parseEventDateTime
} from "./eventPrepTimeline";

describe("buildEventPrepTimeline travel reverse", () => {
  const eventAt = parseEventDateTime("24-08-2026", "19:00")!;
  const steps = [
    { id: "a", title: "Start prep", durationMinutes: 15 },
    { id: "b", title: "Outfit", durationMinutes: 15 }
  ];

  it("puts leave time travelMinutes before the event", () => {
    const timeline = buildEventPrepTimeline(eventAt, 45, 15, steps, "Arena");
    const leave = timeline.find((entry) => entry.kind === "leave")!;
    expect(leave.startAt.getHours()).toBe(18);
    expect(leave.startAt.getMinutes()).toBe(15);
    expect(leave.durationMinutes).toBe(45);
    expect(leave.subtitle).toContain("45");
  });

  it("shifts prep steps earlier when travel time increases", () => {
    const shortTravel = getPrepStartTime(eventAt, 30, 15, steps)!;
    const longTravel = getPrepStartTime(eventAt, 60, 15, steps)!;
    expect(longTravel.getTime()).toBeLessThan(shortTravel.getTime());
    expect(shortTravel.getTime() - longTravel.getTime()).toBe(30 * 60_000);
  });
});
