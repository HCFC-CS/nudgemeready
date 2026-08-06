import * as Calendar from "expo-calendar";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { loadAppPreferences, saveAppPreferences } from "./appPreferencesStorage";
import { createItem, updateItem } from "./nudgeItems";
import type { AppointmentGuest, NudgeItem } from "../types/nudge";

export type CalendarSyncResult =
  | { ok: true; calendarEventId: string; calendarId: string; calendarLabel: string; method: "calendar" | "ics" }
  | { ok: false; message: string };

export type PhoneCalendarOption = {
  id: string;
  title: string;
  label: string;
  sourceName: string;
  sourceType?: string;
  color?: string;
  isPrimary?: boolean;
  allowsModifications: boolean;
};

function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function toIcsDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function buildGuestLines(guests: AppointmentGuest[] | undefined) {
  return (guests ?? [])
    .filter((guest) => guest.email)
    .map((guest) => `ATTENDEE;CN=${escapeIcsText(guest.name)}:mailto:${guest.email}`)
    .join("\r\n");
}

function describeSource(calendar: Calendar.Calendar) {
  const sourceName = calendar.source?.name?.trim() || calendar.source?.id || "Phone";
  const sourceType = String(calendar.source?.type ?? calendar.type ?? "").toLowerCase();
  const hint =
    sourceType.includes("exchange") || sourceName.toLowerCase().includes("outlook")
      ? "Outlook / Exchange"
      : sourceType.includes("caldav") || sourceName.toLowerCase().includes("icloud")
        ? "iCloud"
        : sourceName.toLowerCase().includes("gmail") || sourceName.toLowerCase().includes("google")
          ? "Google"
          : sourceName;
  return { sourceName, sourceType, hint };
}

export function formatCalendarLabel(calendar: Pick<PhoneCalendarOption, "title" | "sourceName">) {
  if (!calendar.sourceName || calendar.sourceName === calendar.title) {
    return calendar.title;
  }
  return `${calendar.title} · ${calendar.sourceName}`;
}

export async function ensureCalendarPermission() {
  const current = await Calendar.getCalendarPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Calendar.requestCalendarPermissionsAsync();
  return requested.granted;
}

export async function listWritablePhoneCalendars(): Promise<{
  calendars: PhoneCalendarOption[];
  granted: boolean;
  message?: string;
}> {
  const result = await listPhoneCalendars({ writableOnly: true });
  return result;
}

export async function listPhoneCalendars(options?: { writableOnly?: boolean }): Promise<{
  calendars: PhoneCalendarOption[];
  granted: boolean;
  message?: string;
}> {
  try {
    const granted = await ensureCalendarPermission();
    if (!granted) {
      return {
        calendars: [],
        granted: false,
        message: "Allow calendar access so appointments can sync with the Calendar app on this phone."
      };
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const optionsList: PhoneCalendarOption[] = calendars
      .filter((calendar) => (options?.writableOnly ? calendar.allowsModifications : true))
      .map((calendar) => {
        const source = describeSource(calendar);
        return {
          id: calendar.id,
          title: calendar.title,
          sourceName: source.hint,
          sourceType: source.sourceType,
          color: calendar.color,
          isPrimary: calendar.isPrimary,
          allowsModifications: calendar.allowsModifications,
          label: formatCalendarLabel({ title: calendar.title, sourceName: source.hint })
        };
      })
      .sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return a.label.localeCompare(b.label);
      });

    return {
      calendars: optionsList,
      granted: true,
      message: optionsList.length
        ? undefined
        : options?.writableOnly
          ? "No writable calendars found. Add iCloud, Google, or Outlook in the phone Calendar settings."
          : "No calendars found on this phone."
    };
  } catch {
    return {
      calendars: [],
      granted: false,
      message: "Could not read calendars on this phone."
    };
  }
}

function toIsoDate(value: Date | string | undefined) {
  if (!value) {
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}

function eventToNudgeDraft(
  event: Calendar.Event,
  actor?: NudgeItem["createdBy"]
): NudgeItem | undefined {
  const title = (event.title ?? "").trim();
  if (!title || event.id.startsWith("ics:")) {
    return undefined;
  }
  const startDate = toIsoDate(event.startDate);
  if (!startDate) {
    return undefined;
  }
  const endDate = toIsoDate(event.endDate);
  const allDay = Boolean(event.allDay);
  const locationLabel = typeof event.location === "string" ? event.location.trim() : "";
  const notes = typeof event.notes === "string" ? event.notes.trim() : "";

  return createItem({
    id: `cal-${event.id}`,
    title,
    type: allDay ? "event" : "appointment",
    status: "open",
    createdBy: actor,
    startDate,
    endDate,
    dueDate: startDate,
    location: locationLabel ? { label: locationLabel, address: locationLabel } : undefined,
    notes: notes || undefined,
    guests: [],
    syncToCalendar: true,
    calendarId: event.calendarId,
    calendarEventId: event.id
  });
}

export type PhoneCalendarImportResult = {
  ok: boolean;
  added: number;
  updated: number;
  scanned: number;
  message?: string;
  drafts: NudgeItem[];
};

/** Fetch phone calendar events and map them to appointment/event nudge drafts. */
export async function fetchPhoneCalendarNudgeDrafts(options?: {
  daysBack?: number;
  daysForward?: number;
  actor?: NudgeItem["createdBy"];
  calendarIds?: string[];
}): Promise<PhoneCalendarImportResult> {
  const daysBack = options?.daysBack ?? 1;
  const daysForward = options?.daysForward ?? 90;

  try {
    const listed = await listPhoneCalendars({ writableOnly: false });
    if (!listed.granted) {
      return { ok: false, added: 0, updated: 0, scanned: 0, drafts: [], message: listed.message };
    }
    if (!listed.calendars.length) {
      return { ok: false, added: 0, updated: 0, scanned: 0, drafts: [], message: listed.message };
    }

    const calendarIds =
      options?.calendarIds?.length
        ? options.calendarIds
        : listed.calendars.map((calendar) => calendar.id);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - daysBack);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    end.setDate(end.getDate() + daysForward);

    const events = await Calendar.getEventsAsync(calendarIds, start, end);
    const drafts = events
      .map((event) => eventToNudgeDraft(event, options?.actor))
      .filter((item): item is NudgeItem => Boolean(item));

    return {
      ok: true,
      added: 0,
      updated: 0,
      scanned: events.length,
      drafts,
      message: drafts.length
        ? undefined
        : "No upcoming calendar events found in the selected range."
    };
  } catch {
    return {
      ok: false,
      added: 0,
      updated: 0,
      scanned: 0,
      drafts: [],
      message: "Could not read events from the phone calendar."
    };
  }
}

/** Merge imported calendar drafts into existing nudges (match on calendarEventId). */
export function mergePhoneCalendarDrafts(
  current: NudgeItem[],
  drafts: NudgeItem[]
): { items: NudgeItem[]; added: number; updated: number } {
  const byEventId = new Map<string, NudgeItem>();
  for (const item of current) {
    if (item.calendarEventId) {
      byEventId.set(item.calendarEventId, item);
    }
  }

  let items = [...current];
  let added = 0;
  let updated = 0;

  for (const draft of drafts) {
    const eventId = draft.calendarEventId;
    if (!eventId) {
      continue;
    }
    const existing = byEventId.get(eventId);
    if (existing) {
      const nextStatus = existing.status === "done" || existing.status === "cancelled" ? existing.status : draft.status;
      items = updateItem(items, existing.id, {
        title: draft.title,
        type: existing.type === "appointment" || existing.type === "event" ? draft.type : existing.type,
        startDate: draft.startDate,
        endDate: draft.endDate,
        dueDate: draft.dueDate,
        location: draft.location ?? existing.location,
        notes: draft.notes ?? existing.notes,
        calendarId: draft.calendarId ?? existing.calendarId,
        calendarEventId: eventId,
        syncToCalendar: true,
        status: nextStatus
      });
      updated += 1;
      continue;
    }
    items = [draft, ...items];
    byEventId.set(eventId, draft);
    added += 1;
  }

  return { items, added, updated };
}

export async function resolveTargetCalendarId(preferredCalendarId?: string) {
  const { calendars, granted, message } = await listWritablePhoneCalendars();
  if (!granted) {
    return { calendarId: undefined as string | undefined, calendars, message };
  }

  const prefs = await loadAppPreferences();
  const preferred =
    (preferredCalendarId && calendars.find((calendar) => calendar.id === preferredCalendarId)) ||
    (prefs.preferredCalendarId && calendars.find((calendar) => calendar.id === prefs.preferredCalendarId));

  if (preferred) {
    return { calendarId: preferred.id, calendar: preferred, calendars };
  }

  if (Platform.OS === "ios") {
    try {
      const defaultCalendar = await Calendar.getDefaultCalendarAsync();
      const match = calendars.find((calendar) => calendar.id === defaultCalendar.id);
      if (match) {
        return { calendarId: match.id, calendar: match, calendars };
      }
    } catch {
      // Fall through to first writable calendar.
    }
  }

  const primary = calendars.find((calendar) => calendar.isPrimary) ?? calendars[0];
  return {
    calendarId: primary?.id,
    calendar: primary,
    calendars,
    message: primary ? undefined : message
  };
}

export function buildIcsContent(item: NudgeItem) {
  const start = item.startDate ?? item.dueDate ?? item.reminderDate;
  if (!start) {
    return undefined;
  }
  const startStamp = toIcsDate(start);
  if (!startStamp) {
    return undefined;
  }
  const endSource = item.endDate ?? new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString();
  const endStamp = toIcsDate(endSource) ?? startStamp;
  const location = item.location?.label ?? item.location?.address ?? "";
  const description = [
    item.notes,
    ...(item.guests ?? []).map((guest) => `Guest: ${guest.name}${guest.email ? ` <${guest.email}>` : ""}`)
  ]
    .filter(Boolean)
    .join("\n");
  const stamp = toIcsDate(new Date().toISOString()) ?? startStamp;
  const attendeeBlock = buildGuestLines(item.guests);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nudge me Ready//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${item.id}@nudgemeready.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${startStamp}`,
    `DTEND:${endStamp}`,
    `SUMMARY:${escapeIcsText(item.title)}`,
    location ? `LOCATION:${escapeIcsText(location)}` : undefined,
    description ? `DESCRIPTION:${escapeIcsText(description)}` : undefined,
    attendeeBlock || undefined,
    "END:VEVENT",
    "END:VCALENDAR"
  ].filter(Boolean);

  return lines.join("\r\n");
}

export async function syncItemToPhoneCalendar(
  item: NudgeItem,
  preferredCalendarId?: string
): Promise<CalendarSyncResult> {
  const start = item.startDate ?? item.dueDate ?? item.reminderDate;
  if (!start) {
    return { ok: false, message: "Add a date and time before linking to the calendar." };
  }

  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) {
    return { ok: false, message: "That date looks invalid." };
  }
  const endDate = item.endDate ? new Date(item.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000);

  try {
    const target = await resolveTargetCalendarId(preferredCalendarId ?? item.calendarId);
    if (!target.calendarId || !target.calendar) {
      return shareAsIcs(item, target.message ?? "No writable calendar was found.");
    }

    const details: Parameters<typeof Calendar.createEventAsync>[1] = {
      title: item.title,
      startDate,
      endDate,
      location: item.location?.label ?? item.location?.address,
      notes: [
        item.notes,
        ...(item.guests ?? []).map((guest) => `Guest: ${guest.name}${guest.email ? ` (${guest.email})` : ""}`)
      ]
        .filter(Boolean)
        .join("\n"),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      alarms: [{ relativeOffset: -60 }]
    };

    let calendarEventId = item.calendarEventId;
    if (calendarEventId && !calendarEventId.startsWith("ics:")) {
      await Calendar.updateEventAsync(calendarEventId, details);
    } else {
      calendarEventId = await Calendar.createEventAsync(target.calendarId, details);
    }

    if (Platform.OS === "android") {
      for (const guest of item.guests ?? []) {
        if (!guest.email) continue;
        try {
          await Calendar.createAttendeeAsync(calendarEventId, {
            email: guest.email,
            name: guest.name,
            role: Calendar.AttendeeRole.ATTENDEE,
            status: Calendar.AttendeeStatus.INVITED,
            type: Calendar.AttendeeType.OPTIONAL
          });
        } catch {
          // Some calendars reject attendee writes; event itself still syncs.
        }
      }
    }

    const prefs = await loadAppPreferences();
    if (prefs.preferredCalendarId !== target.calendarId) {
      await saveAppPreferences({ ...prefs, preferredCalendarId: target.calendarId });
    }

    return {
      ok: true,
      calendarEventId,
      calendarId: target.calendarId,
      calendarLabel: target.calendar.label,
      method: "calendar"
    };
  } catch {
    return shareAsIcs(item);
  }
}

async function shareAsIcs(item: NudgeItem, fallbackMessage?: string): Promise<CalendarSyncResult> {
  const content = buildIcsContent(item);
  if (!content) {
    return { ok: false, message: fallbackMessage ?? "Could not build a calendar file." };
  }

  const directory = FileSystem.cacheDirectory;
  if (!directory) {
    return { ok: false, message: fallbackMessage ?? "Could not save a calendar file." };
  }

  const path = `${directory}nudge-${item.id}.ics`;
  await FileSystem.writeAsStringAsync(path, content, { encoding: FileSystem.EncodingType.UTF8 });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    return { ok: false, message: fallbackMessage ?? "Sharing is not available on this device." };
  }

  await Sharing.shareAsync(path, {
    mimeType: "text/calendar",
    dialogTitle: "Add to calendar",
    UTI: "public.calendar-event"
  });

  return {
    ok: true,
    calendarEventId: item.calendarEventId ?? `ics:${item.id}`,
    calendarId: item.calendarId ?? "",
    calendarLabel: "Calendar file",
    method: "ics"
  };
}

export async function removeItemFromPhoneCalendar(calendarEventId?: string) {
  if (!calendarEventId || calendarEventId.startsWith("ics:")) {
    return;
  }
  try {
    const permitted = await ensureCalendarPermission();
    if (!permitted) {
      return;
    }
    await Calendar.deleteEventAsync(calendarEventId);
  } catch {
    // Ignore missing events or permission changes.
  }
}
