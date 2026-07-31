import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";

import { canEditItem } from "../services/itemPermissions";
import {
  cancelSpeakingReminderNotifications,
  syncSpeakingReminderNotifications
} from "../services/speakingReminders";
import { completeItem, deleteItem, updateItem } from "../services/nudgeItems";
import { cleanupAttachmentsForItem } from "../services/documentAttachments";
import { clearNudgeItemsStorage, loadNudgeItems, saveNudgeItems } from "../services/nudgeItemsStorage";
import { useCrew } from "./useCrew";
import { useNudgeActor } from "./useNudgeActor";
import type { NudgeItem, NudgeItemStatus, NudgeItemType } from "../types/nudge";

type NudgeItemsContextValue = {
  items: NudgeItem[];
  isReady: boolean;
  loadError: string | null;
  clearLoadError: () => void;
  saveItem: (item: NudgeItem) => void;
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

  function saveItem(item: NudgeItem) {
    setItems((current) => {
      const exists = current.some((candidate) => candidate.id === item.id);
      if (exists) {
        const existing = current.find((candidate) => candidate.id === item.id);
        if (existing && !canEditItem(existing, actor)) {
          return current;
        }
        return updateItem(current, item.id, item);
      }
      return [item, ...current];
    });

    if (item.type === "reminder") {
      void (async () => {
        const notificationIds = await syncSpeakingReminderNotifications(item);
        setItems((current) => updateItem(current, item.id, { reminderNotificationIds: notificationIds }));
      })();
    }
  }

  function stopReminderNotifications(item: NudgeItem) {
    void cancelSpeakingReminderNotifications(item);
    setItems((current) => updateItem(current, item.id, { reminderNotificationIds: [] }));
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

      if (existing.type === "reminder" && (status === "done" || status === "cancelled")) {
        void cancelSpeakingReminderNotifications(existing);
        return updateItem(next, itemId, { reminderNotificationIds: [] });
      }

      if (existing.type === "reminder" && status === "open" && existing.status !== "open") {
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
      if (existing.type === "reminder") {
        void cancelSpeakingReminderNotifications(existing);
      }
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

    if (existing.type === "reminder") {
      stopReminderNotifications(existing);
    }

    setItems((current) => deleteItem(current, itemId));

    void cleanupAttachmentsForItem(itemId, existing.attachments);
    reportNudgeDeleted(existing.title, actor.name || "Someone");
  }

  async function clearAllNudgeItems() {
    const snapshot = items;
    for (const item of snapshot) {
      if (item.type === "reminder") {
        await cancelSpeakingReminderNotifications(item);
      }
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
      if (item.type === "reminder") {
        await cancelSpeakingReminderNotifications(item);
      }
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
