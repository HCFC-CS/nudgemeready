import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useAppSecurity } from "../hooks/useAppSecurity";
import type { CredentialType } from "../services/appSecurity";
import { colors, radii, spacing } from "../theme/theme";
import { Button } from "./Button";
import { Field, ToggleRow } from "./FormControls";
import { SoftCard } from "./NudgeComponents";
import { AppText } from "./Text";

export function SecuritySettingsCard() {
  const {
    settings,
    biometricLabel,
    biometricsAvailable,
    hasFaceId,
    turnOnLock,
    turnOffLock,
    updateBiometrics,
    updateLockOnBackground,
    lockNow,
    createReplacementRecoveryCode
  } = useAppSecurity();

  const [credentialType, setCredentialType] = useState<CredentialType>("password");
  const [credential, setCredential] = useState("");
  const [confirmCredential, setConfirmCredential] = useState("");
  const [disableCredential, setDisableCredential] = useState("");
  const [recoveryCredential, setRecoveryCredential] = useState("");
  const [enableFaceId, setEnableFaceId] = useState(true);
  const [shownRecoveryCode, setShownRecoveryCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMessage("");
    setError("");
    setEnableFaceId(biometricsAvailable);
  }, [settings.lockEnabled, biometricsAvailable]);

  const isPassword = credentialType === "password";
  const minLength = isPassword ? 8 : 4;
  const activeLabel = settings.credentialType === "password" ? "password" : "PIN";

  async function handleEnable() {
    setError("");
    setMessage("");
    if (credential !== confirmCredential) {
      setError(`${isPassword ? "Passwords" : "PINs"} don’t match.`);
      return;
    }
    try {
      const useBiometrics = biometricsAvailable && enableFaceId;
      const recoveryCode = await turnOnLock(credential, credentialType, {
        biometricsEnabled: useBiometrics
      });
      setCredential("");
      setConfirmCredential("");
      setShownRecoveryCode(recoveryCode);
      setMessage(
        useBiometrics
          ? `App lock is on with ${biometricLabel} and your ${isPassword ? "password" : "PIN"}.`
          : `App lock is on with your ${isPassword ? "password" : "PIN"}.`
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not enable app lock.");
    }
  }

  async function handleDisable() {
    setError("");
    setMessage("");
    try {
      await turnOffLock(disableCredential);
      setDisableCredential("");
      setShownRecoveryCode("");
      setMessage("App lock turned off.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not turn off app lock.");
    }
  }

  async function handleBiometrics(value: boolean) {
    setError("");
    try {
      await updateBiometrics(value);
      setMessage(value ? `${biometricLabel} unlock enabled.` : `${biometricLabel} unlock off.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update biometrics.");
    }
  }

  async function handleNewRecoveryCode() {
    setError("");
    setMessage("");
    try {
      const code = await createReplacementRecoveryCode(recoveryCredential);
      setRecoveryCredential("");
      setShownRecoveryCode(code);
      setMessage("New recovery code created. Save it somewhere safe.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create a recovery code.");
    }
  }

  function updateCredentialDraft(value: string) {
    if (credentialType === "pin") {
      setCredential(value.replace(/\D/g, "").slice(0, 8));
      return;
    }
    setCredential(value.slice(0, 64));
  }

  function updateConfirmDraft(value: string) {
    if (credentialType === "pin") {
      setConfirmCredential(value.replace(/\D/g, "").slice(0, 8));
      return;
    }
    setConfirmCredential(value.slice(0, 64));
  }

  return (
    <SoftCard>
      <AppText variant="heading">Security</AppText>
      <AppText variant="muted">
        App lock keeps your nudges private on this phone. Your notes, appointments, crew details, and
        settings are encrypted on device. Sign in with {hasFaceId ? "Face ID" : biometricLabel}, a PIN, or
        a password. If you forget it, use Face ID/device passcode or your recovery code.
      </AppText>

      {shownRecoveryCode ? (
        <View style={styles.codeCard}>
          <AppText variant="caption" style={styles.hint}>
            Recovery code — save this now. It won’t be shown again.
          </AppText>
          <AppText style={styles.codeText}>{shownRecoveryCode}</AppText>
          <Button tone="quiet" onPress={() => setShownRecoveryCode("")}>
            I’ve saved it
          </Button>
        </View>
      ) : null}

      {!settings.lockEnabled ? (
        <View style={styles.setup}>
          <View style={styles.typeRow}>
            <TypeChip
              label="Password"
              selected={credentialType === "password"}
              onPress={() => {
                setCredentialType("password");
                setCredential("");
                setConfirmCredential("");
              }}
            />
            <TypeChip
              label="PIN"
              selected={credentialType === "pin"}
              onPress={() => {
                setCredentialType("pin");
                setCredential("");
                setConfirmCredential("");
              }}
            />
          </View>

          <Field
            label={isPassword ? "Password" : "PIN"}
            value={credential}
            onChangeText={updateCredentialDraft}
            placeholder={isPassword ? "At least 8 characters" : "4–8 digits"}
            keyboardType={isPassword ? "default" : "number-pad"}
            voiceEnabled={false}
            secureTextEntry
          />
          <Field
            label={isPassword ? "Confirm password" : "Confirm PIN"}
            value={confirmCredential}
            onChangeText={updateConfirmDraft}
            placeholder={isPassword ? "Repeat password" : "Repeat PIN"}
            keyboardType={isPassword ? "default" : "number-pad"}
            voiceEnabled={false}
            secureTextEntry
          />
          {isPassword ? (
            <AppText variant="caption" style={styles.hint}>
              Use letters and at least one number.
            </AppText>
          ) : null}

          {biometricsAvailable ? (
            <ToggleRow
              label={`Also unlock with ${biometricLabel}`}
              value={enableFaceId}
              onValueChange={setEnableFaceId}
              note={
                hasFaceId
                  ? "Face recognition unlocks the app quickly. Your password remains the backup."
                  : `${biometricLabel} unlocks the app quickly. Your ${isPassword ? "password" : "PIN"} remains the backup.`
              }
            />
          ) : (
            <AppText variant="caption" style={styles.hint}>
              Face recognition isn’t set up on this device yet. You can still use a password or PIN.
            </AppText>
          )}

          <Button
            tone="primary"
            onPress={() => void handleEnable()}
            disabled={credential.length < minLength}
          >
            Turn on app lock
          </Button>
        </View>
      ) : (
        <View style={styles.setup}>
          <AppText variant="caption" style={styles.hint}>
            Unlock method: {settings.credentialType === "password" ? "Password" : "PIN"}
            {settings.biometricsEnabled ? ` + ${biometricLabel}` : ""}
          </AppText>
          <ToggleRow
            label="Lock when leaving app"
            value={settings.lockOnBackground}
            onValueChange={(value) => void updateLockOnBackground(value)}
            note={`Ask for your ${activeLabel} again after you leave the app. Won’t interrupt Control Center or permission prompts.`}
          />
          <ToggleRow
            label={`${biometricLabel} unlock`}
            value={settings.biometricsEnabled}
            onValueChange={(value) => void handleBiometrics(value)}
            note={
              biometricsAvailable
                ? hasFaceId
                  ? "Use face recognition as a quick unlock. Password or PIN still works."
                  : `Use ${biometricLabel} as a quick unlock option.`
                : `${biometricLabel} is not set up on this device.`
            }
            disabled={!biometricsAvailable && !settings.biometricsEnabled}
          />
          <Button tone="quiet" onPress={lockNow}>
            Lock now / return to sign-in
          </Button>

          <AppText variant="caption" style={styles.hint}>
            Forgot password help uses Face ID/device passcode, or the recovery code below.
          </AppText>
          <Field
            label={`Current ${activeLabel} for new recovery code`}
            value={recoveryCredential}
            onChangeText={(value) =>
              setRecoveryCredential(
                settings.credentialType === "pin"
                  ? value.replace(/\D/g, "").slice(0, 8)
                  : value.slice(0, 64)
              )
            }
            placeholder={settings.credentialType === "password" ? "Current password" : "Current PIN"}
            keyboardType={settings.credentialType === "password" ? "default" : "number-pad"}
            voiceEnabled={false}
            secureTextEntry
          />
          <Button
            tone="quiet"
            onPress={() => void handleNewRecoveryCode()}
            disabled={recoveryCredential.length < (settings.credentialType === "password" ? 8 : 4)}
          >
            Create new recovery code
          </Button>

          <Field
            label={`${activeLabel === "password" ? "Password" : "PIN"} to turn off`}
            value={disableCredential}
            onChangeText={(value) =>
              setDisableCredential(
                settings.credentialType === "pin"
                  ? value.replace(/\D/g, "").slice(0, 8)
                  : value.slice(0, 64)
              )
            }
            placeholder={settings.credentialType === "password" ? "Current password" : "Current PIN"}
            keyboardType={settings.credentialType === "password" ? "default" : "number-pad"}
            voiceEnabled={false}
            secureTextEntry
          />
          <Button
            tone="warning"
            onPress={() => void handleDisable()}
            disabled={disableCredential.length < (settings.credentialType === "password" ? 8 : 4)}
          >
            Turn off app lock
          </Button>
        </View>
      )}

      {error ? <AppText variant="caption" style={styles.error}>{error}</AppText> : null}
      {message ? <AppText variant="caption" style={styles.message}>{message}</AppText> : null}
    </SoftCard>
  );
}

function TypeChip({
  label,
  selected,
  onPress
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed
      ]}
    >
      <AppText style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  setup: {
    gap: spacing.sm
  },
  typeRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  chip: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center"
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  chipLabel: {
    fontWeight: "600",
    color: colors.text
  },
  chipLabelSelected: {
    color: colors.primaryDark
  },
  hint: {
    color: colors.mutedText
  },
  codeCard: {
    gap: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    padding: spacing.md
  },
  codeText: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 2,
    textAlign: "center",
    color: colors.text
  },
  error: {
    color: colors.danger
  },
  message: {
    color: colors.mutedText
  },
  pressed: {
    opacity: 0.85
  }
});
