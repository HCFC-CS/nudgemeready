import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { useOptionalItemEdit } from "../hooks/useItemEdit";
import {
  formatDateInput,
  formatMonthTitle,
  getCalendarDays,
  getDateFromInput,
  isSameSelectedDay
} from "../services/reminderDates";
import { colors, radii, spacing } from "../theme/theme";
import { AppText } from "./Text";

type DatePickerFieldProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  variant?: "field" | "tile";
};

export function DatePickerField({
  label,
  value,
  onChangeText,
  placeholder = "DD-MM-YYYY",
  editable,
  variant = "field"
}: DatePickerFieldProps) {
  const edit = useOptionalItemEdit();
  const isEditable = editable ?? edit?.editable ?? true;
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = getDateFromInput(value);
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(selectedDate?.getFullYear() ?? today.getFullYear(), selectedDate?.getMonth() ?? today.getMonth(), 1)
  );
  const days = getCalendarDays(visibleMonth);

  function moveMonth(direction: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  }

  function selectDate(day: number) {
    onChangeText(formatDateInput(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)));
    setIsOpen(false);
  }

  function toggleCalendar() {
    if (!isEditable) {
      return;
    }
    setIsOpen((current) => !current);
  }

  const input = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ? `${label}, open calendar` : "Open calendar"}
      onPress={toggleCalendar}
      style={({ pressed }) => [
        variant === "tile" ? styles.tile : styles.inputRow,
        pressed && isEditable && styles.pressed,
        !isEditable && styles.disabled
      ]}
    >
      {variant === "tile" ? (
        <Ionicons name="calendar-outline" size={20} color={colors.accent} />
      ) : null}
      <TextInput
        style={[variant === "tile" ? styles.tileInput : styles.input, !isEditable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedText}
        editable={isEditable}
        onFocus={() => isEditable && setIsOpen(true)}
      />
      {variant === "field" ? (
        <Ionicons name={isOpen ? "chevron-up" : "calendar-outline"} size={20} color={colors.accent} />
      ) : null}
    </Pressable>
  );

  return (
    <View style={styles.wrap}>
      {label && variant === "field" ? (
        <AppText variant="caption" style={styles.fieldLabel}>
          {label}
        </AppText>
      ) : null}
      {input}
      {isOpen && isEditable ? (
        <View style={styles.calendar}>
          <View style={styles.calendarHeader}>
            <Pressable accessibilityRole="button" onPress={() => moveMonth(-1)} style={styles.arrowBtn}>
              <Ionicons name="chevron-back" size={20} color={colors.accent} />
            </Pressable>
            <AppText variant="heading" style={styles.calendarMonth}>
              {formatMonthTitle(visibleMonth)}
            </AppText>
            <Pressable accessibilityRole="button" onPress={() => moveMonth(1)} style={styles.arrowBtn}>
              <Ionicons name="chevron-forward" size={20} color={colors.accent} />
            </Pressable>
          </View>
          <View style={styles.calendarGrid}>
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((dayName) => (
              <AppText key={dayName} variant="small" style={styles.weekday}>
                {dayName}
              </AppText>
            ))}
            {days.map((day, index) =>
              day ? (
                <Pressable
                  key={`${day}-${index}`}
                  accessibilityRole="button"
                  onPress={() => selectDate(day)}
                  style={({ pressed }) => [
                    styles.dayBtn,
                    isSameSelectedDay(day, visibleMonth, selectedDate) && styles.dayBtnSelected,
                    pressed && styles.pressed
                  ]}
                >
                  <AppText
                    style={[
                      styles.dayLabel,
                      isSameSelectedDay(day, visibleMonth, selectedDate) && styles.dayLabelSelected
                    ]}
                  >
                    {day}
                  </AppText>
                </Pressable>
              ) : (
                <View key={`blank-${index}`} style={styles.dayBlank} />
              )
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs
  },
  fieldLabel: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    minHeight: 48
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.sm
  },
  tile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 52
  },
  tileInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: "600"
  },
  inputDisabled: {
    opacity: 0.6
  },
  disabled: {
    opacity: 0.7
  },
  pressed: {
    opacity: 0.85
  },
  calendar: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    padding: spacing.sm,
    gap: spacing.sm
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  arrowBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  calendarMonth: {
    flex: 1,
    textAlign: "center",
    fontSize: 16
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  weekday: {
    width: "13.4%",
    textAlign: "center",
    color: colors.mutedText,
    fontWeight: "700"
  },
  dayBtn: {
    width: "13.4%",
    minHeight: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center"
  },
  dayBtnSelected: {
    backgroundColor: colors.accent
  },
  dayLabel: {
    color: colors.text,
    fontWeight: "600"
  },
  dayLabelSelected: {
    color: colors.onPrimary
  },
  dayBlank: {
    width: "13.4%",
    minHeight: 40
  }
});
