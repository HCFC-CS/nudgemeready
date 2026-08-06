import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Field } from "../components/FormControls";
import { EmptyStateLight, NudgeListRow } from "../components/NudgeListRow";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useNudgeActor } from "../hooks/useNudgeActor";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { loadAppPreferences, saveAppPreferences } from "../services/appPreferencesStorage";
import {
  fetchPhoneCalendarNudgeDrafts,
  mergePhoneCalendarDrafts
} from "../services/calendarSync";
import { createItem } from "../services/nudgeItems";
import { formatDisplayDateTime } from "../services/reminderDates";
import { spacing } from "../theme/theme";
import type { NudgeItem } from "../types/nudge";

export function AppointmentsScreen() {
  const navigation = useNavigation<any>();
  const { items, saveItem, replaceItems } = useNudgeItems();
  const actor = useNudgeActor();
  const appointments = items.filter((item) => item.type === "appointment" && item.status !== "done");
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [importing, setImporting] = useState(false);
  const [importNotice, setImportNotice] = useState("");

  const pullFromPhoneCalendar = useCallback(async () => {
    setImporting(true);
    try {
      const fetched = await fetchPhoneCalendarNudgeDrafts({ actor });
      if (!fetched.ok) {
        setImportNotice(fetched.message ?? "Could not import calendar events.");
        return;
      }
      const merged = mergePhoneCalendarDrafts(items, fetched.drafts);
      if (merged.added > 0 || merged.updated > 0) {
        replaceItems(merged.items);
      }
      setImportNotice(
        merged.added || merged.updated
          ? `Imported ${merged.added} new, updated ${merged.updated} from phone calendar.`
          : fetched.message ?? "Phone calendar is up to date."
      );
    } catch {
      setImportNotice("Could not import calendar events.");
    } finally {
      setImporting(false);
    }
  }, [actor, items, replaceItems]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        const prefs = await loadAppPreferences();
        if (!active || !prefs.importFromPhoneCalendar) {
          return;
        }
        await pullFromPhoneCalendar();
      })();
      return () => {
        active = false;
      };
    }, [pullFromPhoneCalendar])
  );

  function openAppointment(appointment: NudgeItem) {
    navigation.navigate("ItemDetails", { draft: appointment });
  }

  function createNewAppointment() {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      return;
    }
    const draft = createItem({
      type: "appointment",
      title: trimmedTitle,
      createdBy: actor,
      guests: [],
      syncToCalendar: true
    });
    saveItem(draft);
    setNewTitle("");
    setIsCreating(false);
    openAppointment(draft);
  }

  async function handleImportFromPhone() {
    const prefs = await loadAppPreferences();
    if (!prefs.importFromPhoneCalendar) {
      await saveAppPreferences({ ...prefs, importFromPhoneCalendar: true });
    }
    await pullFromPhoneCalendar();
  }

  return (
    <Screen>
      <PageHeader title="Appointments" subtitle="Times, places, and who is coming." />
      <View style={styles.list}>
        {appointments.map((appointment) => (
          <NudgeListRow
            key={appointment.id}
            title={appointment.title}
            type="appointment"
            meta={getAppointmentMeta(appointment)}
            onPress={() => openAppointment(appointment)}
          />
        ))}
      </View>
      {!appointments.length && !isCreating ? (
        <EmptyStateLight
          title="No appointments yet."
          message="Add one here, or pull events from the Calendar app on this phone."
        />
      ) : null}
      {isCreating ? (
        <SoftCard style={styles.createCard}>
          <Field
            label="Appointment"
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Dentist, GP, haircut..."
            returnKeyType="done"
            blurOnSubmit={false}
            onSubmitEditing={createNewAppointment}
          />
          <PrimaryButton onPress={createNewAppointment}>Add appointment</PrimaryButton>
          <SecondaryButton
            onPress={() => {
              setIsCreating(false);
              setNewTitle("");
            }}
          >
            Cancel
          </SecondaryButton>
        </SoftCard>
      ) : (
        <>
          <PrimaryButton onPress={() => setIsCreating(true)}>Add Appointment</PrimaryButton>
          <SecondaryButton onPress={() => void handleImportFromPhone()} disabled={importing}>
            {importing ? "Importing…" : "Import from phone calendar"}
          </SecondaryButton>
          {importNotice ? <AppText variant="caption">{importNotice}</AppText> : null}
        </>
      )}
    </Screen>
  );
}

function getAppointmentMeta(appointment: NudgeItem) {
  const parts: string[] = [];
  const when = appointment.startDate ?? appointment.dueDate;
  if (when) {
    const date = new Date(when);
    if (!Number.isNaN(date.getTime())) {
      parts.push(formatDisplayDateTime(when));
    }
  }
  if (appointment.location?.label || appointment.location?.address) {
    parts.push(appointment.location.label ?? appointment.location.address ?? "");
  }
  const guestCount = appointment.guests?.length ?? 0;
  if (guestCount) {
    parts.push(`${guestCount} guest${guestCount === 1 ? "" : "s"}`);
  }
  if (appointment.calendarEventId) {
    parts.push("From calendar");
  } else if (appointment.syncToCalendar) {
    parts.push("Calendar");
  }
  return parts;
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  createCard: { gap: spacing.sm }
});
