import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const WEB_PREFIX = "nmr-secure:";
const ASYNC_PREFIX = "nmr-secure:";
const memory = new Map<string, string>();

/**
 * Match expo-secure-store's iOS default service name (`app`) so existing keys
 * stay readable if Keychain is used (Android). Pass it explicitly.
 */
const KEYCHAIN_SERVICE = "app";

type NativeSecureStore = typeof import("expo-secure-store");

let nativeModule: Promise<NativeSecureStore> | null = null;
let keychainQueue: Promise<unknown> = Promise.resolve();

function webGet(key: string): string | null {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(WEB_PREFIX + key);
    }
  } catch {
    // Private mode or missing storage.
  }
  return memory.get(key) ?? null;
}

function webSet(key: string, value: string) {
  memory.set(key, value);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(WEB_PREFIX + key, value);
    }
  } catch {
    // Keep the in-memory copy.
  }
}

function webDelete(key: string) {
  memory.delete(key);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(WEB_PREFIX + key);
    }
  } catch {
    // Ignore.
  }
}

function loadNative(): Promise<NativeSecureStore> {
  if (!nativeModule) {
    nativeModule = import("expo-secure-store");
  }
  return nativeModule;
}

function nativeOptions(Native: NativeSecureStore) {
  return {
    keychainService: KEYCHAIN_SERVICE,
    ...(Native.AFTER_FIRST_UNLOCK != null
      ? { keychainAccessible: Native.AFTER_FIRST_UNLOCK }
      : {})
  };
}

function enqueue<T>(work: () => Promise<T>): Promise<T> {
  const run = keychainQueue.then(work, work);
  keychainQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function fallbackGet(key: string): Promise<string | null> {
  if (memory.has(key)) {
    return memory.get(key) ?? null;
  }
  try {
    return await AsyncStorage.getItem(ASYNC_PREFIX + key);
  } catch {
    return null;
  }
}

async function fallbackSet(key: string, value: string): Promise<void> {
  memory.set(key, value);
  try {
    await AsyncStorage.setItem(ASYNC_PREFIX + key, value);
  } catch {
    // Keep the in-memory copy.
  }
}

async function fallbackDelete(key: string): Promise<void> {
  memory.delete(key);
  try {
    await AsyncStorage.removeItem(ASYNC_PREFIX + key);
  } catch {
    // Ignore.
  }
}

/**
 * iOS 26 aborts in release if expo-secure-store throws an NSException.
 * Keep secrets in the app sandbox via AsyncStorage on iPhone until that
 * native path is safe. Android still uses Keychain.
 */
function useNativeKeychain() {
  return Platform.OS === "android";
}

export async function getItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return webGet(key);
  }
  if (!useNativeKeychain()) {
    return fallbackGet(key);
  }
  return enqueue(async () => {
    try {
      const Native = await loadNative();
      return await Native.getItemAsync(key, nativeOptions(Native));
    } catch {
      return fallbackGet(key);
    }
  });
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    webSet(key, value);
    return;
  }
  if (!useNativeKeychain()) {
    await fallbackSet(key, value);
    return;
  }
  await enqueue(async () => {
    try {
      const Native = await loadNative();
      await Native.setItemAsync(key, value, nativeOptions(Native));
    } catch {
      await fallbackSet(key, value);
    }
  });
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (Platform.OS === "web") {
    webDelete(key);
    return;
  }
  if (!useNativeKeychain()) {
    await fallbackDelete(key);
    return;
  }
  await enqueue(async () => {
    try {
      const Native = await loadNative();
      await Native.deleteItemAsync(key, nativeOptions(Native));
    } catch {
      await fallbackDelete(key);
    }
  });
}
