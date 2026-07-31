import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { useOptionalItemEdit } from "../hooks/useItemEdit";
import {
  formatDateInput,
  formatDisplayDate,
  formatMonthTitle,
  getCalendarDays,
  getDateFromInput,
  isSameSelectedDay
} from "../services/reminderDates";
import { colors, radii, shadows, spacing } from "../theme/theme";
import { AppText } from "./Text";
import { VoiceFieldActions } from "./VoiceFieldActions";

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
  placeholder = "Pick a date",
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
  const displayValue = value ? formatDisplayDate(value) || value : "";

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const next = getDateFromInput(value);
    setVisibleMonth(
      new Date(next?.getFullYear() ?? today.getFullYear(), next?.getMonth() ?? today.getMonth(), 1)
    );
  }, [isOpen, value]);

  function moveMonth(direction: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  }

  function selectDate(day: number) {
    onChangeText(formatDateInput(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)));
    setIsOpen(false);
  }

  function openPicker() {
    if (!isEditable) {
      return;
    }
    setIsOpen(true);
  }

  return (
    <View style={[styles.wrap, variant === "tile" && styles.tileWrap]}>
      {label && variant === "field" ? (
        <View style={styles.labelRow}>
          <AppText variant="caption" style={styles.fieldLabel}>
            {label}
          </AppText>
          <VoiceFieldActions value={value} onChangeText={onChangeText} editable={isEditable} replaceOnSpeak />
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ? `${label}, open calendar` : "Open calendar"}
        onPress={openPicker}
        style={({ pressed }) => [
          variant === "tile" ? styles.tile : styles.trigger,
          pressed && isEditable && styles.pressed,
          !isEditable && styles.disabled
        ]}
      >
        {variant === "tile" ? (
          <>
            <AppText variant="caption" style={styles.tileCaption}>
              {label ?? "Date"}
            </AppText>
            <View style={styles.triggerValueRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.accent} />
              <AppText style={[styles.triggerValue, !displayValue && styles.placeholder]} numberOfLines={1}>
                {displayValue || placeholder}
              </AppText>
            </View>
          </>
        ) : (
          <>
            <Ionicons name="calendar-outline" size={20} color={colors.accent} />
            <AppText style={[styles.triggerValue, !displayValue && styles.placeholder]} numberOfLines={1}>
              {displayValue || placeholder}
            </AppText>
            <Ionicons name="chevron-down" size={18} color={colors.mutedText} />
          </>
        )}
      </Pressable>

      <Modal visible={isOpen && isEditable} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <AppText variant="heading">{label ?? "Date"}</AppText>
              <Pressable accessibilityRole="button" onPress={() => setIsOpen(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.mutedText} />
              </Pressable>
            </View>

            <View style={styles.calendarHeader}>
              <Pressable accessibilityRole="button" onPress={() => moveMonth(-1)} style={styles.arrowBtn}>
                <Ionicons name="chevron-back" size={22} color={colors.accent} />
              </Pressable>
              <AppText variant="heading" style={styles.calendarMonth}>
                {formatMonthTitle(visibleMonth)}
              </AppText>
              <Pressable accessibilityRole="button" onPress={() => moveMonth(1)} style={styles.arrowBtn}>
                <Ionicons name="chevron-forward" size={22} color={colors.accent} />
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
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs
  },
  tileWrap: {
    flex: 1
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  fieldLabel: {
    color: colors.mutedText,
    fontWeight: "600",
    flexShrink: 1
  },
  trigger: {
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
  tile: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 64,
    justifyContent: "center",
    gap: 4
  },
  tileCaption: {
    color: colors.mutedText,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontSize: 11
  },
  triggerValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  triggerValue: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
    fontVariant: ["tabular-nums"]
  },
  placeholder: {
    color: colors.mutedText,
    fontWeight: "500"
  },
  disabled: {
    opacity: 0.7
  },
  pressed: {
    opacity: 0.85
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(21, 32, 56, 0.45)",
    justifyContent: "center",
    padding: spacing.lg
  },
  sheet: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  arrowBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  calendarMonth: {
    flex: 1,
    textAlign: "center",
    fontSize: 17
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
    minHeight: 42,
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
    minHeight: 42
  }
});
