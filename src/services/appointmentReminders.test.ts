import { describe, expect, it } from "vitest";

import {
  appointmentStartAt,
  detectSelectedAppointmentReminders,
  reminderDateForOption,
  syncAppointmentReminderChildren
} from "./appointmentReminders";
import { createItem } from "./nudgeItems";

describe("appointmentReminders", () => {
  it("parses appointment start from display date/time", () => {
    const at = appointmentStartAt("15-06-2026", "14:30");
    expect(at?.getFullYear()).toBe(2026);
    expect(at?.getMonth()).toBe(5);
    expect(at?.getDate()).toBe(15);
    expect(at?.getHours()).toBe(14);
    expect(at?.getMinutes()).toBe(30);
  });

  it("offsets one day and one hour before", () => {
    const appointmentAt = new Date(2026, 5, 15, 14, 0, 0, 0);
    const dayBefore = reminderDateForOption(appointmentAt, "1 day before");
    const hourBefore = reminderDateForOption(appointmentAt, "1 hour before");
    expect(new Date(dayBefore!).getDate()).toBe(14);
    expect(new Date(hourBefore!).getHours()).toBe(13);
  });

  it("creates child reminders for selected offsets", () => {
    const parent = createItem({ title: "Dentist", type: "appointment", startDate: "2026-06-15T13:00:00.000Z" });
    const appointmentAt = new Date("2026-06-15T13:00:00.000Z");
    const children = syncAppointmentReminderChildren({
      parent,
      appointmentAt,
      selected: ["1 day before", "1 hour before"],
      existingChildren: []
    });
    expect(children.upsert).toHaveLength(2);
    expect(children.upsert.every((child) => child.type === "reminder" && child.parentId === parent.id)).toBe(true);
    expect(children.cancel).toHaveLength(0);
  });

  it("cancels deselected appointment pre-reminders", () => {
    const parent = createItem({ title: "Dentist", type: "appointment", startDate: "2026-06-15T13:00:00.000Z" });
    const appointmentAt = new Date("2026-06-15T13:00:00.000Z");
    const existing = syncAppointmentReminderChildren({
      parent,
      appointmentAt,
      selected: ["1 day before", "1 hour before"],
      existingChildren: []
    }).upsert;
    const next = syncAppointmentReminderChildren({
      parent,
      appointmentAt,
      selected: ["1 hour before"],
      existingChildren: existing
    });
    expect(next.upsert).toHaveLength(1);
    expect(next.upsert[0]?.sourceTemplateId).toBe("appt-pre-1h");
    expect(next.cancel).toHaveLength(1);
    expect(next.cancel[0]?.sourceTemplateId).toBe("appt-pre-1d");
  });

  it("detects selected chips from existing children", () => {
    const child = createItem({
      title: "1 day before — Dentist",
      type: "reminder",
      sourceTemplateId: "appt-pre-1d"
    });
    expect(detectSelectedAppointmentReminders([child])).toEqual(["1 day before"]);
  });
});
