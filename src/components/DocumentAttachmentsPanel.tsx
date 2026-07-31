import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from "react-native";

import type { IoniconName } from "./iconTypes";
import { SoftCard } from "./NudgeComponents";
import { AppText } from "./Text";
import {
  DOCUMENT_CATEGORIES,
  documentCategoryLabel,
  openAttachment,
  pickDocumentFile,
  pickDocumentPhoto,
  removeStoredAttachment,
  takeDocumentPhoto
} from "../services/documentAttachments";
import { colors, radii, spacing } from "../theme/theme";
import type { DocumentCategory, NudgeAttachment } from "../types/nudge";

type Props = {
  itemId: string;
  attachments: NudgeAttachment[];
  onChange: (next: NudgeAttachment[]) => void;
  editable?: boolean;
};

export function DocumentAttachmentsPanel({ itemId, attachments, onChange, editable = true }: Props) {
  const [category, setCategory] = useState<DocumentCategory>("other");
  const [busy, setBusy] = useState(false);

  async function addFromPicker(kind: "file" | "photo" | "camera") {
    if (!editable || busy) {
      return;
    }
    setBusy(true);
    try {
      if (kind === "file") {
        const attachment = await pickDocumentFile(itemId, category);
        if (attachment) {
          onChange([...attachments, attachment]);
        }
        return;
      }

      const result =
        kind === "photo" ? await pickDocumentPhoto(itemId, category) : await takeDocumentPhoto(itemId, category);
      if (result.error) {
        Alert.alert("Permission needed", result.error);
        return;
      }
      if (result.attachment) {
        onChange([...attachments, result.attachment]);
      }
    } catch {
      Alert.alert("Upload failed", "Something went wrong while saving that document. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function confirmRemove(attachment: NudgeAttachment) {
    if (!editable) {
      return;
    }
    Alert.alert("Remove document?", attachment.name, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          void (async () => {
            await removeStoredAttachment(attachment);
            onChange(attachments.filter((entry) => entry.id !== attachment.id));
          })();
        }
      }
    ]);
  }

  return (
    <SoftCard>
      <AppText variant="heading">Important documents</AppText>
      <AppText variant="small" style={styles.intro}>
        Keep identity, driving, mobility, access cards, tax certificates, and anything else this nudge needs in one place.
      </AppText>

      {editable ? (
        <>
          <AppText variant="caption" style={styles.sectionLabel}>
            Document type
          </AppText>
          <View style={styles.chips}>
            {DOCUMENT_CATEGORIES.map((entry) => {
              const selected = category === entry.id;
              return (
                <Pressable
                  key={entry.id}
                  accessibilityRole="button"
                  accessibilityLabel={entry.label}
                  onPress={() => setCategory(entry.id)}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipSelected,
                    pressed && styles.pressed
                  ]}
                >
                  <AppText variant="small" style={selected ? styles.chipLabelSelected : undefined}>
                    {entry.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <AppText variant="small" style={styles.hint}>
            {DOCUMENT_CATEGORIES.find((entry) => entry.id === category)?.hint}
          </AppText>

          <View style={styles.actions}>
            <ActionButton
              icon="document-attach-outline"
              label="Upload file"
              disabled={busy}
              onPress={() => void addFromPicker("file")}
            />
            <ActionButton
              icon="images-outline"
              label="Photo"
              disabled={busy}
              onPress={() => void addFromPicker("photo")}
            />
            <ActionButton
              icon="camera-outline"
              label="Scan"
              disabled={busy}
              onPress={() => void addFromPicker("camera")}
            />
          </View>
          {busy ? <ActivityIndicator color={colors.primaryDark} style={styles.spinner} /> : null}
        </>
      ) : null}

      {attachments.length === 0 ? (
        <AppText variant="small" style={styles.empty}>
          No documents attached yet.
        </AppText>
      ) : (
        <View style={styles.list}>
          {attachments.map((attachment) => (
            <View key={attachment.id} style={styles.row}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${attachment.name}`}
                onPress={() => void openAttachment(attachment)}
                style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
              >
                <Ionicons name="document-text-outline" size={20} color={colors.primaryDark} />
                <View style={styles.rowText}>
                  <AppText numberOfLines={1}>{attachment.name}</AppText>
                  <AppText variant="small" style={styles.meta}>
                    {documentCategoryLabel(attachment.category)}
                  </AppText>
                </View>
              </Pressable>
              {editable ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${attachment.name}`}
                  onPress={() => confirmRemove(attachment)}
                  hitSlop={8}
                  style={({ pressed }) => [styles.removeBtn, pressed && styles.pressed]}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.mutedText} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </SoftCard>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  disabled
}: {
  icon: IoniconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.actionBtn, (pressed || disabled) && styles.pressed]}
    >
      <Ionicons name={icon} size={18} color={colors.primaryDark} />
      <AppText variant="small">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  intro: {
    color: colors.mutedText,
    marginTop: spacing.xs,
    marginBottom: spacing.sm
  },
  sectionLabel: {
    color: colors.mutedText,
    marginBottom: spacing.xs
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  chipLabelSelected: {
    color: colors.primaryDark
  },
  hint: {
    color: colors.mutedText,
    marginTop: spacing.xs,
    marginBottom: spacing.sm
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: spacing.sm
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  spinner: {
    marginBottom: spacing.sm
  },
  empty: {
    color: colors.mutedText
  },
  list: {
    gap: 8,
    marginTop: spacing.xs
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  rowText: {
    flex: 1,
    gap: 2
  },
  meta: {
    color: colors.mutedText
  },
  removeBtn: {
    padding: 4
  },
  pressed: {
    opacity: 0.75
  }
});
