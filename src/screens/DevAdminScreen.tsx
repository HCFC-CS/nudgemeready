import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { Button } from "../components/Button";
import { PageHeader, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useAppSecurity } from "../hooks/useAppSecurity";
import {
  collectDevAdminDiagnostics,
  isDevAdminAvailable,
  type DevAdminDiagnostics
} from "../services/devAdmin";
import { colors, radii, spacing } from "../theme/theme";

export function DevAdminScreen() {
  const navigation = useNavigation<any>();
  const {
    settings,
    adminResetLockKeepData,
    authorizeDevRecovery,
    biometricsAvailable
  } = useAppSecurity();
  const [diagnostics, setDiagnostics] = useState<DevAdminDiagnostics | null>(null);
  const [credentialType, setCredentialType] = useState<"password" | "pin">(
    settings.credentialType === "password" ? "password" : "pin"
  );
  const [credential, setCredential] = useState("");
  const [confirm, setConfirm] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState(settings.recoveryEmail ?? "");
  const [enableFaceId, setEnableFaceId] = useState(biometricsAvailable && settings.biometricsEnabled);
  const [freshCode, setFreshCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const available = isDevAdminAvailable();

  const refreshDiagnostics = useCallback(() => {
    void collectDevAdminDiagnostics().then(setDiagnostics);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!available) {
        return;
      }
      refreshDiagnostics();
    }, [available, refreshDiagnostics])
  );

  if (!available) {
    return (
      <Screen showTabMenu={false}>
        <PageHeader title="Developer admin" subtitle="Not available in this build." showBack />
        <SoftCard>
          <AppText variant="muted">
            Developer admin tools are only available in development builds or when explicitly enabled for support.
          </AppText>
          <Button tone="quiet" onPress={() => navigation.goBack()}>
            Back
          </Button>
        </SoftCard>
      </Screen>
    );
  }

  async function handleResetLock() {
    if (credential !== confirm) {
      setMessage(credentialType === "password" ? "Passwords don’t match." : "PINs don’t match.");
      return;
    }
    if (credentialType === "password" && credential.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (credentialType === "pin" && (credential.length < 4 || credential.length > 8)) {
      setMessage("PIN must be 4–8 digits.");
      return;
    }

    Alert.alert(
      "Reset lock — keep all data?",
      "This only changes the PIN/password and recovery code. Nudges, profile, crew, and attachments stay on this phone. Nothing is deleted unless the user uninstalls the app.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset lock, keep data",
          onPress: () => {
            void (async () => {
              setBusy(true);
              setMessage("");
              try {
                const code = await adminResetLockKeepData(credential, credentialType, {
                  biometricsEnabled: enableFaceId,
                  recoveryEmail: recoveryEmail.trim() || undefined
                });
                setFreshCode(code);
                setCredential("");
                setConfirm("");
                setMessage("Lock reset. User data was not deleted.");
                refreshDiagnostics();
              } catch (caught) {
                setMessage(caught instanceof Error ? caught.message : "Could not reset lock.");
              } finally {
                setBusy(false);
              }
            })();
          }
        }
      ]
    );
  }

  function handleAuthorizeResetUi() {
    const ok = authorizeDevRecovery();
    if (!ok) {
      setMessage("Could not authorize recovery.");
      return;
    }
    setMessage("Recovery authorized. Return to Splash and choose a new PIN or password. Data is kept.");
    navigation.navigate("Splash");
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title="Developer admin"
        subtitle="Support tools when recovery fails — data is never wiped here."
        showBack
      />

      <SoftCard>
        <AppText variant="heading">Data retention</AppText>
        <AppText variant="muted">
          {diagnostics?.dataRetentionPolicy ??
            "Recovery and admin lock reset never delete user content. Uninstalling the app removes local data."}
        </AppText>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Diagnostics</AppText>
        {diagnostics ? (
          <View style={styles.diagList}>
            <DiagRow label="Lock enabled" value={yesNo(diagnostics.lockEnabled)} />
            <DiagRow label="Has credential" value={yesNo(diagnostics.hasCredential)} />
            <DiagRow label="Credential type" value={diagnostics.credentialType} />
            <DiagRow label="Biometrics" value={yesNo(diagnostics.biometricsEnabled)} />
            <DiagRow label="Recovery code" value={yesNo(diagnostics.hasRecoveryCode)} />
            <DiagRow label="Recovery email" value={diagnostics.recoveryEmailMasked ?? "—"} />
            <DiagRow label="Data key present" value={yesNo(diagnostics.dataKeyPresent)} />
            <DiagRow label="Profile readable" value={yesNo(diagnostics.profileReadable)} />
            <DiagRow label="Nudge store present" value={yesNo(diagnostics.nudgeStorePresent)} />
            <DiagRow label="AsyncStorage keys" value={String(diagnostics.asyncStorageKeyCount)} />
          </View>
        ) : (
          <AppText variant="muted">Loading…</AppText>
        )}
        <Button tone="quiet" onPress={refreshDiagnostics}>
          Refresh diagnostics
        </Button>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Authorize recovery UI</AppText>
        <AppText variant="muted">
          Lets Splash show the “choose a new PIN/password” step without Face ID, email link, or recovery code. Does
          not delete data.
        </AppText>
        <Button tone="secondary" onPress={handleAuthorizeResetUi} disabled={busy}>
          Authorize reset on Splash
        </Button>
      </SoftCard>

      <SoftCard>
        <AppText variant="heading">Reset lock (keep all data)</AppText>
        <AppText variant="muted">
          Sets a new credential and recovery code now, then unlocks. Nudges and profile stay on the phone.
        </AppText>
        <View style={styles.typeRow}>
          <Pressable
            onPress={() => setCredentialType("password")}
            style={[styles.chip, credentialType === "password" && styles.chipSelected]}
          >
            <AppText style={credentialType === "password" ? styles.chipLabelSelected : undefined}>Password</AppText>
          </Pressable>
          <Pressable
            onPress={() => setCredentialType("pin")}
            style={[styles.chip, credentialType === "pin" && styles.chipSelected]}
          >
            <AppText style={credentialType === "pin" ? styles.chipLabelSelected : undefined}>PIN</AppText>
          </Pressable>
        </View>
        <TextInput
          value={credential}
          onChangeText={(value) =>
            setCredential(credentialType === "pin" ? value.replace(/\D/g, "").slice(0, 8) : value.slice(0, 64))
          }
          placeholder={credentialType === "password" ? "New password" : "New PIN"}
          secureTextEntry
          style={styles.input}
          editable={!busy}
        />
        <TextInput
          value={confirm}
          onChangeText={(value) =>
            setConfirm(credentialType === "pin" ? value.replace(/\D/g, "").slice(0, 8) : value.slice(0, 64))
          }
          placeholder="Confirm"
          secureTextEntry
          style={styles.input}
          editable={!busy}
        />
        <TextInput
          value={recoveryEmail}
          onChangeText={setRecoveryEmail}
          placeholder="Recovery email (optional)"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          editable={!busy}
        />
        {biometricsAvailable ? (
          <Pressable onPress={() => setEnableFaceId((value) => !value)} style={styles.toggleRow}>
            <AppText>Also use Face ID / biometrics: {enableFaceId ? "On" : "Off"}</AppText>
          </Pressable>
        ) : null}
        <Button tone="primary" onPress={() => void handleResetLock()} disabled={busy}>
          {busy ? "Working…" : "Reset lock — keep data"}
        </Button>
      </SoftCard>

      {freshCode ? (
        <SoftCard>
          <AppText variant="heading">New recovery code</AppText>
          <AppText variant="muted">Save this — it won’t be shown again.</AppText>
          <View style={styles.codeCard}>
            <AppText style={styles.codeText}>{freshCode}</AppText>
          </View>
        </SoftCard>
      ) : null}

      {message ? <AppText variant="small">{message}</AppText> : null}
    </Screen>
  );
}

function DiagRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.diagRow}>
      <AppText variant="muted">{label}</AppText>
      <AppText variant="small">{value}</AppText>
    </View>
  );
}

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

const styles = StyleSheet.create({
  diagList: { gap: spacing.xs },
  diagRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  typeRow: { flexDirection: "row", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  chipLabelSelected: {
    fontWeight: "700",
    color: colors.primaryDark
  },
  input: {
    minHeight: 48,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16
  },
  toggleRow: {
    paddingVertical: spacing.sm
  },
  codeCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.ivoryElevated,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  codeText: {
    fontFamily: "Courier",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1.5,
    textAlign: "center",
    color: colors.primaryDark
  }
});
