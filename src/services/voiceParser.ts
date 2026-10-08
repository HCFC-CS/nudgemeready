import type { TaskItem } from "../types/models";

type Draft = Pick<
  TaskItem,
  | "title"
  | "durationMinutes"
  | "repeatRule"
  | "usesTaskBuddy"
  | "workMinutes"
  | "breakMinutes"
  | "classification"
  | "taskType"
> & {
  dueDate?: string;
  notes?: string;
};

export function parseVoiceTask(input: string): Draft {
  const text = input.trim().toLowerCase();
  const durationMatch = text.match(/(\d+)\s*(minute|min|hour|hr)/);
  const rawDuration = durationMatch ? Number(durationMatch[1]) : 15;
  const durationMinutes = durationMatch?.[2]?.startsWith("hour") || durationMatch?.[2] === "hr"
    ? rawDuration * 60
    : rawDuration;

  const repeatRule = text.includes("every day") || text.includes("daily")
    ? "daily"
    : text.includes("every week") || text.includes("weekly")
      ? "weekly"
      : text.includes("every month") || text.includes("monthly")
        ? "monthly"
        : "none";

  const timeMatch = text.match(/at\s+([0-9]{1,2}(?::[0-9]{2})?\s*(am|pm)?)/);
  const dueDate = timeMatch ? `Today at ${timeMatch[1].toUpperCase()}` : undefined;

  let title = input
    .replace(/remind me to/i, "")
    .replace(/start a/i, "")
    .replace(/\d+\s*(minute|min|hour|hr)/i, "")
    .replace(/timer/i, "")
    .replace(/every day|daily|every week|weekly|every month|monthly/i, "")
    .replace(/at\s+[0-9]{1,2}(?::[0-9]{2})?\s*(am|pm)?/i, "")
    .trim();

  if (!title) {
    title = "A task for later";
  }

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    durationMinutes,
    repeatRule,
    classification: text.includes("clean") ? "home" : "clubs",
    taskType: text.includes("remind") ? "reminder" : "taskJob",
    dueDate,
    usesTaskBuddy: text.includes("timer") || durationMinutes >= 20,
    workMinutes: Math.min(durationMinutes, 20),
    breakMinutes: 5,
    notes: input
  };
}
