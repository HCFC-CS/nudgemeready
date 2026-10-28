import { describe, expect, it } from "vitest";

import {
  buildLeavingPlaceSpeechText,
  clampHomeThresholdMeters,
  createDefaultPlaces,
  DEFAULT_PLACE_CHECKLISTS,
  getPlaceChecklist,
  getPlaceThresholdMeters,
  getReminderPlaces,
  HOME_THRESHOLD_DEFAULT_METERS,
  HOME_THRESHOLD_MAX_METERS,
  HOME_THRESHOLD_MIN_METERS,
  type HomeSettings
} from "./homeSettingsStorage";

describe("clampHomeThresholdMeters", () => {
  it("keeps values inside 1–50 m", () => {
    expect(clampHomeThresholdMeters(1)).toBe(HOME_THRESHOLD_MIN_METERS);
    expect(clampHomeThresholdMeters(50)).toBe(HOME_THRESHOLD_MAX_METERS);
    expect(clampHomeThresholdMeters(25)).toBe(25);
  });

  it("rounds and clamps out-of-range values", () => {
    expect(clampHomeThresholdMeters(12.6)).toBe(13);
    expect(clampHomeThresholdMeters(0)).toBe(1);
    expect(clampHomeThresholdMeters(100)).toBe(50);
    expect(clampHomeThresholdMeters(undefined)).toBe(HOME_THRESHOLD_DEFAULT_METERS);
  });
});

describe("per-place leaving checklists", () => {
  it("defaults home, work and school to different items", () => {
    expect(DEFAULT_PLACE_CHECKLISTS.home).toEqual(["keys", "phone", "wallet"]);
    expect(DEFAULT_PLACE_CHECKLISTS.work).toEqual(["laptop", "notes", "charger"]);
    expect(DEFAULT_PLACE_CHECKLISTS.school).toEqual(["homework", "gym kit", "lunch"]);
  });

  it("builds place-specific speech", () => {
    const work = buildLeavingPlaceSpeechText("work", ["laptop", "notes"]);
    expect(work).toMatch(/leaving work/i);
    expect(work).toMatch(/laptop/);
    expect(work).toMatch(/notes/);
    expect(work.toLowerCase()).not.toMatch(/forgot|late|penalty/);

    const home = buildLeavingPlaceSpeechText("home", ["keys", "phone", "wallet"]);
    expect(home).toMatch(/leaving home/i);
    expect(home).toMatch(/keys/);
  });

  it("uses each place’s own distance for geofence reminders", () => {
    const places = createDefaultPlaces();
    places.home = {
      ...places.home,
      latitude: 53.4,
      longitude: -2.9,
      reminderEnabled: true,
      thresholdMeters: 10,
      checklistItems: ["keys", "phone"]
    };
    places.work = {
      ...places.work,
      latitude: 53.5,
      longitude: -2.8,
      reminderEnabled: true,
      thresholdMeters: 40,
      checklistItems: ["laptop", "notes"]
    };
    const settings: HomeSettings = { enabled: true, places };
    const reminderPlaces = getReminderPlaces(settings);
    expect(reminderPlaces).toHaveLength(2);
    expect(getPlaceThresholdMeters(places.home)).toBe(10);
    expect(getPlaceThresholdMeters(places.work)).toBe(40);
    expect(getPlaceChecklist(places.work)).toEqual(["laptop", "notes"]);
  });
});
