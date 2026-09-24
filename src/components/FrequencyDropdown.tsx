import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import type { IoniconName } from "./iconTypes";
import { colors, radii, spacing } from "../theme/theme";
import { AppText } from "./Text";

export type FrequencyOption = {
  value: string;
  icon?: IoniconName;
  label?: string;
};

type FrequencyDropdownProps = {
  label?: string;
  value: string;
  options: FrequencyOption[];
  onSelect: (value: string) => void;
  accessibilityLabel?: string;
  /** Trigger icon; defaults to repeat (frequency). Use another icon for generic “show” pickers. */
  icon?: IoniconName;
};

/**
 * Compact frequency / repeat picker — one row + expandable list.
 */
export function FrequencyDropdown({
  label = "Frequency",
  value,
  options,
  onSelect,
  accessibilityLabel,
  icon = "repeat-outline"
}: FrequencyDropdownProps) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value) ?? options[0];
  const display = current?.label ?? current?.value ?? value;

  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="caption" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((isOpen) => !isOpen)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <Ionicons name={icon} size={20} color={colors.accent} />
        {current?.icon ? <Ionicons name={current.icon} size={18} color={colors.text} /> : null}
        <AppText variant="body" style={styles.value}>
          {display}
        </AppText>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedText} />
      </Pressable>
      {open ? (
        <View style={styles.menu}>
          {options.map((option) => {
            const optionLabel = option.label ?? option.value;
            const selected = value === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                onPress={() => {
                  onSelect(option.value);
                  setOpen(false);
                }}
                style={[styles.item, selected && styles.itemActive]}
              >
                {option.icon ? (
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={selected ? colors.accent : colors.mutedText}
                  />
                ) : null}
                <AppText variant="body" style={selected ? styles.itemTextActive : undefined}>
                  {optionLabel}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs
  },
  label: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  trigger: {
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  value: {
    flex: 1,
    color: colors.text,
    fontWeight: "600"
  },
  menu: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    overflow: "hidden"
  },
  item: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight
  },
  itemActive: {
    backgroundColor: colors.primarySoft
  },
  itemTextActive: {
    color: colors.accent,
    fontWeight: "700"
  },
  pressed: {
    opacity: 0.88
  }
});
