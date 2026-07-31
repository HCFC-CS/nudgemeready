import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DatePickerField } from "../components/DatePickerField";
import { DateTimeFields } from "../components/DateTimeFields";
import { Field, ToggleRow } from "../components/FormControls";
import { BackButton } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { TimePickerField } from "../components/TimePickerField";
import { useTasks } from "../hooks/useTasks";
import {
  applyReminderOffset,
  formatDisplayDate,
  formatDisplayDateTime,
  getReminderAt,
  getReminderParts
} from "../services/reminderDates";
import { classificationColors, colors, spacing } from "../theme/theme";
import type { CardDeliveryMethod, RepeatRule, TaskClassification, TaskType } from "../types/models";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "AddTask">;

const repeatOptions: RepeatRule[] = ["none", "daily", "weekly", "monthly", "annual", "custom"];
const customRepeatOptions = [
  "Every Monday",
  "Every Friday",
  "Every weekday",
  "Every last Friday of the month",
  "Every first Monday of the month"
];
const classificationOptions: Array<{ value: TaskClassification; label: string }> = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "school", label: "School" },
  { value: "health", label: "Health" },
  { value: "clubs", label: "Clubs" }
];
const taskTypeOptions: Array<{ value: TaskType; label: string }> = [
  { value: "taskJob", label: "Task" },
  { value: "chore", label: "Chore" },
  { value: "project", label: "Project" },
  { value: "event", label: "Event" },
  { value: "occasion", label: "Occasion" },
  { value: "list", label: "List" },
  { value: "alert", label: "Alert" }
];
const remindBeforeOptions = [
  { id: "week", label: "1 week before", minutes: 7 * 24 * 60 },
  { id: "day", label: "1 day before", minutes: 24 * 60 },
  { id: "hour", label: "1 hour before", minutes: 60 },
  { id: "ten", label: "10 mins before", minutes: 10 }
];

export function AddTaskScreen({ navigation, route }: Props) {
  const draft = route.params?.draft;
  const selectedType = route.params?.type;
  const { addTask, updateTask } = useTasks();
  const reminderParts = getReminderParts(draft?.reminderAt);
  const appointmentParts = getReminderParts(draft?.appointmentAt);
  const occasionParts = getReminderParts(draft?.occasionDate);
  const giftReminderParts = getReminderParts(draft?.giftReminderAt);
  const cardReminderParts = getReminderParts(draft?.cardReminderAt);
  const [title, setTitle] = useState(draft?.title ?? "");
  const [duration, setDuration] = useState(String(draft?.durationMinutes ?? 15));
  const [appointmentDate, setAppointmentDate] = useState(appointmentParts.date);
  const [appointmentTime, setAppointmentTime] = useState(appointmentParts.time);
  const [classification, setClassification] = useState<TaskClassification>(
    normalizeClassification(draft?.classification)
  );
  const [taskType] = useState<TaskType>(normalizeTaskType(draft?.taskType ?? selectedType));
  const [reminderDate, setReminderDate] = useState(reminderParts.date);
  const [reminderTime, setReminderTime] = useState(reminderParts.time);
  const [occasionName, setOccasionName] = useState(draft?.occasionName ?? "");
  const [occasionDate, setOccasionDate] = useState(occasionParts.date);
  const [giftReminderDate, setGiftReminderDate] = useState(giftReminderParts.date);
  const [cardReminderDate, setCardReminderDate] = useState(cardReminderParts.date);
  const [giftReminderTime, setGiftReminderTime] = useState(giftReminderParts.time || "09:00");
  const [cardReminderTime, setCardReminderTime] = useState(cardReminderParts.time || "09:00");
  const [selectedReminderOffset, setSelectedReminderOffset] = useState("");
  const [selectedGiftOffset, setSelectedGiftOffset] = useState("");
  const [selectedCardOffset, setSelectedCardOffset] = useState("");
  const [remindForGift, setRemindForGift] = useState(draft?.remindForGift ?? false);
  const [remindForCard, setRemindForCard] = useState(draft?.remindForCard ?? false);
  const [cardDeliveryMethod, setCardDeliveryMethod] = useState<CardDeliveryMethod>(
    draft?.cardDeliveryMethod ?? "person"
  );
  const [cardPosted, setCardPosted] = useState(draft?.cardPosted ?? false);
  const [repeatRule, setRepeatRule] = useState<RepeatRule>(draft?.repeatRule ?? "none");
  const [customRepeatRule, setCustomRepeatRule] = useState(draft?.customRepeatRule ?? "");
  const [keepRemindingEvery15UntilDone, setKeepRemindingEvery15UntilDone] = useState(
    draft?.keepRemindingEvery15UntilDone ?? false
  );
  const [usesTaskBuddy, setUsesTaskBuddy] = useState(draft?.usesTaskBuddy ?? true);
  const [workMinutes, setWorkMinutes] = useState(String(draft?.workMinutes ?? 20));
  const [breakMinutes, setBreakMinutes] = useState(String(draft?.breakMinutes ?? 5));
  const [listItems, setListItems] = useState<string[]>(draft?.listItems ?? []);
  const [newListItem, setNewListItem] = useState("");
  const [syncToCalendar, setSyncToCalendar] = useState(draft?.syncToCalendar ?? false);
  const [confirmation, setConfirmation] = useState("");
  const showReminderFields = taskType !== "chore" && taskType !== "occasion" && taskType !== "appointment";
  const showDurationField = !isReminderLike(taskType) && taskType !== "taskJob";
  const showStepsToTake = !isReminderLike(taskType) && taskType !== "taskJob" && taskType !== "appointment";
  const reminderTimeForSave = taskType === "taskJob" ? reminderTime : reminderTime || "09:00";

  if (!draft && !selectedType) {
    return (
      <Screen>
        <BackButton />
        <AppText variant="title">Let's get it down</AppText>
        <View style={styles.typeChoiceGrid}>
          {taskTypeOptions.map((option) => (
            <Button
              key={option.value}
              tone="quiet"
              style={styles.typeChoiceButton}
              onPress={() => navigation.replace("AddTask", { type: option.value })}
            >
              {option.label}
            </Button>
          ))}
        </View>
      </Screen>
    );
  }

  async function createTask() {
    const resolvedTitle = isOccasionLike(taskType) ? occasionName.trim() : title.trim();
    if (!resolvedTitle) {
      return;
    }
    const reminderAt = showReminderFields ? getReminderAt(reminderDate, reminderTimeForSave) : undefined;
    const appointmentAt = getReminderAt(appointmentDate, appointmentTime);
    const occasionAt = occasionDate.trim() ? getReminderAt(occasionDate, "09:00") : undefined;
    const giftReminderAt = getReminderAt(giftReminderDate, giftReminderTime);
    const cardReminderAt = getReminderAt(cardReminderDate, cardReminderTime);
    const reminderLabel = reminderAt ? formatReminderLabel(reminderAt) : undefined;
    const taskPayload = {
      title: resolvedTitle,
      notes: draft?.notes,
      dueDate:
        (taskType === "appointment" || taskType === "event") && appointmentAt
          ? formatReminderLabel(appointmentAt)
          : isOccasionLike(taskType) && occasionAt
            ? formatDateOnlyLabel(occasionAt)
            : reminderLabel,
      reminderAt,
      keepRemindingEvery15UntilDone: taskType === "taskJob" ? keepRemindingEvery15UntilDone : false,
      customRepeatRule: repeatRule === "custom" ? customRepeatRule.trim() || undefined : undefined,
      appointmentAt: taskType === "appointment" || taskType === "event" ? appointmentAt : undefined,
      occasionName: isOccasionLike(taskType) ? occasionName.trim() || undefined : undefined,
      occasionDate: isOccasionLike(taskType) ? occasionAt : undefined,
      remindForGift: isOccasionLike(taskType) ? remindForGift : false,
      giftReminderAt: isOccasionLike(taskType) && remindForGift ? giftReminderAt : undefined,
      remindForCard: isOccasionLike(taskType) ? remindForCard : false,
      cardReminderAt: isOccasionLike(taskType) && remindForCard ? cardReminderAt : undefined,
      cardDeliveryMethod: isOccasionLike(taskType) && remindForCard ? cardDeliveryMethod : undefined,
      cardPosted: isOccasionLike(taskType) && remindForCard && cardDeliveryMethod === "post" ? cardPosted : undefined,
      classification,
      taskType,
      listItems: taskType === "list" ? listItems.filter((item) => item.trim()) : undefined,
      syncToCalendar: supportsCalendarSync(taskType) ? syncToCalendar : false,
      durationMinutes: showDurationField ? Number(duration) || 15 : 15,
      usesTaskBuddy: showStepsToTake ? usesTaskBuddy : false,
      workMinutes: Number(workMinutes) || 20,
      breakMinutes: Number(breakMinutes) || 5,
      repeatRule,
      encouragementStyle: draft?.encouragementStyle ?? "calm"
    };
    if (draft?.id && draft.createdAt && typeof draft.isCompleted === "boolean") {
      await updateTask({
        ...taskPayload,
        id: draft.id,
        createdAt: draft.createdAt,
        isCompleted: draft.isCompleted
      });
    } else {
      await addTask(taskPayload);
    }
    setConfirmation(draft?.id ? "Task updated" : "Task created");
    setTimeout(() => {
      navigation.navigate("Tabs");
    }, 900);
  }

  return (
    <Screen>
      <BackButton />
      <Card>
        {isOccasionLike(taskType) ? null : (
          <Field
            label={taskType === "chore" ? "Chore title" : "Title"}
            value={title}
            onChangeText={setTitle}
            placeholder={taskType === "chore" ? "Clean the kitchen" : "Feed the dog"}
          />
        )}
        {isOccasionLike(taskType) ? (
          <Card style={styles.reminderBuilder}>
            <AppText variant="heading">{taskType === "alert" ? "Alert" : "Occasion"}</AppText>
            <Field
              label={taskType === "alert" ? "Alert for" : "Occasion"}
              value={occasionName}
              onChangeText={setOccasionName}
              placeholder={taskType === "alert" ? "Medication due" : "Mum's birthday"}
            />
            <DatePickerField
              label={taskType === "alert" ? "Alert date" : "Occasion date"}
              value={occasionDate}
              onChangeText={setOccasionDate}
              placeholder="04-05-2026"
            />
            {taskType !== "alert" ? (
              <>
                <ToggleRow
                  label="Gift needed?"
                  value={remindForGift}
                  onValueChange={setRemindForGift}
                />
                {remindForGift ? (
                  <>
                    <DatePickerField
                      label="Gift date"
                      value={giftReminderDate}
                      onChangeText={setGiftReminderDate}
                      placeholder="27-04-2026"
                    />
                    <RemindBeforeOptions
                      selectedId={selectedGiftOffset}
                      onSelect={(option) => {
                        setSelectedGiftOffset(option.id);
                        applyReminderOffset(occasionDate, "09:00", option.minutes, setGiftReminderDate, setGiftReminderTime);
                      }}
                    />
                  </>
                ) : null}
                <ToggleRow
                  label="Card needed?"
                  value={remindForCard}
                  onValueChange={setRemindForCard}
                />
                {remindForCard ? (
                  <>
                    <DatePickerField
                      label="Card date"
                      value={cardReminderDate}
                      onChangeText={setCardReminderDate}
                      placeholder="27-04-2026"
                    />
                    <RemindBeforeOptions
                      selectedId={selectedCardOffset}
                      onSelect={(option) => {
                        setSelectedCardOffset(option.id);
                        applyReminderOffset(occasionDate, "09:00", option.minutes, setCardReminderDate, setCardReminderTime);
                      }}
                    />
                    <Card style={styles.questionCard}>
                      <AppText variant="heading">Card - post or in person?</AppText>
                      <View style={styles.segment}>
                        <Button
                          tone={cardDeliveryMethod === "post" ? "primary" : "quiet"}
                          style={styles.segmentButton}
                          onPress={() => setCardDeliveryMethod("post")}
                        >
                          Post
                        </Button>
                        <Button
                          tone={cardDeliveryMethod === "person" ? "primary" : "quiet"}
                          style={styles.segmentButton}
                          onPress={() => setCardDeliveryMethod("person")}
                        >
                          In person
                        </Button>
                      </View>
                      {cardDeliveryMethod === "post" ? (
                        <ToggleRow
                          label="Have you posted it?"
                          value={cardPosted}
                          onValueChange={setCardPosted}
                          note={cardPosted ? "Marked as posted." : "This will show on the home screen."}
                        />
                      ) : null}
                    </Card>
                  </>
                ) : null}
              </>
            ) : null}
          </Card>
        ) : null}
        {taskType === "appointment" || taskType === "event" ? (
          <>
            <DateTimeFields
              dateLabel={taskType === "event" ? "Event date" : "Appointment date"}
              timeLabel={taskType === "event" ? "Event time" : "Appointment time"}
              date={appointmentDate}
              onDateChange={setAppointmentDate}
              time={appointmentTime}
              onTimeChange={setAppointmentTime}
              datePlaceholder="04-05-2026"
              timePlaceholder="14:30"
            />
            <RemindBeforeOptions
              selectedId={selectedReminderOffset}
              onSelect={(option) => {
                setSelectedReminderOffset(option.id);
                applyReminderOffset(appointmentDate, appointmentTime, option.minutes, setReminderDate, setReminderTime);
              }}
            />
          </>
        ) : null}
        {showDurationField ? (
          <Field
            label={getDurationLabel(taskType)}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            placeholder="15"
          />
        ) : null}
        <AppText variant="small">Classification</AppText>
        <View style={styles.segment}>
          {classificationOptions.map((option) => (
            <Button
              key={option.value}
              tone={classification === option.value ? "primary" : "quiet"}
              style={[
                styles.segmentButton,
                {
                  backgroundColor:
                    classification === option.value ? classificationColors[option.value].background : colors.card,
                  borderColor: classificationColors[option.value].border,
                  borderWidth: 1
                }
              ]}
              onPress={() => setClassification(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </View>
        {taskType === "list" ? (
          <Card style={styles.listBuilder}>
            <AppText variant="heading">List items</AppText>
            {listItems.map((item, index) => (
              <View key={`${item}-${index}`} style={styles.listItemRow}>
                <AppText style={styles.listItemText}>{item}</AppText>
                <Button
                  tone="quiet"
                  style={styles.removeItemButton}
                  onPress={() => setListItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                >
                  Remove
                </Button>
              </View>
            ))}
            <Field
              label="New item"
              value={newListItem}
              onChangeText={(text) => {
                if (/\r?\n/.test(text)) {
                  const lines = text
                    .split(/\r?\n/)
                    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
                    .filter(Boolean);
                  if (lines.length) {
                    setListItems((current) => [...current, ...lines]);
                  }
                  setNewListItem("");
                  return;
                }
                setNewListItem(text);
              }}
              placeholder="Milk — or paste several lines"
              multiline
            />
            <Button
              tone="secondary"
              onPress={() => {
                const lines = newListItem
                  .split(/\r?\n/)
                  .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
                  .filter(Boolean);
                if (!lines.length) {
                  return;
                }
                setListItems((current) => [...current, ...lines]);
                setNewListItem("");
              }}
            >
              Add item
            </Button>
          </Card>
        ) : null}
        {showReminderFields ? (
          <>
            <DatePickerField
              label={taskType === "taskJob" ? "Date it needs to be done" : "Reminder date"}
              value={reminderDate}
              onChangeText={setReminderDate}
              placeholder="04-05-2026"
            />
            {taskType !== "taskJob" ? (
              <RemindBeforeOptions
                selectedId={selectedReminderOffset}
                onSelect={(option) => {
                  setSelectedReminderOffset(option.id);
                  applyReminderOffset(reminderDate, reminderTimeForSave, option.minutes, setReminderDate, setReminderTime);
                }}
              />
            ) : null}
            {taskType === "taskJob" ? (
              <TimePickerField
                label="Time it needs to be done"
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="18:00"
              />
            ) : null}
            {taskType === "taskJob" ? (
              <ToggleRow
                label="Keep reminding every 15 mins until done"
                value={keepRemindingEvery15UntilDone}
                onValueChange={setKeepRemindingEvery15UntilDone}
              />
            ) : null}
          </>
        ) : null}
        {supportsCalendarSync(taskType) ? (
          <ToggleRow
            label="Sync to calendar"
            value={syncToCalendar}
            onValueChange={setSyncToCalendar}
            note="Marks this item for calendar sync."
          />
        ) : null}
        <AppText variant="small">{taskType === "chore" ? "Recurring chore?" : "Repeat"}</AppText>
        <View style={styles.segment}>
          {repeatOptions.map((option) => (
            <Button
              key={option}
              tone={repeatRule === option ? "primary" : "quiet"}
              style={styles.segmentButton}
              onPress={() => setRepeatRule(option)}
            >
              {option}
            </Button>
          ))}
        </View>
        {repeatRule === "custom" ? (
          <Card style={styles.customRepeatBuilder}>
            <AppText variant="heading">Custom repeat</AppText>
            <View style={styles.segment}>
              {customRepeatOptions.map((option) => (
                <Button
                  key={option}
                  tone={customRepeatRule === option ? "primary" : "quiet"}
                  style={styles.segmentButton}
                  onPress={() => setCustomRepeatRule(option)}
                >
                  {option}
                </Button>
              ))}
            </View>
            <Field
              label="Custom repeat"
              value={customRepeatRule}
              onChangeText={setCustomRepeatRule}
              placeholder="Every last Friday of the month"
            />
          </Card>
        ) : null}
        {showStepsToTake ? (
          <ToggleRow label="Use steps to take" value={usesTaskBuddy} onValueChange={setUsesTaskBuddy} />
        ) : null}
        {showStepsToTake && usesTaskBuddy ? (
          <View style={styles.twoColumns}>
            <Field label="Work minutes" value={workMinutes} onChangeText={setWorkMinutes} keyboardType="number-pad" />
            <Field label="Break minutes" value={breakMinutes} onChangeText={setBreakMinutes} keyboardType="number-pad" />
          </View>
        ) : null}
      </Card>
      <Button onPress={createTask}>Save It</Button>
      <Button tone="quiet" onPress={createTask}>Just Keep It Simple</Button>
      {confirmation ? (
        <Card style={styles.confirmation}>
          <AppText variant="heading">{confirmation}</AppText>
          <AppText variant="muted">Taking you back home.</AppText>
        </Card>
      ) : null}
      <AppText variant="small" style={{ color: colors.mutedText }}>
        {taskType === "occasion"
          ? "Occasion dates use DD-MM-YYYY."
          : "Dates use DD-MM-YYYY and times use 24-hour HH:MM, like an alarm."}
      </AppText>
    </Screen>
  );
}

function RemindBeforeOptions({
  selectedId,
  onSelect
}: {
  selectedId: string;
  onSelect: (option: (typeof remindBeforeOptions)[number]) => void;
}) {
  return (
    <View style={styles.remindOptions}>
      <AppText variant="small">Remind me...</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.remindOptionScroller}>
        {remindBeforeOptions.map((option) => (
          <Button
            key={option.id}
            tone={selectedId === option.id ? "primary" : "quiet"}
            style={styles.remindOptionButton}
            onPress={() => onSelect(option)}
          >
            {option.label}
          </Button>
        ))}
      </ScrollView>
    </View>
  );
}

function normalizeClassification(classification?: string): TaskClassification {
  if (
    classification === "home" ||
    classification === "health" ||
    classification === "school" ||
    classification === "work" ||
    classification === "clubs"
  ) {
    return classification;
  }
  return "clubs";
}

function normalizeTaskType(taskType?: string): TaskType {
  if (
    taskType === "taskJob" ||
    taskType === "task" ||
    taskType === "project" ||
    taskType === "reminder" ||
    taskType === "appointment" ||
    taskType === "event" ||
    taskType === "list" ||
    taskType === "alert" ||
    taskType === "occasion" ||
    taskType === "chore"
  ) {
    if (taskType === "task") {
      return "taskJob";
    }
    return taskType;
  }
  return "taskJob";
}

function formatTaskType(taskType: TaskType) {
  if (taskType === "reminder") {
    return "Occasion";
  }
  if (taskType === "taskJob") {
    return "Task";
  }
  const option = taskTypeOptions.find((item) => item.value === taskType);
  return option?.label.split(" - ")[0] ?? "Task";
}

function getDurationLabel(taskType: TaskType) {
  if (taskType === "appointment") {
    return "Appointment duration";
  }
  if (taskType === "event") {
    return "Event duration";
  }
  if (taskType === "taskJob") {
    return "Time to do";
  }
  if (taskType === "chore") {
    return "How long to work on it";
  }
  return "Duration";
}

function supportsCalendarSync(taskType: TaskType) {
  return (
    taskType === "appointment" ||
    taskType === "event" ||
    taskType === "reminder" ||
    taskType === "occasion" ||
    taskType === "alert" ||
    taskType === "list"
  );
}

function isReminderLike(taskType: TaskType) {
  return taskType === "reminder" || taskType === "alert" || taskType === "occasion";
}

function isOccasionLike(taskType: TaskType) {
  return taskType === "reminder" || taskType === "occasion" || taskType === "alert";
}

function formatReminderLabel(reminderAt: string) {
  return formatDisplayDateTime(reminderAt);
}

function formatDateOnlyLabel(reminderAt: string) {
  return formatDisplayDate(reminderAt);
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  segmentButton: {
    minHeight: 44,
    flexGrow: 1
  },
  typeChoiceGrid: {
    gap: spacing.md
  },
  typeChoiceButton: {
    minHeight: 64,
    alignItems: "center"
  },
  selectedTypeCard: {
    backgroundColor: colors.secondary,
    padding: spacing.md
  },
  twoColumns: {
    flexDirection: "row",
    gap: spacing.sm
  },
  confirmation: {
    borderColor: colors.primary
  },
  listBuilder: {
    backgroundColor: colors.secondary
  },
  reminderBuilder: {
    backgroundColor: colors.secondary
  },
  customRepeatBuilder: {
    backgroundColor: colors.secondary
  },
  questionCard: {
    backgroundColor: colors.card,
    borderColor: colors.border
  },
  remindOptions: {
    gap: spacing.xs
  },
  remindOptionScroller: {
    gap: spacing.sm,
    paddingRight: spacing.md
  },
  remindOptionButton: {
    minHeight: 42,
    minWidth: 132
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  listItemText: {
    flex: 1
  },
  removeItemButton: {
    minHeight: 42
  }
});
