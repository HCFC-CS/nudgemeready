import type { NudgeItem, NudgeItemInput, NudgeItemType, NudgeItemWithParent } from "../types/nudge";

export function createItem(input: NudgeItemInput, now = new Date()): NudgeItem {
  const timestamp = now.toISOString();
  return {
    id: input.id ?? createId(),
    title: input.title.trim(),
    type: input.type,
    status: input.status ?? "open",
    parentId: input.parentId,
    children: input.children ?? [],
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
    dueDate: input.dueDate,
    startDate: input.startDate,
    endDate: input.endDate,
    reminderDate: input.reminderDate,
    repeatRule: input.repeatRule,
    location: input.location,
    contactId: input.contactId,
    contactName: input.contactName,
    contactPhone: input.contactPhone,
    contactEmail: input.contactEmail,
    notes: input.notes,
    voiceNoteUrl: input.voiceNoteUrl,
    speakingReminderText: input.speakingReminderText,
    nudgeEveryTenMinutesUntilDone: input.nudgeEveryTenMinutesUntilDone ?? false,
    notifyNudgerIfNotDone: input.notifyNudgerIfNotDone ?? false,
    reminderNotificationIds: input.reminderNotificationIds ?? [],
    attachments: input.attachments ?? [],
    priority: input.priority,
    energyLevel: input.energyLevel,
    estimatedEffort: input.estimatedEffort,
    listItems: input.listItems ?? [],
    sharedWith: input.sharedWith,
    progress: input.progress ?? 0,
    createdBy: input.createdBy,
    isLocked: input.isLocked ?? false,
    homeLocation: input.homeLocation,
    eventTravelMinutes: input.eventTravelMinutes,
    eventReadyMinutes: input.eventReadyMinutes,
    eventPrepSteps: input.eventPrepSteps,
    guests: input.guests ?? [],
    syncToCalendar: input.syncToCalendar,
    calendarId: input.calendarId,
    calendarEventId: input.calendarEventId,
    needsCard: input.needsCard,
    needsPresent: input.needsPresent,
    cardReminderAt: input.cardReminderAt,
    giftReminderAt: input.giftReminderAt
  };
}

export function updateItem(items: NudgeItem[], itemId: string, updates: Partial<NudgeItem>, now = new Date()) {
  return items.map((item) =>
    item.id === itemId
      ? {
          ...item,
          ...updates,
          id: item.id,
          createdAt: item.createdAt,
          updatedAt: now.toISOString()
        }
      : item
  );
}

export function deleteItem(items: NudgeItem[], itemId: string) {
  const descendantIds = getDescendantIds(items, itemId);
  const idsToRemove = new Set([itemId, ...descendantIds]);
  return items
    .filter((item) => !idsToRemove.has(item.id))
    .map((item) => ({
      ...item,
      children: item.children.filter((childId) => !idsToRemove.has(childId))
    }));
}

export function completeItem(items: NudgeItem[], itemId: string, now = new Date()) {
  return updateItem(items, itemId, { status: "done", progress: 100 }, now);
}

export function addChildItem(items: NudgeItem[], parentId: string, childInput: NudgeItemInput, now = new Date()) {
  const child = createItem({ ...childInput, parentId }, now);
  const nextItems = items.map((item) =>
    item.id === parentId
      ? {
          ...item,
          children: item.children.includes(child.id) ? item.children : [...item.children, child.id],
          updatedAt: now.toISOString()
        }
      : item
  );
  return [...nextItems, child];
}

export function getChildrenForParent(items: NudgeItem[], parentId: string) {
  return items.filter((item) => item.parentId === parentId);
}

export function calculateProjectProgress(items: NudgeItem[], projectId: string) {
  const subtasks = getChildrenForParent(items, projectId).filter((child) => child.type === "subtask");
  if (!subtasks.length) {
    return 0;
  }
  const doneSubtasks = subtasks.filter((child) => child.status === "done").length;
  return Math.round((doneSubtasks / subtasks.length) * 100);
}

export function getItemsForToday(items: NudgeItem[], today = new Date()): NudgeItemWithParent[] {
  return withParentProjectNames(items, items.filter((item) => isRelevantToday(item, today)));
}

export function getUpcomingItems(items: NudgeItem[], today = new Date()): NudgeItemWithParent[] {
  const todayStart = startOfDay(today).getTime();
  return withParentProjectNames(
    items,
    items
      .filter((item) => {
        const itemDate = getPrimaryDate(item);
        return item.status !== "done" && Boolean(itemDate && itemDate.getTime() > todayStart);
      })
      .sort((first, second) => (getPrimaryDate(first)?.getTime() ?? 0) - (getPrimaryDate(second)?.getTime() ?? 0))
  );
}

export function getItemsByType(items: NudgeItem[], type: NudgeItemType): NudgeItemWithParent[] {
  return withParentProjectNames(items, items.filter((item) => item.type === type));
}

function withParentProjectNames(allItems: NudgeItem[], items: NudgeItem[]): NudgeItemWithParent[] {
  return items.map((item) => {
    if (!item.parentId) {
      return item;
    }
    const parent = allItems.find((candidate) => candidate.id === item.parentId && candidate.type === "project");
    return {
      ...item,
      parentProjectName: parent?.title
    };
  });
}

function isRelevantToday(item: NudgeItem, today: Date) {
  if (item.status === "done" || item.status === "cancelled") {
    return false;
  }
  const dates = [item.dueDate, item.startDate, item.endDate, item.reminderDate]
    .map((value) => (value ? new Date(value) : undefined))
    .filter((value): value is Date => value instanceof Date && !Number.isNaN(value.getTime()));
  return dates.some((date) => isSameDay(date, today));
}

function getPrimaryDate(item: NudgeItem) {
  const value = item.startDate ?? item.dueDate ?? item.reminderDate ?? item.endDate;
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDescendantIds(items: NudgeItem[], parentId: string): string[] {
  const directChildren = items.filter((item) => item.parentId === parentId);
  return directChildren.flatMap((child) => [child.id, ...getDescendantIds(items, child.id)]);
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
