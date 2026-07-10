import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Field } from "../components/FormControls";
import { BackButton, VoiceCaptureButton } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useTasks } from "../hooks/useTasks";
import { parseVoiceTask } from "../services/voiceParser";
import { colors, spacing } from "../theme/theme";
import type { TaskItem } from "../types/models";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "VoiceAddTask">;

export function VoiceAddTaskScreen({ navigation }: Props) {
  const { addTask } = useTasks();
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState<Partial<TaskItem> | undefined>();

  function parseInput() {
    const nextDraft = parseVoiceTask(input);
    setDraft(nextDraft);
    Speech.speak("Does this look right?");
  }

  async function addDraft() {
    if (!draft?.title) {
      return;
    }
    await addTask({
      title: draft.title,
      notes: draft.notes,
      dueDate: draft.dueDate,
      classification: draft.classification ?? "clubs",
      taskType: draft.taskType ?? "taskJob",
      durationMinutes: draft.durationMinutes ?? 15,
      usesTaskBuddy: draft.usesTaskBuddy ?? false,
      workMinutes: draft.workMinutes ?? 20,
      breakMinutes: draft.breakMinutes ?? 5,
      repeatRule: draft.repeatRule ?? "none",
      encouragementStyle: "calm"
    });
    navigation.navigate("Tabs");
  }

  return (
    <Screen>
      <BackButton />
      <VoiceCaptureButton
        idleLabel="Tap to speak"
        idleTone="primary"
        placeholder="Remind me to feed the dog every day at 6pm"
        onCaptured={(capturedText) => setInput(capturedText)}
      />

      <Field label="Voice text" value={input} onChangeText={setInput} multiline />
      <Button onPress={parseInput} disabled={!input.trim()}>Create draft</Button>

      {draft ? (
        <Card>
          <AppText variant="heading">Does this look right?</AppText>
          <AppText>{draft.title}</AppText>
          <AppText variant="muted">
            {draft.durationMinutes} min · {draft.repeatRule} {draft.dueDate ? `· ${draft.dueDate}` : ""}
          </AppText>
          <View style={styles.row}>
            <Button style={styles.rowButton} onPress={addDraft}>Add it</Button>
            <Button style={styles.rowButton} tone="quiet" onPress={() => navigation.navigate("AddTask", { draft })}>
              Edit
            </Button>
          </View>
          <Button tone="secondary" onPress={() => setDraft(undefined)}>Try again</Button>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm
  },
  rowButton: {
    flex: 1
  }
});
