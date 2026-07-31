import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";

import type { DocumentCategory, NudgeAttachment } from "../types/nudge";

export const DOCUMENT_CATEGORIES: { id: DocumentCategory; label: string; hint: string }[] = [
  { id: "identity", label: "Identity", hint: "Passport, ID, birth certificate" },
  { id: "driving", label: "Driving", hint: "Licence, MOT, insurance" },
  { id: "mobility", label: "Mobility", hint: "Blue Badge, travel passes" },
  { id: "access", label: "Access", hint: "Keys, fobs, access cards" },
  { id: "tax", label: "Tax", hint: "Tax certificates, NI letter" },
  { id: "insurance", label: "Insurance", hint: "Home, car, life cover" },
  { id: "medical", label: "Medical", hint: "Letters, prescriptions, plans" },
  { id: "other", label: "Other", hint: "Anything else this nudge needs" }
];

export function documentCategoryLabel(category?: DocumentCategory) {
  return DOCUMENT_CATEGORIES.find((entry) => entry.id === category)?.label ?? "Document";
}

function createAttachmentId() {
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function attachmentsRoot() {
  const root = FileSystem.documentDirectory;
  if (!root) {
    throw new Error("Document storage is not available on this device.");
  }
  return `${root}nudge-attachments/`;
}

function itemFolder(itemId: string) {
  return `${attachmentsRoot()}${sanitizePathPart(itemId)}/`;
}

function sanitizePathPart(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function sanitizeFileName(name: string) {
  const trimmed = name.trim() || "document";
  return sanitizePathPart(trimmed).slice(0, 80);
}

async function ensureDir(path: string) {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  }
}

async function persistPickedFile(itemId: string, sourceUri: string, fileName: string, mimeType?: string, category: DocumentCategory = "other") {
  const folder = itemFolder(itemId);
  await ensureDir(folder);
  const id = createAttachmentId();
  const safeName = sanitizeFileName(fileName);
  const destination = `${folder}${id}-${safeName}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destination });
  const attachment: NudgeAttachment = {
    id,
    name: fileName.trim() || safeName,
    url: destination,
    mimeType,
    category,
    addedAt: new Date().toISOString()
  };
  return attachment;
}

export async function pickDocumentFile(itemId: string, category: DocumentCategory): Promise<NudgeAttachment | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/pdf", "image/*", "text/*", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    copyToCacheDirectory: true,
    multiple: false
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  return persistPickedFile(itemId, asset.uri, asset.name, asset.mimeType, category);
}

export async function pickDocumentPhoto(itemId: string, category: DocumentCategory): Promise<{ attachment: NudgeAttachment | null; error: string | null }> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { attachment: null, error: "Photo library access is needed to attach a photo of a document." };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    quality: 0.85
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return { attachment: null, error: null };
  }

  const asset = result.assets[0];
  const name = asset.fileName || `photo-${Date.now()}.jpg`;
  const attachment = await persistPickedFile(itemId, asset.uri, name, asset.mimeType ?? "image/jpeg", category);
  return { attachment, error: null };
}

export async function takeDocumentPhoto(itemId: string, category: DocumentCategory): Promise<{ attachment: NudgeAttachment | null; error: string | null }> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return { attachment: null, error: "Camera access is needed to photograph a document." };
  }

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.85
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return { attachment: null, error: null };
  }

  const asset = result.assets[0];
  const name = asset.fileName || `scan-${Date.now()}.jpg`;
  const attachment = await persistPickedFile(itemId, asset.uri, name, asset.mimeType ?? "image/jpeg", category);
  return { attachment, error: null };
}

export async function removeStoredAttachment(attachment: NudgeAttachment) {
  try {
    const info = await FileSystem.getInfoAsync(attachment.url);
    if (info.exists) {
      await FileSystem.deleteAsync(attachment.url, { idempotent: true });
    }
  } catch {
    // Ignore missing files; metadata removal still proceeds.
  }
}

export async function cleanupAttachmentsForItem(itemId: string, attachments: NudgeAttachment[] = []) {
  await Promise.all(attachments.map((attachment) => removeStoredAttachment(attachment)));
  try {
    const folder = itemFolder(itemId);
    const info = await FileSystem.getInfoAsync(folder);
    if (info.exists) {
      await FileSystem.deleteAsync(folder, { idempotent: true });
    }
  } catch {
    // Best-effort cleanup.
  }
}

export async function openAttachment(attachment: NudgeAttachment) {
  try {
    const canOpen = await Linking.canOpenURL(attachment.url);
    if (!canOpen) {
      Alert.alert("Cannot open", `Unable to open ${attachment.name} on this device.`);
      return;
    }
    await Linking.openURL(attachment.url);
  } catch {
    Alert.alert("Cannot open", `Unable to open ${attachment.name}. Try saving it again.`);
  }
}
