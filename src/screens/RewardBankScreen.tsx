import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { Field } from "../components/FormControls";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useRewardBank } from "../hooks/useRewardBank";
import { colors, spacing } from "../theme/theme";
import type { RewardDefinition } from "../types/rewards";

export function RewardBankScreen() {
  const navigation = useNavigation<any>();
  const { wallet, nextReward, pointsToNext, bigGoal, pointsToBigGoal, claim, replaceRewards } = useRewardBank();
  const [editing, setEditing] = useState(false);
  const [draftRewards, setDraftRewards] = useState<RewardDefinition[]>(wallet.rewards);
  const [notice, setNotice] = useState("");

  const sortedRewards = useMemo(
    () => [...wallet.rewards].sort((a, b) => a.points - b.points),
    [wallet.rewards]
  );

  function startEdit() {
    setDraftRewards(wallet.rewards.map((entry) => ({ ...entry })));
    setEditing(true);
    setNotice("");
  }

  function saveEdit() {
    replaceRewards(draftRewards);
    setEditing(false);
    setNotice("Rewards updated.");
  }

  function handleClaim(reward: RewardDefinition) {
    if (wallet.availablePoints < reward.points) {
      setNotice(`Need ${reward.points - wallet.availablePoints} more points for that.`);
      return;
    }
    Alert.alert("You've earned this", reward.title, [
      { text: "Keep saving", style: "cancel" },
      {
        text: "Claim reward",
        onPress: () => {
          try {
            claim(reward.id);
            setNotice(`Enjoyed: ${reward.title}`);
          } catch (error) {
            setNotice(error instanceof Error ? error.message : "Could not claim that yet.");
          }
        }
      }
    ]);
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title="Reward Bank"
        subtitle="Small steps count. Points are never taken away."
        showBack
      />

      <SoftCard style={styles.card}>
        <AppText variant="heading">{wallet.availablePoints} points ready</AppText>
        <AppText variant="muted">Lifetime earned: {wallet.lifetimePoints}</AppText>
        {nextReward ? (
          <AppText variant="small" style={styles.next}>
            {pointsToNext > 0
              ? `${pointsToNext} to go for “${nextReward.title}”`
              : `You can claim “${nextReward.title}” when you like`}
          </AppText>
        ) : null}
        {bigGoal && bigGoal.id !== nextReward?.id ? (
          <AppText variant="muted">
            {pointsToBigGoal > 0
              ? `Bigger goal: ${wallet.availablePoints} / ${bigGoal.points} · “${bigGoal.title}”`
              : `Bigger goal “${bigGoal.title}” is within reach. Claim or keep saving.`}
          </AppText>
        ) : null}
        <SecondaryButton size="compact" onPress={() => navigation.navigate("DidSomething")}>
          I did something
        </SecondaryButton>
      </SoftCard>

      <SoftCard style={styles.card}>
        <View style={styles.headerRow}>
          <AppText variant="heading">Rewards</AppText>
          <Pressable onPress={editing ? saveEdit : startEdit} hitSlop={8}>
            <AppText style={styles.link}>{editing ? "Save" : "Customise"}</AppText>
          </Pressable>
        </View>

        {editing
          ? draftRewards.map((reward, index) => (
              <View key={reward.id} style={styles.editRow}>
                <Field
                  label="Title"
                  value={reward.title}
                  onChangeText={(value) =>
                    setDraftRewards((current) =>
                      current.map((entry, i) => (i === index ? { ...entry, title: value } : entry))
                    )
                  }
                />
                <Field
                  label="Points"
                  value={String(reward.points)}
                  keyboardType="number-pad"
                  onChangeText={(value) =>
                    setDraftRewards((current) =>
                      current.map((entry, i) =>
                        i === index ? { ...entry, points: Number(value.replace(/[^\d]/g, "")) || 1 } : entry
                      )
                    )
                  }
                />
              </View>
            ))
          : sortedRewards.map((reward) => (
              <View key={reward.id} style={styles.rewardRow}>
                <View style={styles.flex}>
                  <AppText style={styles.rewardTitle}>{reward.title}</AppText>
                  <AppText variant="caption" style={styles.meta}>
                    {reward.points} points
                  </AppText>
                </View>
                <SecondaryButton
                  size="compact"
                  disabled={wallet.availablePoints < reward.points}
                  onPress={() => handleClaim(reward)}
                >
                  Claim
                </SecondaryButton>
              </View>
            ))}
      </SoftCard>

      {wallet.claims.length ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Claimed</AppText>
          {wallet.claims.slice(0, 8).map((claimEntry) => (
            <AppText key={claimEntry.id} variant="small" style={styles.meta}>
              {claimEntry.title} · {claimEntry.points} pts
            </AppText>
          ))}
        </SoftCard>
      ) : null}

      {wallet.ledger.length ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Recent wins</AppText>
          {wallet.ledger.slice(0, 10).map((event) => (
            <AppText key={event.id} variant="small" style={styles.meta}>
              +{event.points} · {event.title}
            </AppText>
          ))}
        </SoftCard>
      ) : null}

      {notice ? <AppText variant="muted">{notice}</AppText> : null}
      {!editing ? (
        <PrimaryButton onPress={startEdit}>Customise rewards</PrimaryButton>
      ) : (
        <SecondaryButton onPress={() => setEditing(false)}>Cancel</SecondaryButton>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  link: {
    color: colors.link,
    fontWeight: "700"
  },
  next: {
    color: colors.primaryDark,
    fontWeight: "600"
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight
  },
  rewardTitle: {
    fontWeight: "700",
    color: colors.text
  },
  meta: {
    color: colors.mutedText
  },
  flex: {
    flex: 1,
    gap: 2
  },
  editRow: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight
  }
});
