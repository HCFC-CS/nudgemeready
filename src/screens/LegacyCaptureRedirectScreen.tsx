import { useEffect } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { PageHeader, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import type { RootStackParamList } from "../types/navigation";

/**
 * Legacy TaskItem create/buddy screens redirect to Capture.
 * Canonical create path is Capture → ItemDetails (NudgeItem + Reward Bank).
 */
export function LegacyCaptureRedirectScreen({
  navigation
}: NativeStackScreenProps<RootStackParamList, "AddTask" | "VoiceAddTask" | "TaskBuddy">) {
  useEffect(() => {
    navigation.replace("Tabs", { screen: "Capture" });
  }, [navigation]);

  return (
    <Screen showTabMenu={false}>
      <PageHeader title="Add" showBack={false} />
      <SoftCard>
        <AppText variant="muted">Opening Add…</AppText>
      </SoftCard>
    </Screen>
  );
}
