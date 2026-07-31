import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { gcm } from "@noble/ciphers/aes.js";
import { bytesToHex, hexToBytes, utf8ToBytes, bytesToUtf8 } from "@noble/ciphers/utils.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DATA_KEY_STORE = "nudge.security.dataKey.v1";
const ENCRYPTED_PREFIX = "nmr1:";

async function getOrCreateDataKey(): Promise<Uint8Array> {
  const existing = await SecureStore.getItemAsync(DATA_KEY_STORE);
  if (existing) {
    return hexToBytes(existing);
  }
  const bytes = await Crypto.getRandomBytesAsync(32);
  const key = new Uint8Array(bytes);
  await SecureStore.setItemAsync(DATA_KEY_STORE, bytesToHex(key));
  return key;
}

function isEncryptedPayload(raw: string) {
  return raw.startsWith(ENCRYPTED_PREFIX);
}

async function encryptString(plaintext: string): Promise<string> {
  const key = await getOrCreateDataKey();
  const nonceBytes = await Crypto.getRandomBytesAsync(12);
  const nonce = new Uint8Array(nonceBytes);
  const aes = gcm(key, nonce);
  const ciphertext = aes.encrypt(utf8ToBytes(plaintext));
  return `${ENCRYPTED_PREFIX}${bytesToHex(nonce)}:${bytesToHex(ciphertext)}`;
}

async function decryptString(payload: string): Promise<string> {
  const body = payload.slice(ENCRYPTED_PREFIX.length);
  const [nonceHex, cipherHex] = body.split(":");
  if (!nonceHex || !cipherHex) {
    throw new Error("Invalid encrypted payload");
  }
  const key = await getOrCreateDataKey();
  const aes = gcm(key, hexToBytes(nonceHex));
  const plaintext = aes.decrypt(hexToBytes(cipherHex));
  return bytesToUtf8(plaintext);
}

/** Read a string; migrates legacy plaintext into encrypted storage. */
export async function getEncryptedItem(key: string): Promise<string | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw == null) {
    return null;
  }
  if (!isEncryptedPayload(raw)) {
    await setEncryptedItem(key, raw);
    return raw;
  }
  try {
    return await decryptString(raw);
  } catch {
    return null;
  }
}

export async function setEncryptedItem(key: string, value: string) {
  const encrypted = await encryptString(value);
  await AsyncStorage.setItem(key, encrypted);
}

export async function removeEncryptedItem(key: string) {
  await AsyncStorage.removeItem(key);
}

export async function getEncryptedJson<T>(key: string): Promise<T | null> {
  const raw = await getEncryptedItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setEncryptedJson(key: string, value: unknown) {
  await setEncryptedItem(key, JSON.stringify(value));
}
