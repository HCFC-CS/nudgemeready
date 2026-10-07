import { Pressable, StyleSheet, View } from "react-native";

import { SoftCard } from "./NudgeComponents";
import { AppText } from "./Text";
import { colors, spacing } from "../theme/theme";
import type { HorizonEntry } from "../types/nudgeHorizon";

type Props = {
  entry: HorizonEntry;
  onPress?: () => void;
  showLeaveBy?: boolean;
  compact?: boolean;
};

function formatWhen(iso: string | null | undefined) {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  if (hasTime) {
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function HorizonEntryCard({ entry, onPress, showLeaveBy, compact }: Props) {
  const when = formatWhen(entry.at);
  const leaveBy = showLeaveBy ? formatWhen(entry.leaveByAt) : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${entry.title}. ${entry.label}. ${when ?? "no time"}. ${entry.flexibility}`}
      style={({ pressed }) => [pressed && onPress ? styles.pressed : null]}
    >
      <SoftCard style={[styles.card, compact && styles.compact]}>
        <View style={styles.row}>
          <AppText variant="caption" style={styles.label}>
            {entry.label}
          </AppText>
          {when ? (
            <AppText variant="caption" style={styles.when}>
              {when}
            </AppText>
          ) : (
            <AppText variant="caption" style={styles.when}>
              Someday
            </AppText>
          )}
        </View>
        <AppText style={styles.title}>{entry.title}</AppText>
        {leaveBy ? (
          <AppText variant="muted" style={styles.meta}>
            Leave by {leaveBy}
          </AppText>
        ) : null}
        {entry.durationMinutes ? (
          <AppText variant="caption" style={styles.meta}>
            {entry.durationMinutes} mins
          </AppText>
        ) : null}
        {!compact && entry.alsoLinked?.length ? (
          <AppText variant="caption" style={styles.meta}>
            Also: {entry.alsoLinked.join(" · ")}
          </AppText>
        ) : null}
      </SoftCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  compact: {
    marginBottom: spacing.xs
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  label: {
    color: colors.babyBlue,
    fontWeight: "700",
    letterSpacing: 0.4
  },
  when: {
    color: colors.mutedText
  },
  title: {
    color: colors.text,
    fontWeight: "600"
  },
  meta: {
    color: colors.mutedText
  },
  pressed: {
    opacity: 0.85
  }
});
