/**
 * Web-only shim for `expo-secure-store`.
 *
 * Expo ships an empty web module for SecureStore (`export default {}`), so any
 * call such as `getItemAsync` throws on web. The app only targets web for local
 * development previews and the screenshot pipeline (`npm run screenshots`, plus
 * the `?screenshot=` bypass in `App.tsx`), never for shipping secrets, so a
 * browser-storage-backed fallback keeps the app renderable on web while leaving
 * native builds on the real, hardware-backed SecureStore.
 *
 * Only the surface the app uses is implemented: getItemAsync, setItemAsync and
 * deleteItemAsync. Native (`ios`/`android`) never resolves this file.
 */
const PREFIX = "expo-secure-store-web:";

function getStore() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Access to localStorage can throw in sandboxed contexts.
  }
  return null;
}

const memoryStore = new Map();

async function getItemAsync(key) {
  const store = getStore();
  if (store) {
    const value = store.getItem(PREFIX + key);
    return value == null ? null : value;
  }
  return memoryStore.has(key) ? memoryStore.get(key) : null;
}

async function setItemAsync(key, value) {
  const store = getStore();
  if (store) {
    store.setItem(PREFIX + key, value);
    return;
  }
  memoryStore.set(key, value);
}

async function deleteItemAsync(key) {
  const store = getStore();
  if (store) {
    store.removeItem(PREFIX + key);
    return;
  }
  memoryStore.delete(key);
}

async function isAvailableAsync() {
  return true;
}

module.exports = {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
  isAvailableAsync
};
