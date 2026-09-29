import { beforeEach, describe, expect, it, vi } from "vitest";

describe("secureStore", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("round-trips a value on native", async () => {
    const { deleteItemAsync, getItemAsync, setItemAsync } = await import("./secureStore");
    await setItemAsync("guide-test-key", "kept-local");
    expect(await getItemAsync("guide-test-key")).toBe("kept-local");
    await deleteItemAsync("guide-test-key");
    expect(await getItemAsync("guide-test-key")).toBeNull();
  });

  it("passes an explicit keychain service so iOS 26 does not throw", async () => {
    const { setItemAsync } = await import("./secureStore");
    const stub = await import("../test/expoSecureStoreStub.cjs");
    await setItemAsync("keychain-options-key", "value");
    expect(stub.state.lastOptions).toMatchObject({
      keychainService: "app",
      keychainAccessible: 1
    });
  });

  it("returns null when native get throws", async () => {
    const stub = await import("../test/expoSecureStoreStub.cjs");
    stub.state.throwOnGet = true;
    const { getItemAsync } = await import("./secureStore");
    await expect(getItemAsync("broken")).resolves.toBeNull();
    stub.state.throwOnGet = false;
  });
});
