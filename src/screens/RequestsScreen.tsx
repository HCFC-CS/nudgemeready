import { StyleSheet, View } from "react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useCircle } from "../hooks/useCircle";
import { useTasks } from "../hooks/useTasks";
import { spacing } from "../theme/theme";

export function RequestsScreen() {
  const { requests, updateRequest } = useCircle();
  const { addTask } = useTasks();
  const pending = requests.filter((request) => request.status === "pending");

  return (
    <Screen>
      <AppText variant="title">Requests</AppText>
      {pending.map((request) => (
        <Card key={request.id}>
          <AppText variant="heading">
            {request.fromName} wants to add: {request.title}
          </AppText>
          <AppText variant="muted">{request.suggestedTime ?? "A gentle reminder for later"}</AppText>
          {request.message ? <AppText>{request.message}</AppText> : null}
          <View style={styles.row}>
            <Button
              style={styles.rowButton}
              onPress={async () => {
                await addTask({
                  title: request.title,
                  classification: "home",
                  taskType: "reminder",
                  durationMinutes: 5,
                  usesTaskBuddy: false,
                  workMinutes: 5,
                  breakMinutes: 1,
                  repeatRule: request.repeatRule,
                  dueDate: request.suggestedTime,
                  encouragementStyle: "calm"
                });
                updateRequest({ ...request, status: "accepted" });
              }}
            >
              Accept
            </Button>
            <Button
              style={styles.rowButton}
              tone="secondary"
              onPress={() => updateRequest({ ...request, status: "later" })}
            >
              Later
            </Button>
          </View>
          <View style={styles.row}>
            <Button style={styles.rowButton} tone="quiet">Edit</Button>
            <Button
              style={styles.rowButton}
              tone="quiet"
              onPress={() => updateRequest({ ...request, status: "declined" })}
            >
              Decline
            </Button>
          </View>
        </Card>
      ))}
      {pending.length === 0 ? (
        <Card>
          <AppText variant="heading">No pending requests</AppText>
          <AppText variant="muted">You stay in control of what gets added.</AppText>
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
