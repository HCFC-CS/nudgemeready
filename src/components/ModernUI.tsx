import Ionicons from "@expo/vector-icons/Ionicons";
import type { PropsWithChildren } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { colors, radii, shadows, spacing } from "../theme/theme";
import type { IoniconName } from "./iconTypes";
import { AppText } from "./Text";
import { VoiceFieldActions } from "./VoiceFieldActions";

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search..."
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search-outline" size={18} color={colors.mutedText} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedText}
        style={styles.searchInput}
      />
      <VoiceFieldActions value={value} onChangeText={onChangeText} size={26} />
      {value ? (
        <Pressable accessibilityRole="button" onPress={() => onChangeText("")} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={colors.mutedText} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function MenuTile({
  title,
  subtitle,
  icon,
  onPress,
  accent = colors.primary
}: {
  title: string;
  subtitle?: string;
  icon: IoniconName;
  onPress: () => void;
  accent?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.menuTile, pressed && styles.menuTilePressed]}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${accent}16` }]}>
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <View style={styles.menuText}>
        <AppText variant="body" style={styles.menuTitle}>
          {title}
        </AppText>
        {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.mutedText} />
    </Pressable>
  );
}

export function FilterScroll({
  options,
  selected,
  onSelect
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
      {options.map((option) => {
        const isActive = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[styles.filterChip, isActive && styles.filterChipActive]}
          >
            <AppText variant="small" style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
              {option}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statPill}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="heading">{value}</AppText>
    </View>
  );
}

export function HeroSurface({ children }: PropsWithChildren) {
  return <View style={styles.heroSurface}>{children}</View>;
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.sm
  },
  menuTile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm
  },
  menuTilePressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }]
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center"
  },
  menuText: {
    flex: 1,
    gap: 2
  },
  menuTitle: {
    fontWeight: "600"
  },
  filterScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  filterChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  filterLabel: {
    fontWeight: "600",
    color: colors.mutedText
  },
  filterLabelActive: {
    color: colors.accent
  },
  statPill: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 2
  },
  heroSurface: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md
  }
});
