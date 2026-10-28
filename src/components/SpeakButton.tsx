import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useId, useRef } from "react";
import { AccessibilityInfo, Alert, Pressable, StyleSheet, Vibration, View } from "react-native";

import { useSpeechCapture } from "../hooks/useSpeechCapture";
import { useOptionalVoiceCaptureSettings } from "../hooks/useVoiceCaptureSettings";
import { speakToggleAccessibilityLabel } from "../services/speechCapture";
import { isSpeechRecognitionSupported } from "../services/speechRecognition";
import { releasePlaybackForMicrophone } from "../services/textToSpeech";
import { colors } from "../theme/theme";
import { AppText } from "./Text";

export function SpeakButton({
  onTranscript,
  size = 28,
  disabled,
  captureId
}: {
  onTranscript: (text: string) => void;
  size?: number;
  disabled?: boolean;
  captureId?: string;
}) {
  const generatedId = useId();
  const targetId = captureId ?? generatedId;
  const settings = useOptionalVoiceCaptureSettings();
  const speech = useSpeechCapture(targetId);
  const enabled = settings?.enabled ?? true;
  const supported = isSpeechRecognitionSupported();
  const iconSize = size <= 28 ? 16 : 18;
  const mountedRef = useRef(true);
  const resetRef = useRef(speech.reset);
  resetRef.current = speech.reset;
  const showListening = speech.isListening || speech.isEngaged;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      resetRef.current();
    };
  }, []);

  useEffect(() => {
    if (!enabled || disabled) {
      resetRef.current();
    }
  }, [enabled, disabled]);

  useEffect(() => {
    if (speech.error) {
      AccessibilityInfo.announceForAccessibility(speech.error);
    }
  }, [speech.error]);

  if (!enabled || disabled) {
    return null;
  }

  async function handlePress() {
    if (!supported) {
      Alert.alert(
        "Voice to text",
        "Speech input needs a development or TestFlight build. It is not available in Expo Go."
      );
      return;
    }

    if (speech.isListening) {
      const { capturedText } = await speech.finish();
      if (!mountedRef.current || !capturedText) {
        return;
      }
      onTranscript(capturedText);
      Vibration.vibrate(160);
      return;
    }

    if (speech.isEngaged || speech.isBusyElsewhere) {
      return;
    }

    await releasePlaybackForMicrophone();
    const started = await speech.start();
    if (started) {
      Vibration.vibrate(100);
    }
  }

  const idleLabel = speakToggleAccessibilityLabel(showListening);

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={speech.error ? `${idleLabel}. ${speech.error}` : idleLabel}
        onPress={() => void handlePress()}
        style={({ pressed }) => [
          styles.button,
          { width: size, height: size, borderRadius: size / 2 },
          showListening && styles.buttonActive,
          (!supported || speech.isBusyElsewhere) && styles.buttonMuted,
          pressed && styles.buttonPressed
        ]}
      >
        <Ionicons
          name="mic"
          size={iconSize}
          color={showListening ? colors.onPrimary : colors.primaryDark}
        />
      </Pressable>
      {speech.error ? (
        <AppText variant="caption" accessibilityLiveRegion="polite" style={styles.error}>
          {speech.error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "flex-end",
    flexShrink: 1,
    maxWidth: "75%"
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft
  },
  buttonActive: {
    backgroundColor: colors.accent
  },
  buttonMuted: {
    opacity: 0.7
  },
  buttonPressed: {
    opacity: 0.85
  },
  error: {
    color: "#B42318",
    textAlign: "right"
  }
});
