import { Pressable, StyleSheet, Vibration } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useSpeechToText } from "../hooks/useSpeechToText";
import { useOptionalVoiceCaptureSettings } from "../hooks/useVoiceCaptureSettings";
import { colors } from "../theme/theme";

export function SpeakButton({
  onTranscript,
  size = 28,
  disabled
}: {
  onTranscript: (text: string) => void;
  size?: number;
  disabled?: boolean;
}) {
  const settings = useOptionalVoiceCaptureSettings();
  const speech = useSpeechToText();
  const enabled = settings?.enabled ?? true;
  const iconSize = size <= 28 ? 16 : 18;

  if (!enabled || !speech.isAvailable || disabled) {
    return null;
  }

  async function handlePress() {
    if (speech.isListening) {
      const { capturedText } = speech.finish();
      if (capturedText) {
        onTranscript(capturedText);
        Vibration.vibrate(160);
      }
      return;
    }

    const started = await speech.start();
    if (started) {
      Vibration.vibrate(100);
    }
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={speech.isListening ? "Done speaking" : "Tap to speak"}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        speech.isListening && styles.buttonActive,
        pressed && styles.buttonPressed
      ]}
    >
      <Ionicons
        name={speech.isListening ? "checkmark" : "mic"}
        size={iconSize}
        color={speech.isListening ? colors.onPrimary : colors.primaryDark}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft
  },
  buttonActive: {
    backgroundColor: colors.accent
  },
  buttonPressed: {
    opacity: 0.85
  }
});
