import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Linking } from "react-native";

import { navigateToItemDetails } from "../navigation/navigationRef";
import {
  handlePayLaterConfirmResponse,
  PAY_LATER_CONFIRM_ROLE,
  PAY_LATER_NOTIFICATION_ROLE
} from "../services/payLaterReminders";
import { handleSpeakingReminderNotification } from "../services/speakingReminders";
import { useNudgeActor } from "./useNudgeActor";
import { useNudgeItems } from "./useNudgeItems";

function openPayLaterLinkIfPresent(notification: Notifications.Notification) {
  const data = notification.request.content.data as
    | { role?: string; payUrl?: string }
    | undefined;
  if (
    (data?.role !== PAY_LATER_NOTIFICATION_ROLE && data?.role !== PAY_LATER_CONFIRM_ROLE) ||
    !data.payUrl
  ) {
    return false;
  }
  void Linking.openURL(data.payUrl).catch(() => undefined);
  return true;
}

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
      const data = responseNotification.notification.request.content.data as
        | { role?: string; placeId?: string; payUrl?: string }
        | undefined;

      if (data?.role === PAY_LATER_CONFIRM_ROLE) {
        void handlePayLaterConfirmResponse(
          responseNotification.actionIdentifier,
          data.placeId
        ).then((handled) => {
          if (!handled && data.payUrl) {
            void Linking.openURL(data.payUrl).catch(() => undefined);
          }
        });
        handleSpeakingReminderNotification(
          responseNotification.notification,
          itemsRef.current,
          actor.id
        );
        return;
      }

      if (openPayLaterLinkIfPresent(responseNotification.notification)) {
        handleSpeakingReminderNotification(
          responseNotification.notification,
          itemsRef.current,
          actor.id
        );
        return;
      }
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
      if (openPayLaterLinkIfPresent(last.notification)) {
        await Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
        return;
      }
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
