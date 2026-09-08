import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
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
import { type AuthProvider, type ProfileIcon, useProfile } from "../hooks/useProfile";
import { createEmailResetLink, credentialLabel, SUPPORT_EMAIL, type CredentialType } from "../services/appSecurity";
import { pollCrewUnlockApproval, requestCrewUnlock } from "../services/crewUnlock";
import { isDevAdminAvailable } from "../services/devAdmin";
import { peekPendingInvite } from "../services/pendingDeepLinks";
import { resetSecurityLockPrompt } from "../services/securityLockPrompt";
import {
  isAppleSignInAvailable,
  isGoogleSignInConfigured,
  signInWithApple,
  signInWithGoogle
} from "../services/socialSignIn";
import {
  formatDateOfBirthDisplay,
  validateDateOfBirthForSignup
} from "../utils/dateOfBirth";
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
  | "crewUnlock"
  | "reset"
  | "recoveryShown";

export function SplashScreen({ navigation, route }: Props) {
  const { profile, completeRegistration, needsRegistration, isProfileReady } = useProfile();
  const { renameSelfProfile, setHasOwnNudgeWorld, myCrewMembers } = useCrew();
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
  const [autoEmailResetSent, setAutoEmailResetSent] = useState(false);
  const [crewUnlockToken, setCrewUnlockToken] = useState<string | undefined>();
  const [crewUnlockStatus, setCrewUnlockStatus] = useState<"pending" | "approved" | "expired">("pending");
  const crewUnlockPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
  const [regDob, setRegDob] = useState("");
  const [regAuthProvider, setRegAuthProvider] = useState<AuthProvider>("email");
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
  const needsSecuritySetup =
    bootReady && !needsRegistration && !settings.hasCredential && !needsUnlock;

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
      setRegDob(formatDateOfBirthDisplay(profile.dateOfBirth));
      setRegAuthProvider(profile.authProvider ?? "email");
      setRegIcon(profile.icon);
      setRegAvatarUri(profile.avatarUri);
      return;
    }
    if (needsSecuritySetup) {
      setStep("setup");
      setRecoveryEmail(profile.email || recoveryEmail);
      setEnableFaceId(biometricsAvailable);
      return;
    }
    if (
      step === "unlock" ||
      step === "forgot" ||
      step === "recoveryCode" ||
      step === "crewUnlock" ||
      step === "reset" ||
      step === "register" ||
      step === "setup"
    ) {
      setStep("welcome");
    }
  }, [bootReady, needsUnlock, needsRegistration, needsSecuritySetup, route.params?.recoverToken]);

  // If the user doesn't have a recovery code, auto-send the reset email on the "Forgot password" screen.
  // Safety: only auto-send when the stored recovery email matches the registered email from the device profile.
  useEffect(() => {
    if (step !== "forgot") {
      setAutoEmailResetSent(false);
      return;
    }
    if (!bootReady) {
      return;
    }
    if (busy || autoEmailResetSent) {
      return;
    }
    const registeredEmail = profile.email?.trim().toLowerCase();
    const recoveryEmail = settings.recoveryEmail?.trim().toLowerCase();
    if (!registeredEmail || !recoveryEmail) {
      return;
    }
    if (settings.hasRecoveryCode) {
      return;
    }
    if (!settings.hasRecoveryEmail || registeredEmail !== recoveryEmail) {
      return;
    }

    setAutoEmailResetSent(true);
    void emailResetLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, bootReady, busy, autoEmailResetSent, profile.email, settings.hasRecoveryCode, settings.hasRecoveryEmail, settings.recoveryEmail]);

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
    if (needsSecuritySetup || !settings.hasCredential) {
      setStep("setup");
      setRecoveryEmail(profile.email || recoveryEmail);
      setEnableFaceId(biometricsAvailable);
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

  async function applySocialSignIn(provider: "apple" | "google") {
    setBusy(true);
    setError("");
    try {
      const result = provider === "apple" ? await signInWithApple() : await signInWithGoogle();
      setRegAuthProvider(result.provider);
      if (result.name) {
        setRegName(result.name.slice(0, 40));
      }
      if (result.email) {
        setRegEmail(result.email.slice(0, 120));
        setRecoveryEmail(result.email.slice(0, 120));
      }
      setMessage(
        result.email
          ? `Signed in with ${provider === "apple" ? "Apple" : "Google"}. Confirm your details, add your date of birth, then continue.`
          : `Signed in with ${provider === "apple" ? "Apple" : "Google"}. Add your email and date of birth to continue.`
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign-in didn’t work. Try email instead.");
    } finally {
      setBusy(false);
    }
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
    let dateOfBirth: string;
    try {
      dateOfBirth = validateDateOfBirthForSignup(regDob);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Enter your date of birth.");
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
      dateOfBirth,
      authProvider: regAuthProvider,
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
    setMessage("");
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
      const result = await beginForgotPasswordWithEmailLink();
      setMessage(result.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start email reset.");
    } finally {
      setBusy(false);
    }
  }

  function normalizePhoneForSms(phone: string) {
    return phone.trim().replace(/\s+/g, "");
  }

  function normalizePhoneForWhatsApp(phone: string) {
    // WhatsApp “wa.me” wants digits only (often international, without '+').
    return phone.trim().replace(/[^\d]/g, "");
  }

  async function sendSmsResetLink() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const phone = normalizePhoneForSms(profile.phone);
      if (!phone) {
        setError("Add a phone number first.");
        return;
      }
      const reset = await createEmailResetLink();
      const resetText = [
        "Nudge me Ready reset link:",
        reset.webLink,
        reset.appLink,
        "Works on this phone only (24h)."
      ].join("\n");
      const url = `sms:${phone}?body=${encodeURIComponent(resetText)}`;
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        throw new Error("SMS isn’t available on this device.");
      }
      await Linking.openURL(url);
      setMessage("SMS draft opened. Send it to continue.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start SMS reset.");
    } finally {
      setBusy(false);
    }
  }

  async function sendWhatsAppResetLink() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const phone = normalizePhoneForWhatsApp(profile.phone);
      if (!phone) {
        setError("Add a phone number first.");
        return;
      }
      const reset = await createEmailResetLink();
      const resetText = [
        "Nudge me Ready reset link:",
        reset.webLink,
        reset.appLink,
        "Works on this phone only (24h)."
      ].join("\n");
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(resetText)}`;
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        throw new Error("WhatsApp isn’t available on this device.");
      }
      await Linking.openURL(url);
      setMessage("WhatsApp draft opened. Send it to continue.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start WhatsApp reset.");
    } finally {
      setBusy(false);
    }
  }

  async function askCrewMemberForResetLink() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const crewEmailCandidates = myCrewMembers.filter(
        (m) =>
          (m.roles.includes("captain") || m.roles.includes("guardian")) &&
          typeof m.email === "string" &&
          m.email.trim().includes("@")
      );

      if (!crewEmailCandidates.length) {
        setMessage("No captain/guardian email is available.");
        return;
      }

      const reset = await createEmailResetLink();
      const resetText = [
        "Reset links for Nudge me Ready:",
        reset.webLink,
        reset.appLink,
        "Works on the phone where the app is installed (24h, once)."
      ].join("\n");

      // Let the user pick the captain/guardian recipient (usually just one exists).
      const pickedEmail = await new Promise<string | null>((resolve) => {
        Alert.alert(
          "Ask for help",
          "Send the reset links to your captain or guardian so they can forward it.",
          [
            { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
            ...crewEmailCandidates.slice(0, 6).map((member) => ({
              text: member.name,
              onPress: () => resolve(member.email ?? null)
            }))
          ]
        );
      });

      if (!pickedEmail) {
        return;
      }

      const subject = encodeURIComponent("Nudge me Ready reset help");
      const body = encodeURIComponent(
        [
          `Hi ${crewEmailCandidates.find((m) => m.email === pickedEmail)?.name ?? "there"},`,
          "",
          "Please forward this reset link to the person trying to regain access (the phone with the app installed):",
          "",
          resetText,
          "",
          `Thanks,`,
          `${profile.name || "Nudge me Ready user"}`
        ].join("\n")
      );

      const url = `mailto:${encodeURIComponent(pickedEmail)}?subject=${subject}&body=${body}`;
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        throw new Error("Email isn’t available on this device.");
      }
      await Linking.openURL(url);
      setMessage("Email draft opened. Send it to your captain/guardian.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start crew reset.");
    } finally {
      setBusy(false);
    }
  }

  // Stop any in-progress poll when leaving the crewUnlock step.
  useEffect(() => {
    if (step !== "crewUnlock") {
      if (crewUnlockPollRef.current) {
        clearInterval(crewUnlockPollRef.current);
        crewUnlockPollRef.current = null;
      }
    }
  }, [step]);

  function startCrewUnlockPolling(token: string) {
    if (crewUnlockPollRef.current) {
      clearInterval(crewUnlockPollRef.current);
    }
    crewUnlockPollRef.current = setInterval(() => {
      void pollCrewUnlockApproval(token).then((status) => {
        if (status === "approved") {
          clearInterval(crewUnlockPollRef.current!);
          crewUnlockPollRef.current = null;
          setCrewUnlockStatus("approved");
          // Small delay so the user sees the "Approved!" message before moving on.
          setTimeout(() => {
            setResetType(settings.credentialType);
            setStep("reset");
            setMessage("Your captain approved. Choose a new PIN or password.");
          }, 1500);
        } else if (status === "expired") {
          clearInterval(crewUnlockPollRef.current!);
          crewUnlockPollRef.current = null;
          setCrewUnlockStatus("expired");
        }
      });
    }, 5000);
  }

  async function startCrewUnlock(captain: { name: string; email: string }) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await requestCrewUnlock({
        captainName: captain.name,
        captainEmail: captain.email,
        userName: profile.name || "the user"
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setCrewUnlockStatus("pending");
      setCrewUnlockToken(result.token);
      setStep("crewUnlock");
      setMessage(result.message);
      if (result.token) {
        startCrewUnlockPolling(result.token);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start crew unlock.");
    } finally {
      setBusy(false);
    }
  }

  function pickCrewUnlockMember() {
    const candidates = myCrewMembers.filter(
      (m) =>
        (m.roles.includes("captain") || m.roles.includes("guardian")) &&
        typeof m.email === "string" &&
        m.email.trim().includes("@")
    );

    if (!candidates.length) {
      setMessage("No captain or guardian with an email address found in your crew.");
      return;
    }

    if (candidates.length === 1) {
      void startCrewUnlock({ name: candidates[0]!.name, email: candidates[0]!.email! });
      return;
    }

    Alert.alert(
      "Who should approve?",
      "Choose a captain or guardian to send the approval to.",
      [
        { text: "Cancel", style: "cancel" },
        ...candidates.slice(0, 6).map((m) => ({
          text: m.name,
          onPress: () => void startCrewUnlock({ name: m.name, email: m.email! })
        }))
      ]
    );
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
                  ? "Name, email and date of birth — then a password or PIN"
                  : step === "setup"
                    ? "Set a password or PIN, and optionally Face ID"
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
                    ? "You’re joining to support someone. Create your profile first — details stay on your phone."
                    : "Create your account. Name, email and date of birth are required. Details stay on your phone."}
                </AppText>

                <View style={styles.ssoRow}>
                  {isAppleSignInAvailable() ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Sign in with Apple"
                      disabled={busy}
                      onPress={() => void applySocialSignIn("apple")}
                      style={({ pressed }) => [styles.ssoButton, pressed && styles.pressed]}
                    >
                      <Ionicons name="logo-apple" size={20} color={colors.text} />
                      <AppText style={styles.ssoLabel}>Apple</AppText>
                    </Pressable>
                  ) : null}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Sign in with Google"
                    disabled={busy}
                    onPress={() => void applySocialSignIn("google")}
                    style={({ pressed }) => [styles.ssoButton, pressed && styles.pressed]}
                  >
                    <Ionicons name="logo-google" size={20} color={colors.text} />
                    <AppText style={styles.ssoLabel}>Google</AppText>
                  </Pressable>
                </View>
                <AppText variant="caption" style={styles.hint}>
                  {isGoogleSignInConfigured()
                    ? "Apple or Google fills your name and email faster. You still set a password or PIN next."
                    : "Apple fills your name and email faster on iPhone. Google Sign-In needs a configured build. You still set a password or PIN next."}
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
                  textContentType="name"
                  autoComplete="name"
                />
                <CredentialInput
                  value={regEmail}
                  onChangeText={(value) => {
                    setRegEmail(value.slice(0, 120));
                    setRegAuthProvider("email");
                    setError("");
                  }}
                  placeholder="Email address"
                  isPassword={false}
                  editable={!busy}
                  secureTextEntry={false}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  maxLength={120}
                  textContentType="username"
                  autoComplete="email"
                />
                <CredentialInput
                  value={regDob}
                  onChangeText={(value) => {
                    setRegDob(value.slice(0, 10));
                    setError("");
                  }}
                  placeholder="Date of birth (e.g. 15/06/1958)"
                  isPassword={false}
                  editable={!busy}
                  secureTextEntry={false}
                  keyboardType="default"
                  autoCapitalize="none"
                  maxLength={10}
                  textContentType="none"
                  autoComplete="birthdate-full"
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
                  textContentType="telephoneNumber"
                  autoComplete="tel"
                />
                <AppText variant="caption" style={styles.hint}>
                  Your email is used for password reset emails from support@nudgemeready.app.
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
                {message ? <AppText variant="caption" style={styles.hint}>{message}</AppText> : null}
                {error ? <AppText variant="caption" style={styles.error}>{error}</AppText> : null}
                <Button
                  tone="primary"
                  onPress={submitRegistration}
                  disabled={
                    !regName.trim() || !regEmail.includes("@") || !regDob.trim() || !regTermsAccepted
                  }
                >
                  Continue
                </Button>
              </>
            ) : null}

            {step === "setup" ? (
              <>
                <AppText variant="muted" style={styles.centerCopy}>
                  Choose a password (saved to your phone’s password manager when offered) or a PIN.
                  You can also turn on {faceLabel} for a quicker open.
                </AppText>
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
                  textContentType={setupIsPassword ? "newPassword" : "oneTimeCode"}
                  autoComplete={setupIsPassword ? "new-password" : "off"}
                  passwordRules={
                    setupIsPassword ? "minlength: 8; required: lower; required: upper; required: digit;" : undefined
                  }
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
                  textContentType={setupIsPassword ? "newPassword" : "oneTimeCode"}
                  autoComplete={setupIsPassword ? "new-password" : "off"}
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
                  textContentType="username"
                  autoComplete="email"
                />
                <AppText variant="caption" style={styles.hint}>
                  Forgotten {setupIsPassword ? "password" : "PIN"} emails go via support@nudgemeready.app
                  with an automated reset link back to this address.
                </AppText>
                {setupIsPassword ? (
                  <AppText variant="caption" style={styles.hint}>
                    Use letters and at least one number. Save it in your password manager when asked.
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
                  textContentType={unlockIsPassword ? "password" : "oneTimeCode"}
                  autoComplete={unlockIsPassword ? "password" : "off"}
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
                  Your nudges are safe. Let's get you back in.
                </AppText>

                {/* Easiest option first — biometrics */}
                <Button tone="primary" onPress={() => void recoverWithDevice()} disabled={busy}>
                  Use {faceLabel} / device passcode
                </Button>

                {/* Email reset — auto-sent if email matches */}
                {settings.hasRecoveryEmail ? (
                  <Button tone="quiet" onPress={() => void emailResetLink()} disabled={busy}>
                    Send reset link to my email
                  </Button>
                ) : null}

                {/* SMS / WhatsApp — only if phone on file */}
                {settings.hasRecoveryEmail && profile.phone.trim() ? (
                  <>
                    <Button tone="quiet" onPress={() => void sendSmsResetLink()} disabled={busy}>
                      Send reset link by text
                    </Button>
                    <Button tone="quiet" onPress={() => void sendWhatsAppResetLink()} disabled={busy}>
                      Send reset link via WhatsApp
                    </Button>
                  </>
                ) : null}

                {/* Captain / guardian approval */}
                {myCrewMembers.some(
                  (m) =>
                    (m.roles.includes("captain") || m.roles.includes("guardian")) &&
                    typeof m.email === "string" &&
                    m.email.trim().includes("@")
                ) ? (
                  <Button tone="quiet" onPress={pickCrewUnlockMember} disabled={busy}>
                    Ask a Crew Captain or guardian to let me in
                  </Button>
                ) : null}

                {/* Recovery code — last resort */}
                {settings.hasRecoveryCode ? (
                  <Button tone="quiet" onPress={() => setStep("recoveryCode")} disabled={busy}>
                    Use my recovery code
                  </Button>
                ) : null}

                {message ? <AppText variant="caption" style={styles.hint}>{message}</AppText> : null}
                {error ? <AppText variant="caption" style={styles.error}>{error}</AppText> : null}

                {/* Support — very bottom */}
                <Button tone="quiet" onPress={() => void emailSupportHelp()} disabled={busy}>
                  Contact support
                </Button>

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

            {step === "crewUnlock" ? (
              <>
                {crewUnlockStatus === "approved" ? (
                  <AppText variant="muted" style={styles.centerCopy}>
                    ✓ Approved! Opening reset…
                  </AppText>
                ) : crewUnlockStatus === "expired" ? (
                  <>
                    <AppText variant="muted" style={styles.centerCopy}>
                      The approval link expired before your captain could open it.
                    </AppText>
                    <Button tone="quiet" onPress={pickCrewUnlockMember} disabled={busy}>
                      Try again
                    </Button>
                  </>
                ) : (
                  <AppText variant="muted" style={styles.centerCopy}>
                    Waiting for approval… This screen will update automatically once your captain
                    or guardian taps the link in their email.
                  </AppText>
                )}
                {message ? <AppText variant="caption" style={styles.hint}>{message}</AppText> : null}
                {error ? <AppText variant="caption" style={styles.error}>{error}</AppText> : null}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    cancelPasswordRecovery();
                    setCrewUnlockToken(undefined);
                    setCrewUnlockStatus("pending");
                    setMessage("");
                    setStep("forgot");
                  }}
                  style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
                >
                  <AppText style={styles.linkLabel}>Back</AppText>
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
  onSubmitEditing,
  textContentType,
  autoComplete,
  passwordRules
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
  textContentType?:
    | "none"
    | "name"
    | "username"
    | "password"
    | "newPassword"
    | "oneTimeCode"
    | "emailAddress"
    | "telephoneNumber";
  autoComplete?:
    | "off"
    | "name"
    | "email"
    | "password"
    | "new-password"
    | "tel"
    | "birthdate-full"
    | "username";
  passwordRules?: string;
}) {
  const resolvedKeyboard =
    keyboardType ?? (isPassword || !secureTextEntry ? "default" : "number-pad");
  const resolvedCapitalize =
    autoCapitalize ?? (secureTextEntry ? "none" : "characters");
  const resolvedMax =
    maxLength ?? (keyboardType === "email-address" ? 120 : isPassword ? 64 : secureTextEntry ? 8 : 14);
  const resolvedContentType =
    textContentType ??
    (keyboardType === "email-address"
      ? "emailAddress"
      : isPassword && secureTextEntry
        ? "password"
        : undefined);
  const resolvedAutoComplete =
    autoComplete ??
    (keyboardType === "email-address" ? "email" : isPassword && secureTextEntry ? "password" : undefined);

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
      autoComplete={resolvedAutoComplete}
      textContentType={resolvedContentType}
      passwordRules={passwordRules}
      secureTextEntry={secureTextEntry}
      editable={editable}
      maxLength={resolvedMax}
      onSubmitEditing={onSubmitEditing}
      importantForAutofill="yes"
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
  ssoRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  ssoButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  ssoLabel: {
    color: colors.text,
    fontWeight: "600"
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
