import { describe, expect, it } from "vitest";

import {
  isNoisyCalendarEventTitle,
  isNoisyCalendarName,
  shouldImportPhoneCalendarEvent
} from "./calendarNoiseFilter";

describe("calendarNoiseFilter", () => {
  it("drops holiday and DST titles", () => {
    expect(isNoisyCalendarEventTitle("Halloween")).toBe(true);
    expect(isNoisyCalendarEventTitle("Daylight Saving Time begins")).toBe(true);
    expect(isNoisyCalendarEventTitle("Clocks go back")).toBe(true);
    expect(isNoisyCalendarEventTitle("Bank Holiday")).toBe(true);
    expect(isNoisyCalendarEventTitle("Dentist")).toBe(false);
    expect(isNoisyCalendarEventTitle("Team standup")).toBe(false);
  });

  it("drops holiday-style calendars", () => {
    expect(isNoisyCalendarName("UK Holidays")).toBe(true);
    expect(isNoisyCalendarName("Birthdays")).toBe(true);
    expect(isNoisyCalendarName("Work")).toBe(false);
  });

  it("gates import on title and calendar", () => {
    expect(
      shouldImportPhoneCalendarEvent({
        title: "Halloween",
        calendarTitle: "Personal"
      })
    ).toBe(false);
    expect(
      shouldImportPhoneCalendarEvent({
        title: "Mum visit",
        calendarTitle: "UK Holidays"
      })
    ).toBe(false);
    expect(
      shouldImportPhoneCalendarEvent({
        title: "Mum visit",
        calendarTitle: "Personal"
      })
    ).toBe(true);
  });
});
