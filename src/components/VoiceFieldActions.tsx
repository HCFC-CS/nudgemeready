import { StyleSheet, View } from "react-native";

import { HearButton } from "./HearButton";
import { SpeakButton } from "./SpeakButton";
import { appendSpokenText } from "../services/voiceCaptureStorage";
import { spacing } from "../theme/theme";

/** Mic (speech→text) + speaker (text→speech) for any text value. */
export function VoiceFieldActions({
  value,
  onChangeText,
  editable = true,
  size = 28,
  replaceOnSpeak = false
}: {
  value: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  size?: number;
  /** When true, spoken text replaces the field instead of appending */
  replaceOnSpeak?: boolean;
}) {
  return (
    <View style={styles.row}>
      {editable && onChangeText ? (
        <SpeakButton
          size={size}
          onTranscript={(spoken) =>
            onChangeText(replaceOnSpeak ? spoken.trim() : appendSpokenText(value, spoken))
          }
        />
      ) : null}
      <HearButton text={value} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  }
});
