import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { loadAppPreferences } from "../services/appPreferencesStorage";
import { withAffiliate } from "../services/affiliateLinks";
import { openExternalUrl } from "../services/openExternalUrl";
import { useSavedThings } from "../hooks/useSavedThings";
import { colors, radii, spacing } from "../theme/theme";
import { AffiliateDisclosure } from "./AffiliateDisclosure";
import { AppText } from "./Text";

export type SubtleOutboundLink = {
  id: string;
  label: string;
  url: string;
};

export type SubtleOutboundSection = {
  id: string;
  title: string;
  hint?: string;
  links: SubtleOutboundLink[];
};

const DEFAULT_PREVIEW = 3;

/**
 * Quiet, collapsed-by-default partner / shop / booking ideas.
 * Keeps commercial prompts out of the way of the main nudge flow.
 */
export function SubtleOutboundLinks({
  sections,
  summaryLabel = "Help me find it",
  showAffiliateNote = true,
  previewCount = DEFAULT_PREVIEW,
  dismissKey,
  sourcePackId
}: {
  sections: SubtleOutboundSection[];
  summaryLabel?: string;
  showAffiliateNote?: boolean;
  previewCount?: number;
  /** When set, “I already have this” stays hidden after leaving the screen. */
  dismissKey?: string;
  sourcePackId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [localAlreadyHave, setLocalAlreadyHave] = useState(false);
  const [shopSuggestions, setShopSuggestions] = useState(true);
  const [notice, setNotice] = useState("");
  const { save, isSaved, alreadyHave, isHidden } = useSavedThings();

  useEffect(() => {
    let active = true;
    void loadAppPreferences().then((prefs) => {
      if (active) {
        setShopSuggestions(prefs.shopSuggestions !== false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const totalLinks = useMemo(
    () => sections.reduce((sum, section) => sum + section.links.length, 0),
    [sections]
  );

  if (!shopSuggestions || localAlreadyHave || isHidden(dismissKey) || !sections.length || totalLinks === 0) {
    return null;
  }

  function toggleSection(sectionId: string) {
    setExpandedSections((current) => ({ ...current, [sectionId]: !current[sectionId] }));
  }

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${summaryLabel}. ${totalLinks} links`}
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [styles.summary, pressed && styles.pressed]}
      >
        <AppText variant="caption" style={styles.summaryLabel}>
          {summaryLabel}
        </AppText>
        <AppText variant="caption" style={styles.summaryCount}>
          {totalLinks}
        </AppText>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.mutedText}
        />
      </Pressable>

      {open ? (
        <View style={styles.body}>
          {sections.map((section) => {
            const showAll = Boolean(expandedSections[section.id]);
            const visible = showAll ? section.links : section.links.slice(0, previewCount);
            const hiddenCount = Math.max(0, section.links.length - previewCount);

            return (
              <View key={section.id} style={styles.section}>
                <AppText variant="caption" style={styles.sectionTitle}>
                  {section.title}
                </AppText>
                {section.hint ? (
                  <AppText variant="caption" style={styles.hint} numberOfLines={2}>
                    {section.hint}
                  </AppText>
                ) : null}
                <View style={styles.chipRow}>
                  {visible.map((link) => {
                    const saved = isSaved(link.url);
                    return (
                      <View key={link.id} style={styles.chipWrap}>
                        <Pressable
                          accessibilityRole="link"
                          accessibilityLabel={`Open ${link.label}`}
                          onPress={() => {
                            void openExternalUrl(withAffiliate(link.url), link.label);
                          }}
                          style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                        >
                          <AppText variant="caption" style={styles.chipLabel} numberOfLines={1}>
                            {link.label}
                          </AppText>
                          <Ionicons name="open-outline" size={12} color={colors.mutedText} />
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={saved ? `${link.label} saved` : `Save ${link.label}`}
                          onPress={() => {
                            if (saved) {
                              return;
                            }
                            save({ title: link.label, url: link.url, sourcePackId });
                            setNotice("Saved. Compare up to three in Menu → Saved Things.");
                          }}
                          style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
                        >
                          <Ionicons
                            name={saved ? "bookmark" : "bookmark-outline"}
                            size={16}
                            color={saved ? colors.primaryDark : colors.mutedText}
                          />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
                {hiddenCount > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => toggleSection(section.id)}
                    hitSlop={8}
                    style={styles.moreBtn}
                  >
                    <AppText variant="caption" style={styles.moreLabel}>
                      {showAll ? "Show fewer" : `More (${hiddenCount})`}
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
          {showAffiliateNote ? <AffiliateDisclosure compact /> : null}
          {notice ? (
            <AppText variant="caption" style={styles.hint}>
              {notice}
            </AppText>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (dismissKey) {
                alreadyHave(dismissKey);
              }
              setLocalAlreadyHave(true);
            }}
            hitSlop={8}
            style={styles.moreBtn}
          >
            <AppText variant="caption" style={styles.moreLabel}>
              I already have this
            </AppText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.ivoryElevated,
    overflow: "hidden"
  },
  summary: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  summaryLabel: {
    flex: 1,
    color: colors.mutedText,
    fontWeight: "600"
  },
  summaryCount: {
    color: colors.mutedText,
    opacity: 0.8
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight
  },
  section: {
    gap: 4,
    paddingTop: spacing.sm
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "600"
  },
  hint: {
    color: colors.mutedText,
    lineHeight: 18
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: 2
  },
  chipWrap: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%"
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  chipLabel: {
    color: colors.primaryDark,
    fontWeight: "600",
    maxWidth: 200
  },
  saveBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  moreBtn: {
    alignSelf: "flex-start",
    minHeight: 32,
    justifyContent: "center"
  },
  moreLabel: {
    color: colors.link,
    fontWeight: "600"
  },
  pressed: {
    opacity: 0.82
  }
});
