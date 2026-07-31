import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { AppState, Linking, type AppStateStatus } from "react-native";

import {
  authenticateDeviceOwner,
  authenticateWithBiometrics,
  buildSupportRecoveryMailto,
  createEmailResetLink,
  credentialLabel,
  type CredentialType,
  disableAppLock,
  enableAppLock,
  getBiometricCapability,
  issueNewRecoveryCode,
  loadAppSecuritySettings,
  resetAppCredential,
  setBiometricsEnabled,
  setLockOnBackground,
  type AppSecuritySettings,
  updateRecoveryEmailWithCredential,
  verifyAppCredential,
  verifyEmailResetToken,
  verifyRecoveryCode
} from "../services/appSecurity";

const MAX_FAILED_ATTEMPTS = 5;
const BASE_LOCKOUT_MS = 30_000;

type AppSecurityContextValue = {
  isReady: boolean;
  isLocked: boolean;
  settings: AppSecuritySettings;
  biometricLabel: string;
  biometricsAvailable: boolean;
  hasFaceId: boolean;
  /** Milliseconds remaining in unlock lockout, or 0. */
  unlockLockoutMs: number;
  unlockWithCredential: (value: string) => Promise<boolean>;
  /** @deprecated use unlockWithCredential */
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  lockNow: () => void;
  turnOnLock: (
    value: string,
    type: CredentialType,
    options?: { biometricsEnabled?: boolean; recoveryEmail?: string }
  ) => Promise<string>;
  turnOffLock: (value: string) => Promise<void>;
  updateBiometrics: (enabled: boolean) => Promise<void>;
  updateLockOnBackground: (enabled: boolean) => Promise<void>;
  beginForgotPasswordWithDevice: () => Promise<boolean>;
  beginForgotPasswordWithRecoveryCode: (code: string) => Promise<boolean>;
  beginForgotPasswordWithEmailLink: () => Promise<void>;
  beginForgotPasswordWithEmailToken: (token: string) => Promise<boolean>;
  emailSupportForRecovery: () => Promise<void>;
  updateRecoveryEmail: (currentCredential: string, email: string) => Promise<void>;
  cancelPasswordRecovery: () => void;
  completePasswordReset: (value: string, type: CredentialType) => Promise<string>;
  finishPasswordReset: () => void;
  createReplacementRecoveryCode: (currentCredential: string) => Promise<string>;
  refresh: () => Promise<void>;
};

const defaultSettings: AppSecuritySettings = {
  lockEnabled: false,
  biometricsEnabled: false,
  lockOnBackground: true,
  hasCredential: false,
  hasPin: false,
  credentialType: "pin",
  hasRecoveryCode: false,
  recoveryEmail: null,
  hasRecoveryEmail: false
};

const AppSecurityContext = createContext<AppSecurityContextValue | undefined>(undefined);

function lockoutDurationMs(failedAttempts: number) {
  const rounds = Math.max(0, Math.floor(failedAttempts / MAX_FAILED_ATTEMPTS) - 1);
  return BASE_LOCKOUT_MS * Math.pow(2, rounds);
}

export function AppSecurityProvider({
  children,
  bypassLock = false
}: PropsWithChildren<{ bypassLock?: boolean }>) {
  const [isReady, setIsReady] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [settings, setSettings] = useState<AppSecuritySettings>(defaultSettings);
  const [biometricLabel, setBiometricLabel] = useState("Biometrics");
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [hasFaceId, setHasFaceId] = useState(false);
  const [recoveryAuthorized, setRecoveryAuthorized] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(0);
  const [nowTick, setNowTick] = useState(() => Date.now());

  const refresh = useCallback(async () => {
    const next = await loadAppSecuritySettings();
    const capability = await getBiometricCapability();
    setSettings(next);
    setBiometricLabel(capability.label);
    setBiometricsAvailable(capability.available);
    setHasFaceId(capability.hasFace);
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      const next = await loadAppSecuritySettings();
      if (!bypassLock && next.lockEnabled && next.hasCredential) {
        setIsLocked(true);
      }
      setIsReady(true);
    })();
  }, [bypassLock, refresh]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") {
        void refresh();
      }
    });
    return () => subscription.remove();
  }, [refresh]);

  // Only re-lock when the app truly backgrounds — not on iOS "inactive"
  // (Control Center, permission sheets, multitasking previews).
  useEffect(() => {
    if (bypassLock || !settings.lockEnabled || !settings.lockOnBackground) {
      return;
    }

    let previous: AppStateStatus = AppState.currentState;
    const subscription = AppState.addEventListener("change", (next) => {
      if (previous === "active" && next === "background") {
        setIsLocked(true);
        setRecoveryAuthorized(false);
      }
      previous = next;
    });
    return () => subscription.remove();
  }, [bypassLock, settings.lockEnabled, settings.lockOnBackground]);

  useEffect(() => {
    if (!lockoutUntil || Date.now() >= lockoutUntil) {
      return;
    }
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  const unlockLockoutMs = Math.max(0, lockoutUntil - nowTick);

  const clearLockout = useCallback(() => {
    setFailedAttempts(0);
    setLockoutUntil(0);
  }, []);

  const registerFailedUnlock = useCallback(() => {
    setFailedAttempts((prev) => {
      const next = prev + 1;
      if (next % MAX_FAILED_ATTEMPTS === 0) {
        setLockoutUntil(Date.now() + lockoutDurationMs(next));
      }
      return next;
    });
  }, []);

  const unlockWithCredential = useCallback(
    async (value: string) => {
      if (Date.now() < lockoutUntil) {
        return false;
      }
      const ok = await verifyAppCredential(value);
      if (ok) {
        setIsLocked(false);
        setRecoveryAuthorized(false);
        clearLockout();
      } else {
        registerFailedUnlock();
      }
      return ok;
    },
    [clearLockout, lockoutUntil, registerFailedUnlock]
  );

  const unlockWithBiometrics = useCallback(async () => {
    if (!settings.biometricsEnabled || Date.now() < lockoutUntil) {
      return false;
    }
    if (!biometricsAvailable) {
      await refresh();
      return false;
    }
    const fallback = `Use ${credentialLabel(settings.credentialType)}`;
    const ok = await authenticateWithBiometrics("Unlock Nudge me Ready", fallback);
    if (ok) {
      setIsLocked(false);
      setRecoveryAuthorized(false);
      clearLockout();
    } else {
      registerFailedUnlock();
    }
    return ok;
  }, [
    biometricsAvailable,
    clearLockout,
    lockoutUntil,
    refresh,
    registerFailedUnlock,
    settings.biometricsEnabled,
    settings.credentialType
  ]);

  const lockNow = useCallback(() => {
    if (settings.lockEnabled) {
      setIsLocked(true);
      setRecoveryAuthorized(false);
    }
  }, [settings.lockEnabled]);

  const turnOnLock = useCallback(
    async (
      value: string,
      type: CredentialType,
      options?: { biometricsEnabled?: boolean; recoveryEmail?: string }
    ) => {
      const recoveryCode = await enableAppLock(value, type, options);
      const next = await loadAppSecuritySettings();
      setSettings(next);
      setIsLocked(false);
      setRecoveryAuthorized(false);
      clearLockout();
      return recoveryCode;
    },
    [clearLockout]
  );

  const turnOffLock = useCallback(
    async (value: string) => {
      await disableAppLock(value);
      const next = await loadAppSecuritySettings();
      setSettings(next);
      setIsLocked(false);
      setRecoveryAuthorized(false);
      clearLockout();
    },
    [clearLockout]
  );

  const updateBiometrics = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const ok = await authenticateWithBiometrics(
          `Enable ${biometricLabel}`,
          `Use ${credentialLabel(settings.credentialType)}`
        );
        if (!ok) {
          throw new Error(`${biometricLabel} was not confirmed`);
        }
      }
      await setBiometricsEnabled(enabled);
      const next = await loadAppSecuritySettings();
      setSettings(next);
    },
    [biometricLabel, settings.credentialType]
  );

  const updateLockOnBackground = useCallback(async (enabled: boolean) => {
    await setLockOnBackground(enabled);
    const next = await loadAppSecuritySettings();
    setSettings(next);
  }, []);

  const beginForgotPasswordWithDevice = useCallback(async () => {
    const ok = await authenticateDeviceOwner(
      hasFaceId
        ? "Confirm with Face ID or your device passcode to reset your password"
        : "Confirm with biometrics or your device passcode to reset your password"
    );
    if (ok) {
      setRecoveryAuthorized(true);
      clearLockout();
    }
    return ok;
  }, [clearLockout, hasFaceId]);

  const beginForgotPasswordWithRecoveryCode = useCallback(
    async (code: string) => {
      const ok = await verifyRecoveryCode(code);
      if (ok) {
        setRecoveryAuthorized(true);
        clearLockout();
      }
      return ok;
    },
    [clearLockout]
  );

  const beginForgotPasswordWithEmailLink = useCallback(async () => {
    const reset = await createEmailResetLink();
    const canOpen = await Linking.canOpenURL(reset.mailtoUrl);
    if (!canOpen) {
      throw new Error("No email app is available on this phone");
    }
    await Linking.openURL(reset.mailtoUrl);
  }, []);

  const beginForgotPasswordWithEmailToken = useCallback(
    async (token: string) => {
      const ok = await verifyEmailResetToken(token);
      if (ok) {
        setRecoveryAuthorized(true);
        clearLockout();
      }
      return ok;
    },
    [clearLockout]
  );

  const emailSupportForRecovery = useCallback(async () => {
    const url = buildSupportRecoveryMailto(credentialLabel(settings.credentialType));
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      throw new Error("No email app is available on this phone");
    }
    await Linking.openURL(url);
  }, [settings.credentialType]);

  const updateRecoveryEmail = useCallback(async (currentCredential: string, email: string) => {
    await updateRecoveryEmailWithCredential(currentCredential, email);
    const next = await loadAppSecuritySettings();
    setSettings(next);
  }, []);

  const cancelPasswordRecovery = useCallback(() => {
    setRecoveryAuthorized(false);
  }, []);

  const completePasswordReset = useCallback(
    async (value: string, type: CredentialType) => {
      if (!recoveryAuthorized) {
        throw new Error("Confirm recovery first");
      }
      const recoveryCode = await resetAppCredential(value, type);
      const next = await loadAppSecuritySettings();
      setSettings(next);
      return recoveryCode;
    },
    [recoveryAuthorized]
  );

  const finishPasswordReset = useCallback(() => {
    setIsLocked(false);
    setRecoveryAuthorized(false);
    clearLockout();
  }, [clearLockout]);

  const createReplacementRecoveryCode = useCallback(async (currentCredential: string) => {
    const recoveryCode = await issueNewRecoveryCode(currentCredential);
    const next = await loadAppSecuritySettings();
    setSettings(next);
    return recoveryCode;
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      isLocked: bypassLock ? false : isLocked,
      settings,
      biometricLabel,
      biometricsAvailable,
      hasFaceId,
      unlockLockoutMs,
      unlockWithCredential,
      unlockWithPin: unlockWithCredential,
      unlockWithBiometrics,
      lockNow,
      turnOnLock,
      turnOffLock,
      updateBiometrics,
      updateLockOnBackground,
      beginForgotPasswordWithDevice,
      beginForgotPasswordWithRecoveryCode,
      beginForgotPasswordWithEmailLink,
      beginForgotPasswordWithEmailToken,
      emailSupportForRecovery,
      updateRecoveryEmail,
      cancelPasswordRecovery,
      completePasswordReset,
      finishPasswordReset,
      createReplacementRecoveryCode,
      refresh
    }),
    [
      isReady,
      bypassLock,
      isLocked,
      settings,
      biometricLabel,
      biometricsAvailable,
      hasFaceId,
      unlockLockoutMs,
      unlockWithCredential,
      unlockWithBiometrics,
      lockNow,
      turnOnLock,
      turnOffLock,
      updateBiometrics,
      updateLockOnBackground,
      beginForgotPasswordWithDevice,
      beginForgotPasswordWithRecoveryCode,
      beginForgotPasswordWithEmailLink,
      beginForgotPasswordWithEmailToken,
      emailSupportForRecovery,
      updateRecoveryEmail,
      cancelPasswordRecovery,
      completePasswordReset,
      finishPasswordReset,
      createReplacementRecoveryCode,
      refresh
    ]
  );

  return <AppSecurityContext.Provider value={value}>{children}</AppSecurityContext.Provider>;
}

export function useAppSecurity() {
  const context = useContext(AppSecurityContext);
  if (!context) {
    throw new Error("useAppSecurity must be used within AppSecurityProvider");
  }
  return context;
}

export function useOptionalAppSecurity() {
  return useContext(AppSecurityContext);
}
