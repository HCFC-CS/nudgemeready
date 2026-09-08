import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from "react-native";

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
  const [busy, setBusy] = useState(false);

  async function addFromPicker(kind: "file" | "photo" | "camera", category: DocumentCategory) {
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

  function askHowToAdd(category: DocumentCategory) {
    Alert.alert("Add document", documentCategoryLabel(category), [
      { text: "Cancel", style: "cancel" },
      { text: "File", onPress: () => void addFromPicker("file", category) },
      { text: "Photo", onPress: () => void addFromPicker("photo", category) },
      { text: "Camera", onPress: () => void addFromPicker("camera", category) }
    ]);
  }

  function startUpload() {
    if (!editable || busy) {
      return;
    }
    Alert.alert(
      "Document type",
      "What kind of document is this?",
      [
        { text: "Cancel", style: "cancel" },
        ...DOCUMENT_CATEGORIES.map((entry) => ({
          text: entry.label,
          onPress: () => askHowToAdd(entry.id)
        }))
      ]
    );
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

      {editable ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Upload document"
          disabled={busy}
          onPress={startUpload}
          style={({ pressed }) => [styles.uploadBtn, (pressed || busy) && styles.pressed]}
        >
          <Ionicons name="cloud-upload-outline" size={20} color={colors.primaryDark} />
          <AppText>Upload document</AppText>
        </Pressable>
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
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: spacing.sm,
    marginBottom: spacing.sm
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
