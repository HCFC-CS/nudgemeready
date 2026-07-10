import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState
} from "react";

import {
  canEditItem,
  canToggleItemLock,
  formatCreatorLabel,
  resolveItemCreator
} from "../services/itemPermissions";
import type { NudgeItem } from "../types/nudge";
import { useNudgeActor } from "./useNudgeActor";

type ItemEditContextValue = {
  editable: boolean;
  canToggleLock: boolean;
  isLocked: boolean;
  creatorLabel: string;
  setLocked: (locked: boolean) => void;
};

const ItemEditContext = createContext<ItemEditContextValue | undefined>(undefined);

export function ItemEditProvider({
  item,
  children
}: PropsWithChildren<{ item: NudgeItem }>) {
  const actor = useNudgeActor();
  const [isLocked, setIsLocked] = useState(item.isLocked ?? false);
  const createdBy = resolveItemCreator(item);
  const itemWithLock = useMemo(() => ({ ...item, isLocked, createdBy }), [item, isLocked, createdBy]);
  const editable = canEditItem(itemWithLock, actor);
  const canToggleLock = canToggleItemLock(itemWithLock, actor);

  const value = useMemo(
    () => ({
      editable,
      canToggleLock,
      isLocked,
      creatorLabel: formatCreatorLabel(createdBy),
      setLocked: setIsLocked
    }),
    [editable, canToggleLock, isLocked, createdBy]
  );

  return <ItemEditContext.Provider value={value}>{children}</ItemEditContext.Provider>;
}

export function useItemEdit() {
  const context = useContext(ItemEditContext);
  if (!context) {
    throw new Error("useItemEdit must be used inside ItemEditProvider");
  }
  return context;
}

export function useOptionalItemEdit() {
  return useContext(ItemEditContext);
}
