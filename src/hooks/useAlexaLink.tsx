import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { AppState, type AppStateStatus } from "react-native";

import {
  ackAlexaPendingAdds,
  createNudgeFromAlexaPending,
  disableAlexaLink,
  enableAlexaLink,
  isAlexaBridgeConfigured,
  pullAlexaPendingAdds,
  refreshAlexaLinkCode,
  syncAlexaNudges
} from "../services/alexaBridge";
import {
  defaultAlexaLinkState,
  loadAlexaLinkState,
  type AlexaLinkState
} from "../services/alexaLinkStorage";
import { useNudgeActor } from "./useNudgeActor";
import { useNudgeItems } from "./useNudgeItems";

type AlexaLinkContextValue = {
  linkState: AlexaLinkState;
  busy: boolean;
  bridgeConfigured: boolean;
  turnOn: () => Promise<AlexaLinkState>;
  turnOff: () => Promise<AlexaLinkState>;
  refreshCode: () => Promise<AlexaLinkState>;
  runSync: () => Promise<void>;
  refreshLocal: () => Promise<AlexaLinkState>;
};

const AlexaLinkContext = createContext<AlexaLinkContextValue | undefined>(undefined);

export function AlexaLinkProvider({ children }: PropsWithChildren) {
  const { items, isReady, saveItem } = useNudgeItems();
  const actor = useNudgeActor();
  const [linkState, setLinkState] = useState<AlexaLinkState>(defaultAlexaLinkState);
  const [busy, setBusy] = useState(false);

  const refreshLocal = useCallback(async () => {
    const loaded = await loadAlexaLinkState();
    setLinkState(loaded);
    return loaded;
  }, []);

  const runSync = useCallback(async () => {
    if (!isReady) {
      return;
    }
    const current = await loadAlexaLinkState();
    if (!current.enabled || !current.deviceToken) {
      setLinkState(current);
      return;
    }
    try {
      const { state, pendingAdds } = await pullAlexaPendingAdds(current);
      const existingIds = new Set(items.map((item) => item.id));
      const existingTitles = new Set(
        items.map((item) => item.title.trim().toLowerCase()).filter(Boolean)
      );
      const importedIds: string[] = [];
      for (const pending of pendingAdds) {
        const key = pending.title.trim().toLowerCase();
        if (existingIds.has(pending.id) || (key && existingTitles.has(key))) {
          importedIds.push(pending.id);
          continue;
        }
        const draft = createNudgeFromAlexaPending(pending, actor);
        saveItem({ ...draft, id: pending.id });
        existingIds.add(pending.id);
        if (key) {
          existingTitles.add(key);
        }
        importedIds.push(pending.id);
      }
      if (importedIds.length) {
        await ackAlexaPendingAdds(importedIds, state);
      }
      const synced = await syncAlexaNudges(items, state);
      setLinkState(synced);
    } catch (error) {
      setLinkState({
        ...current,
        lastError: error instanceof Error ? error.message : "Alexa sync failed."
      });
    }
  }, [actor, isReady, items, saveItem]);

  useEffect(() => {
    void refreshLocal();
  }, [refreshLocal]);

  useEffect(() => {
    if (!isReady || !linkState.enabled) {
      return;
    }
    void runSync();
  }, [isReady, linkState.enabled, items.length, runSync]);

  useEffect(() => {
    function handleAppState(next: AppStateStatus) {
      if (next === "active") {
        void runSync();
      }
    }
    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, [runSync]);

  const value = useMemo<AlexaLinkContextValue>(
    () => ({
      linkState,
      busy,
      bridgeConfigured: isAlexaBridgeConfigured(),
      refreshLocal,
      runSync,
      async turnOn() {
        setBusy(true);
        try {
          const next = await enableAlexaLink();
          setLinkState(next);
          if (next.enabled && next.deviceToken) {
            const synced = await syncAlexaNudges(items, next);
            setLinkState(synced);
            return synced;
          }
          return next;
        } finally {
          setBusy(false);
        }
      },
      async turnOff() {
        setBusy(true);
        try {
          const next = await disableAlexaLink(linkState);
          setLinkState(next);
          return next;
        } finally {
          setBusy(false);
        }
      },
      async refreshCode() {
        setBusy(true);
        try {
          const next = await refreshAlexaLinkCode(linkState);
          setLinkState(next);
          return next;
        } finally {
          setBusy(false);
        }
      }
    }),
    [busy, items, linkState, refreshLocal, runSync]
  );

  return <AlexaLinkContext.Provider value={value}>{children}</AlexaLinkContext.Provider>;
}

export function useAlexaLink() {
  const value = useContext(AlexaLinkContext);
  if (!value) {
    throw new Error("useAlexaLink must be used within AlexaLinkProvider");
  }
  return value;
}
