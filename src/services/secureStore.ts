import { Platform } from "react-native";
import * as NativeSecureStore from "expo-secure-store";

const WEB_PREFIX = "nmr-secure:";
const memory = new Map<string, string>();

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

/** expo-secure-store has no web implementation; use localStorage there. */
export async function getItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return webGet(key);
  }
  return NativeSecureStore.getItemAsync(key);
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    webSet(key, value);
    return;
  }
  await NativeSecureStore.setItemAsync(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (Platform.OS === "web") {
    webDelete(key);
    return;
  }
  await NativeSecureStore.deleteItemAsync(key);
}
