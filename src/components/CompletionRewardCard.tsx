import { SoftCard } from "./NudgeComponents";
import { AppText } from "./Text";
import { StyleSheet, View } from "react-native";
import { spacing } from "../theme/theme";

/** Gentle completion notice after Focus — points already went to Reward Bank. */
export function CompletionRewardCard({ points }: { points: number }) {
  return (
    <SoftCard style={styles.completionCard}>
      <View style={styles.copy}>
        <AppText variant="heading">Sorted</AppText>
        <AppText variant="muted">
          {points > 0
            ? `+${points} in Reward Bank. Marked complete and recorded gently.`
            : "Marked complete and recorded in your progress."}
        </AppText>
      </View>
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  completionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  copy: {
    flex: 1
  }
});
