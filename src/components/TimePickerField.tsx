import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { useOptionalItemEdit } from "../hooks/useItemEdit";
import { formatDisplayTime } from "../services/reminderDates";
import { colors, radii, shadows, spacing } from "../theme/theme";
import { AppText } from "./Text";
import { VoiceFieldActions } from "./VoiceFieldActions";

const hourOptions = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const minuteOptions = ["00", "15", "30", "45"];

type TimePickerFieldProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  variant?: "field" | "tile";
};

export function TimePickerField({
  label,
  value,
  onChangeText,
  placeholder = "Pick a time",
  editable,
  variant = "field"
}: TimePickerFieldProps) {
  const edit = useOptionalItemEdit();
  const isEditable = editable ?? edit?.editable ?? true;
  const [isOpen, setIsOpen] = useState(false);
  const { hour, minute } = useMemo(() => parseTimeValue(value), [value]);
  const displayValue = value ? formatDisplayTime(value) || value : "";

  function selectTime(nextHour: string, nextMinute: string) {
    onChangeText(`${nextHour}:${nextMinute}`);
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
        accessibilityLabel={label ? `${label}, open time picker` : "Open time picker"}
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
              {label ?? "Time"}
            </AppText>
            <View style={styles.triggerValueRow}>
              <Ionicons name="time-outline" size={18} color={colors.accent} />
              <AppText style={[styles.triggerValue, !displayValue && styles.placeholder]} numberOfLines={1}>
                {displayValue || placeholder}
              </AppText>
            </View>
          </>
        ) : (
          <>
            <Ionicons name="time-outline" size={20} color={colors.accent} />
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
              <AppText variant="heading">{label ?? "Time"}</AppText>
              <Pressable accessibilityRole="button" onPress={() => setIsOpen(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.mutedText} />
              </Pressable>
            </View>

            <AppText variant="small" style={styles.pickerHint}>
              Choose hour and minutes
            </AppText>

            <View style={styles.columns}>
              <View style={styles.column}>
                <AppText variant="caption" style={styles.columnLabel}>
                  Hour
                </AppText>
                <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                  {hourOptions.map((option) => (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      onPress={() => selectTime(option, minute)}
                      style={({ pressed }) => [
                        styles.option,
                        hour === option && styles.optionSelected,
                        pressed && styles.pressed
                      ]}
                    >
                      <AppText style={[styles.optionLabel, hour === option && styles.optionLabelSelected]}>
                        {option}
                      </AppText>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.column}>
                <AppText variant="caption" style={styles.columnLabel}>
                  Min
                </AppText>
                <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                  {minuteOptions.map((option) => (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      onPress={() => selectTime(hour, option)}
                      style={({ pressed }) => [
                        styles.option,
                        minute === option && styles.optionSelected,
                        pressed && styles.pressed
                      ]}
                    >
                      <AppText style={[styles.optionLabel, minute === option && styles.optionLabelSelected]}>
                        {option}
                      </AppText>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function parseTimeValue(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return { hour: "09", minute: "00" };
  }
  const hour = String(Math.min(23, Math.max(0, Number(match[1])))).padStart(2, "0");
  const rawMinute = Number(match[2]);
  const minute = minuteOptions.includes(String(rawMinute).padStart(2, "0"))
    ? String(rawMinute).padStart(2, "0")
    : "00";
  return { hour, minute };
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
    fontVariant: ["tabular-nums"],
    letterSpacing: 0.4
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
    maxHeight: "70%",
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
  pickerHint: {
    color: colors.mutedText,
    textAlign: "center"
  },
  columns: {
    flexDirection: "row",
    gap: spacing.md
  },
  column: {
    flex: 1,
    gap: spacing.xs
  },
  columnLabel: {
    textAlign: "center",
    color: colors.mutedText,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  columnScroll: {
    maxHeight: 220
  },
  option: {
    minHeight: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center"
  },
  optionSelected: {
    backgroundColor: colors.accent
  },
  optionLabel: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 18,
    fontVariant: ["tabular-nums"]
  },
  optionLabelSelected: {
    color: colors.onPrimary
  }
});
