import { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { PageHeader, PrimaryButton, SecondaryButton, SoftCard } from "../components/NudgeComponents";
import { NudgeListRow, nudgeRowMeta } from "../components/NudgeListRow";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { pickDocumentFile, titleFromAttachmentName } from "../services/documentAttachments";
import { compareNudgesByDate, createItem } from "../services/nudgeItems";
import { spacing } from "../theme/theme";

/** Thin Documents hub — attachments live on nudges; no separate document engine. */
export function DocumentsHubScreen() {
  const navigation = useNavigation<any>();
  const { items, saveItem, setItemStatus } = useNudgeItems();
  const [busy, setBusy] = useState(false);

  const withDocs = useMemo(
    () =>
      items
        .filter((item) => (item.attachments?.length ?? 0) > 0)
        .sort(compareNudgesByDate),
    [items]
  );

  async function uploadDocument() {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      const draft = createItem({ title: "Document", type: "note" });
      const attachment = await pickDocumentFile(draft.id, "other");
      if (!attachment) {
        return;
      }
      const saved = {
        ...draft,
        title: titleFromAttachmentName(attachment.name),
        attachments: [attachment]
      };
      saveItem(saved);
      navigation.navigate("ItemDetails", { draft: saved });
    } catch {
      Alert.alert("Upload failed", "Something went wrong while saving that document. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title="Documents"
        showBack
        helpText="Files stay on the nudge they belong to. This list just helps you find them."
      />
      <SoftCard style={styles.card}>
        <AppText variant="muted">Upload a letter, ticket, or photo. It is saved on a nudge on this phone.</AppText>
        <PrimaryButton
          accessibilityLabel="Upload a document"
          disabled={busy}
          onPress={() => void uploadDocument()}
        >
          Upload a document
        </PrimaryButton>
      </SoftCard>
      {withDocs.length === 0 ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Nothing attached yet</AppText>
          <AppText variant="muted">
            Add a photo or file on any nudge when it helps. They stay with that item.
          </AppText>
          <SecondaryButton size="compact" onPress={() => navigation.navigate("Tabs", { screen: "Capture" })}>
            Add a nudge
          </SecondaryButton>
        </SoftCard>
      ) : (
        <View style={styles.list}>
          {withDocs.map((item) => (
            <NudgeListRow
              key={item.id}
              title={item.title}
              type={item.type}
              meta={[
                `${item.attachments.length} file${item.attachments.length === 1 ? "" : "s"}`,
                ...nudgeRowMeta(item)
              ]}
              isDone={item.status === "done"}
              onPress={() => navigation.navigate("ItemDetails", { draft: item })}
              onToggleDone={() => setItemStatus(item.id, item.status === "done" ? "open" : "done")}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm
  },
  list: {
    gap: spacing.sm
  }
});
