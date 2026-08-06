import { getEncryptedItem, setEncryptedItem } from "./encryptedStorage";

const KEY = "nudge-me:security-lock-prompt-v1";

export type SecurityLockPromptState = {
  /** User dismissed the Home “turn on app lock” tip. */
  dismissed: boolean;
};

const defaultState = (): SecurityLockPromptState => ({ dismissed: false });

export async function loadSecurityLockPromptState(): Promise<SecurityLockPromptState> {
  const raw = await getEncryptedItem(KEY);
  if (!raw) {
    return defaultState();
  }
  try {
    const parsed = JSON.parse(raw) as Partial<SecurityLockPromptState>;
    return { dismissed: Boolean(parsed.dismissed) };
  } catch {
    return defaultState();
  }
}

export async function dismissSecurityLockPrompt(): Promise<void> {
  await setEncryptedItem(KEY, JSON.stringify({ dismissed: true } satisfies SecurityLockPromptState));
}

/** Call when the user turns app lock on so the tip can reappear if they later turn it off. */
export async function resetSecurityLockPrompt(): Promise<void> {
  await setEncryptedItem(KEY, JSON.stringify({ dismissed: false } satisfies SecurityLockPromptState));
}
