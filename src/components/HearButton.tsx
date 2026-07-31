import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { useOptionalVoiceCaptureSettings } from "../hooks/useVoiceCaptureSettings";
import { isSpeaking, stopSpeaking, toggleSpeakText } from "../services/textToSpeech";
import { colors } from "../theme/theme";

export function HearButton({
  text,
  size = 28,
  disabled
}: {
  text: string;
  size?: number;
  disabled?: boolean;
}) {
  const settings = useOptionalVoiceCaptureSettings();
  const enabled = settings?.readAloudEnabled ?? true;
  const [active, setActive] = useState(false);
  const iconSize = size <= 28 ? 16 : 18;
  const hasText = Boolean(text.trim());

  useEffect(() => {
    return () => {
      if (isSpeaking()) {
        stopSpeaking();
      }
    };
  }, []);

  if (!enabled || disabled) {
    return null;
  }

  async function handlePress() {
    if (!hasText) {
      return;
    }
    const result = await toggleSpeakText(text, {
      onDone: () => setActive(false)
    });
    setActive(result === "speaking");
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={active ? "Stop reading" : "Read aloud"}
      disabled={!hasText}
      onPress={() => void handlePress()}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        active && styles.buttonActive,
        !hasText && styles.buttonDisabled,
        pressed && hasText && styles.buttonPressed
      ]}
    >
      <Ionicons
        name={active ? "stop" : "volume-high"}
        size={iconSize}
        color={active ? colors.onPrimary : colors.primaryDark}
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
  buttonDisabled: {
    opacity: 0.4
  },
  buttonPressed: {
    opacity: 0.85
  }
});
