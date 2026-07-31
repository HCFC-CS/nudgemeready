import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";

import { useOptionalItemEdit } from "../hooks/useItemEdit";
import { getLocationLabel, openInMaps, searchPlaces, toNudgeLocation } from "../services/placeSearch";
import { colors, radii, spacing } from "../theme/theme";
import type { NudgeLocation } from "../types/nudge";
import { AppText } from "./Text";
import { VoiceFieldActions } from "./VoiceFieldActions";

type LocationFinderFieldProps = {
  label: string;
  value?: NudgeLocation;
  onChange: (location: NudgeLocation | undefined) => void;
  placeholder?: string;
  editable?: boolean;
};

export function LocationFinderField({
  label,
  value,
  onChange,
  placeholder = "Search venue or place",
  editable
}: LocationFinderFieldProps) {
  const edit = useOptionalItemEdit();
  const isEditable = editable ?? edit?.editable ?? true;
  const [query, setQuery] = useState(getLocationLabel(value));
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchPlaces>>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setQuery(getLocationLabel(value));
  }, [value?.label, value?.address]);

  useEffect(() => {
    if (!isEditable || query.trim().length < 3) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    if (getLocationLabel(value) === query.trim() && value?.latitude != null) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");
      try {
        const places = await searchPlaces(query);
        setResults(places);
        setShowResults(true);
      } catch {
        setSearchError("Could not search right now.");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [query, isEditable, value]);

  function selectPlace(place: (typeof results)[number]) {
    onChange(toNudgeLocation(place));
    setQuery(place.label);
    setResults([]);
    setShowResults(false);
  }

  function handleTextChange(text: string) {
    setQuery(text);
    onChange(
      text.trim()
        ? {
            label: text.trim(),
            address: text.trim(),
            latitude: value?.latitude,
            longitude: value?.longitude
          }
        : undefined
    );
  }

  async function handleOpenMaps() {
    if (!value) {
      return;
    }
    await openInMaps(value);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <AppText variant="caption" style={styles.fieldLabel}>
          {label}
        </AppText>
        <VoiceFieldActions value={query} onChangeText={handleTextChange} editable={isEditable} />
      </View>
      <View style={styles.inputRow}>
        <Ionicons name="location-outline" size={20} color={colors.accent} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedText}
          editable={isEditable}
          onFocus={() => setShowResults(true)}
        />
        {isSearching ? <ActivityIndicator size="small" color={colors.accent} /> : null}
      </View>

      {value?.address && value.address !== value.label ? (
        <AppText variant="caption" style={styles.address}>
          {value.address}
        </AppText>
      ) : null}

      {showResults && results.length > 0 ? (
        <View style={styles.results}>
          {results.map((place) => (
            <Pressable
              key={`${place.latitude}-${place.longitude}-${place.label}`}
              accessibilityRole="button"
              onPress={() => selectPlace(place)}
              style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}
            >
              <Ionicons name="pin-outline" size={18} color={colors.accent} />
              <View style={styles.resultText}>
                <AppText style={styles.resultTitle}>{place.label}</AppText>
                <AppText variant="caption" style={styles.resultAddress} numberOfLines={2}>
                  {place.address}
                </AppText>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      {searchError ? <AppText variant="caption" style={styles.error}>{searchError}</AppText> : null}

      {value && (value.address || value.label) ? (
        <Pressable
          accessibilityRole="button"
          onPress={handleOpenMaps}
          style={({ pressed }) => [styles.mapsBtn, pressed && styles.pressed]}
        >
          <Ionicons name="map-outline" size={18} color={colors.accent} />
          <AppText style={styles.mapsLabel}>Open in Maps</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  fieldLabel: {
    color: colors.mutedText,
    fontWeight: "600",
    flexShrink: 1
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    minHeight: 48
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.sm
  },
  address: {
    color: colors.mutedText
  },
  results: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    overflow: "hidden"
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  resultText: {
    flex: 1,
    gap: 2
  },
  resultTitle: {
    fontWeight: "600",
    color: colors.text
  },
  resultAddress: {
    color: colors.mutedText
  },
  mapsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.secondary
  },
  mapsLabel: {
    color: colors.accent,
    fontWeight: "700"
  },
  error: {
    color: colors.softWarning
  },
  pressed: {
    opacity: 0.85
  }
});
