import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, View } from "react-native";

import { PrimaryButton, SecondaryButton, SoftCard } from "./NudgeComponents";
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
  const [busy, setBusy] = useState(false);
  const [category, setCategory] = useState<DocumentCategory>("other");

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
      <AppText variant="heading">Documents</AppText>
      <AppText variant="muted">Keep letters, tickets, or photos with this nudge.</AppText>

      {editable ? (
        <View style={styles.uploadBlock}>
          <AppText variant="small">What kind of document?</AppText>
          <View style={styles.chips}>
            {DOCUMENT_CATEGORIES.map((entry) => {
              const selected = category === entry.id;
              return (
                <Pressable
                  key={entry.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setCategory(entry.id)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <AppText style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{entry.label}</AppText>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.actions}>
            <PrimaryButton
              accessibilityLabel="Upload document"
              disabled={busy}
              onPress={() => void addFromPicker("file")}
            >
              Upload document
            </PrimaryButton>
            <SecondaryButton
              accessibilityLabel="Choose photo"
              disabled={busy}
              onPress={() => void addFromPicker("photo")}
            >
              Choose photo
            </SecondaryButton>
            {Platform.OS !== "web" ? (
              <SecondaryButton
                accessibilityLabel="Take photo"
                disabled={busy}
                onPress={() => void addFromPicker("camera")}
              >
                Take photo
              </SecondaryButton>
            ) : null}
          </View>
        </View>
      ) : null}

      {busy ? <ActivityIndicator color={colors.primaryDark} style={styles.spinner} /> : null}

      {attachments.length === 0 ? (
        <AppText variant="small" style={styles.empty}>
          None yet.
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

const styles = StyleSheet.create({
  uploadBlock: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.ivoryElevated,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  chipSelected: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.ivoryElevated
  },
  chipLabel: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 13
  },
  chipLabelSelected: {
    color: colors.primaryDark
  },
  actions: {
    gap: spacing.sm
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
