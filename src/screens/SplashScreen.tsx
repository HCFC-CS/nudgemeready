import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from "react-native";

import { Button } from "../components/Button";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { ProfileAvatarPicker } from "../components/ProfileAvatarPicker";
import { RecoveryCodeSaveCard } from "../components/RecoveryCodeSaveCard";
import { FixedScreen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useAppSecurity } from "../hooks/useAppSecurity";
import { useCrew } from "../hooks/useCrew";
import { type ProfileIcon, useProfile } from "../hooks/useProfile";
import { credentialLabel, type CredentialType } from "../services/appSecurity";
import { isDevAdminAvailable } from "../services/devAdmin";
import { peekPendingInvite } from "../services/pendingDeepLinks";
import { resetSecurityLockPrompt } from "../services/securityLockPrompt";
import {
  TERMS_OF_USE_ACCEPT_LABEL,
  TERMS_OF_USE_VERSION
} from "../content/termsOfUse";
import { colors, radii, shadows, spacing } from "../theme/theme";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;
type SignInStep =
  | "welcome"
  | "register"
  | "setup"
  | "unlock"
  | "forgot"
  | "recoveryCode"
  | "reset"
  | "recoveryShown";

export function SplashScreen({ navigation, route }: Props) {
  const { profile, completeRegistration, needsRegistration, isProfileReady } = useProfile();
  const { renameSelfProfile, setHasOwnNudgeWorld } = useCrew();
  const {
    isReady,
    isLocked,
    settings,
    biometricLabel,
    biometricsAvailable,
    hasFaceId,
    unlockWithCredential,
    unlockWithBiometrics,
    unlockLockoutMs,
    turnOnLock,
    beginForgotPasswordWithDevice,
    beginForgotPasswordWithRecoveryCode,
    beginForgotPasswordWithEmailLink,
    beginForgotPasswordWithEmailToken,
    emailSupportForRecovery,
    cancelPasswordRecovery,
    completePasswordReset,
    finishPasswordReset
  } = useAppSecurity();

  const [step, setStep] = useState<SignInStep>("welcome");
  const [credentialType, setCredentialType] = useState<CredentialType>("password");
  const [credential, setCredential] = useState("");
  const [confirmCredential, setConfirmCredential] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [enableFaceId, setEnableFaceId] = useState(true);
  const [recoveryInput, setRecoveryInput] = useState("");
  const [freshRecoveryCode, setFreshRecoveryCode] = useState("");
  const [resetType, setResetType] = useState<CredentialType>("password");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const titleTapRef = useRef({ count: 0, timer: null as ReturnType<typeof setTimeout> | null });

  function handleTitleTap() {
    if (!isDevAdminAvailable()) {
      return;
    }
    const state = titleTapRef.current;
    state.count += 1;
    if (state.timer) {
      clearTimeout(state.timer);
    }
    state.timer = setTimeout(() => {
      state.count = 0;
    }, 1800);
    if (state.count >= 7) {
      state.count = 0;
      navigation.navigate("DevAdmin");
    }
  }
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regTermsAccepted, setRegTermsAccepted] = useState(false);
  const [regIcon, setRegIcon] = useState<ProfileIcon>("sun");
  const [regAvatarUri, setRegAvatarUri] = useState<string | undefined>();

  const profileName = profile.name.trim();
  const lockActive = settings.lockEnabled && settings.hasCredential;
  const needsUnlock = isLocked && lockActive;
  const faceLabel = hasFaceId ? "Face ID" : biometricLabel;
  const activeLabel = credentialLabel(settings.credentialType);
  const setupIsPassword = credentialType === "password";
  const unlockIsPassword = settings.credentialType === "password";
  const resetIsPassword = resetType === "password";
  const bootReady = isReady && isProfileReady;

  useEffect(() => {
    if (!bootReady) return;
    if (route.params?.recoverToken) return;
    if (needsUnlock) {
      setStep("unlock");
      setError("");
      setCredential("");
      return;
    }
    if (needsRegistration) {
      setStep("register");
      setRegName(profile.name);
      setRegEmail(profile.email);
      setRegPhone(profile.phone);
      setRegIcon(profile.icon);
      setRegAvatarUri(profile.avatarUri);
      return;
    }
    if (step === "unlock" || step === "forgot" || step === "recoveryCode" || step === "reset" || step === "register") {
      setStep("welcome");
    }
  }, [bootReady, needsUnlock, needsRegistration, route.params?.recoverToken]);

  useEffect(() => {
    const token = route.params?.recoverToken;
    if (!isReady || !token) {
      return;
    }
    let cancelled = false;
    (async () => {
      setBusy(true);
      setError("");
      setMessage("");
      const ok = await beginForgotPasswordWithEmailToken(token);
      if (cancelled) return;
      setBusy(false);
      navigation.setParams({ recoverToken: undefined });
      if (!ok) {
        setStep(needsUnlock ? "forgot" : "welcome");
        setError("That reset link is invalid or has expired. Request a new email link.");
        return;
      }
      setResetType(settings.credentialType);
      setStep("reset");
      setMessage("Email link confirmed. Choose a new PIN or password.");
    })();
    return () => {
      cancelled = true;
    };
  }, [
    beginForgotPasswordWithEmailToken,
    isReady,
    navigation,
    needsUnlock,
    route.params?.recoverToken,
    settings.credentialType
  ]);

  useEffect(() => {
    if (step === "unlock" && settings.biometricsEnabled && biometricsAvailable && needsUnlock) {
      void unlockWithBiometrics();
    }
  }, [step, settings.biometricsEnabled, biometricsAvailable, needsUnlock, unlockWithBiometrics]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (!needsUnlock) return;
      event.preventDefault();
    });
    return unsubscribe;
  }, [navigation, needsUnlock]);

  function clearDrafts() {
    setCredential("");
    setConfirmCredential("");
    setRecoveryInput("");
    setError("");
    setMessage("");
  }

  function enterApp(screen: "Today" | "Capture" = "Today") {
    if (needsUnlock) return;
    if (needsRegistration) {
      setStep("register");
      return;
    }
    navigation.reset({
      index: 0,
      routes: [{ name: "Tabs", params: { screen } }]
    });
  }

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function submitRegistration() {
    const name = regName.trim();
    const email = regEmail.trim().toLowerCase();
    const phone = regPhone.trim();
    if (!name) {
      setError("Add your name to continue.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Add a valid email address.");
      return;
    }
    if (!regTermsAccepted) {
      setError("Please agree to the Terms of Use to continue.");
      return;
    }
    completeRegistration({
      name,
      email,
      phone,
      icon: regIcon,
      avatarUri: regAvatarUri,
      termsOfUseAcceptedAt: new Date().toISOString(),
      termsOfUseVersion: TERMS_OF_USE_VERSION
    });
    renameSelfProfile(name);
    // Invite-first installs support the nudgee only until they opt into their own world.
    setHasOwnNudgeWorld(!peekPendingInvite());
    setRecoveryEmail(email);
    setError("");
    setCredentialType("password");
    setEnableFaceId(biometricsAvailable);
    setStep("setup");
  }

  async function submitUnlock() {
    if (unlockLockoutMs > 0) {
      const seconds = Math.ceil(unlockLockoutMs / 1000);
      setError(`Too many attempts. Try again in ${seconds}s.`);
      return;
    }
    setBusy(true);
    setError("");
    const ok = await unlockWithCredential(credential);
    setBusy(false);
    if (!ok) {
      setError(`That ${activeLabel} doesn’t match. Try again.`);
      setCredential("");
      return;
    }
    clearDrafts();
    setStep("welcome");
  }

  async function submitSetup() {
    setError("");
    if (credential !== confirmCredential) {
      setError(setupIsPassword ? "Passwords don’t match." : "PINs don’t match.");
      return;
    }
    setBusy(true);
    try {
      const useBiometrics = biometricsAvailable && enableFaceId;
      const recoveryCode = await turnOnLock(credential, credentialType, {
        biometricsEnabled: useBiometrics,
        recoveryEmail
      });
      await resetSecurityLockPrompt();
      setFreshRecoveryCode(recoveryCode);
      clearDrafts();
      setStep("recoveryShown");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not set up sign-in.");
    } finally {
      setBusy(false);
    }
  }

  async function recoverWithDevice() {
    setBusy(true);
    setError("");
    const ok = await beginForgotPasswordWithDevice();
    setBusy(false);
    if (!ok) {
      setError("Couldn’t confirm it’s you. Try email reset or your recovery code.");
      return;
    }
    setResetType(settings.credentialType);
    setStep("reset");
  }

  async function recoverWithCode() {
    setBusy(true);
    setError("");
    const ok = await beginForgotPasswordWithRecoveryCode(recoveryInput);
    setBusy(false);
    if (!ok) {
      setError("That recovery code doesn’t match.");
      return;
    }
    setResetType(settings.credentialType);
    setStep("reset");
  }

  async function emailResetLink() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await beginForgotPasswordWithEmailLink();
      setMessage(
        settings.recoveryEmail
          ? `Email draft opened for ${settings.recoveryEmail}. Send it, then tap the link on this phone.`
          : "Email draft opened. Send it, then tap the link on this phone."
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not open email.");
    } finally {
      setBusy(false);
    }
  }

  async function emailSupportHelp() {
    setBusy(true);
    setError("");
    try {
      await emailSupportForRecovery();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not open email.");
    } finally {
      setBusy(false);
    }
  }

  async function submitReset() {
    setError("");
    if (credential !== confirmCredential) {
      setError(resetIsPassword ? "Passwords don’t match." : "PINs don’t match.");
      return;
    }
    setBusy(true);
    try {
      const code = await completePasswordReset(credential, resetType);
      setFreshRecoveryCode(code);
      clearDrafts();
      setStep("recoveryShown");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not reset sign-in.");
    } finally {
      setBusy(false);
    }
  }

  function finishRecoveryAndEnter() {
    finishPasswordReset();
    cancelPasswordRecovery();
    setFreshRecoveryCode("");
    setStep("welcome");
  }

  return (
    <FixedScreen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.glow} />
            <ProfileAvatar size={88} />
            <Pressable onPress={handleTitleTap} accessibilityRole="header">
              <AppText variant="title" style={styles.title}>
                Nudge me Ready
              </AppText>
            </Pressable>
            {profileName ? (
              <AppText variant="body" style={styles.profileName}>
                Hi, {profileName}
              </AppText>
            ) : null}
            <AppText variant="muted" style={styles.subtitle}>
              {needsUnlock || step === "unlock"
                ? `Sign in with ${settings.biometricsEnabled && biometricsAvailable ? `${faceLabel}, ` : ""}${activeLabel}`
                : step === "register"
                  ? "Create your profile to get started"
                  : step === "setup"
                    ? "Protect your nudges with Face ID, a PIN, or a password"
                    : "Forget me never, one nudge at a time"}
            </AppText>
          </View>

          <View style={styles.panel}>
            {step === "welcome" && !needsUnlock && !needsRegistration ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => enterApp("Today")}
                  style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
                >
                  <Ionicons name="sunny-outline" size={22} color={colors.onPrimary} />
                  <AppText style={styles.primaryLabel}>Nudges ready</AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => enterApp("Capture")}
                  style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
                >
                  <Ionicons name="add-circle-outline" size={22} color={colors.primaryDark} />
                  <AppText style={styles.secondaryLabel}>Add a nudge</AppText>
                </Pressable>

                {!lockActive ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      clearDrafts();
                      setCredentialType("password");
                      setEnableFaceId(biometricsAvailable);
                      setRecoveryEmail(profile.email || recoveryEmail);
                      setStep("setup");
                    }}
                    style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
                  >
                    <Ionicons name={hasFaceId ? "scan-outline" : "lock-closed-outline"} size={18} color={colors.accent} />
                    <AppText style={styles.linkLabel}>
                      Set up {hasFaceId ? "Face ID, " : ""}PIN or password
                    </AppText>
                  </Pressable>
                ) : (
                  <AppText variant="caption" style={styles.hint}>
                    Protected with {settings.biometricsEnabled ? `${faceLabel} + ` : ""}
                    {activeLabel}. Change this in Settings.
                  </AppText>
                )}
              </>
            ) : null}

            {step === "register" ? (
              <>
                <AppText variant="muted" style={styles.centerCopy}>
                  {peekPendingInvite()
                    ? "You’re joining to support someone. This stays on your phone. You’ll only access their nudges unless you set up the app for yourself later."
                    : "Tell us a little about you. This stays on your phone."}
                </AppText>
                <ProfileAvatarPicker
                  name={regName}
                  icon={regIcon}
                  avatarUri={regAvatarUri}
                  onIconChange={setRegIcon}
                  onAvatarChange={setRegAvatarUri}
                />
                <CredentialInput
                  value={regName}
                  onChangeText={(value) => {
                    setRegName(value.slice(0, 40));
                    setError("");
                  }}
                  placeholder="Your name"
                  isPassword={false}
                  editable={!busy}
                  secureTextEntry={false}
                  keyboardType="default"
                  autoCapitalize="words"
                  maxLength={40}
                />
                <CredentialInput
                  value={regEmail}
                  onChangeText={(value) => {
                    setRegEmail(value.slice(0, 120));
                    setError("");
                  }}
                  placeholder="Email address"
                  isPassword={false}
                  editable={!busy}
                  secureTextEntry={false}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  maxLength={120}
                />
                <CredentialInput
                  value={regPhone}
                  onChangeText={(value) => setRegPhone(value.slice(0, 30))}
                  placeholder="Phone (optional)"
                  isPassword={false}
                  editable={!busy}
                  secureTextEntry={false}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  maxLength={30}
                />
                <AppText variant="caption" style={styles.hint}>
                  Your email is used if you forget your PIN or password later.
                </AppText>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: regTermsAccepted }}
                  onPress={() => {
                    setRegTermsAccepted((value) => !value);
                    setError("");
                  }}
                  style={({ pressed }) => [styles.termsRow, pressed && styles.pressed]}
                >
                  <Ionicons
                    name={regTermsAccepted ? "checkbox" : "square-outline"}
                    size={24}
                    color={regTermsAccepted ? colors.primary : colors.mutedText}
                  />
                  <AppText variant="caption" style={styles.termsLabel}>
                    {TERMS_OF_USE_ACCEPT_LABEL}
                  </AppText>
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate("TermsOfUse")}
                  style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
                >
                  <AppText style={styles.linkLabel}>Read Terms of Use</AppText>
                </Pressable>
                {error ? <AppText variant="caption" style={styles.error}>{error}</AppText> : null}
                <Button
                  tone="primary"
                  onPress={submitRegistration}
                  disabled={!regName.trim() || !regEmail.includes("@") || !regTermsAccepted}
                >
                  Create my profile
                </Button>
              </>
            ) : null}

            {step === "setup" ? (
              <>
                <View style={styles.typeRow}>
                  <TypeChip
                    label="Password"
                    selected={credentialType === "password"}
                    onPress={() => {
                      setCredentialType("password");
                      clearDrafts();
                    }}
                  />
                  <TypeChip
                    label="PIN"
                    selected={credentialType === "pin"}
                    onPress={() => {
                      setCredentialType("pin");
                      clearDrafts();
                    }}
                  />
                </View>

                {biometricsAvailable ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setEnableFaceId((value) => !value)}
                    style={({ pressed }) => [
                      styles.faceToggle,
                      enableFaceId && styles.faceToggleOn,
                      pressed && styles.pressed
                    ]}
                  >
                    <Ionicons
                      name={hasFaceId ? "scan-outline" : "finger-print"}
                      size={22}
                      color={enableFaceId ? colors.onPrimary : colors.primaryDark}
                    />
                    <AppText style={enableFaceId ? styles.faceToggleLabelOn : styles.faceToggleLabel}>
                      {enableFaceId ? `${faceLabel} unlock on` : `Also use ${faceLabel}`}
                    </AppText>
                  </Pressable>
                ) : (
                  <AppText variant="caption" style={styles.hint}>
                    Face recognition isn’t set up on this phone yet. You can still use a PIN or password.
                  </AppText>
                )}

                <CredentialInput
                  value={credential}
                  onChangeText={(value) =>
                    setCredential(setupIsPassword ? value.slice(0, 64) : value.replace(/\D/g, "").slice(0, 8))
                  }
                  placeholder={setupIsPassword ? "Create password" : "Create PIN (4–8 digits)"}
                  isPassword={setupIsPassword}
                  editable={!busy}
                />
                <CredentialInput
                  value={confirmCredential}
                  onChangeText={(value) =>
                    setConfirmCredential(
                      setupIsPassword ? value.slice(0, 64) : value.replace(/\D/g, "").slice(0, 8)
                    )
                  }
                  placeholder={setupIsPassword ? "Confirm password" : "Confirm PIN"}
                  isPassword={setupIsPassword}
                  editable={!busy}
                />
                <CredentialInput
                  value={recoveryEmail}
                  onChangeText={(value) => setRecoveryEmail(value.slice(0, 120))}
                  placeholder="Recovery email"
                  isPassword={false}
                  editable={!busy}
                  secureTextEntry={false}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <AppText variant="caption" style={styles.hint}>
                  We’ll use this email if you forget your {setupIsPassword ? "password" : "PIN"}.
                </AppText>
                {setupIsPassword ? (
                  <AppText variant="caption" style={styles.hint}>
                    Use letters and at least one number.
                  </AppText>
                ) : null}
                {error ? <AppText variant="caption" style={styles.error}>{error}</AppText> : null}
                <Button
                  tone="primary"
                  onPress={() => void submitSetup()}
                  disabled={
                    busy ||
                    credential.length < (setupIsPassword ? 8 : 4) ||
                    !recoveryEmail.includes("@")
                  }
                >
                  Save and continue
                </Button>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    clearDrafts();
                    enterApp("Today");
                  }}
                  style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
                >
                  <AppText style={styles.linkLabel}>Not now — continue to app</AppText>
                </Pressable>
              </>
            ) : null}

            {(step === "unlock" || needsUnlock) && step !== "forgot" && step !== "recoveryCode" && step !== "reset" && step !== "recoveryShown" ? (
              <>
                {settings.biometricsEnabled && biometricsAvailable ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void unlockWithBiometrics()}
                    style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
                  >
                    <Ionicons name={hasFaceId ? "scan-outline" : "finger-print"} size={22} color={colors.onPrimary} />
                    <AppText style={styles.primaryLabel}>Open with {faceLabel}</AppText>
                  </Pressable>
                ) : null}

                <CredentialInput
                  value={credential}
                  onChangeText={(value) => {
                    setCredential(
                      unlockIsPassword ? value.slice(0, 64) : value.replace(/\D/g, "").slice(0, 8)
                    );
                    setError("");
                  }}
                  placeholder={unlockIsPassword ? "Enter password" : "Enter PIN"}
                  isPassword={unlockIsPassword}
                  editable={!busy && unlockLockoutMs <= 0}
                  onSubmitEditing={() => void submitUnlock()}
                />
                {unlockLockoutMs > 0 ? (
                  <AppText variant="caption" style={styles.error}>
                    Too many attempts. Try again in {Math.ceil(unlockLockoutMs / 1000)}s.
                  </AppText>
                ) : error ? (
                  <AppText variant="caption" style={styles.error}>{error}</AppText>
                ) : null}
                <Button
                  tone="primary"
                  onPress={() => void submitUnlock()}
                  disabled={
                    busy || unlockLockoutMs > 0 || credential.length < (unlockIsPassword ? 8 : 4)
                  }
                >
                  Sign in with {activeLabel}
                </Button>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setError("");
                    setStep("forgot");
                  }}
                  style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
                >
                  <AppText style={styles.linkLabel}>
                    {unlockIsPassword ? "Forgot password?" : "Forgot PIN?"}
                  </AppText>
                </Pressable>
              </>
            ) : null}

            {step === "forgot" ? (
              <>
                <AppText variant="muted" style={styles.centerCopy}>
                  Reset your {activeLabel} with Face ID/device passcode, an email reset link, or your
                  recovery code. Your nudges and profile stay on this phone — recovery only changes the lock,
                  and data is removed only if you uninstall the app.
                </AppText>
                <Button tone="primary" onPress={() => void recoverWithDevice()} disabled={busy}>
                  Reset with {faceLabel} / device passcode
                </Button>
                {settings.hasRecoveryEmail ? (
                  <Button tone="quiet" onPress={() => void emailResetLink()} disabled={busy}>
                    Email a reset link to {settings.recoveryEmail}
                  </Button>
                ) : (
                  <AppText variant="caption" style={styles.hint}>
                    No recovery email saved yet. Use Face ID/device passcode, your recovery code, or email
                    support.
                  </AppText>
                )}
                {settings.hasRecoveryCode ? (
                  <Button tone="quiet" onPress={() => setStep("recoveryCode")} disabled={busy}>
                    Use recovery code
                  </Button>
                ) : null}
                <Button tone="quiet" onPress={() => void emailSupportHelp()} disabled={busy}>
                  Email support for help
                </Button>
                {message ? <AppText variant="caption" style={styles.hint}>{message}</AppText> : null}
                {error ? <AppText variant="caption" style={styles.error}>{error}</AppText> : null}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    cancelPasswordRecovery();
                    setMessage("");
                    setStep("unlock");
                  }}
                  style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
                >
                  <AppText style={styles.linkLabel}>Back to sign in</AppText>
                </Pressable>
              </>
            ) : null}

            {step === "recoveryCode" ? (
              <>
                <CredentialInput
                  value={recoveryInput}
                  onChangeText={(value) => {
                    setRecoveryInput(value.toUpperCase().slice(0, 14));
                    setError("");
                  }}
                  placeholder="XXXX-XXXX-XXXX"
                  isPassword={false}
                  editable={!busy}
                  secureTextEntry={false}
                  onSubmitEditing={() => void recoverWithCode()}
                />
                {error ? <AppText variant="caption" style={styles.error}>{error}</AppText> : null}
                <Button
                  tone="primary"
                  onPress={() => void recoverWithCode()}
                  disabled={busy || recoveryInput.replace(/[^A-Za-z0-9]/g, "").length < 12}
                >
                  Continue
                </Button>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setStep("forgot")}
                  style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
                >
                  <AppText style={styles.linkLabel}>Back</AppText>
                </Pressable>
              </>
            ) : null}

            {step === "reset" ? (
              <>
                {message ? <AppText variant="caption" style={styles.hint}>{message}</AppText> : null}
                <View style={styles.typeRow}>
                  <TypeChip
                    label="Password"
                    selected={resetType === "password"}
                    onPress={() => {
                      setResetType("password");
                      clearDrafts();
                    }}
                  />
                  <TypeChip
                    label="PIN"
                    selected={resetType === "pin"}
                    onPress={() => {
                      setResetType("pin");
                      clearDrafts();
                    }}
                  />
                </View>
                <CredentialInput
                  value={credential}
                  onChangeText={(value) =>
                    setCredential(resetIsPassword ? value.slice(0, 64) : value.replace(/\D/g, "").slice(0, 8))
                  }
                  placeholder={resetIsPassword ? "New password" : "New PIN"}
                  isPassword={resetIsPassword}
                  editable={!busy}
                />
                <CredentialInput
                  value={confirmCredential}
                  onChangeText={(value) =>
                    setConfirmCredential(
                      resetIsPassword ? value.slice(0, 64) : value.replace(/\D/g, "").slice(0, 8)
                    )
                  }
                  placeholder={resetIsPassword ? "Confirm password" : "Confirm PIN"}
                  isPassword={resetIsPassword}
                  editable={!busy}
                />
                {error ? <AppText variant="caption" style={styles.error}>{error}</AppText> : null}
                <Button
                  tone="primary"
                  onPress={() => void submitReset()}
                  disabled={busy || credential.length < (resetIsPassword ? 8 : 4)}
                >
                  Save and unlock
                </Button>
              </>
            ) : null}

            {step === "recoveryShown" ? (
              <RecoveryCodeSaveCard
                code={freshRecoveryCode}
                onSaved={finishRecoveryAndEnter}
                continueLabel="I’ve saved it — continue"
              />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </FixedScreen>
  );
}

function CredentialInput({
  value,
  onChangeText,
  placeholder,
  isPassword,
  editable,
  secureTextEntry = true,
  keyboardType,
  autoCapitalize,
  maxLength,
  onSubmitEditing
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  isPassword: boolean;
  editable: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "number-pad" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "characters" | "sentences" | "words";
  maxLength?: number;
  onSubmitEditing?: () => void;
}) {
  const resolvedKeyboard =
    keyboardType ?? (isPassword || !secureTextEntry ? "default" : "number-pad");
  const resolvedCapitalize =
    autoCapitalize ?? (secureTextEntry ? "none" : "characters");
  const resolvedMax =
    maxLength ?? (keyboardType === "email-address" ? 120 : isPassword ? 64 : secureTextEntry ? 8 : 14);

  return (
    <TextInput
      style={[styles.credentialInput, (isPassword || !secureTextEntry) && styles.passwordInput]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedText}
      keyboardType={resolvedKeyboard}
      autoCapitalize={resolvedCapitalize}
      autoCorrect={false}
      autoComplete={keyboardType === "email-address" ? "email" : undefined}
      textContentType={keyboardType === "email-address" ? "emailAddress" : undefined}
      secureTextEntry={secureTextEntry}
      editable={editable}
      maxLength={resolvedMax}
      onSubmitEditing={onSubmitEditing}
    />
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
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    gap: spacing.lg,
    paddingBottom: spacing.md
  },
  hero: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primarySoft,
    opacity: 0.7
  },
  title: {
    textAlign: "center",
    letterSpacing: -0.6
  },
  profileName: {
    textAlign: "center",
    color: colors.accent,
    fontWeight: "600"
  },
  subtitle: {
    textAlign: "center",
    maxWidth: 320
  },
  panel: {
    gap: spacing.sm
  },
  primaryAction: {
    minHeight: 54,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadows.sm
  },
  secondaryAction: {
    minHeight: 54,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  faceToggle: {
    minHeight: 48,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md
  },
  faceToggleOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  faceToggleLabel: {
    color: colors.primaryDark,
    fontWeight: "600"
  },
  faceToggleLabelOn: {
    color: colors.onPrimary,
    fontWeight: "700"
  },
  credentialInput: {
    minHeight: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    fontSize: 22,
    letterSpacing: 6,
    textAlign: "center",
    color: colors.text
  },
  passwordInput: {
    fontSize: 18,
    letterSpacing: 1,
    textAlign: "left"
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
  linkBtn: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  linkLabel: {
    color: colors.accent,
    fontWeight: "600"
  },
  hint: {
    color: colors.mutedText,
    textAlign: "center"
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft
  },
  termsLabel: {
    flex: 1,
    color: colors.text,
    textAlign: "left"
  },
  centerCopy: {
    textAlign: "center"
  },
  error: {
    color: colors.danger,
    textAlign: "center"
  },
  primaryLabel: {
    color: colors.onPrimary,
    fontWeight: "700",
    fontSize: 16
  },
  secondaryLabel: {
    color: colors.primaryDark,
    fontWeight: "600",
    fontSize: 16
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }]
  }
});
