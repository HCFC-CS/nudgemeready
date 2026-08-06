import { createItem } from "./nudgeItems";
import { canInstallPack, type ReadyPackEntitlementLedger } from "./readyPackEntitlements";
import type { NudgeItem, NudgeListItem } from "../types/nudge";
import type {
  InstalledPackRecord,
  ReadyPack,
  ReadyPackInstallState,
  ReadyPackPreview,
  ReadyPackTemplate,
  UninstallMode
} from "../types/readyPacks";

function addDays(base: Date, days: number): string {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

function listRowsFromTemplate(template: ReadyPackTemplate): NudgeListItem[] {
  return (template.listItems ?? []).map((row, index) => ({
    id: `${template.id}-row-${index}`,
    title: row.title,
    status: "open" as const
  }));
}

export function templateToItem(
  pack: ReadyPack,
  template: ReadyPackTemplate,
  now = new Date(),
  existingId?: string
): NudgeItem {
  return createItem(
    {
      id: existingId,
      title: template.title,
      type: template.type,
      notes: template.notes,
      speakingReminderText: template.speakingReminderText,
      repeatRule: template.repeatRule,
      dueDate: template.dueInDays !== undefined ? addDays(now, template.dueInDays) : undefined,
      reminderDate: template.reminderInDays !== undefined ? addDays(now, template.reminderInDays) : undefined,
      listItems: listRowsFromTemplate(template),
      priority: template.priority,
      sourcePackId: pack.id,
      sourceTemplateId: template.id,
      userEdited: false
    },
    now
  );
}

export function previewPack(
  pack: ReadyPack,
  state: ReadyPackInstallState,
  ledger: ReadyPackEntitlementLedger
): ReadyPackPreview {
  const installed = state.installed[pack.id];
  const entitlement = canInstallPack(pack, ledger);
  return {
    pack,
    templateCount: pack.content.templates.length,
    templates: pack.content.templates,
    isInstalled: Boolean(installed),
    installedVersion: installed?.version,
    canInstall: entitlement.allowed,
    entitlementReason: entitlement.reason
  };
}

export type InstallResult = {
  items: NudgeItem[];
  state: ReadyPackInstallState;
  createdCount: number;
};

export function installPack(
  pack: ReadyPack,
  items: NudgeItem[],
  state: ReadyPackInstallState,
  ledger: ReadyPackEntitlementLedger,
  now = new Date()
): InstallResult {
  const entitlement = canInstallPack(pack, ledger);
  if (!entitlement.allowed) {
    throw new Error(entitlement.reason ?? "Not entitled to install this ReadyPack.");
  }
  if (state.installed[pack.id]) {
    throw new Error("This ReadyPack is already installed. Uninstall it first or use update.");
  }

  const templateItemIds: Record<string, string> = {};
  const created: NudgeItem[] = [];

  for (const template of pack.content.templates) {
    const item = templateToItem(pack, template, now);
    templateItemIds[template.id] = item.id;
    created.push(item);
  }

  const record: InstalledPackRecord = {
    packId: pack.id,
    version: pack.version,
    installedAt: now.toISOString(),
    templateItemIds
  };

  return {
    items: [...created, ...items],
    state: {
      installed: {
        ...state.installed,
        [pack.id]: record
      }
    },
    createdCount: created.length
  };
}

export type UninstallResult = {
  items: NudgeItem[];
  state: ReadyPackInstallState;
  removedCount: number;
  keptEditedCount: number;
};

export function uninstallPack(
  packId: string,
  items: NudgeItem[],
  state: ReadyPackInstallState,
  mode: UninstallMode = "unedited_only"
): UninstallResult {
  const record = state.installed[packId];
  if (!record) {
    return { items, state, removedCount: 0, keptEditedCount: 0 };
  }

  let removedCount = 0;
  let keptEditedCount = 0;
  const nextItems = items.filter((item) => {
    if (item.sourcePackId !== packId) {
      return true;
    }
    if (mode === "unedited_only" && item.userEdited) {
      keptEditedCount += 1;
      return true;
    }
    removedCount += 1;
    return false;
  });

  const nextInstalled = { ...state.installed };
  delete nextInstalled[packId];

  return {
    items: nextItems,
    state: { installed: nextInstalled },
    removedCount,
    keptEditedCount
  };
}

export type MigrateResult = {
  items: NudgeItem[];
  state: ReadyPackInstallState;
  updatedCount: number;
  preservedEditedCount: number;
  addedCount: number;
};

/** Update installed pack to a newer catalogue version; preserve userEdited items. */
export function migratePack(
  pack: ReadyPack,
  items: NudgeItem[],
  state: ReadyPackInstallState,
  now = new Date()
): MigrateResult {
  const record = state.installed[pack.id];
  if (!record) {
    throw new Error("Pack is not installed.");
  }
  if (record.version === pack.version) {
    return { items, state, updatedCount: 0, preservedEditedCount: 0, addedCount: 0 };
  }

  let updatedCount = 0;
  let preservedEditedCount = 0;
  let addedCount = 0;
  const templateItemIds = { ...record.templateItemIds };
  let nextItems = [...items];

  for (const template of pack.content.templates) {
    const existingId = templateItemIds[template.id];
    const existing = existingId ? nextItems.find((item) => item.id === existingId) : undefined;

    if (existing?.userEdited) {
      preservedEditedCount += 1;
      continue;
    }

    if (existing) {
      const refreshed = templateToItem(pack, template, now, existing.id);
      nextItems = nextItems.map((item) => (item.id === existing.id ? refreshed : item));
      updatedCount += 1;
    } else {
      const created = templateToItem(pack, template, now);
      templateItemIds[template.id] = created.id;
      nextItems = [created, ...nextItems];
      addedCount += 1;
    }
  }

  const nextRecord: InstalledPackRecord = {
    ...record,
    version: pack.version,
    templateItemIds
  };

  return {
    items: nextItems,
    state: {
      installed: {
        ...state.installed,
        [pack.id]: nextRecord
      }
    },
    updatedCount,
    preservedEditedCount,
    addedCount
  };
}

/** Mark pack-sourced items as user-edited only when meaningful content changed. */
export function packItemContentSignature(item: NudgeItem): string {
  return JSON.stringify({
    title: item.title,
    notes: item.notes ?? "",
    type: item.type,
    status: item.status,
    dueDate: item.dueDate ?? null,
    location: item.location ?? null,
    speakingReminderText: item.speakingReminderText ?? "",
    priority: item.priority ?? null,
    listItems: (item.listItems ?? []).map((row) => ({
      title: row.title,
      status: row.status ?? "open"
    })),
    repeatRule: item.repeatRule ?? null
  });
}

export function markPackItemEdited(item: NudgeItem, previous?: NudgeItem): NudgeItem {
  if (!item.sourcePackId) {
    return item;
  }
  if (item.userEdited) {
    return item;
  }
  if (!previous || previous.id !== item.id) {
    return item;
  }
  if (packItemContentSignature(item) === packItemContentSignature(previous)) {
    return { ...item, userEdited: previous.userEdited ?? false };
  }
  return { ...item, userEdited: true };
}
