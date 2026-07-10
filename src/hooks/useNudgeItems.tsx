import { createContext, type PropsWithChildren, useContext, useState } from "react";

import { mockNudgeItems } from "../data/mockData";
import { canEditItem } from "../services/itemPermissions";
import {
  cancelSpeakingReminderNotifications,
  syncSpeakingReminderNotifications
} from "../services/speakingReminders";
import { completeItem, updateItem } from "../services/nudgeItems";
import { useNudgeActor } from "./useNudgeActor";
import type { NudgeItem, NudgeItemStatus } from "../types/nudge";

type NudgeItemsContextValue = {
  items: NudgeItem[];
  saveItem: (item: NudgeItem) => void;
  setItemStatus: (itemId: string, status: NudgeItemStatus) => void;
  completeNudgeItem: (itemId: string) => void;
};

const NudgeItemsContext = createContext<NudgeItemsContextValue | undefined>(undefined);

export function NudgeItemsProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<NudgeItem[]>(mockNudgeItems);
  const actor = useNudgeActor();

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

  function setItemStatus(itemId: string, status: NudgeItemStatus) {
    setItems((current) => {
      const existing = current.find((candidate) => candidate.id === itemId);
      if (existing && !canEditItem(existing, actor)) {
        return current;
      }
      return updateItem(current, itemId, { status });
    });
  }

  function completeNudgeItem(itemId: string) {
    setItems((current) => {
      const existing = current.find((candidate) => candidate.id === itemId);
      if (existing?.type === "reminder") {
        void cancelSpeakingReminderNotifications(existing);
      }
      const nextItems = completeItem(current, itemId);
      return updateItem(nextItems, itemId, { reminderNotificationIds: [] });
    });
  }

  return (
    <NudgeItemsContext.Provider value={{ items, saveItem, setItemStatus, completeNudgeItem }}>
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
