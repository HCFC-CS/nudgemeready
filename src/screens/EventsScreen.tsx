import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Field } from "../components/FormControls";
import { EmptyStateLight, NudgeListRow } from "../components/NudgeListRow";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { useNudgeActor } from "../hooks/useNudgeActor";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { createItem } from "../services/nudgeItems";
import { formatTimelineTime, getPrepStartTime } from "../services/eventPrepTimeline";
import { spacing } from "../theme/theme";
import type { NudgeItem } from "../types/nudge";

export function EventsScreen() {
  const navigation = useNavigation<any>();
  const { items, saveItem } = useNudgeItems();
  const actor = useNudgeActor();
  const events = items.filter((item) => item.type === "event" && item.status !== "done");
  const [isCreating, setIsCreating] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");

  function openEvent(event: NudgeItem) {
    navigation.navigate("ItemDetails", { draft: event });
  }

  function createNewEvent() {
    const trimmedTitle = newEventTitle.trim();
    if (!trimmedTitle) {
      return;
    }
    const draft = createItem({ type: "event", title: trimmedTitle, createdBy: actor });
    saveItem(draft);
    setNewEventTitle("");
    setIsCreating(false);
    openEvent(draft);
  }

  return (
    <Screen>
      <PageHeader title="Events" subtitle="Dinners, parties, and things with a date." />
      <View style={styles.list}>
        {events.map((event) => (
          <NudgeListRow
            key={event.id}
            title={event.title}
            type="event"
            meta={getEventMeta(event)}
            onPress={() => openEvent(event)}
          />
        ))}
      </View>
      {!events.length && !isCreating ? (
        <EmptyStateLight title="No events yet." message="Add one when something is coming up." />
      ) : null}
      {isCreating ? (
        <SoftCard style={styles.createCard}>
          <Field
            label="Event"
            value={newEventTitle}
            onChangeText={setNewEventTitle}
            placeholder="School concert, dinner with friends..."
            returnKeyType="done"
            blurOnSubmit={false}
            onSubmitEditing={createNewEvent}
          />
          <PrimaryButton onPress={createNewEvent}>Add event</PrimaryButton>
          <SecondaryButton
            onPress={() => {
              setIsCreating(false);
              setNewEventTitle("");
            }}
          >
            Cancel
          </SecondaryButton>
        </SoftCard>
      ) : (
        <PrimaryButton onPress={() => setIsCreating(true)}>Add Event</PrimaryButton>
      )}
    </Screen>
  );
}

function getEventMeta(event: NudgeItem) {
  const parts: string[] = [];
  const eventAt = event.startDate ?? event.dueDate;
  if (eventAt) {
    const date = new Date(eventAt);
    if (!Number.isNaN(date.getTime())) {
      parts.push(`${formatDate(eventAt)} at ${formatTimelineTime(date)}`);
    }
  }
  if (event.location?.label) {
    parts.push(event.location.label);
  }
  if (eventAt) {
    const prepStart = getPrepStartTime(
      new Date(eventAt),
      event.eventTravelMinutes ?? 60,
      event.eventReadyMinutes ?? 15,
      event.eventPrepSteps ?? []
    );
    if (prepStart && !Number.isNaN(prepStart.getTime())) {
      parts.push(`Prep from ${formatTimelineTime(prepStart)}`);
    }
  }
  return parts;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  createCard: { gap: spacing.sm }
});
