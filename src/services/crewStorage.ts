import type { CrewStoreState } from "../data/mockCrewData";
import { createEmptyCrewStore } from "../data/mockCrewData";
import { getEncryptedItem, removeEncryptedItem, setEncryptedItem } from "./encryptedStorage";

const CREW_STORE_KEY = "nudge-me:crew-store-v4";
const LEGACY_CREW_STORE_KEY = "nudge-me:crew-store-v3";

function isCrewStore(value: unknown): value is CrewStoreState {
  return Boolean(value && typeof value === "object" && Array.isArray((value as CrewStoreState).profiles));
}

/** Load crew data. First launch starts with only the self profile — no demo family/patients. */
export async function loadCrewStore(): Promise<CrewStoreState> {
  const raw = await getEncryptedItem(CREW_STORE_KEY);
  if (raw == null) {
    // One-time migrate away from demo-heavy v3 stores by starting clean if missing v4.
    await removeEncryptedItem(LEGACY_CREW_STORE_KEY).catch(() => undefined);
    return createEmptyCrewStore("Me");
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isCrewStore(parsed) || !parsed.profiles.length) {
      return createEmptyCrewStore("Me");
    }
    return {
      ...createEmptyCrewStore("Me"),
      ...parsed,
      profiles: parsed.profiles,
      crews: parsed.crews ?? [],
      memberships: parsed.memberships ?? [],
      invitations: parsed.invitations ?? [],
      requests: parsed.requests ?? [],
      organisations: parsed.organisations ?? [],
      organisationUsers: parsed.organisationUsers ?? [],
      organisationProfiles: parsed.organisationProfiles ?? []
    };
  } catch {
    return createEmptyCrewStore("Me");
  }
}

export async function saveCrewStore(state: CrewStoreState) {
  await setEncryptedItem(CREW_STORE_KEY, JSON.stringify(state));
}
