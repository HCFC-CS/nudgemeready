import { StyleSheet, View } from "react-native";

import { spacing } from "../theme/theme";
import { DatePickerField } from "./DatePickerField";
import { TimePickerField } from "./TimePickerField";

type DateTimeFieldsProps = {
  date: string;
  onDateChange: (value: string) => void;
  time: string;
  onTimeChange: (value: string) => void;
  dateLabel?: string;
  timeLabel?: string;
  datePlaceholder?: string;
  timePlaceholder?: string;
  editable?: boolean;
  /** Side-by-side tiles (reminder hero) vs stacked labeled fields */
  layout?: "row" | "stack";
};

export function DateTimeFields({
  date,
  onDateChange,
  time,
  onTimeChange,
  dateLabel = "Date",
  timeLabel = "Time",
  datePlaceholder = "DD-MM-YYYY",
  timePlaceholder = "09:00",
  editable,
  layout = "stack"
}: DateTimeFieldsProps) {
  if (layout === "row") {
    return (
      <View style={styles.row}>
        <View style={styles.half}>
          <DatePickerField
            label={dateLabel}
            value={date}
            onChangeText={onDateChange}
            placeholder={datePlaceholder}
            editable={editable}
            variant="tile"
          />
        </View>
        <View style={styles.half}>
          <TimePickerField
            label={timeLabel}
            value={time}
            onChangeText={onTimeChange}
            placeholder={timePlaceholder}
            editable={editable}
            variant="tile"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <DatePickerField
        label={dateLabel}
        value={date}
        onChangeText={onDateChange}
        placeholder={datePlaceholder}
        editable={editable}
      />
      <TimePickerField
        label={timeLabel}
        value={time}
        onChangeText={onTimeChange}
        placeholder={timePlaceholder}
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.sm
  },
  half: {
    flex: 1,
    minWidth: 0
  },
  stack: {
    gap: spacing.md
  }
});
