import { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { PageHeader, PrimaryButton, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useReadyPacks } from "../hooks/useReadyPacks";
import {
  getPackAccessLabel,
  READY_PACK_STORE_BILLING_ENABLED
} from "../services/readyPackEntitlements";
import {
  isCosmeticPackKind,
  READY_PACK_COSMETICS_ENABLED,
  READY_PACK_PREVIEW_EXTRAS_ENABLED
} from "../services/readyPackFeatureFlags";
import { colors, spacing } from "../theme/theme";

export function ReadyPackPreviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const packId = route.params?.packId as string;
  const { getPreview, install, uninstall, purchase, migrate, installState, ledger } = useReadyPacks();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const preview = useMemo(() => getPreview(packId), [getPreview, packId]);

  if (!preview) {
    return (
      <Screen>
        <PageHeader title="ReadyPack" subtitle="This pack could not be found." />
        <PrimaryButton onPress={() => navigation.goBack()}>Back</PrimaryButton>
      </Screen>
    );
  }

  const { pack, templates, isInstalled, canInstall, entitlementReason, installedVersion } = preview;
  const needsUpdate =
    isInstalled && installedVersion && installedVersion !== pack.version;
  const cosmeticsComingSoon = isCosmeticPackKind(pack.kind) && !READY_PACK_COSMETICS_ENABLED;
  const canOfferInstall = canInstall && !cosmeticsComingSoon;

  async function handleInstall() {
    setBusy(true);
    setNotice("");
    try {
      if (cosmeticsComingSoon) {
        setNotice("Themes, voices and characters are coming in a later update.");
        return;
      }
      // Only call purchase when real store billing is enabled and the pack is not yet entitled.
      if (!canInstall && pack.productId && READY_PACK_STORE_BILLING_ENABLED) {
        await purchase(pack.id);
      }
      if (!canInstall && !READY_PACK_STORE_BILLING_ENABLED) {
        setNotice("In-app purchases are not available in this version yet.");
        return;
      }
      const result = await install(pack.id);
      setNotice(
        pack.kind === "content"
          ? `Installed ${result.createdCount} editable items. You can change or remove them anytime.`
          : "Pack applied. You can switch again from ReadyPacks anytime."
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not install this ReadyPack.");
    } finally {
      setBusy(false);
    }
  }

  function confirmInstall() {
    if (cosmeticsComingSoon) {
      setNotice("Themes, voices and characters are coming in a later update.");
      return;
    }
    if (pack.healthDisclaimer) {
      Alert.alert(
        "Organisational support only",
        `${pack.healthDisclaimer}\n\nContinue to install?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Install", onPress: () => void handleInstall() }
        ]
      );
      return;
    }
    void handleInstall();
  }

  function handleUninstall() {
    Alert.alert(
      "Remove ReadyPack?",
      "Unrelated reminders stay. You can keep items you have edited, or remove everything from this pack.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove unedited only",
          onPress: () => {
            void (async () => {
              setBusy(true);
              try {
                const result = await uninstall(pack.id, "unedited_only");
                setNotice(
                  `Removed ${result.removedCount} items` +
                    (result.keptEditedCount ? ` · kept ${result.keptEditedCount} edited` : "") +
                    "."
                );
              } catch (error) {
                setNotice(error instanceof Error ? error.message : "Could not uninstall.");
              } finally {
                setBusy(false);
              }
            })();
          }
        },
        {
          text: "Remove all from pack",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setBusy(true);
              try {
                const result = await uninstall(pack.id, "all_from_pack");
                setNotice(`Removed ${result.removedCount} items from this pack.`);
              } catch (error) {
                setNotice(error instanceof Error ? error.message : "Could not uninstall.");
              } finally {
                setBusy(false);
              }
            })();
          }
        }
      ]
    );
  }

  return (
    <Screen>
      <PageHeader title={pack.title} subtitle={pack.summary} />

      <SoftCard style={styles.card}>
        <AppText variant="caption">
          Version {pack.version}
          {isInstalled ? ` · installed ${installedVersion ?? installState.installed[pack.id]?.version}` : ""}
        </AppText>
        <AppText variant="body">{pack.features.join(" · ")}</AppText>
        {pack.healthDisclaimer ? (
          <AppText variant="muted" style={styles.disclaimer}>
            {pack.healthDisclaimer}
          </AppText>
        ) : null}
        <AppText variant="muted">
          {cosmeticsComingSoon
            ? "Coming soon — not available to install in this version."
            : getPackAccessLabel(pack, { canInstall, allowAll: ledger.allowAll })}
        </AppText>
      </SoftCard>

      {templates.length > 0 ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">What you will get</AppText>
          <AppText variant="muted">Everything stays editable after install.</AppText>
          {templates.map((template) => (
            <View key={template.id} style={styles.row}>
              <AppText variant="body">{template.title}</AppText>
              <AppText variant="caption">{template.type}</AppText>
            </View>
          ))}
        </SoftCard>
      ) : null}

      {READY_PACK_COSMETICS_ENABLED && pack.content.theme ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Theme</AppText>
          <AppText variant="muted">Applies appearance preference: {pack.content.theme.appearanceKey}</AppText>
        </SoftCard>
      ) : null}

      {READY_PACK_COSMETICS_ENABLED && pack.content.voice ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Voice</AppText>
          <AppText variant="muted">
            {pack.content.voice.label} · {pack.content.voice.language}
          </AppText>
        </SoftCard>
      ) : null}

      {READY_PACK_COSMETICS_ENABLED && pack.content.character ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Character</AppText>
          <AppText variant="body">
            {pack.content.character.avatarSymbol} {pack.content.character.displayName}
          </AppText>
          {pack.content.character.quotes.slice(0, 2).map((quote) => (
            <AppText key={quote} variant="muted">
              “{quote}”
            </AppText>
          ))}
        </SoftCard>
      ) : null}

      {READY_PACK_PREVIEW_EXTRAS_ENABLED &&
      pack.content.aiCoachPrompts &&
      pack.content.aiCoachPrompts.length > 0 ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">AI coach prompts</AppText>
          {pack.content.aiCoachPrompts.map((prompt) => (
            <AppText key={prompt} variant="muted">
              · {prompt}
            </AppText>
          ))}
        </SoftCard>
      ) : null}

      {READY_PACK_PREVIEW_EXTRAS_ENABLED && pack.content.badges && pack.content.badges.length > 0 ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Badges</AppText>
          {pack.content.badges.map((badge) => (
            <AppText key={badge.id} variant="muted">
              · {badge.title}
            </AppText>
          ))}
        </SoftCard>
      ) : null}

      {READY_PACK_PREVIEW_EXTRAS_ENABLED &&
      pack.content.crewRecommendations &&
      pack.content.crewRecommendations.length > 0 ? (
        <SoftCard style={styles.card}>
          <AppText variant="heading">Crew ideas</AppText>
          {pack.content.crewRecommendations.map((row) => (
            <AppText key={`${row.roleHint}-${row.reason}`} variant="muted">
              · {row.roleHint}: {row.reason}
            </AppText>
          ))}
        </SoftCard>
      ) : null}

      {notice ? (
        <SoftCard style={styles.card}>
          <AppText variant="body">{notice}</AppText>
        </SoftCard>
      ) : null}

      {!canInstall && entitlementReason ? (
        <SoftCard style={styles.card}>
          <AppText variant="muted">{entitlementReason}</AppText>
        </SoftCard>
      ) : null}

      <View style={styles.actions}>
        {!isInstalled ? (
          cosmeticsComingSoon ? (
            <PrimaryButton disabled accessibilityLabel={`${pack.title} coming soon`}>
              Coming soon
            </PrimaryButton>
          ) : (
            <PrimaryButton
              disabled={busy || !canOfferInstall}
              onPress={() => confirmInstall()}
              accessibilityLabel={`Install ${pack.title}`}
            >
              {busy ? "Working…" : "Install"}
            </PrimaryButton>
          )
        ) : (
          <>
            {needsUpdate ? (
              <PrimaryButton
                disabled={busy}
                onPress={() => {
                  void (async () => {
                    setBusy(true);
                    try {
                      await migrate(pack.id);
                      setNotice("Updated unedited items. Your edits were kept.");
                    } catch (error) {
                      setNotice(error instanceof Error ? error.message : "Update failed.");
                    } finally {
                      setBusy(false);
                    }
                  })();
                }}
              >
                Update pack
              </PrimaryButton>
            ) : null}
            <PrimaryButton disabled={busy} onPress={handleUninstall} accessibilityLabel={`Uninstall ${pack.title}`}>
              Uninstall
            </PrimaryButton>
          </>
        )}
        <PrimaryButton size="compact" onPress={() => navigation.goBack()}>
          Back to catalogue
        </PrimaryButton>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  row: {
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight
  },
  disclaimer: {
    marginTop: spacing.xs
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xl
  }
});
