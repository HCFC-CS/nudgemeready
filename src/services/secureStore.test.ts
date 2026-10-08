import { afterEach, describe, expect, it, vi } from "vitest";

describe("secureStore web fallback", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("react-native");
    vi.unstubAllGlobals();
  });

  it("keeps native Keychain calls on iOS", async () => {
    vi.doMock("react-native", () => ({ Platform: { OS: "ios" } }));
    const getItemAsync = vi.fn(async () => "from-keychain");
    vi.doMock("expo-secure-store", () => ({
      getItemAsync,
      setItemAsync: vi.fn(),
      deleteItemAsync: vi.fn()
    }));
    const store = await import("./secureStore");
    await expect(store.getItemAsync("lock")).resolves.toBe("from-keychain");
    expect(getItemAsync).toHaveBeenCalledWith("lock");
  });

  it("uses localStorage on web so SecureStore does not blank the app", async () => {
    vi.doMock("react-native", () => ({ Platform: { OS: "web" } }));
    const getItemAsync = vi.fn();
    vi.doMock("expo-secure-store", () => ({
      getItemAsync,
      setItemAsync: vi.fn(),
      deleteItemAsync: vi.fn()
    }));
    const memory = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
      removeItem: (key: string) => {
        memory.delete(key);
      }
    });
    const store = await import("./secureStore");
    await store.setItemAsync("lock", "pin");
    await expect(store.getItemAsync("lock")).resolves.toBe("pin");
    await store.deleteItemAsync("lock");
    await expect(store.getItemAsync("lock")).resolves.toBeNull();
    expect(getItemAsync).not.toHaveBeenCalled();
  });

  it("keeps an in-memory copy if localStorage is missing", async () => {
    vi.doMock("react-native", () => ({ Platform: { OS: "web" } }));
    vi.doMock("expo-secure-store", () => ({
      getItemAsync: vi.fn(),
      setItemAsync: vi.fn(),
      deleteItemAsync: vi.fn()
    }));
    vi.stubGlobal("localStorage", undefined);
    const store = await import("./secureStore");
    await store.setItemAsync("lock", "pin");
    await expect(store.getItemAsync("lock")).resolves.toBe("pin");
  });
});
