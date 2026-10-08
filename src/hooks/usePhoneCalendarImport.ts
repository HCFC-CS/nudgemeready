import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { loadAppPreferences } from "../services/appPreferencesStorage";
import {
  fetchPhoneCalendarNudgeDrafts,
  mergePhoneCalendarDrafts
} from "../services/calendarSync";
import { useNudgeActor } from "./useNudgeActor";
import { useNudgeItems } from "./useNudgeItems";

export type PhoneCalendarImportStatus = {
  running: boolean;
  lastMessage: string;
  lastAdded: number;
  lastUpdated: number;
};

/**
 * Pulls phone Calendar events into nudges when the preference is on,
 * and whenever the app returns to the foreground.
 */
export function usePhoneCalendarImport() {
  const { items, isReady, replaceItems } = useNudgeItems();
  const actor = useNudgeActor();
  const itemsRef = useRef(items);
  const runningRef = useRef(false);
  const [status, setStatus] = useState<PhoneCalendarImportStatus>({
    running: false,
    lastMessage: "",
    lastAdded: 0,
    lastUpdated: 0
  });

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const runImport = useCallback(
    async (force = false) => {
      if (runningRef.current || !isReady) {
        return;
      }

      const prefs = await loadAppPreferences();
      if (!force && !prefs.importFromPhoneCalendar) {
        return;
      }

      runningRef.current = true;
      setStatus((current) => ({ ...current, running: true }));

      try {
        const fetched = await fetchPhoneCalendarNudgeDrafts({ actor });
        if (!fetched.ok) {
          setStatus({
            running: false,
            lastMessage: fetched.message ?? "Could not import calendar events.",
            lastAdded: 0,
            lastUpdated: 0
          });
          return;
        }

        const merged = mergePhoneCalendarDrafts(itemsRef.current, fetched.drafts);
        if (merged.added > 0 || merged.updated > 0) {
          replaceItems(merged.items);
          itemsRef.current = merged.items;
        }

        setStatus({
          running: false,
          lastMessage:
            merged.added || merged.updated
              ? `Imported ${merged.added} new, updated ${merged.updated} from phone calendar.`
              : fetched.message ?? "Phone calendar is up to date.",
          lastAdded: merged.added,
          lastUpdated: merged.updated
        });
      } catch {
        setStatus({
          running: false,
          lastMessage: "Could not import calendar events.",
          lastAdded: 0,
          lastUpdated: 0
        });
      } finally {
        runningRef.current = false;
      }
    },
    [actor, isReady, replaceItems]
  );

  useEffect(() => {
    if (!isReady) {
      return;
    }
    void runImport(false);
  }, [isReady, runImport]);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === "active") {
        void runImport(false);
      }
    };
    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
  }, [runImport]);

  return {
    ...status,
    importNow: () => runImport(true)
  };
}
