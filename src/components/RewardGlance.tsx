import { Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useRewardBank } from "../hooks/useRewardBank";
import { colors, spacing } from "../theme/theme";
import { AppText } from "./Text";

/** Compact next-reward + big-goal glance. Opens Reward Bank. */
export function RewardGlance() {
  const navigation = useNavigation<any>();
  const { wallet, nextReward, pointsToNext, bigGoal, pointsToBigGoal } = useRewardBank();

  if (!nextReward && !bigGoal) {
    return null;
  }

  const showBig =
    Boolean(bigGoal) &&
    (!nextReward || bigGoal?.id !== nextReward.id || pointsToBigGoal !== pointsToNext);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open Reward Bank"
      onPress={() => navigation.navigate("RewardBank")}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <View style={styles.row}>
          {nextReward ? (
            <AppText variant="small" style={styles.line}>
              {pointsToNext > 0
                ? `${wallet.availablePoints} points · ${pointsToNext} until “${nextReward.title}”`
                : `${wallet.availablePoints} pts · “${nextReward.title}” is ready to claim`}
            </AppText>
          ) : (
            <AppText variant="small" style={styles.line}>
              {wallet.availablePoints} points ready
            </AppText>
          )}
        </View>
        {nextReward && pointsToNext > 0 ? (
          <View style={styles.track} accessibilityLabel={`${wallet.availablePoints} of ${nextReward.points} points`}>
            <View
              style={[
                styles.fill,
                { width: `${Math.min(100, Math.round((wallet.availablePoints / Math.max(nextReward.points, 1)) * 100))}%` }
              ]}
            />
          </View>
        ) : null}
      {showBig && bigGoal ? (
        <AppText variant="caption" style={styles.big}>
          {pointsToBigGoal > 0
            ? `Bigger goal · ${wallet.availablePoints} / ${bigGoal.points} · “${bigGoal.title}”`
            : `Bigger goal · “${bigGoal.title}” is within reach`}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  line: {
    color: colors.primaryDark,
    fontWeight: "600"
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.ivoryElevated,
    overflow: "hidden"
  },
  fill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.softGold
  },
  big: {
    color: colors.mutedText
  },
  pressed: {
    opacity: 0.88
  }
});
