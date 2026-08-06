import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { getPack, listPacks } from "../data/readyPacks/catalogue";
import { useNudgeItems } from "./useNudgeItems";
import {
  defaultAppPreferences,
  loadAppPreferences,
  saveAppPreferences,
  type AppPreferences
} from "../services/appPreferencesStorage";
import {
  canInstallPack,
  defaultEntitlementLedger,
  loadEntitlementLedger,
  purchaseProduct,
  READY_PACK_STORE_BILLING_ENABLED,
  restorePurchases,
  type ReadyPackEntitlementLedger
} from "../services/readyPackEntitlements";
import {
  applyCharacterToPreferences,
  applyThemeToPreferences,
  applyVoiceToPreferences
} from "../services/readyPackCosmetics";
import {
  isCosmeticPackKind,
  READY_PACK_COSMETICS_ENABLED
} from "../services/readyPackFeatureFlags";
import {
  installPack,
  migratePack,
  previewPack,
  uninstallPack,
  type UninstallResult
} from "../services/readyPackInstall";
import {
  emptyReadyPackInstallState,
  loadReadyPackInstallState,
  saveReadyPackInstallState
} from "../services/readyPackStorage";
import type { ReadyPack, ReadyPackInstallState, ReadyPackKind, ReadyPackPreview, UninstallMode } from "../types/readyPacks";

type ReadyPacksContextValue = {
  isReady: boolean;
  installState: ReadyPackInstallState;
  ledger: ReadyPackEntitlementLedger;
  packs: ReadyPack[];
  listByKind: (kind?: ReadyPackKind) => ReadyPack[];
  getPreview: (packId: string) => ReadyPackPreview | null;
  install: (packId: string) => Promise<{ createdCount: number }>;
  uninstall: (packId: string, mode?: UninstallMode) => Promise<UninstallResult>;
  migrate: (packId: string) => Promise<void>;
  purchase: (packId: string) => Promise<void>;
  restore: () => Promise<{ restoredCount: number }>;
  isInstalled: (packId: string) => boolean;
};

const ReadyPacksContext = createContext<ReadyPacksContextValue | undefined>(undefined);

export function ReadyPacksProvider({ children }: PropsWithChildren) {
  const { items, replaceItems, isReady: itemsReady } = useNudgeItems();
  const [installState, setInstallState] = useState<ReadyPackInstallState>(emptyReadyPackInstallState);
  const [ledger, setLedger] = useState<ReadyPackEntitlementLedger>(defaultEntitlementLedger);  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([loadReadyPackInstallState(), loadEntitlementLedger()]).then(([state, entitlements]) => {
      if (!active) {
        return;
      }
      setInstallState(state);
      setLedger(entitlements);
      setIsReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const persistState = useCallback(async (next: ReadyPackInstallState) => {
    setInstallState(next);
    await saveReadyPackInstallState(next);
  }, []);

  const applyCosmeticPreferences = useCallback(async (pack: ReadyPack) => {
    const prefs = await loadAppPreferences();
    let next: AppPreferences = prefs;
    if (pack.content.theme) {
      next = applyThemeToPreferences(next, pack.content.theme);
    }
    if (pack.content.voice) {
      next = applyVoiceToPreferences(next, pack.content.voice);
    }
    if (pack.content.character) {
      next = applyCharacterToPreferences(next, pack.content.character);
    }
    if (next !== prefs) {
      await saveAppPreferences(next);
    }
  }, []);

  const install = useCallback(
    async (packId: string) => {
      const pack = getPack(packId);
      if (!pack) {
        throw new Error("ReadyPack not found.");
      }
      if (isCosmeticPackKind(pack.kind) && !READY_PACK_COSMETICS_ENABLED) {
        throw new Error("Themes, voices and characters are coming in a later update.");
      }
      const currentLedger = await loadEntitlementLedger();
      setLedger(currentLedger);
      const result = installPack(pack, items, installState, currentLedger);
      replaceItems(result.items);
      await persistState(result.state);
      if (pack.kind !== "content") {
        await applyCosmeticPreferences(pack);
      }
      return { createdCount: result.createdCount };
    },
    [applyCosmeticPreferences, installState, items, persistState, replaceItems]
  );

  const uninstall = useCallback(
    async (packId: string, mode: UninstallMode = "unedited_only") => {
      const result = uninstallPack(packId, items, installState, mode);
      replaceItems(result.items);
      await persistState(result.state);
      return result;
    },
    [installState, items, persistState, replaceItems]
  );

  const migrate = useCallback(
    async (packId: string) => {
      const pack = getPack(packId);
      if (!pack) {
        throw new Error("ReadyPack not found.");
      }
      const result = migratePack(pack, items, installState);
      replaceItems(result.items);
      await persistState(result.state);
    },
    [installState, items, persistState, replaceItems]
  );

  const purchase = useCallback(async (packId: string) => {
    if (!READY_PACK_STORE_BILLING_ENABLED) {
      throw new Error("In-app purchases are not available in this version yet.");
    }
    const pack = getPack(packId);
    if (!pack?.productId) {
      return;
    }
    const next = await purchaseProduct(pack.productId);
    setLedger(next);
  }, []);

  const restore = useCallback(async () => {
    if (!READY_PACK_STORE_BILLING_ENABLED) {
      return { restoredCount: 0 };
    }
    // When StoreKit / Play Billing is wired, pass restored product ids from the store SDK.
    const result = await restorePurchases([]);
    setLedger(result.ledger);
    return { restoredCount: result.restoredCount };
  }, []);

  const value = useMemo<ReadyPacksContextValue>(
    () => ({
      isReady: isReady && itemsReady,
      installState,
      ledger,
      packs: listPacks(),
      listByKind: listPacks,
      getPreview: (packId: string) => {
        const pack = getPack(packId);
        if (!pack) {
          return null;
        }
        return previewPack(pack, installState, ledger);
      },
      install,
      uninstall,
      migrate,
      purchase,
      restore,
      isInstalled: (packId: string) => Boolean(installState.installed[packId])
    }),
    [install, installState, isReady, itemsReady, ledger, migrate, purchase, restore, uninstall]
  );

  return <ReadyPacksContext.Provider value={value}>{children}</ReadyPacksContext.Provider>;
}

export function useReadyPacks() {
  const ctx = useContext(ReadyPacksContext);
  if (!ctx) {
    throw new Error("useReadyPacks must be used within ReadyPacksProvider");
  }
  return ctx;
}

export function packEntitled(pack: ReadyPack, ledger: ReadyPackEntitlementLedger) {
  return canInstallPack(pack, ledger);
}

export { defaultAppPreferences };
