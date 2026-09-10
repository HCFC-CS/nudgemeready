import { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { Field } from "../components/FormControls";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useNudgeActor } from "../hooks/useNudgeActor";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { useRewardBank } from "../hooks/useRewardBank";
import { createItem } from "../services/nudgeItems";
import { formatRewardEarnNotice } from "../services/rewardBank";
import { colors, radii, spacing } from "../theme/theme";
import {
  DID_SOMETHING_LIST_TITLE,
  DID_SOMETHING_TEMPLATE_ID,
  difficultyLabel,
  type RewardDifficulty
} from "../types/rewards";

const DIFFICULTIES: RewardDifficulty[] = ["normal", "hard", "really_hard"];

export function DidSomethingScreen({ navigation }: { navigation: any }) {
  const { items, saveItem } = useNudgeItems();
  const actor = useNudgeActor();
  const { earn } = useRewardBank();
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<RewardDifficulty>("normal");
  const [notice, setNotice] = useState("");

  const recent = useMemo(
    () =>
      items
        .filter((item) => item.sourceTemplateId === DID_SOMETHING_TEMPLATE_ID)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 8),
    [items]
  );

  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) {
      setNotice("What did you get done?");
      return;
    }
    const entry = createItem({
      type: "note",
      title: trimmed,
      status: "done",
      notes: `${DID_SOMETHING_LIST_TITLE} · ${difficultyLabel(difficulty)}`,
      sourceTemplateId: DID_SOMETHING_TEMPLATE_ID,
      createdBy: actor,
      progress: 100
    });
    saveItem(entry);
    const points = earn({
      difficulty,
      title: trimmed,
      kind: "did_something",
      sourceItemId: entry.id
    });
    setTitle("");
    setDifficulty("normal");
    setNotice(formatRewardEarnNotice(points, trimmed, `Saved. +{points} — that counts.`));
    if (points > 0) {
      Alert.alert("Well done", `+${points} added to your Reward Bank.`, [
        { text: "Stay here", style: "cancel" },
        { text: "Reward Bank", onPress: () => navigation.navigate("RewardBank") }
      ]);
    }
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title="I did something"
        subtitle="It does not need to have been on a list."
        showBack
      />

      <SoftCard style={styles.card}>
        <Field
          label="What did you get done?"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Opened the post"
        />
        <AppText variant="caption" style={styles.hint}>
          How hard was it today?
        </AppText>
        <View style={styles.row}>
          {DIFFICULTIES.map((entry) => {
            const selected = difficulty === entry;
            return (
              <SecondaryButton
                key={entry}
                size="compact"
                style={selected ? styles.selected : undefined}
                onPress={() => setDifficulty(entry)}
              >
                {difficultyLabel(entry)}
              </SecondaryButton>
            );
          })}
        </View>
        <PrimaryButton onPress={handleSave}>Save this win</PrimaryButton>
        {notice ? <AppText variant="muted">{notice}</AppText> : null}
      </SoftCard>

      {recent.length ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">{DID_SOMETHING_LIST_TITLE}</AppText>
          {recent.map((item) => (
            <AppText key={item.id} variant="small" style={styles.recent}>
              {item.title}
            </AppText>
          ))}
        </SoftCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm
  },
  hint: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  recent: {
    color: colors.text,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight
  }
});
