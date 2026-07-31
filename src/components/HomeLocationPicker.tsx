import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";

import { Button } from "./Button";
import { Field } from "./FormControls";
import { PrimaryButton } from "./NudgeComponents";
import { AppText } from "./Text";
import { useHomeSettings } from "../hooks/useHomeSettings";
import {
  filterAddressesByHouseNumber,
  formatUkPostcode,
  isLikelyUkPostcode,
  lookupHouseAtPostcode,
  searchAddressesForPostcode,
  type HomeAddressOption
} from "../services/homeAddressLookup";
import { getCurrentCoordinates } from "../services/locationReminders";
import {
  getPlaceSummary,
  hasPlaceCoordinates,
  PLACE_KINDS,
  PLACE_LABELS,
  type HomeLocationSource,
  type PlaceKind,
  type SavedPlace
} from "../services/homeSettingsStorage";
import { colors, radii, spacing } from "../theme/theme";

type Mode = "address" | "location";

type PlaceDraft = {
  label: string;
  address: string;
  postcode: string;
  houseNumber: string;
  latitude: number | null;
  longitude: number | null;
  locationSource: HomeLocationSource | null;
  reminderEnabled: boolean;
};

function draftFromPlace(place: SavedPlace): PlaceDraft {
  return {
    label: place.label,
    address: place.address,
    postcode: place.postcode,
    houseNumber: place.houseNumber,
    latitude: place.latitude,
    longitude: place.longitude,
    locationSource: place.locationSource,
    reminderEnabled: place.reminderEnabled
  };
}

function emptyDraft(reminderEnabled: boolean): PlaceDraft {
  return {
    label: "",
    address: "",
    postcode: "",
    houseNumber: "",
    latitude: null,
    longitude: null,
    locationSource: null,
    reminderEnabled
  };
}

function draftsEqual(a: PlaceDraft, b: PlaceDraft) {
  return (
    a.label === b.label &&
    a.address === b.address &&
    a.postcode === b.postcode &&
    a.houseNumber === b.houseNumber &&
    a.latitude === b.latitude &&
    a.longitude === b.longitude &&
    a.locationSource === b.locationSource &&
    a.reminderEnabled === b.reminderEnabled
  );
}

function shortSummary(draft: PlaceDraft) {
  if (draft.latitude == null || draft.longitude == null) {
    return "Not set";
  }
  if (draft.locationSource === "gps") {
    return "Current location";
  }
  return draft.label || [draft.houseNumber, draft.postcode].filter(Boolean).join(", ") || "Address set";
}

export function HomeLocationPicker() {
  const {
    homeSettings,
    setPlace,
    clearPlace,
    setPlaceReminder,
    setAllPlaceReminders
  } = useHomeSettings();
  const [activeKind, setActiveKind] = useState<PlaceKind>("home");
  const activePlace = homeSettings.places[activeKind];
  const savedDraft = useMemo(() => draftFromPlace(activePlace), [activePlace]);
  const [mode, setMode] = useState<Mode>(activePlace.locationSource === "gps" ? "location" : "address");
  const [draft, setDraft] = useState<PlaceDraft>(() => draftFromPlace(activePlace));
  const [postcode, setPostcode] = useState(activePlace.postcode);
  const [houseNumber, setHouseNumber] = useState(activePlace.houseNumber);
  const [addresses, setAddresses] = useState<HomeAddressOption[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const place = homeSettings.places[activeKind];
    setDraft(draftFromPlace(place));
    setPostcode(place.postcode);
    setHouseNumber(place.houseNumber);
    setMode(place.locationSource === "gps" ? "location" : "address");
    setAddresses([]);
    setMessage("");
  }, [activeKind]);

  const isDirty = !draftsEqual(draft, savedDraft);
  const visibleAddresses = useMemo(
    () => filterAddressesByHouseNumber(addresses, houseNumber),
    [addresses, houseNumber]
  );

  const reminderCount = PLACE_KINDS.filter(
    (kind) => homeSettings.places[kind].reminderEnabled && hasPlaceCoordinates(homeSettings.places[kind])
  ).length;

  function applyReminders(reminderEnabled: boolean) {
    setAllPlaceReminders(reminderEnabled);
    setDraft((current) => ({ ...current, reminderEnabled }));
  }

  async function handleLookupPostcode() {
    const nextPostcode = formatUkPostcode(postcode);
    setPostcode(nextPostcode);
    if (!isLikelyUkPostcode(nextPostcode)) {
      setMessage("Enter a full UK postcode.");
      return;
    }

    setBusy(true);
    setMessage("");
    setAddresses([]);
    try {
      const result = await searchAddressesForPostcode(nextPostcode);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setPostcode(result.postcode);
      setAddresses(result.addresses);
      setMessage(
        result.addresses.length
          ? `${result.addresses.length} found — pick a number.`
          : "No list found. Enter a house number."
      );
    } catch {
      setMessage("Lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLookupHouse() {
    setBusy(true);
    setMessage("");
    try {
      const result = await lookupHouseAtPostcode(houseNumber, postcode);
      if (result.error || !result.address) {
        setMessage(result.error || "Not found.");
        return;
      }
      selectAddress(result.address);
    } catch {
      setMessage("Lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  function selectAddress(option: HomeAddressOption) {
    setDraft((current) => ({
      ...current,
      label: option.label,
      address: option.address,
      postcode: option.postcode,
      houseNumber: option.houseNumber,
      latitude: option.latitude,
      longitude: option.longitude,
      locationSource: "address"
    }));
    setPostcode(option.postcode);
    setHouseNumber(option.houseNumber);
    setMessage("Selected — tap Save.");
  }

  async function handleUseCurrentLocation() {
    setBusy(true);
    setMessage("");
    try {
      const coordinates = await getCurrentCoordinates();
      if (!coordinates) {
        setMessage("Location permission needed.");
        return;
      }
      setDraft((current) => ({
        ...current,
        label: "Current location",
        address: "",
        postcode: "",
        houseNumber: "",
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        locationSource: "gps"
      }));
      setMessage("Selected — tap Save.");
    } finally {
      setBusy(false);
    }
  }

  function handleSave() {
    if (!isDirty) {
      setMessage("Already saved.");
      return;
    }
    if (draft.latitude == null || draft.longitude == null) {
      clearPlace(activeKind);
      setPlaceReminder(activeKind, draft.reminderEnabled);
      setAddresses([]);
      setMessage("Cleared.");
      return;
    }
    setPlace(activeKind, {
      label: draft.label || PLACE_LABELS[activeKind],
      address: draft.address,
      postcode: draft.postcode,
      houseNumber: draft.houseNumber,
      latitude: draft.latitude,
      longitude: draft.longitude,
      locationSource: draft.locationSource ?? "address",
      reminderEnabled: draft.reminderEnabled
    });
    setMessage("Saved.");
  }

  function handleDiscard() {
    setDraft(savedDraft);
    setPostcode(savedDraft.postcode);
    setHouseNumber(savedDraft.houseNumber);
    setAddresses([]);
    setMessage("");
  }

  function handleClearDraft() {
    setDraft(emptyDraft(draft.reminderEnabled));
    setPostcode("");
    setHouseNumber("");
    setAddresses([]);
    setMessage("Cleared — tap Save to confirm.");
  }

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kindRow}>
        {PLACE_KINDS.map((kind) => {
          const place = homeSettings.places[kind];
          const selected = activeKind === kind;
          return (
            <Pressable
              key={kind}
              onPress={() => setActiveKind(kind)}
              style={[styles.kindChip, selected && styles.kindChipSelected]}
            >
              <AppText variant="small" style={selected ? styles.selectedLabel : undefined}>
                {PLACE_LABELS[kind]}
              </AppText>
              <AppText variant="caption" numberOfLines={1} style={styles.kindMeta}>
                {hasPlaceCoordinates(place) ? getPlaceSummary(place) : "Add"}
                {place.reminderEnabled && hasPlaceCoordinates(place) ? " · remind" : ""}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.reminderRow}>
        <View style={styles.flex}>
          <AppText>Remind when leaving</AppText>
          <AppText variant="caption" style={styles.kindMeta}>
            {PLACE_LABELS[activeKind]}
          </AppText>
        </View>
        <Switch
          value={draft.reminderEnabled}
          onValueChange={(value) => setDraft((current) => ({ ...current, reminderEnabled: value }))}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor={colors.card}
        />
      </View>

      <View style={styles.applyRow}>
        <Button tone="quiet" size="compact" onPress={() => applyReminders(true)}>
          Remind all
        </Button>
        <Button tone="quiet" size="compact" onPress={() => applyReminders(false)}>
          Remind none
        </Button>
        <AppText variant="caption" style={styles.kindMeta}>
          {reminderCount} on
        </AppText>
      </View>

      <View style={styles.modeRow}>
        {(["address", "location"] as const).map((entry) => (
          <Pressable
            key={entry}
            onPress={() => setMode(entry)}
            style={[styles.modeChip, mode === entry && styles.modeChipActive]}
          >
            <AppText variant="small" style={mode === entry ? styles.selectedLabel : undefined}>
              {entry === "address" ? "Postcode" : "GPS"}
            </AppText>
          </Pressable>
        ))}
      </View>

      {mode === "address" ? (
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Field
                label="Postcode"
                value={postcode}
                onChangeText={(value) => setPostcode(value.toUpperCase())}
                placeholder="L39 2DT"
              />
            </View>
            <Button
              tone="secondary"
              style={styles.lookupBtn}
              onPress={() => void handleLookupPostcode()}
              disabled={busy || !postcode.trim()}
            >
              Lookup
            </Button>
          </View>

          <View style={styles.row}>
            <View style={styles.flex}>
              <Field label="House number" value={houseNumber} onChangeText={setHouseNumber} placeholder="12" />
            </View>
            <Button
              tone="quiet"
              style={styles.lookupBtn}
              onPress={() => void handleLookupHouse()}
              disabled={busy || !postcode.trim() || !houseNumber.trim()}
            >
              Find
            </Button>
          </View>

          {visibleAddresses.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {visibleAddresses.map((option) => {
                const selected =
                  draft.houseNumber === option.houseNumber &&
                  draft.postcode === option.postcode &&
                  draft.latitude === option.latitude;
                return (
                  <Pressable
                    key={`${option.houseNumber}-${option.street}-${option.latitude}`}
                    onPress={() => selectAddress(option)}
                    style={[styles.houseChip, selected && styles.houseChipSelected]}
                  >
                    <AppText variant="small" style={selected ? styles.selectedLabel : undefined}>
                      {option.houseNumber}
                    </AppText>
                    {option.street ? (
                      <AppText variant="caption" numberOfLines={1} style={styles.kindMeta}>
                        {option.street}
                      </AppText>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}
        </View>
      ) : (
        <Button tone="secondary" onPress={() => void handleUseCurrentLocation()} disabled={busy}>
          {busy ? "Getting location…" : "Use current location"}
        </Button>
      )}

      {busy ? <ActivityIndicator color={colors.primaryDark} /> : null}

      <View style={styles.summaryRow}>
        <View style={styles.flex}>
          <AppText variant="caption" style={styles.summaryLabel}>
            {isDirty ? "Selected" : "Saved"}
          </AppText>
          <AppText numberOfLines={1}>{shortSummary(draft)}</AppText>
        </View>
        {draft.latitude != null || savedDraft.latitude != null ? (
          <Pressable onPress={handleClearDraft} hitSlop={8}>
            <AppText variant="caption" style={styles.clearLink}>
              Clear
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.saveRow}>
        <PrimaryButton onPress={handleSave} style={styles.flex}>
          Save {PLACE_LABELS[activeKind]}
        </PrimaryButton>
        {isDirty ? (
          <Button tone="quiet" onPress={handleDiscard}>
            Discard
          </Button>
        ) : null}
      </View>

      {message ? (
        <AppText variant="caption" style={styles.message}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm
  },
  kindRow: {
    gap: spacing.sm,
    paddingVertical: 2
  },
  kindChip: {
    minWidth: 96,
    maxWidth: 130,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    gap: 2
  },
  kindChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  kindMeta: {
    color: colors.mutedText
  },
  selectedLabel: {
    color: colors.primaryDark,
    fontWeight: "700"
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  applyRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  modeRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  modeChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted
  },
  modeChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  section: {
    gap: spacing.sm
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm
  },
  flex: {
    flex: 1
  },
  lookupBtn: {
    minWidth: 88,
    marginBottom: 2
  },
  chipRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs
  },
  houseChip: {
    minWidth: 64,
    maxWidth: 120,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    gap: 2
  },
  houseChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.xs
  },
  summaryLabel: {
    color: colors.mutedText,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    fontWeight: "700"
  },
  clearLink: {
    color: colors.link,
    fontWeight: "600"
  },
  saveRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center"
  },
  message: {
    color: colors.mutedText
  }
});
