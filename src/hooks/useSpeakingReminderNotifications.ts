import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";

import { navigateToItemDetails } from "../navigation/navigationRef";
import { handleSpeakingReminderNotification } from "../services/speakingReminders";
import { useNudgeActor } from "./useNudgeActor";
import { useNudgeItems } from "./useNudgeItems";

export function useSpeakingReminderNotifications() {
  const { items, isReady } = useNudgeItems();
  const actor = useNudgeActor();
  const itemsRef = useRef(items);
  const handledResponseId = useRef<string | null>(null);
  itemsRef.current = items;

  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener((notification) => {
      handleSpeakingReminderNotification(notification, itemsRef.current, actor.id);
    });

    const response = Notifications.addNotificationResponseReceivedListener((responseNotification) => {
      handledResponseId.current = responseNotification.notification.request.identifier;
      const item = handleSpeakingReminderNotification(
        responseNotification.notification,
        itemsRef.current,
        actor.id
      );
      if (item) {
        navigateToItemDetails(item);
      }
    });

    return () => {
      received.remove();
      response.remove();
    };
  }, [actor.id]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let active = true;
    void Notifications.getLastNotificationResponseAsync().then(async (last) => {
      if (!active || !last) {
        return;
      }
      const responseId = last.notification.request.identifier;
      if (handledResponseId.current === responseId) {
        return;
      }
      handledResponseId.current = responseId;
      const data = last.notification.request.content.data as { itemId?: string } | undefined;
      const item = data?.itemId
        ? itemsRef.current.find((candidate) => candidate.id === data.itemId)
        : undefined;
      if (item && item.status !== "done" && item.status !== "cancelled") {
        navigateToItemDetails(item);
      }
      await Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
    });

    return () => {
      active = false;
    };
  }, [isReady]);
}
