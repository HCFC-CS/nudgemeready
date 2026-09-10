import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  clearHiddenShopIdeas,
  compareThings,
  emptySavedThings,
  hideShopIdeas,
  isShopHidden,
  isThingSaved,
  loadSavedThings,
  persistSavedThings,
  removeThing,
  saveThing,
  toggleCompare
} from "../services/savedThings";
import type { SavedThing, SavedThingsState } from "../types/savedThings";

type SavedThingsContextValue = {
  state: SavedThingsState;
  isReady: boolean;
  items: SavedThing[];
  compareItems: SavedThing[];
  save: (input: { title: string; url: string; sourcePackId?: string }) => void;
  remove: (id: string) => void;
  toggleCompareItem: (id: string) => boolean;
  alreadyHave: (key: string) => void;
  isHidden: (key?: string) => boolean;
  isSaved: (url: string) => boolean;
  showShopIdeasAgain: () => void;
};

const SavedThingsContext = createContext<SavedThingsContextValue | undefined>(undefined);

export function SavedThingsProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<SavedThingsState>(emptySavedThings);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadSavedThings()
      .then(setState)
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) {
      void persistSavedThings(state);
    }
  }, [isReady, state]);

  const save = useCallback((input: { title: string; url: string; sourcePackId?: string }) => {
    setState((current) => saveThing(current, input));
  }, []);

  const remove = useCallback((id: string) => {
    setState((current) => removeThing(current, id));
  }, []);

  const toggleCompareItem = useCallback((id: string) => {
    let accepted = true;
    setState((current) => {
      if (!current.compareIds.includes(id) && current.compareIds.length >= 3) {
        accepted = false;
        return current;
      }
      return toggleCompare(current, id);
    });
    return accepted;
  }, []);

  const alreadyHave = useCallback((key: string) => {
    setState((current) => hideShopIdeas(current, key));
  }, []);

  const showShopIdeasAgain = useCallback(() => {
    setState((current) => clearHiddenShopIdeas(current));
  }, []);

  const value = useMemo<SavedThingsContextValue>(
    () => ({
      state,
      isReady,
      items: state.items,
      compareItems: compareThings(state),
      save,
      remove,
      toggleCompareItem,
      alreadyHave,
      isHidden: (key?: string) => isShopHidden(state, key),
      isSaved: (url: string) => isThingSaved(state, url),
      showShopIdeasAgain
    }),
    [alreadyHave, isReady, remove, save, showShopIdeasAgain, state, toggleCompareItem]
  );

  return <SavedThingsContext.Provider value={value}>{children}</SavedThingsContext.Provider>;
}

export function useSavedThings() {
  const value = useContext(SavedThingsContext);
  if (!value) {
    throw new Error("useSavedThings must be used within SavedThingsProvider");
  }
  return value;
}
