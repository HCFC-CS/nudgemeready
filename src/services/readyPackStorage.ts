import { getEncryptedItem, setEncryptedItem } from "./encryptedStorage";
import type { ReadyPackInstallState } from "../types/readyPacks";

const READY_PACK_STATE_KEY = "nudge-me:ready-packs-v1";

export const emptyReadyPackInstallState = (): ReadyPackInstallState => ({
  installed: {}
});

export async function loadReadyPackInstallState(): Promise<ReadyPackInstallState> {
  const raw = await getEncryptedItem(READY_PACK_STATE_KEY);
  if (!raw) {
    return emptyReadyPackInstallState();
  }
  try {
    const parsed = JSON.parse(raw) as ReadyPackInstallState;
    return {
      installed: parsed.installed ?? {}
    };
  } catch {
    return emptyReadyPackInstallState();
  }
}

export async function saveReadyPackInstallState(state: ReadyPackInstallState): Promise<void> {
  await setEncryptedItem(READY_PACK_STATE_KEY, JSON.stringify(state));
}
