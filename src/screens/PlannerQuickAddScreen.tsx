import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { StyleSheet } from "react-native";

import { Field } from "../components/FormControls";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { parsePlannerQuickAdd, useReady4Planner } from "../hooks/useReady4Planner";
import { getPlannerConfig } from "../services/ready4PlannerConfigs";
import { spacing } from "../theme/theme";

export function PlannerQuickAddScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const preferredPackId = typeof route.params?.packId === "string" ? route.params.packId : undefined;
  const { addFromDraft, linkNudge } = useReady4Planner();
  const [raw, setRaw] = useState("");
  const [alsoNudge, setAlsoNudge] = useState(true);

  const draft = useMemo(() => parsePlannerQuickAdd(raw || " ", preferredPackId), [raw, preferredPackId]);
  const config = getPlannerConfig(draft.ready4PackId);

  function handleSave() {
    if (!raw.trim()) {
      return;
    }
    const item = addFromDraft(parsePlannerQuickAdd(raw, preferredPackId));
    if (alsoNudge) {
      linkNudge(item.id, item);
    }
    if (preferredPackId) {
      navigation.navigate("PackPlanner", { packId: preferredPackId });
      return;
    }
    navigation.navigate("PlannerHub");
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title="Add something"
        subtitle="Type it in your words. We'll confirm before saving."
        showBack
      />

      <SoftCard style={styles.card}>
        <Field
          label="What do you want to plan?"
          value={raw}
          onChangeText={setRaw}
          placeholder="e.g. Revision for biology Monday at 7"
          multiline
        />
      </SoftCard>

      {raw.trim() ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">{draft.title}</AppText>
          <AppText variant="muted">Pack: {config?.title ?? draft.ready4PackId}</AppText>
          <AppText variant="muted">Type: {draft.type}</AppText>
          {draft.startAt ? (
            <AppText variant="muted">When: {new Date(draft.startAt).toLocaleString("en-GB")}</AppText>
          ) : null}
          {draft.dueAt ? (
            <AppText variant="muted">Due: {new Date(draft.dueAt).toLocaleString("en-GB")}</AppText>
          ) : null}
          {draft.durationMinutes ? (
            <AppText variant="muted">About {draft.durationMinutes} minutes</AppText>
          ) : null}
          {draft.rewardNote ? <AppText variant="muted">Reward note: {draft.rewardNote}</AppText> : null}
          <AppText variant="caption">
            {alsoNudge
              ? "Will also create a linked nudge (and calendar sync when enabled on the nudge)."
              : "Planner only — you can link a nudge later."}
          </AppText>
          <SecondaryButton size="compact" onPress={() => setAlsoNudge((value) => !value)}>
            {alsoNudge ? "Planner only this time" : "Also add nudge"}
          </SecondaryButton>
          <PrimaryButton onPress={handleSave}>Save</PrimaryButton>
        </SoftCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  }
});
