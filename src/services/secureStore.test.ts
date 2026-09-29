import { beforeEach, describe, expect, it, vi } from "vitest";

describe("secureStore", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("round-trips a value on iOS without Keychain", async () => {
    const { deleteItemAsync, getItemAsync, setItemAsync } = await import("./secureStore");
    await setItemAsync("guide-test-key", "kept-local");
    expect(await getItemAsync("guide-test-key")).toBe("kept-local");
    await deleteItemAsync("guide-test-key");
    expect(await getItemAsync("guide-test-key")).toBeNull();
  });

  it("does not call expo-secure-store on iOS", async () => {
    const stub = await import("../test/expoSecureStoreStub.cjs");
    stub.state.setItemKeys.length = 0;
    const { setItemAsync } = await import("./secureStore");
    await setItemAsync("no-keychain-key", "value");
    expect(stub.state.setItemKeys).toEqual([]);
  });

  it("returns null when sandbox storage get throws", async () => {
    const stub = await import("../test/asyncStorageStub.cjs");
    stub.state.throwOnGet = true;
    const { getItemAsync } = await import("./secureStore");
    await expect(getItemAsync("broken")).resolves.toBeNull();
    stub.state.throwOnGet = false;
  });
});
