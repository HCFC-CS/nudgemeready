import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

import { useAppSecurity } from "../hooks/useAppSecurity";
import type { CredentialType } from "../services/appSecurity";
import { resetSecurityLockPrompt } from "../services/securityLockPrompt";
import { colors, radii, spacing } from "../theme/theme";
import { Button } from "./Button";
import { Field, ToggleRow } from "./FormControls";
import { SoftCard } from "./NudgeComponents";
import { RecoveryCodeSaveCard } from "./RecoveryCodeSaveCard";
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
    createReplacementRecoveryCode,
    updateRecoveryEmail
  } = useAppSecurity();

  const [credentialType, setCredentialType] = useState<CredentialType>("password");
  const [credential, setCredential] = useState("");
  const [confirmCredential, setConfirmCredential] = useState("");
  const [disableCredential, setDisableCredential] = useState("");
  const [recoveryCredential, setRecoveryCredential] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [emailCredential, setEmailCredential] = useState("");
  const [enableFaceId, setEnableFaceId] = useState(true);
  const [shownRecoveryCode, setShownRecoveryCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devicePasscodeOn, setDevicePasscodeOn] = useState<boolean | null>(null);

  useEffect(() => {
    setMessage("");
    setError("");
    setEnableFaceId(biometricsAvailable);
    setRecoveryEmail(settings.recoveryEmail ?? "");
  }, [settings.lockEnabled, settings.recoveryEmail, biometricsAvailable]);

  useEffect(() => {
    let active = true;
    LocalAuthentication.getEnrolledLevelAsync()
      .then((level) => {
        if (!active) return;
        setDevicePasscodeOn(level > LocalAuthentication.SecurityLevel.NONE);
      })
      .catch(() => {
        if (active) setDevicePasscodeOn(null);
      });
    return () => {
      active = false;
    };
  }, []);

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
        biometricsEnabled: useBiometrics,
        recoveryEmail
      });
      await resetSecurityLockPrompt();
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
    Alert.alert(
      "Turn off app lock?",
      "Anyone with this phone will be able to open your nudges without Face ID, PIN, or password.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Turn off",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await turnOffLock(disableCredential);
                setDisableCredential("");
                setShownRecoveryCode("");
                setMessage("App lock turned off.");
              } catch (caught) {
                setError(caught instanceof Error ? caught.message : "Could not turn off app lock.");
              }
            })();
          }
        }
      ]
    );
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
      setMessage("New recovery code created. Save it somewhere safe offline.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create a recovery code.");
    }
  }

  async function handleUpdateRecoveryEmail() {
    setError("");
    setMessage("");
    try {
      await updateRecoveryEmail(emailCredential, recoveryEmail);
      setEmailCredential("");
      setMessage("Recovery email updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update recovery email.");
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
        Keep a passcode on this phone, turn on app lock, and store your recovery code offline. Your notes,
        appointments, crew details, and settings are encrypted on device.
      </AppText>

      {devicePasscodeOn === false ? (
        <AppText variant="caption" style={styles.warning}>
          This phone does not appear to have a device passcode or Face ID set up. Add one in iPhone Settings
          first — app lock works best on top of that.
        </AppText>
      ) : null}

      {shownRecoveryCode ? (
        <RecoveryCodeSaveCard
          code={shownRecoveryCode}
          onSaved={() => setShownRecoveryCode("")}
          continueLabel="I’ve saved it"
        />
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

          <Field
            label="Recovery email"
            value={recoveryEmail}
            onChangeText={(value) => setRecoveryEmail(value.slice(0, 120))}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            voiceEnabled={false}
          />
          <AppText variant="caption" style={styles.hint}>
            Used to email yourself a one-time reset link if you forget your sign-in.
          </AppText>

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
            disabled={credential.length < minLength || !recoveryEmail.includes("@")}
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
            Forgot password help uses Face ID/device passcode, an email reset link, or the recovery code
            below. Store a fresh code offline if you rotate it.
          </AppText>
          <Field
            label="Recovery email"
            value={recoveryEmail}
            onChangeText={(value) => setRecoveryEmail(value.slice(0, 120))}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            voiceEnabled={false}
          />
          <Field
            label={`Current ${activeLabel} to update email`}
            value={emailCredential}
            onChangeText={(value) =>
              setEmailCredential(
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
            onPress={() => void handleUpdateRecoveryEmail()}
            disabled={
              !recoveryEmail.includes("@") ||
              emailCredential.length < (settings.credentialType === "password" ? 8 : 4)
            }
          >
            Save recovery email
          </Button>

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

      {error ? (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      ) : null}
      {message ? (
        <AppText variant="caption" style={styles.message}>
          {message}
        </AppText>
      ) : null}
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
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}
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
  warning: {
    color: colors.danger
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
