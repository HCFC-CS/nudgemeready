import { StyleSheet, View } from "react-native";

import { colors } from "../theme/theme";

/** Sun-over-waves mark from the illustrated home screen. */
export function BrandMark({ size = 56 }: { size?: number }) {
  const sun = size * 0.42;
  const ray = size * 0.08;

  return (
    <View style={[styles.wrap, { width: size, height: size * 0.85 }]} accessibilityRole="image" accessibilityLabel="Nudge me Ready">
      <View style={[styles.sunCore, { width: sun, height: sun / 2, borderTopLeftRadius: sun, borderTopRightRadius: sun }]} />
      <View style={[styles.ray, styles.rayLeft, { width: ray, height: size * 0.14, top: size * 0.06, left: size * 0.12 }]} />
      <View style={[styles.ray, styles.rayUp, { width: ray, height: size * 0.16, top: 0, left: size * 0.46 }]} />
      <View style={[styles.ray, styles.rayRight, { width: ray, height: size * 0.14, top: size * 0.06, right: size * 0.12 }]} />
      <View style={[styles.wave, { width: size * 0.78, top: size * 0.48 }]} />
      <View style={[styles.wave, styles.waveLower, { width: size * 0.62, top: size * 0.6 }]} />
    </View>
  );
}

export function HeartDivider() {
  return (
    <View style={styles.dividerRow} accessibilityElementsHidden>
      <View style={styles.dividerLine} />
      <View style={styles.heart}>
        <View style={[styles.heartLobe, styles.heartLeft]} />
        <View style={[styles.heartLobe, styles.heartRight]} />
        <View style={styles.heartPoint} />
      </View>
      <View style={styles.dividerLine} />
    </View>
  );
}

export function SparkleDivider() {
  return (
    <View style={styles.dividerRow} accessibilityElementsHidden>
      <View style={styles.dividerLine} />
      <View style={styles.sparkle}>
        <View style={styles.sparkleV} />
        <View style={styles.sparkleH} />
      </View>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 4
  },
  sunCore: {
    backgroundColor: colors.accent,
    marginTop: 10
  },
  ray: {
    position: "absolute",
    backgroundColor: colors.accent,
    borderRadius: 2
  },
  rayLeft: {
    transform: [{ rotate: "-32deg" }]
  },
  rayUp: {},
  rayRight: {
    transform: [{ rotate: "32deg" }]
  },
  wave: {
    position: "absolute",
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
    alignSelf: "center"
  },
  waveLower: {
    opacity: 0.75,
    backgroundColor: colors.primaryPressed
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 8,
    paddingHorizontal: 8
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.accent,
    opacity: 0.55
  },
  heart: {
    width: 14,
    height: 12,
    alignItems: "center"
  },
  heartLobe: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: "transparent",
    top: 0
  },
  heartLeft: {
    left: 0
  },
  heartRight: {
    right: 0
  },
  heartPoint: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: colors.accent,
    transform: [{ rotate: "45deg" }],
    top: 3
  },
  sparkle: {
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  sparkleV: {
    position: "absolute",
    width: 2,
    height: 12,
    borderRadius: 1,
    backgroundColor: colors.accent
  },
  sparkleH: {
    position: "absolute",
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.accent
  }
});
