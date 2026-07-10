import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { useOptionalItemEdit } from "../hooks/useItemEdit";
import { colors, radii, spacing } from "../theme/theme";
import { AppText } from "./Text";

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
  placeholder = "09:00",
  editable,
  variant = "field"
}: TimePickerFieldProps) {
  const edit = useOptionalItemEdit();
  const isEditable = editable ?? edit?.editable ?? true;
  const [isOpen, setIsOpen] = useState(false);
  const { hour, minute } = useMemo(() => parseTimeValue(value), [value]);

  function selectTime(nextHour: string, nextMinute: string) {
    onChangeText(`${nextHour}:${nextMinute}`);
    setIsOpen(false);
  }

  function togglePicker() {
    if (!isEditable) {
      return;
    }
    setIsOpen((current) => !current);
  }

  const input = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ? `${label}, open time picker` : "Open time picker"}
      onPress={togglePicker}
      style={({ pressed }) => [
        variant === "tile" ? styles.tile : styles.inputRow,
        pressed && isEditable && styles.pressed,
        !isEditable && styles.disabled
      ]}
    >
      {variant === "tile" ? <Ionicons name="time-outline" size={20} color={colors.accent} /> : null}
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
        <Ionicons name={isOpen ? "chevron-up" : "time-outline"} size={20} color={colors.accent} />
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
        <View style={styles.picker}>
          <AppText variant="small" style={styles.pickerHint}>
            Pick a time
          </AppText>
          <View style={styles.columns}>
            <ScrollView style={styles.column} showsVerticalScrollIndicator={false}>
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
                  <AppText style={[styles.optionLabel, hour === option && styles.optionLabelSelected]}>{option}</AppText>
                </Pressable>
              ))}
            </ScrollView>
            <ScrollView style={styles.column} showsVerticalScrollIndicator={false}>
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
      ) : null}
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
  picker: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    padding: spacing.sm,
    gap: spacing.sm
  },
  pickerHint: {
    color: colors.mutedText,
    textAlign: "center"
  },
  columns: {
    flexDirection: "row",
    gap: spacing.sm,
    maxHeight: 180
  },
  column: {
    flex: 1
  },
  option: {
    minHeight: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center"
  },
  optionSelected: {
    backgroundColor: colors.accent
  },
  optionLabel: {
    color: colors.text,
    fontWeight: "600"
  },
  optionLabelSelected: {
    color: colors.onPrimary
  }
});
