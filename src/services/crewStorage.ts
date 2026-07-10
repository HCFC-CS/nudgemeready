import AsyncStorage from "@react-native-async-storage/async-storage";

import type { CrewStoreState } from "../data/mockCrewData";
import { defaultCrewStore } from "../data/mockCrewData";

const CREW_STORE_KEY = "nudge-me:crew-store";

export async function loadCrewStore(): Promise<CrewStoreState> {
  const raw = await AsyncStorage.getItem(CREW_STORE_KEY);
  if (!raw) {
    return defaultCrewStore;
  }
  try {
    const parsed = JSON.parse(raw) as CrewStoreState;
    return {
      ...defaultCrewStore,
      ...parsed,
      profiles: parsed.profiles?.length ? parsed.profiles : defaultCrewStore.profiles,
      crews: parsed.crews?.length ? parsed.crews : defaultCrewStore.crews,
      memberships: parsed.memberships?.length ? parsed.memberships : defaultCrewStore.memberships
    };
  } catch {
    return defaultCrewStore;
  }
}

export async function saveCrewStore(state: CrewStoreState) {
  await AsyncStorage.setItem(CREW_STORE_KEY, JSON.stringify(state));
}
