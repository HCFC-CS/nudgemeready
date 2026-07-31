import { StyleSheet, Switch, TextInput, View, type TextInputProps } from "react-native";

import { useOptionalItemEdit } from "../hooks/useItemEdit";
import { colors, radii, spacing } from "../theme/theme";
import { AppText } from "./Text";
import { VoiceFieldActions } from "./VoiceFieldActions";

function useFieldEditable(editable?: boolean) {
  const edit = useOptionalItemEdit();
  if (editable !== undefined) {
    return editable;
  }
  return edit?.editable ?? true;
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  onSubmitEditing,
  returnKeyType,
  blurOnSubmit,
  editable,
  voiceEnabled = true,
  secureTextEntry = false
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
  multiline?: boolean;
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  returnKeyType?: TextInputProps["returnKeyType"];
  blurOnSubmit?: TextInputProps["blurOnSubmit"];
  editable?: boolean;
  /** Show mic (speech-to-text) and speaker (text-to-speech) controls */
  voiceEnabled?: boolean;
  secureTextEntry?: boolean;
}) {
  const isEditable = useFieldEditable(editable);

  return (
    <View style={styles.group}>
      <View style={styles.labelRow}>
        <AppText variant="caption" style={styles.fieldLabel}>
          {label}
        </AppText>
        {voiceEnabled ? (
          <VoiceFieldActions value={value} onChangeText={onChangeText} editable={isEditable} />
        ) : null}
      </View>
      <TextInput
        style={[styles.input, multiline && styles.multiline, !isEditable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedText}
        keyboardType={keyboardType}
        multiline={multiline}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        blurOnSubmit={blurOnSubmit}
        editable={isEditable}
        secureTextEntry={secureTextEntry}
        autoCapitalize={secureTextEntry ? "none" : undefined}
        autoCorrect={secureTextEntry ? false : undefined}
      />
    </View>
  );
}

export function ToggleRow({
  label,
  value,
  onValueChange,
  note,
  disabled
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  note?: string;
  disabled?: boolean;
}) {
  const isEditable = useFieldEditable(disabled === undefined ? undefined : !disabled);

  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <AppText>{label}</AppText>
        {note ? <AppText variant="small" style={{ color: colors.mutedText }}>{note}</AppText> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor={colors.card}
        disabled={!isEditable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.xs
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  input: {
    minHeight: 50,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16
  },
  multiline: {
    minHeight: 104,
    paddingTop: spacing.md,
    textAlignVertical: "top"
  },
  inputDisabled: {
    opacity: 0.72,
    backgroundColor: colors.background
  },
  toggleRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xs
  },
  fieldLabel: {
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    flexShrink: 1
  }
});
