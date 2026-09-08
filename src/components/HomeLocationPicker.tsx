import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";

import { Button } from "./Button";
import { DistanceScaleBar } from "./DistanceScaleBar";
import { Field } from "./FormControls";
import { HearButton } from "./HearButton";
import { PrimaryButton } from "./NudgeComponents";
import { AppText } from "./Text";
import { useHomeSettings } from "../hooks/useHomeSettings";
import {
  formatUkPostcode,
  filterAddressesByHouseNumber,
  isLikelyUkPostcode,
  searchAddressesForPostcode,
  type HomeAddressOption,
  type PostcodeArea
} from "../services/homeAddressLookup";
import { getCurrentCoordinates } from "../services/locationReminders";
import {
  buildLeavingPlaceSpeechText,
  clampHomeThresholdMeters,
  DEFAULT_PLACE_CHECKLISTS,
  getPlaceSummary,
  hasPlaceCoordinates,
  HOME_THRESHOLD_DEFAULT_METERS,
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
  thresholdMeters: number;
  checklistItems: string[];
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
    reminderEnabled: place.reminderEnabled,
    thresholdMeters: place.thresholdMeters,
    checklistItems: [...place.checklistItems]
  };
}

function emptyDraft(kind: PlaceKind, reminderEnabled: boolean): PlaceDraft {
  return {
    label: "",
    address: "",
    postcode: "",
    houseNumber: "",
    latitude: null,
    longitude: null,
    locationSource: null,
    reminderEnabled,
    thresholdMeters: HOME_THRESHOLD_DEFAULT_METERS,
    checklistItems: [...DEFAULT_PLACE_CHECKLISTS[kind]]
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
    a.reminderEnabled === b.reminderEnabled &&
    a.thresholdMeters === b.thresholdMeters &&
    a.checklistItems.join("\n") === b.checklistItems.join("\n")
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

function checklistPlaceholder(kind: PlaceKind) {
  if (kind === "work") {
    return "laptop, notes…";
  }
  if (kind === "school") {
    return "homework, gym kit…";
  }
  return "keys, phone…";
}

export function HomeLocationPicker() {
  const {
    homeSettings,
    setPlace,
    clearPlace,
    setPlaceReminder,
    setAllPlaceReminders,
    setPlaceThreshold,
    setPlaceChecklist
  } = useHomeSettings();
  const [activeKind, setActiveKind] = useState<PlaceKind>("home");
  const activePlace = homeSettings.places[activeKind];
  const savedDraft = useMemo(() => draftFromPlace(activePlace), [activePlace]);
  const [mode, setMode] = useState<Mode>(activePlace.locationSource === "gps" ? "location" : "address");
  const [draft, setDraft] = useState<PlaceDraft>(() => draftFromPlace(activePlace));
  const [postcode, setPostcode] = useState(activePlace.postcode);
  const [addressFilter, setAddressFilter] = useState("");
  const [addressOptions, setAddressOptions] = useState<HomeAddressOption[]>([]);
  const [area, setArea] = useState<PostcodeArea | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const place = homeSettings.places[activeKind];
    setDraft(draftFromPlace(place));
    setPostcode(place.postcode);
    setAddressFilter("");
    setAddressOptions([]);
    setMode(place.locationSource === "gps" ? "location" : "address");
    setArea(null);
    setMessage("");
  }, [activeKind]);

  const isDirty = !draftsEqual(draft, savedDraft);

  const visibleAddresses = useMemo(
    () => filterAddressesByHouseNumber(addressOptions, addressFilter),
    [addressOptions, addressFilter]
  );

  const reminderCount = PLACE_KINDS.filter(
    (kind) => homeSettings.places[kind].reminderEnabled && hasPlaceCoordinates(homeSettings.places[kind])
  ).length;

  function applyReminders(reminderEnabled: boolean) {
    setAllPlaceReminders(reminderEnabled);
    setDraft((current) => ({ ...current, reminderEnabled }));
  }

  function clearAddressSelection() {
    setDraft((current) => ({
      ...current,
      label: "",
      address: "",
      houseNumber: "",
      latitude: null,
      longitude: null,
      locationSource: null
    }));
  }

  async function handleLookupPostcode() {
    const nextPostcode = formatUkPostcode(postcode);
    setPostcode(nextPostcode);
    if (!isLikelyUkPostcode(nextPostcode)) {
      setMessage("Enter a full UK postcode.");
      setArea(null);
      setAddressOptions([]);
      return;
    }

    setBusy(true);
    setMessage("");
    setArea(null);
    setAddressOptions([]);
    setAddressFilter("");
    clearAddressSelection();
    try {
      const result = await searchAddressesForPostcode(nextPostcode);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setPostcode(result.postcode);
      setArea(result.area ?? null);
      setAddressOptions(result.addresses);
      setDraft((current) => ({
        ...current,
        postcode: result.postcode,
        label: "",
        address: "",
        houseNumber: "",
        latitude: null,
        longitude: null,
        locationSource: null
      }));
      if (result.addresses.length === 1 && !result.addresses[0]?.houseNumber) {
        setMessage("No named houses found for this postcode yet. You can use the postcode centre below.");
      } else {
        setMessage(`Found ${result.addresses.length} address${result.addresses.length === 1 ? "" : "es"}. Pick one.`);
      }
    } catch {
      setMessage("Lookup failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleSelectAddress(option: HomeAddressOption) {
    setPostcode(option.postcode);
    setAddressFilter("");
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
      setPlaceThreshold(activeKind, clampHomeThresholdMeters(draft.thresholdMeters));
      setPlaceChecklist(
        activeKind,
        draft.checklistItems.length ? draft.checklistItems : [...DEFAULT_PLACE_CHECKLISTS[activeKind]]
      );
      setArea(null);
      setMessage("Cleared location. Checklist and distance kept.");
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
      reminderEnabled: draft.reminderEnabled,
      thresholdMeters: clampHomeThresholdMeters(draft.thresholdMeters),
      checklistItems: draft.checklistItems.length
        ? draft.checklistItems
        : [...DEFAULT_PLACE_CHECKLISTS[activeKind]]
    });
    setMessage("Saved.");
  }

  function handleDiscard() {
    setDraft(savedDraft);
    setPostcode(savedDraft.postcode);
    setAddressFilter("");
    setAddressOptions([]);
    setArea(null);
    setMessage("");
  }

  function handleClearDraft() {
    setDraft(emptyDraft(activeKind, draft.reminderEnabled));
    setPostcode("");
    setAddressFilter("");
    setAddressOptions([]);
    setArea(null);
    setMessage("Cleared — tap Save to confirm.");
  }

  const preview = buildLeavingPlaceSpeechText(activeKind, draft.checklistItems);

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
            GPS only for {PLACE_LABELS[activeKind]} — not a daily reminder
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

      <DistanceScaleBar
        value={draft.thresholdMeters}
        onChange={(meters) =>
          setDraft((current) => ({ ...current, thresholdMeters: clampHomeThresholdMeters(meters) }))
        }
      />

      <AppText variant="caption" style={styles.checklistHeading}>
        When leaving {PLACE_LABELS[activeKind].toLowerCase()}, remind me about
      </AppText>
      {draft.checklistItems.map((item, index) => (
        <View key={`${activeKind}-item-${index}`} style={styles.checklistRow}>
          <View style={styles.flex}>
            <Field
              label={`Item ${index + 1}`}
              value={item}
              onChangeText={(value) =>
                setDraft((current) => ({
                  ...current,
                  checklistItems: current.checklistItems.map((entry, itemIndex) =>
                    itemIndex === index ? value : entry
                  )
                }))
              }
              placeholder={checklistPlaceholder(activeKind)}
            />
          </View>
          {draft.checklistItems.length > 1 ? (
            <Button
              tone="quiet"
              style={styles.removeButton}
              onPress={() =>
                setDraft((current) => ({
                  ...current,
                  checklistItems: current.checklistItems.filter((_, itemIndex) => itemIndex !== index)
                }))
              }
            >
              Remove
            </Button>
          ) : null}
        </View>
      ))}
      <Button
        tone="quiet"
        onPress={() => setDraft((current) => ({ ...current, checklistItems: [...current.checklistItems, ""] }))}
      >
        Add item
      </Button>
      <View style={styles.previewRow}>
        <AppText variant="caption" style={styles.previewText}>
          Preview: {preview}
        </AppText>
        <HearButton text={preview} />
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
                onChangeText={(value) => {
                  setPostcode(value.toUpperCase());
                  setArea(null);
                  setAddressOptions([]);
                  setAddressFilter("");
                  clearAddressSelection();
                }}
                placeholder="L39 2DT"
                autoCapitalize="characters"
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

          {area ? (
            <AppText variant="caption" style={styles.kindMeta}>
              Area: {area.summary}
            </AppText>
          ) : null}

          {addressOptions.length > 0 ? (
            <View style={styles.section}>
              <Field
                label="Filter addresses (optional)"
                value={addressFilter}
                onChangeText={setAddressFilter}
                placeholder="e.g. 12 or flat"
              />
              <AppText variant="caption" style={styles.checklistHeading}>
                Choose an address
              </AppText>
              <ScrollView
                style={styles.addressList}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                {visibleAddresses.length ? (
                  visibleAddresses.map((option) => {
                    const selected =
                      draft.latitude === option.latitude &&
                      draft.longitude === option.longitude &&
                      draft.label === option.label;
                    return (
                      <Pressable
                        key={`${option.label}-${option.latitude}-${option.longitude}`}
                        accessibilityRole="button"
                        accessibilityLabel={`Select ${option.label}`}
                        onPress={() => handleSelectAddress(option)}
                        style={[styles.addressRow, selected && styles.addressRowSelected]}
                      >
                        <AppText style={selected ? styles.selectedLabel : undefined}>{option.label}</AppText>
                        <AppText variant="caption" style={styles.kindMeta} numberOfLines={2}>
                          {option.address}
                        </AppText>
                      </Pressable>
                    );
                  })
                ) : (
                  <AppText variant="caption" style={styles.kindMeta}>
                    No addresses match that filter.
                  </AppText>
                )}
              </ScrollView>
            </View>
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
          <AppText numberOfLines={2}>{shortSummary(draft)}</AppText>
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
  checklistHeading: {
    color: colors.mutedText,
    fontWeight: "700",
    marginTop: spacing.xs
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm
  },
  removeButton: {
    marginBottom: 2
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  previewText: {
    color: colors.mutedText,
    flex: 1
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
  addressList: {
    maxHeight: 220,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
    backgroundColor: colors.ivoryElevated
  },
  addressRow: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    gap: 2
  },
  addressRowSelected: {
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
