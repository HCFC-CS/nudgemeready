import type { PropsWithChildren } from "react";
import { StyleSheet, Text as RNText, type TextProps } from "react-native";

import { colors, typography } from "../theme/theme";

type Variant = "title" | "heading" | "section" | "body" | "small" | "caption" | "muted" | "accent" | "timer";

export function AppText({
  children,
  variant = "body",
  style,
  ...props
}: PropsWithChildren<TextProps & { variant?: Variant }>) {
  return (
    <RNText {...props} style={[styles.base, styles[variant], style]}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    fontFamily: typography.fontFamily.regular,
    fontWeight: "400"
  },
  title: {
    fontSize: typography.title,
    lineHeight: 34,
    fontWeight: "600",
    letterSpacing: -0.5,
    color: colors.text,
    fontFamily: "Georgia"
  },
  heading: {
    fontSize: typography.heading,
    lineHeight: 22,
    fontWeight: "600",
    letterSpacing: -0.2,
    color: colors.text,
    fontFamily: "Georgia"
  },
  section: {
    fontSize: typography.section,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: colors.accent
  },
  body: {
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.text
  },
  small: {
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: "500",
    color: colors.text
  },
  caption: {
    fontSize: typography.caption,
    lineHeight: 14,
    fontWeight: "500",
    color: colors.mutedText
  },
  muted: {
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.mutedText
  },
  accent: {
    fontSize: typography.body,
    lineHeight: 24,
    fontWeight: "600",
    color: colors.accent
  },
  timer: {
    fontSize: typography.timer,
    lineHeight: 64,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
    textAlign: "center",
    color: colors.text
  }
});
