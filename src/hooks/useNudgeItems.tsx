import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";

import { canEditItem } from "../services/itemPermissions";
import {
  cancelSpeakingReminderNotifications,
  resyncTimedNudges,
  syncSpeakingReminderNotifications
} from "../services/speakingReminders";
import { completeItem, deleteItem, updateItem } from "../services/nudgeItems";
import { markPackItemEdited } from "../services/readyPackInstall";
import { cleanupAttachmentsForItem } from "../services/documentAttachments";
import { clearNudgeItemsStorage, loadNudgeItems, saveNudgeItems } from "../services/nudgeItemsStorage";
import { syncDailySummaryNotification } from "../services/dailySummary";
import { useCrew } from "./useCrew";
import { useNudgeActor } from "./useNudgeActor";
import type { NudgeItem, NudgeItemStatus, NudgeItemType } from "../types/nudge";

type NudgeItemsContextValue = {
  items: NudgeItem[];
  isReady: boolean;
  loadError: string | null;
  clearLoadError: () => void;
  saveItem: (item: NudgeItem) => void;
  replaceItems: (items: NudgeItem[]) => void;
  setItemStatus: (itemId: string, status: NudgeItemStatus) => void;
  completeNudgeItem: (itemId: string) => void;
  deleteNudgeItem: (itemId: string) => void;
  clearAllNudgeItems: () => Promise<void>;
  clearCompletedNudgeItems: () => Promise<number>;
  clearNudgeItemsByTypes: (types: NudgeItemType[]) => Promise<number>;
};

const NudgeItemsContext = createContext<NudgeItemsContextValue | undefined>(undefined);

export function NudgeItemsProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<NudgeItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const actor = useNudgeActor();
  const { reportNudgeDeleted } = useCrew();

  useEffect(() => {
    let active = true;
    loadNudgeItems()
      .then((loaded) => {
        if (active) {
          setItems(loaded.items);
          setLoadError(loaded.error ?? null);
        }
      })
      .finally(() => {
        if (active) {
          setIsReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    void saveNudgeItems(items);
  }, [isReady, items]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    let cancelled = false;
    const snapshot = items;
    void (async () => {
      const idsByItem = await resyncTimedNudges(snapshot);
      if (cancelled) {
        return;
      }
      setItems((current) => {
        let next = current;
        let changed = false;
        for (const item of current) {
          const ids = idsByItem[item.id];
          if (!ids) {
            continue;
          }
          const prev = item.reminderNotificationIds ?? [];
          if (ids.join() !== prev.join()) {
            next = updateItem(next, item.id, { reminderNotificationIds: ids });
            changed = true;
          }
        }
        return changed ? next : current;
      });
      await syncDailySummaryNotification(snapshot);
    })();
    return () => {
      cancelled = true;
    };
    // Reschedule once after load — saveItem keeps each nudge in sync after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  function saveItem(item: NudgeItem) {
    setItems((current) => {
      const exists = current.some((candidate) => candidate.id === item.id);
      if (exists) {
        const existing = current.find((candidate) => candidate.id === item.id);
        if (existing && !canEditItem(existing, actor)) {
          return current;
        }
        const nextItem =
          existing?.sourcePackId || item.sourcePackId
            ? markPackItemEdited(
                {
                  ...item,
                  sourcePackId: item.sourcePackId ?? existing?.sourcePackId,
                  sourceTemplateId: item.sourceTemplateId ?? existing?.sourceTemplateId
                },
                existing
              )
            : item;
        return updateItem(current, item.id, nextItem);
      }
      return [item, ...current];
    });

    void (async () => {
      const notificationIds = await syncSpeakingReminderNotifications(item);
      let latest: NudgeItem[] = [];
      setItems((current) => {
        latest = updateItem(current, item.id, { reminderNotificationIds: notificationIds });
        return latest;
      });
      await syncDailySummaryNotification(latest.length ? latest : undefined);
    })();
  }

  function replaceItems(next: NudgeItem[]) {
    setItems(next);
  }

  function setItemStatus(itemId: string, status: NudgeItemStatus) {
    setItems((current) => {
      const existing = current.find((candidate) => candidate.id === itemId);
      if (!existing) {
        return current;
      }
      if (!canEditItem(existing, actor)) {
        return current;
      }

      const next = updateItem(current, itemId, { status });

      if (status === "done" || status === "cancelled" || status === "paused") {
        void cancelSpeakingReminderNotifications(existing);
        return updateItem(next, itemId, { reminderNotificationIds: [] });
      }

      if (status === "open" && existing.status !== "open") {
        void (async () => {
          const notificationIds = await syncSpeakingReminderNotifications({ ...existing, status: "open" });
          setItems((latest) => updateItem(latest, itemId, { reminderNotificationIds: notificationIds }));
        })();
      }

      return next;
    });
  }

  function completeNudgeItem(itemId: string) {
    setItems((current) => {
      const existing = current.find((candidate) => candidate.id === itemId);
      if (!existing) {
        return current;
      }
      void cancelSpeakingReminderNotifications(existing);
      const nextItems = completeItem(current, itemId);
      return updateItem(nextItems, itemId, { reminderNotificationIds: [] });
    });
  }

  function deleteNudgeItem(itemId: string) {
    const existing = items.find((candidate) => candidate.id === itemId);
    if (existing && !canEditItem(existing, actor)) {
      return;
    }
    if (!existing) {
      return;
    }

    void cancelSpeakingReminderNotifications(existing);

    setItems((current) => deleteItem(current, itemId));

    void cleanupAttachmentsForItem(itemId, existing.attachments);
    reportNudgeDeleted(existing.title, actor.name || "Someone");
  }

  async function clearAllNudgeItems() {
    const snapshot = items;
    for (const item of snapshot) {
      await cancelSpeakingReminderNotifications(item);
      await cleanupAttachmentsForItem(item.id, item.attachments);
    }
    setItems([]);
    await clearNudgeItemsStorage();
    await saveNudgeItems([]);
  }

  async function clearItemsMatching(predicate: (item: NudgeItem) => boolean) {
    const snapshot = items;
    const toRemove = snapshot.filter(predicate);
    for (const item of toRemove) {
      await cancelSpeakingReminderNotifications(item);
      await cleanupAttachmentsForItem(item.id, item.attachments);
    }
    const remaining = snapshot.filter((item) => !predicate(item));
    setItems(remaining);
    await saveNudgeItems(remaining);
    return toRemove.length;
  }

  async function clearCompletedNudgeItems() {
    return clearItemsMatching((item) => item.status === "done");
  }

  async function clearNudgeItemsByTypes(types: NudgeItemType[]) {
    const typeSet = new Set(types);
    return clearItemsMatching((item) => typeSet.has(item.type));
  }

  return (
    <NudgeItemsContext.Provider
      value={{
        items,
        isReady,
        loadError,
        clearLoadError: () => setLoadError(null),
        saveItem,
        replaceItems,
        setItemStatus,
        completeNudgeItem,
        deleteNudgeItem,
        clearAllNudgeItems,
        clearCompletedNudgeItems,
        clearNudgeItemsByTypes
      }}
    >
      {children}
    </NudgeItemsContext.Provider>
  );
}

export function useNudgeItems() {
  const context = useContext(NudgeItemsContext);
  if (!context) {
    throw new Error("useNudgeItems must be used inside NudgeItemsProvider");
  }
  return context;
}
