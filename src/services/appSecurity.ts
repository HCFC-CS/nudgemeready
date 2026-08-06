import * as Crypto from "expo-crypto";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/ciphers/utils.js";

const LOCK_ENABLED_KEY = "nudge.security.lockEnabled";
const BIOMETRICS_KEY = "nudge.security.biometricsEnabled";
const LOCK_ON_BACKGROUND_KEY = "nudge.security.lockOnBackground";
const CREDENTIAL_HASH_KEY = "nudge.security.pinHash";
const CREDENTIAL_SALT_KEY = "nudge.security.pinSalt";
const CREDENTIAL_TYPE_KEY = "nudge.security.credentialType";
const RECOVERY_HASH_KEY = "nudge.security.recoveryHash";
const RECOVERY_SALT_KEY = "nudge.security.recoverySalt";
const RECOVERY_EMAIL_KEY = "nudge.security.recoveryEmail";
const RESET_TOKEN_HASH_KEY = "nudge.security.resetTokenHash";
const RESET_TOKEN_SALT_KEY = "nudge.security.resetTokenSalt";
const RESET_TOKEN_EXPIRES_KEY = "nudge.security.resetTokenExpires";

const PBKDF2_ITERATIONS = 100_000;
const HASH_PREFIX = "pbkdf2$";
const RESET_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const SUPPORT_EMAIL = "support@nudgemeready.app";

export type CredentialType = "pin" | "password";

export type AppSecuritySettings = {
  lockEnabled: boolean;
  biometricsEnabled: boolean;
  lockOnBackground: boolean;
  hasCredential: boolean;
  /** @deprecated use hasCredential */
  hasPin: boolean;
  credentialType: CredentialType;
  hasRecoveryCode: boolean;
  recoveryEmail: string | null;
  hasRecoveryEmail: boolean;
};

async function readFlag(key: string, fallback = false) {
  const raw = await SecureStore.getItemAsync(key);
  if (raw == null) {
    return fallback;
  }
  return raw === "true";
}

async function writeFlag(key: string, value: boolean) {
  await SecureStore.setItemAsync(key, value ? "true" : "false");
}

function normalizeCredentialType(raw: string | null): CredentialType {
  return raw === "password" ? "password" : "pin";
}

export async function loadAppSecuritySettings(): Promise<AppSecuritySettings> {
  const [
    lockEnabled,
    biometricsEnabled,
    lockOnBackground,
    credentialHash,
    credentialTypeRaw,
    recoveryHash,
    recoveryEmail
  ] = await Promise.all([
    readFlag(LOCK_ENABLED_KEY, false),
    readFlag(BIOMETRICS_KEY, false),
    readFlag(LOCK_ON_BACKGROUND_KEY, true),
    SecureStore.getItemAsync(CREDENTIAL_HASH_KEY),
    SecureStore.getItemAsync(CREDENTIAL_TYPE_KEY),
    SecureStore.getItemAsync(RECOVERY_HASH_KEY),
    SecureStore.getItemAsync(RECOVERY_EMAIL_KEY)
  ]);
  const hasCredential = Boolean(credentialHash);
  const email = recoveryEmail?.trim() || null;
  return {
    lockEnabled,
    biometricsEnabled,
    lockOnBackground,
    hasCredential,
    hasPin: hasCredential,
    credentialType: normalizeCredentialType(credentialTypeRaw),
    hasRecoveryCode: Boolean(recoveryHash),
    recoveryEmail: email,
    hasRecoveryEmail: Boolean(email)
  };
}

function hashWithPbkdf2(value: string, saltHex: string) {
  const derived = pbkdf2(sha256, utf8ToBytes(value), hexToBytes(saltHex), {
    c: PBKDF2_ITERATIONS,
    dkLen: 32
  });
  return `${HASH_PREFIX}${bytesToHex(derived)}`;
}

async function hashValueLegacy(value: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${value}`);
}

async function createSaltHex() {
  const saltBytes = await Crypto.getRandomBytesAsync(16);
  return bytesToHex(new Uint8Array(saltBytes));
}

function normalizeRecoveryCode(code: string) {
  return code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function formatRecoveryCode(code: string) {
  const cleaned = normalizeRecoveryCode(code);
  return cleaned.match(/.{1,4}/g)?.join("-") ?? cleaned;
}

export async function generateRecoveryCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = await Crypto.getRandomBytesAsync(12);
  let raw = "";
  for (let index = 0; index < 12; index += 1) {
    raw += alphabet[bytes[index]! % alphabet.length];
  }
  return formatRecoveryCode(raw);
}

async function storeRecoveryCode(code: string) {
  const cleaned = normalizeRecoveryCode(code);
  const salt = await createSaltHex();
  const hash = hashWithPbkdf2(cleaned, salt);
  await SecureStore.setItemAsync(RECOVERY_SALT_KEY, salt);
  await SecureStore.setItemAsync(RECOVERY_HASH_KEY, hash);
}

export async function verifyRecoveryCode(code: string) {
  const [salt, hash] = await Promise.all([
    SecureStore.getItemAsync(RECOVERY_SALT_KEY),
    SecureStore.getItemAsync(RECOVERY_HASH_KEY)
  ]);
  if (!salt || !hash) {
    return false;
  }
  const cleaned = normalizeRecoveryCode(code);
  if (hash.startsWith(HASH_PREFIX)) {
    return hashWithPbkdf2(cleaned, salt) === hash;
  }
  const legacy = await hashValueLegacy(cleaned, salt);
  if (legacy !== hash) {
    return false;
  }
  await storeRecoveryCode(cleaned);
  return true;
}

async function clearRecoveryCode() {
  await SecureStore.deleteItemAsync(RECOVERY_HASH_KEY);
  await SecureStore.deleteItemAsync(RECOVERY_SALT_KEY);
}

export function validateCredential(value: string, type: CredentialType) {
  const cleaned = value.trim();
  if (type === "pin") {
    if (!/^\d{4,8}$/.test(cleaned)) {
      throw new Error("PIN must be 4–8 digits");
    }
    return cleaned;
  }
  if (cleaned.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (cleaned.length > 64) {
    throw new Error("Password must be 64 characters or fewer");
  }
  if (!/[A-Za-z]/.test(cleaned) || !/\d/.test(cleaned)) {
    throw new Error("Password needs letters and at least one number");
  }
  return cleaned;
}

export function validateRecoveryEmail(email: string) {
  const cleaned = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned) || cleaned.length > 120) {
    throw new Error("Enter a valid recovery email");
  }
  return cleaned;
}

export async function setRecoveryEmail(email: string) {
  const cleaned = validateRecoveryEmail(email);
  await SecureStore.setItemAsync(RECOVERY_EMAIL_KEY, cleaned);
  return cleaned;
}

export async function clearRecoveryEmail() {
  await SecureStore.deleteItemAsync(RECOVERY_EMAIL_KEY);
}

async function clearEmailResetToken() {
  await SecureStore.deleteItemAsync(RESET_TOKEN_HASH_KEY);
  await SecureStore.deleteItemAsync(RESET_TOKEN_SALT_KEY);
  await SecureStore.deleteItemAsync(RESET_TOKEN_EXPIRES_KEY);
}

/** Creates a one-time reset token and mailto:/app link for the recovery email. */
export async function createEmailResetLink() {
  const email = await SecureStore.getItemAsync(RECOVERY_EMAIL_KEY);
  if (!email) {
    throw new Error("Add a recovery email in Settings first");
  }
  const tokenBytes = await Crypto.getRandomBytesAsync(24);
  const token = bytesToHex(new Uint8Array(tokenBytes));
  const salt = await createSaltHex();
  const hash = hashWithPbkdf2(token, salt);
  await SecureStore.setItemAsync(RESET_TOKEN_SALT_KEY, salt);
  await SecureStore.setItemAsync(RESET_TOKEN_HASH_KEY, hash);
  await SecureStore.setItemAsync(RESET_TOKEN_EXPIRES_KEY, String(Date.now() + RESET_TOKEN_TTL_MS));

  const webLink = `https://nudgemeready.app/recover?t=${token}`;
  const appLink = `nudge-me://recover?t=${token}`;
  return {
    email,
    token,
    webLink,
    appLink,
    mailtoUrl: buildRecoveryMailto(email, webLink, appLink)
  };
}

export function buildRecoveryMailto(email: string, webLink: string, appLink: string) {
  const subject = encodeURIComponent("Reset your Nudge me Ready sign-in");
  const body = encodeURIComponent(
    [
      "Hi,",
      "",
      "Tap one of these links on the phone where Nudge me Ready is installed to reset your PIN or password:",
      "",
      webLink,
      "",
      "Or open this app link:",
      appLink,
      "",
      "This link works for 24 hours and can only be used once.",
      "If you didn’t ask for this, you can ignore this email.",
      "",
      "— Nudge me Ready"
    ].join("\n")
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

export function buildSupportRecoveryMailto(credentialLabelText: string) {
  const subject = encodeURIComponent(`Help resetting my Nudge me Ready ${credentialLabelText}`);
  const body = encodeURIComponent(
    [
      "Hi Nudge me Ready support,",
      "",
      `I need help resetting my app ${credentialLabelText}.`,
      "",
      "Device:",
      "What I’ve already tried:",
      "",
      "Thanks"
    ].join("\n")
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

export async function verifyEmailResetToken(token: string) {
  const cleaned = token.trim();
  if (!cleaned) {
    return false;
  }
  const [salt, hash, expiresRaw] = await Promise.all([
    SecureStore.getItemAsync(RESET_TOKEN_SALT_KEY),
    SecureStore.getItemAsync(RESET_TOKEN_HASH_KEY),
    SecureStore.getItemAsync(RESET_TOKEN_EXPIRES_KEY)
  ]);
  if (!salt || !hash || !expiresRaw) {
    return false;
  }
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || Date.now() > expires) {
    await clearEmailResetToken();
    return false;
  }
  const ok = hashWithPbkdf2(cleaned, salt) === hash;
  if (ok) {
    await clearEmailResetToken();
  }
  return ok;
}

export function parseRecoverTokenFromUrl(url: string) {
  try {
    const normalized = url.replace(/^nudge-me:\/\//i, "https://nudgemeready.app/");
    const parsed = new URL(normalized);
    const path = parsed.pathname.replace(/\/+$/, "");
    if (path.endsWith("/recover") || path === "/recover" || parsed.host === "recover") {
      return parsed.searchParams.get("t");
    }
    if (parsed.searchParams.has("t") && /recover/i.test(url)) {
      return parsed.searchParams.get("t");
    }
  } catch {
    return null;
  }
  return null;
}

export async function setAppCredential(value: string, type: CredentialType) {
  const cleaned = validateCredential(value, type);
  const salt = await createSaltHex();
  const hash = hashWithPbkdf2(cleaned, salt);
  await SecureStore.setItemAsync(CREDENTIAL_SALT_KEY, salt);
  await SecureStore.setItemAsync(CREDENTIAL_HASH_KEY, hash);
  await SecureStore.setItemAsync(CREDENTIAL_TYPE_KEY, type);
}

export async function verifyAppCredential(value: string) {
  const [salt, hash, typeRaw] = await Promise.all([
    SecureStore.getItemAsync(CREDENTIAL_SALT_KEY),
    SecureStore.getItemAsync(CREDENTIAL_HASH_KEY),
    SecureStore.getItemAsync(CREDENTIAL_TYPE_KEY)
  ]);
  if (!salt || !hash) {
    return false;
  }
  const cleaned = value.trim();
  if (hash.startsWith(HASH_PREFIX)) {
    return hashWithPbkdf2(cleaned, salt) === hash;
  }
  const legacy = await hashValueLegacy(cleaned, salt);
  if (legacy !== hash) {
    return false;
  }
  // Upgrade legacy SHA-256 hashes to PBKDF2 on successful unlock.
  await setAppCredential(cleaned, normalizeCredentialType(typeRaw));
  return true;
}

/** @deprecated use verifyAppCredential */
export async function verifyAppPin(pin: string) {
  return verifyAppCredential(pin);
}

export async function clearAppCredential() {
  await SecureStore.deleteItemAsync(CREDENTIAL_HASH_KEY);
  await SecureStore.deleteItemAsync(CREDENTIAL_SALT_KEY);
  await SecureStore.deleteItemAsync(CREDENTIAL_TYPE_KEY);
  await clearRecoveryCode();
  await clearRecoveryEmail();
  await clearEmailResetToken();
}

export async function enableAppLock(
  value: string,
  type: CredentialType,
  options?: { biometricsEnabled?: boolean; recoveryEmail?: string }
) {
  await setAppCredential(value, type);
  if (options?.recoveryEmail) {
    await setRecoveryEmail(options.recoveryEmail);
  }
  const recoveryCode = await generateRecoveryCode();
  await storeRecoveryCode(recoveryCode);
  await writeFlag(LOCK_ENABLED_KEY, true);
  await writeFlag(LOCK_ON_BACKGROUND_KEY, true);
  if (options?.biometricsEnabled != null) {
    await writeFlag(BIOMETRICS_KEY, options.biometricsEnabled);
  }
  return recoveryCode;
}

export async function disableAppLock(value: string) {
  const ok = await verifyAppCredential(value);
  if (!ok) {
    const settings = await loadAppSecuritySettings();
    throw new Error(settings.credentialType === "password" ? "Password is incorrect" : "PIN is incorrect");
  }
  await writeFlag(LOCK_ENABLED_KEY, false);
  await writeFlag(BIOMETRICS_KEY, false);
  await clearAppCredential();
}

/** Reset password/PIN after proving recovery. Returns a fresh recovery code. */
export async function resetAppCredential(value: string, type: CredentialType) {
  await setAppCredential(value, type);
  const recoveryCode = await generateRecoveryCode();
  await storeRecoveryCode(recoveryCode);
  return recoveryCode;
}

/**
 * Developer/support lock reset. Rotates PIN/password + recovery code only.
 * Never touches the data encryption key or AsyncStorage user content.
 */
export async function adminResetLockKeepData(
  value: string,
  type: CredentialType,
  options?: { biometricsEnabled?: boolean; recoveryEmail?: string }
) {
  await setAppCredential(value, type);
  if (options?.recoveryEmail) {
    await setRecoveryEmail(options.recoveryEmail);
  }
  const recoveryCode = await generateRecoveryCode();
  await storeRecoveryCode(recoveryCode);
  await writeFlag(LOCK_ENABLED_KEY, true);
  await writeFlag(LOCK_ON_BACKGROUND_KEY, true);
  if (options?.biometricsEnabled != null) {
    await writeFlag(BIOMETRICS_KEY, options.biometricsEnabled);
  }
  await clearEmailResetToken();
  return recoveryCode;
}

export async function issueNewRecoveryCode(currentCredential: string) {
  const ok = await verifyAppCredential(currentCredential);
  if (!ok) {
    const settings = await loadAppSecuritySettings();
    throw new Error(settings.credentialType === "password" ? "Password is incorrect" : "PIN is incorrect");
  }
  const recoveryCode = await generateRecoveryCode();
  await storeRecoveryCode(recoveryCode);
  return recoveryCode;
}

export async function updateRecoveryEmailWithCredential(currentCredential: string, email: string) {
  const ok = await verifyAppCredential(currentCredential);
  if (!ok) {
    const settings = await loadAppSecuritySettings();
    throw new Error(settings.credentialType === "password" ? "Password is incorrect" : "PIN is incorrect");
  }
  return setRecoveryEmail(email);
}

export async function setBiometricsEnabled(enabled: boolean) {
  await writeFlag(BIOMETRICS_KEY, enabled);
}

export async function setLockOnBackground(enabled: boolean) {
  await writeFlag(LOCK_ON_BACKGROUND_KEY, enabled);
}

export type BiometricCapability = {
  available: boolean;
  label: string;
  hasFace: boolean;
  hasFingerprint: boolean;
};

export async function getBiometricCapability(): Promise<BiometricCapability> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = compatible ? await LocalAuthentication.isEnrolledAsync() : false;
  const types = enrolled ? await LocalAuthentication.supportedAuthenticationTypesAsync() : [];
  const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
  const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
  const label = hasFace ? "Face ID" : hasFingerprint ? "Touch ID" : "Biometrics";
  return { available: compatible && enrolled, label, hasFace, hasFingerprint };
}

export async function authenticateWithBiometrics(
  promptMessage = "Unlock Nudge me Ready",
  cancelLabel = "Use password"
) {
  const capability = await getBiometricCapability();
  if (!capability.available) {
    return false;
  }
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel,
    disableDeviceFallback: true
  });
  return result.success;
}

/** Prove device ownership for forgot-password (Face ID / Touch ID / device passcode). */
export async function authenticateDeviceOwner(
  promptMessage = "Confirm it’s you to reset your Nudge me Ready password"
) {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    fallbackLabel: "Device passcode",
    cancelLabel: "Cancel",
    disableDeviceFallback: false
  });
  if (result.success) {
    return true;
  }
  if (!hasHardware && !result.success) {
    return false;
  }
  return false;
}

export function credentialLabel(type: CredentialType) {
  return type === "password" ? "password" : "PIN";
}
