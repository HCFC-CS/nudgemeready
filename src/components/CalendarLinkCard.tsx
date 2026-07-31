import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ToggleRow } from "./FormControls";
import { SecondaryButton } from "./NudgeComponents";
import { AppText } from "./Text";
import {
  listWritablePhoneCalendars,
  type PhoneCalendarOption
} from "../services/calendarSync";
import { colors, radii, spacing } from "../theme/theme";

export function CalendarLinkCard({
  enabled,
  onEnabledChange,
  selectedCalendarId,
  onSelectCalendar,
  editable = true
}: {
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  selectedCalendarId?: string;
  onSelectCalendar: (calendarId: string) => void;
  editable?: boolean;
}) {
  const [calendars, setCalendars] = useState<PhoneCalendarOption[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function refreshCalendars(requestIfNeeded = true) {
    setLoading(true);
    try {
      const result = await listWritablePhoneCalendars();
      setCalendars(result.calendars);
      setMessage(result.message ?? "");
      if (result.calendars.length && !selectedCalendarId) {
        onSelectCalendar(result.calendars[0].id);
      }
      if (!result.granted && requestIfNeeded) {
        setMessage(result.message ?? "Calendar access is needed.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (enabled) {
      void refreshCalendars();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const selected = calendars.find((calendar) => calendar.id === selectedCalendarId);

  return (
    <View style={styles.wrap}>
      <ToggleRow
        label="Link to phone / email calendar"
        value={enabled}
        onValueChange={(value) => {
          onEnabledChange(value);
          if (value) {
            void refreshCalendars();
          }
        }}
        note="Saves into the Calendar app — iCloud, Google, Outlook, or any account on this phone."
        disabled={!editable}
      />

      {enabled ? (
        <View style={styles.picker}>
          <AppText variant="small">Choose calendar</AppText>
          {loading ? <AppText variant="muted">Loading calendars…</AppText> : null}
          {!loading && calendars.length === 0 ? (
            <AppText variant="muted">
              {message || "No calendars found. Add an account in the phone Calendar settings."}
            </AppText>
          ) : null}
          <View style={styles.list}>
            {calendars.map((calendar) => {
              const isSelected = calendar.id === selectedCalendarId;
              return (
                <Pressable
                  key={calendar.id}
                  disabled={!editable}
                  onPress={() => onSelectCalendar(calendar.id)}
                  style={({ pressed }) => [
                    styles.option,
                    isSelected && styles.optionSelected,
                    pressed && styles.pressed
                  ]}
                >
                  <View style={[styles.swatch, { backgroundColor: calendar.color || colors.accent }]} />
                  <View style={styles.optionCopy}>
                    <AppText variant="heading">{calendar.title}</AppText>
                    <AppText variant="muted">{calendar.sourceName}</AppText>
                  </View>
                  {isSelected ? <AppText variant="small">Selected</AppText> : null}
                </Pressable>
              );
            })}
          </View>
          {selected ? (
            <AppText variant="small">Will sync to {selected.label}.</AppText>
          ) : null}
          <SecondaryButton onPress={() => void refreshCalendars()}>Refresh calendars</SecondaryButton>
          {message && calendars.length ? <AppText variant="small">{message}</AppText> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  picker: { gap: spacing.sm },
  list: { gap: spacing.xs },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    backgroundColor: colors.card
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}14`
  },
  optionCopy: { flex: 1, gap: 2 },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  pressed: { opacity: 0.88 }
});
