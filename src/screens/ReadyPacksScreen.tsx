import { useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";

import { FilterScroll, MenuTile } from "../components/ModernUI";
import { PageHeader, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useReadyPacks } from "../hooks/useReadyPacks";
import { isPackFree, READY_PACK_STORE_BILLING_ENABLED } from "../services/readyPackEntitlements";
import {
  isCatalogueKindVisible,
  READY_PACK_COSMETICS_ENABLED
} from "../services/readyPackFeatureFlags";
import { colors, spacing } from "../theme/theme";
import type { IoniconName } from "../components/iconTypes";
import type { ReadyPackKind } from "../types/readyPacks";

const allFilters: Array<{ label: string; kind?: ReadyPackKind }> = [
  { label: "All" },
  { label: "ReadyPacks", kind: "content" },
  { label: "Themes", kind: "theme" },
  { label: "Voices", kind: "voice" },
  { label: "Characters", kind: "character" }
];

function asIcon(name: string): IoniconName {
  return name as IoniconName;
}

export function ReadyPacksScreen() {
  const navigation = useNavigation<any>();
  const { listByKind, isInstalled, isReady } = useReadyPacks();
  const filters = useMemo(
    () =>
      allFilters.filter((entry) => !entry.kind || isCatalogueKindVisible(entry.kind)),
    []
  );
  const [filterLabel, setFilterLabel] = useState("ReadyPacks");

  const selectedFilter = useMemo(
    () => filters.find((entry) => entry.label === filterLabel),
    [filterLabel, filters]
  );

  const packs = useMemo(() => {
    const listed = listByKind(selectedFilter?.kind);
    if (READY_PACK_COSMETICS_ENABLED) {
      return listed;
    }
    return listed.filter((pack) => pack.kind === "content");
  }, [listByKind, selectedFilter?.kind]);

  return (
    <Screen>
      <PageHeader
        title="ReadyPacks"
        subtitle={
          READY_PACK_STORE_BILLING_ENABLED
            ? "Ready 4 life systems — preview before you install."
            : "Ready 4 life systems. Included in this version — App Store purchases are not enabled yet."
        }
      />
      {filters.length > 1 ? (
        <FilterScroll
          options={filters.map((entry) => entry.label)}
          selected={filterLabel}
          onSelect={setFilterLabel}
        />
      ) : null}
      {!READY_PACK_COSMETICS_ENABLED ? (
        <SoftCard style={styles.note}>
          <AppText variant="muted">
            Themes, voices and characters are coming later. This catalogue shows ReadyPacks that add editable
            reminders and checklists.
          </AppText>
        </SoftCard>
      ) : null}
      {!isReady ? (
        <SoftCard>
          <AppText variant="muted">Loading ReadyPacks…</AppText>
        </SoftCard>
      ) : (
        <View style={styles.list} accessibilityRole="list">
          {packs.map((pack) => {
            const installed = isInstalled(pack.id);
            const access = isPackFree(pack)
              ? "Free"
              : READY_PACK_STORE_BILLING_ENABLED
                ? "Paid"
                : "Included";
            return (
              <MenuTile
                key={pack.id}
                title={pack.title}
                subtitle={`${installed ? "Installed · " : ""}${access} · ${pack.summary}`}
                icon={asIcon(pack.icon)}
                accent={installed ? colors.softGold : colors.primary}
                onPress={() => navigation.navigate("ReadyPackPreview", { packId: pack.id })}
              />
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  note: {
    marginTop: spacing.sm
  }
});
