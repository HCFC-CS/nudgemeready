import { getEncryptedItem, setEncryptedItem } from "./encryptedStorage";

const ALEXA_LINK_KEY = "nudge-me:alexa-link-v1";

export type AlexaLinkState = {
  enabled: boolean;
  deviceToken: string | null;
  linkCode: string | null;
  linkCodeExpiresAt: string | null;
  linkedToAlexa: boolean;
  lastSyncAt: string | null;
  lastError: string | null;
};

export const defaultAlexaLinkState: AlexaLinkState = {
  enabled: false,
  deviceToken: null,
  linkCode: null,
  linkCodeExpiresAt: null,
  linkedToAlexa: false,
  lastSyncAt: null,
  lastError: null
};

function normalize(parsed: Partial<AlexaLinkState> | null | undefined): AlexaLinkState {
  return {
    enabled: Boolean(parsed?.enabled),
    deviceToken: typeof parsed?.deviceToken === "string" ? parsed.deviceToken : null,
    linkCode: typeof parsed?.linkCode === "string" ? parsed.linkCode : null,
    linkCodeExpiresAt: typeof parsed?.linkCodeExpiresAt === "string" ? parsed.linkCodeExpiresAt : null,
    linkedToAlexa: Boolean(parsed?.linkedToAlexa),
    lastSyncAt: typeof parsed?.lastSyncAt === "string" ? parsed.lastSyncAt : null,
    lastError: typeof parsed?.lastError === "string" ? parsed.lastError : null
  };
}

export async function loadAlexaLinkState(): Promise<AlexaLinkState> {
  const raw = await getEncryptedItem(ALEXA_LINK_KEY);
  if (!raw) {
    return defaultAlexaLinkState;
  }
  try {
    return normalize(JSON.parse(raw) as Partial<AlexaLinkState>);
  } catch {
    return defaultAlexaLinkState;
  }
}

export async function saveAlexaLinkState(state: AlexaLinkState) {
  await setEncryptedItem(ALEXA_LINK_KEY, JSON.stringify(normalize(state)));
}
