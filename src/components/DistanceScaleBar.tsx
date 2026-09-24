import { useMemo, useState } from "react";
import { LayoutChangeEvent, PanResponder, StyleSheet, View } from "react-native";

import {
  HOME_THRESHOLD_MAX_METERS,
  HOME_THRESHOLD_MIN_METERS,
  clampHomeThresholdMeters
} from "../services/homeSettingsStorage";
import { colors, radii, spacing } from "../theme/theme";
import { AppText } from "./Text";

type DistanceScaleBarProps = {
  value: number;
  onChange: (meters: number) => void;
  editable?: boolean;
  min?: number;
  max?: number;
};

/**
 * Horizontal scale for leaving-place distance (1 m → 50 m).
 */
export function DistanceScaleBar({
  value,
  onChange,
  editable = true,
  min = HOME_THRESHOLD_MIN_METERS,
  max = HOME_THRESHOLD_MAX_METERS
}: DistanceScaleBarProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const clamped = clampHomeThresholdMeters(value, min, max);
  const ratio = (clamped - min) / (max - min);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => editable,
        onMoveShouldSetPanResponder: () => editable,
        onPanResponderGrant: (event) => {
          applyFromX(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event) => {
          applyFromX(event.nativeEvent.locationX);
        }
      }),
    // applyFromX closes over trackWidth/min/max via function below
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editable, trackWidth, min, max, onChange]
  );

  function applyFromX(x: number) {
    if (!editable || trackWidth <= 0) {
      return;
    }
    const nextRatio = Math.min(1, Math.max(0, x / trackWidth));
    const meters = Math.round(min + nextRatio * (max - min));
    onChange(clampHomeThresholdMeters(meters, min, max));
  }

  function onLayout(event: LayoutChangeEvent) {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.valueRow}>
        <AppText variant="caption" style={styles.label}>
          Distance from place
        </AppText>
        <AppText style={styles.value}>{clamped} m</AppText>
      </View>
      <View
        style={styles.trackHit}
        onLayout={onLayout}
        {...panResponder.panHandlers}
        accessibilityRole="adjustable"
        accessibilityLabel="Distance from place"
        accessibilityValue={{ min, max, now: clamped, text: `${clamped} metres` }}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
          <View style={[styles.thumb, { left: `${ratio * 100}%` }]} />
        </View>
      </View>
      <View style={styles.ends}>
        <AppText variant="caption" style={styles.endLabel}>
          {min} m
        </AppText>
        <AppText variant="caption" style={styles.endLabel}>
          {max} m
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  label: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  value: {
    color: colors.accent,
    fontWeight: "700"
  },
  trackHit: {
    paddingVertical: spacing.sm
  },
  track: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.borderLight,
    justifyContent: "center"
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radii.pill,
    backgroundColor: colors.babyBlue
  },
  thumb: {
    position: "absolute",
    width: 22,
    height: 22,
    marginLeft: -11,
    borderRadius: 11,
    backgroundColor: colors.primaryDark,
    borderWidth: 2,
    borderColor: colors.card
  },
  ends: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  endLabel: {
    color: colors.mutedText
  }
});
