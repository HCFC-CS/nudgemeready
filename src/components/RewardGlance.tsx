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
              ? `${wallet.availablePoints} / ${nextReward.points} · ${pointsToNext} to “${nextReward.title}”`
              : `${wallet.availablePoints} pts · “${nextReward.title}” is ready to claim`}
          </AppText>
        ) : (
          <AppText variant="small" style={styles.line}>
            {wallet.availablePoints} points ready
          </AppText>
        )}
      </View>
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
    gap: 2
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  line: {
    color: colors.primaryDark,
    fontWeight: "600"
  },
  big: {
    color: colors.mutedText
  },
  pressed: {
    opacity: 0.88
  }
});
