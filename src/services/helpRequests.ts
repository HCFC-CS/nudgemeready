import { Linking, Share } from "react-native";

import { getEncryptedJson, setEncryptedJson } from "./encryptedStorage";

const HELP_QUEUE_KEY = "nudge-me:help-request-queue";

export type HelpRequestDraft = {
  id: string;
  personId: string;
  personName: string;
  personContact?: string;
  helpType: string;
  createdAt: string;
  status: "pending" | "shared";
};

async function loadQueue() {
  const items = await getEncryptedJson<HelpRequestDraft[]>(HELP_QUEUE_KEY);
  return items ?? [];
}

async function saveQueue(items: HelpRequestDraft[]) {
  await setEncryptedJson(HELP_QUEUE_KEY, items);
}

function buildHelpMessage(personName: string, helpType: string) {
  return `Hi ${personName}, could you ${helpType.toLowerCase()}? I’m asking gently through Nudge me Ready.`;
}

export async function sendHelpRequest(input: {
  personId: string;
  personName: string;
  personContact?: string;
  helpType: string;
}): Promise<{ ok: boolean; queued: boolean; message: string }> {
  const draft: HelpRequestDraft = {
    id: `help-${Date.now()}`,
    personId: input.personId,
    personName: input.personName,
    personContact: input.personContact,
    helpType: input.helpType,
    createdAt: new Date().toISOString(),
    status: "pending"
  };

  const body = buildHelpMessage(input.personName, input.helpType);
  const contact = input.personContact?.trim();

  try {
    if (contact && /^[\d+\s()-]+$/.test(contact.replace(/\s/g, ""))) {
      const smsUrl = `sms:${contact.replace(/\s/g, "")}?body=${encodeURIComponent(body)}`;
      const canSms = await Linking.canOpenURL(smsUrl);
      if (canSms) {
        await Linking.openURL(smsUrl);
        draft.status = "shared";
        const queue = await loadQueue();
        await saveQueue([draft, ...queue].slice(0, 20));
        return { ok: true, queued: false, message: "Message opened so you can send it." };
      }
    }

    if (contact?.includes("@")) {
      const mailUrl = `mailto:${contact}?subject=${encodeURIComponent("A gentle ask from Nudge me Ready")}&body=${encodeURIComponent(body)}`;
      const canMail = await Linking.canOpenURL(mailUrl);
      if (canMail) {
        await Linking.openURL(mailUrl);
        draft.status = "shared";
        const queue = await loadQueue();
        await saveQueue([draft, ...queue].slice(0, 20));
        return { ok: true, queued: false, message: "Email draft opened so you can send it." };
      }
    }

    const result = await Share.share({ message: body });
    if (result.action === Share.sharedAction) {
      draft.status = "shared";
      const queue = await loadQueue();
      await saveQueue([draft, ...queue].slice(0, 20));
      return { ok: true, queued: false, message: "Shared with your village." };
    }

    const queue = await loadQueue();
    await saveQueue([draft, ...queue].slice(0, 20));
    return {
      ok: true,
      queued: true,
      message: "Saved as a draft on this phone. You can share it when you’re ready."
    };
  } catch {
    const queue = await loadQueue();
    await saveQueue([draft, ...queue].slice(0, 20));
    return {
      ok: false,
      queued: true,
      message: "Couldn’t open Messages or Share just now. Your ask was saved on this phone."
    };
  }
}

export async function listQueuedHelpRequests() {
  return loadQueue();
}
