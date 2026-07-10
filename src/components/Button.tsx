import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { colors, radii } from "../theme/theme";
import { AppText } from "./Text";

type Tone = "primary" | "secondary" | "quiet" | "warning";
type Size = "default" | "compact";

export function Button({
  children,
  tone = "primary",
  size = "default",
  style,
  ...props
}: PropsWithChildren<Omit<PressableProps, "style"> & { tone?: Tone; size?: Size; style?: StyleProp<ViewStyle> }>) {
  const labelStyle =
    tone === "primary"
      ? styles.onPrimaryLabel
      : tone === "warning"
        ? styles.label
        : tone === "quiet"
          ? styles.quietLabel
          : styles.label;

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.base,
        styles[tone],
        size === "compact" && styles.compact,
        pressed && !props.disabled && styles.pressed,
        props.disabled && styles.disabled,
        style
      ]}
    >
      <AppText style={[labelStyle, size === "compact" && styles.compactLabel]}>{children}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  compact: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: radii.sm
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.secondary
  },
  quiet: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border
  },
  warning: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  },
  disabled: {
    opacity: 0.45
  },
  label: {
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
    color: colors.text
  },
  onPrimaryLabel: {
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
    color: colors.onPrimary
  },
  compactLabel: {
    fontSize: 14
  },
  quietLabel: {
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
    color: colors.text
  }
});
