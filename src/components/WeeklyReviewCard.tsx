import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useRewardBank } from "../hooks/useRewardBank";
import { loadAppPreferences, saveAppPreferences } from "../services/appPreferencesStorage";
import { buildWeeklyReview } from "../services/weeklyMotivation";
import { colors, radii, spacing } from "../theme/theme";
import { AppText } from "./Text";

export function WeeklyReviewCard({ showBankLink = true }: { showBankLink?: boolean }) {
  const navigation = useNavigation<any>();
  const { wallet, nextReward, pointsToNext, isReady } = useRewardBank();
  const [dismissedWeek, setDismissedWeek] = useState<string | null>(null);
  const [prefsReady, setPrefsReady] = useState(false);

  useEffect(() => {
    let active = true;
    void loadAppPreferences().then((prefs) => {
      if (!active) {
        return;
      }
      setDismissedWeek(prefs.weeklyReviewDismissedWeek ?? null);
      setPrefsReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const review = useMemo(
    () =>
      buildWeeklyReview({
        ledger: wallet.ledger,
        pointsToNextReward: pointsToNext,
        nextRewardTitle: nextReward?.title
      }),
    [wallet.ledger, pointsToNext, nextReward?.title]
  );

  if (!isReady || !prefsReady || !review || dismissedWeek === review.isoWeek) {
    return null;
  }

  const weekKey = review.isoWeek;

  async function dismiss() {
    const prefs = await loadAppPreferences();
    await saveAppPreferences({ ...prefs, weeklyReviewDismissedWeek: weekKey });
    setDismissedWeek(weekKey);
  }

  return (
    <View style={styles.card} accessibilityRole="summary">
      <AppText variant="caption" style={styles.kicker}>
        This week
      </AppText>
      <AppText variant="body" style={styles.message}>
        {review.message}
      </AppText>
      <AppText variant="muted">
        {review.completions} sorted · {review.madeSmallerCount} made smaller · {review.points} points
      </AppText>
      {review.mostConsistentTitle ? (
        <AppText variant="small" style={styles.line}>
          Most consistent: {review.mostConsistentTitle}
        </AppText>
      ) : null}
      {review.biggestWinTitle ? (
        <AppText variant="small" style={styles.line}>
          Biggest win: {review.biggestWinTitle}
        </AppText>
      ) : null}
      {review.nextRewardTitle ? (
        <AppText variant="small" style={styles.line}>
          {review.pointsToNextReward > 0
            ? `${review.pointsToNextReward} to go for “${review.nextRewardTitle}”`
            : `“${review.nextRewardTitle}” is ready when you want it`}
        </AppText>
      ) : null}
      <View style={styles.row}>
        {showBankLink ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Reward Bank"
            style={({ pressed }) => [styles.btn, styles.primary, pressed && styles.pressed]}
            onPress={() => navigation.navigate("RewardBank")}
          >
            <AppText style={styles.primaryLabel}>Reward Bank</AppText>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => void dismiss()}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        >
          <AppText style={styles.quietLabel}>Hide for this week</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.ivoryElevated
  },
  kicker: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  message: {
    color: colors.text,
    fontWeight: "600"
  },
  line: {
    color: colors.mutedText
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  btn: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center"
  },
  primary: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  primaryLabel: {
    color: colors.primaryDark,
    fontWeight: "700"
  },
  quietLabel: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  pressed: {
    opacity: 0.86
  }
});
