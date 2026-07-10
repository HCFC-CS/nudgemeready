import * as Notifications from "expo-notifications";
import { useEffect } from "react";

import { useNudgeActor } from "./useNudgeActor";
import { useNudgeItems } from "./useNudgeItems";
import { handleSpeakingReminderNotification } from "../services/speakingReminders";

export function useSpeakingReminderNotifications() {
  const { items } = useNudgeItems();
  const actor = useNudgeActor();

  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener((notification) => {
      handleSpeakingReminderNotification(notification, items, actor.id);
    });
    const response = Notifications.addNotificationResponseReceivedListener((response) => {
      handleSpeakingReminderNotification(response.notification, items, actor.id);
    });

    return () => {
      received.remove();
      response.remove();
    };
  }, [items, actor.id]);
}
