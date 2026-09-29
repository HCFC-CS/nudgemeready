import { Platform } from "react-native";

const WEB_PREFIX = "nmr-secure:";
const memory = new Map<string, string>();

/**
 * Match expo-secure-store's iOS default service name (`app`) so existing v3 keys
 * stay readable, but pass it explicitly — iOS 26 can throw if the service is unset.
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

/** expo-secure-store has no web implementation; use localStorage there. */
export async function getItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return webGet(key);
  }
  return enqueue(async () => {
    try {
      const Native = await loadNative();
      return await Native.getItemAsync(key, nativeOptions(Native));
    } catch {
      // iOS 26 Keychain exceptions must not abort launch.
      return null;
    }
  });
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    webSet(key, value);
    return;
  }
  await enqueue(async () => {
    try {
      const Native = await loadNative();
      await Native.setItemAsync(key, value, nativeOptions(Native));
    } catch {
      memory.set(key, value);
    }
  });
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (Platform.OS === "web") {
    webDelete(key);
    return;
  }
  await enqueue(async () => {
    try {
      const Native = await loadNative();
      await Native.deleteItemAsync(key, nativeOptions(Native));
    } catch {
      memory.delete(key);
    }
  });
}
