import { ScrollView, StyleSheet, View } from "react-native";

import { type RemindBeforeOption, occasionRemindBeforeOptions } from "../services/reminderDates";
import { spacing } from "../theme/theme";
import { Button } from "./Button";
import { AppText } from "./Text";

export function RemindBeforeOptions({
  label = "Remind me...",
  selectedId,
  options = occasionRemindBeforeOptions,
  onSelect
}: {
  label?: string;
  selectedId: string;
  options?: RemindBeforeOption[];
  onSelect: (option: RemindBeforeOption) => void;
}) {
  return (
    <View style={styles.container}>
      <AppText variant="small">{label}</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroller}>
        {options.map((option) => (
          <Button
            key={option.id}
            tone={selectedId === option.id ? "primary" : "quiet"}
            style={styles.button}
            onPress={() => onSelect(option)}
          >
            {option.label}
          </Button>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs
  },
  scroller: {
    gap: spacing.sm,
    paddingVertical: spacing.xs
  },
  button: {
    minHeight: 44
  }
});
