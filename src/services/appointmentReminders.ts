import { createItem } from "./nudgeItems";
import type { NudgeItem } from "../types/nudge";

export const APPOINTMENT_REMINDER_OPTIONS = ["1 day before", "1 hour before", "Custom"] as const;
export type AppointmentReminderOption = (typeof APPOINTMENT_REMINDER_OPTIONS)[number];

const TEMPLATE_BY_OPTION: Record<AppointmentReminderOption, string> = {
  "1 day before": "appt-pre-1d",
  "1 hour before": "appt-pre-1h",
  Custom: "appt-pre-custom"
};

const OPTION_BY_TEMPLATE = Object.fromEntries(
  Object.entries(TEMPLATE_BY_OPTION).map(([option, templateId]) => [templateId, option])
) as Record<string, AppointmentReminderOption>;

export function isAppointmentPreReminder(item: Pick<NudgeItem, "type" | "sourceTemplateId">) {
  return item.type === "reminder" && Boolean(item.sourceTemplateId && OPTION_BY_TEMPLATE[item.sourceTemplateId]);
}

export function detectSelectedAppointmentReminders(children: NudgeItem[]): AppointmentReminderOption[] {
  const selected = children
    .filter(isAppointmentPreReminder)
    .map((child) => OPTION_BY_TEMPLATE[child.sourceTemplateId!])
    .filter(Boolean);
  return [...new Set(selected)];
}

export function appointmentStartAt(dateText: string, timeText: string, fallbackIso?: string): Date | null {
  const match = dateText.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    const timeMatch = timeText.trim().match(/^(\d{1,2}):(\d{2})$/);
    const hours = timeMatch ? Number(timeMatch[1]) : 9;
    const minutes = timeMatch ? Number(timeMatch[2]) : 0;
    const date = new Date(Number(year), Number(month) - 1, Number(day), hours, minutes, 0, 0);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  if (fallbackIso) {
    const fallback = new Date(fallbackIso);
    if (!Number.isNaN(fallback.getTime())) {
      return fallback;
    }
  }
  return null;
}

export function reminderDateForOption(
  appointmentAt: Date,
  option: AppointmentReminderOption,
  customIso?: string
): string | null {
  if (option === "Custom") {
    if (!customIso) {
      return null;
    }
    const custom = new Date(customIso);
    return Number.isNaN(custom.getTime()) ? null : custom.toISOString();
  }
  const next = new Date(appointmentAt);
  if (option === "1 day before") {
    next.setDate(next.getDate() - 1);
  } else if (option === "1 hour before") {
    next.setTime(next.getTime() - 60 * 60 * 1000);
  }
  return next.toISOString();
}

/** Upsert gentle pre-reminders as child reminder nudges (scheduled by the reminder engine). */
export function syncAppointmentReminderChildren(input: {
  parent: NudgeItem;
  appointmentAt: Date;
  selected: AppointmentReminderOption[];
  existingChildren: NudgeItem[];
  customReminderIso?: string;
  actor?: NudgeItem["createdBy"];
}): { upsert: NudgeItem[]; cancel: NudgeItem[] } {
  const { parent, appointmentAt, selected, existingChildren, customReminderIso, actor } = input;
  const existingByTemplate = new Map(
    existingChildren.filter(isAppointmentPreReminder).map((child) => [child.sourceTemplateId!, child])
  );
  const selectedTemplates = new Set(selected.map((option) => TEMPLATE_BY_OPTION[option]));
  const upsert: NudgeItem[] = [];

  for (const option of selected) {
    const templateId = TEMPLATE_BY_OPTION[option];
    const at = reminderDateForOption(
      appointmentAt,
      option,
      option === "Custom" ? customReminderIso : undefined
    );
    if (!at) {
      continue;
    }
    const existing = existingByTemplate.get(templateId);
    const title =
      option === "Custom"
        ? `Reminder: ${parent.title}`
        : `${option[0].toUpperCase()}${option.slice(1)} — ${parent.title}`;
    if (existing) {
      upsert.push({
        ...existing,
        title,
        reminderDate: at,
        status: existing.status === "done" || existing.status === "cancelled" ? "open" : existing.status,
        notes: "Gentle cue before your appointment. Snooze or skip anytime.",
        updatedAt: new Date().toISOString()
      });
    } else {
      upsert.push(
        createItem({
          type: "reminder",
          title,
          parentId: parent.id,
          createdBy: actor ?? parent.createdBy,
          reminderDate: at,
          sourceTemplateId: templateId,
          speakingReminderText: `Reminder for ${parent.title}`,
          notes: "Gentle cue before your appointment. Snooze or skip anytime."
        })
      );
    }
  }

  const cancel = existingChildren.filter(
    (child) => isAppointmentPreReminder(child) && !selectedTemplates.has(child.sourceTemplateId!)
  );

  return { upsert, cancel };
}
