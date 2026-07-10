import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { applyReminderOffset, occasionRemindBeforeOptions } from "../services/reminderDates";
import { spacing } from "../theme/theme";
import { DatePickerField } from "./DatePickerField";
import { ToggleRow } from "./FormControls";
import { GiftIdeaLinks } from "./GiftIdeaLinks";
import { RemindBeforeOptions } from "./RemindBeforeOptions";
import { AppText } from "./Text";
import { TimePickerField } from "./TimePickerField";

export function OccasionShoppingPrompts({
  title,
  giftIdeas = [],
  occasionDate,
  needsCard,
  onNeedsCardChange,
  needsPresent,
  onNeedsPresentChange,
  cardReminderDate,
  cardReminderTime,
  onCardReminderDateChange,
  onCardReminderTimeChange,
  giftReminderDate,
  giftReminderTime,
  onGiftReminderDateChange,
  onGiftReminderTimeChange
}: {
  title: string;
  giftIdeas?: string[];
  occasionDate: string;
  needsCard: boolean;
  onNeedsCardChange: (value: boolean) => void;
  needsPresent: boolean;
  onNeedsPresentChange: (value: boolean) => void;
  cardReminderDate: string;
  cardReminderTime: string;
  onCardReminderDateChange: (value: string) => void;
  onCardReminderTimeChange: (value: string) => void;
  giftReminderDate: string;
  giftReminderTime: string;
  onGiftReminderDateChange: (value: string) => void;
  onGiftReminderTimeChange: (value: string) => void;
}) {
  const [selectedCardOffset, setSelectedCardOffset] = useState("");
  const [selectedGiftOffset, setSelectedGiftOffset] = useState("");
  const hasOccasionDate = Boolean(occasionDate.trim());

  useEffect(() => {
    if (!needsCard || !hasOccasionDate || !selectedCardOffset) {
      return;
    }
    const minutes = occasionRemindBeforeOptions.find((option) => option.id === selectedCardOffset)?.minutes;
    if (!minutes) {
      return;
    }
    applyReminderOffset(occasionDate, "09:00", minutes, onCardReminderDateChange, onCardReminderTimeChange);
  }, [occasionDate, selectedCardOffset]);

  useEffect(() => {
    if (!needsPresent || !hasOccasionDate || !selectedGiftOffset) {
      return;
    }
    const minutes = occasionRemindBeforeOptions.find((option) => option.id === selectedGiftOffset)?.minutes;
    if (!minutes) {
      return;
    }
    applyReminderOffset(occasionDate, "09:00", minutes, onGiftReminderDateChange, onGiftReminderTimeChange);
  }, [occasionDate, selectedGiftOffset]);

  if (!title.trim()) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ToggleRow label="Do you need a card?" value={needsCard} onValueChange={onNeedsCardChange} />
      {needsCard ? (
        <View style={styles.block}>
          <RemindBeforeOptions
            label="Remind me to get the card"
            selectedId={selectedCardOffset}
            onSelect={(option) => {
              setSelectedCardOffset(option.id);
              if (hasOccasionDate) {
                applyReminderOffset(
                  occasionDate,
                  "09:00",
                  option.minutes,
                  onCardReminderDateChange,
                  onCardReminderTimeChange
                );
              }
            }}
          />
          {!hasOccasionDate ? (
            <AppText variant="small">Add the occasion date above to set a reminder.</AppText>
          ) : (
            <>
              <DatePickerField
                label="Reminder date"
                value={cardReminderDate}
                onChangeText={onCardReminderDateChange}
                placeholder="DD-MM-YYYY"
              />
              <TimePickerField
                label="Reminder time"
                value={cardReminderTime}
                onChangeText={onCardReminderTimeChange}
                placeholder="09:00"
              />
            </>
          )}
          <GiftIdeaLinks title={title} variant="card" />
        </View>
      ) : null}

      <ToggleRow label="Do you need a present?" value={needsPresent} onValueChange={onNeedsPresentChange} />
      {needsPresent ? (
        <View style={styles.block}>
          <RemindBeforeOptions
            label="Remind me to get the present"
            selectedId={selectedGiftOffset}
            onSelect={(option) => {
              setSelectedGiftOffset(option.id);
              if (hasOccasionDate) {
                applyReminderOffset(
                  occasionDate,
                  "09:00",
                  option.minutes,
                  onGiftReminderDateChange,
                  onGiftReminderTimeChange
                );
              }
            }}
          />
          {!hasOccasionDate ? (
            <AppText variant="small">Add the occasion date above to set a reminder.</AppText>
          ) : (
            <>
              <DatePickerField
                label="Reminder date"
                value={giftReminderDate}
                onChangeText={onGiftReminderDateChange}
                placeholder="DD-MM-YYYY"
              />
              <TimePickerField
                label="Reminder time"
                value={giftReminderTime}
                onChangeText={onGiftReminderTimeChange}
                placeholder="09:00"
              />
            </>
          )}
          <GiftIdeaLinks title={title} giftIdeas={giftIdeas} variant="present" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md
  },
  block: {
    gap: spacing.sm
  }
});
