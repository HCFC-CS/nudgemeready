import { useNavigation } from "@react-navigation/native";
import type { IoniconName } from "../components/iconTypes";

import { PageHeader, VoiceCaptureButton } from "../components/NudgeComponents";
import { QuickLinkGrid } from "../components/QuickLinkGrid";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useNudgeActor } from "../hooks/useNudgeActor";
import { classifyCaptureText } from "../services/classifyCaptureText";
import { createItem } from "../services/nudgeItems";

const browseLinks: Array<{ label: string; route: string; icon: IoniconName }> = [
  { label: "Lists", route: "Lists", icon: "list-outline" },
  { label: "Chores", route: "Chores", icon: "checkmark-circle-outline" },
  { label: "Reminders", route: "Reminders", icon: "notifications-outline" },
  { label: "Routines", route: "Routines", icon: "repeat-outline" },
  { label: "Events", route: "Events", icon: "calendar-outline" },
  { label: "Occasions", route: "Occasions", icon: "gift-outline" },
  { label: "Projects", route: "Projects", icon: "folder-outline" },
  { label: "Completed", route: "Done", icon: "checkmark-done-outline" }
];

export function CaptureScreen() {
  const navigation = useNavigation<any>();
  const actor = useNudgeActor();

  function handleVoiceCapture(capturedText: string, voiceNoteUrl: string) {
    const classification = classifyCaptureText(capturedText);
    const draft = createItem({
      title: classification.title,
      type: classification.type,
      createdBy: actor,
      dueDate: classification.suggestedFields.dueDate,
      startDate: classification.suggestedFields.startDate,
      reminderDate: classification.suggestedFields.reminderDate,
      repeatRule: classification.suggestedFields.repeatRule,
      contactName: classification.suggestedFields.contactName,
      notes: capturedText,
      voiceNoteUrl: voiceNoteUrl || undefined,
      listItems: classification.suggestedFields.listItems?.map((title, index) => ({
        id: `list-${index}`,
        title,
        status: "open"
      }))
    });
    navigation.navigate("ItemDetails", { draft });
  }

  return (
    <Screen>
      <PageHeader title="+nudge" subtitle="Say it, or pick a type below." />
      <VoiceCaptureButton idleLabel="Say it" idleTone="primary" onCaptured={handleVoiceCapture} />
      <AppText variant="section">Browse</AppText>
      <QuickLinkGrid links={browseLinks} onPress={(route) => navigation.navigate(route)} />
    </Screen>
  );
}
