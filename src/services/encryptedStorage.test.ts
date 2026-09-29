import { beforeEach, describe, expect, it, vi } from "vitest";

const DATA_KEY_STORE = "nmr-secure:nudge.security.dataKey.v1";

describe("encryptedStorage data key", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates the encryption key once when many stores load together", async () => {
    const stub = await import("../test/asyncStorageStub.cjs");
    stub.state.setItemKeys.length = 0;
    const { getEncryptedItem, setEncryptedItem } = await import("./encryptedStorage");
    await Promise.all([
      setEncryptedItem("parallel-a", "one"),
      setEncryptedItem("parallel-b", "two"),
      setEncryptedItem("parallel-c", "three")
    ]);
    const dataKeyWrites = stub.state.setItemKeys.filter((key: string) => key === DATA_KEY_STORE);
    expect(dataKeyWrites).toHaveLength(1);
    expect(await getEncryptedItem("parallel-a")).toBe("one");
    expect(await getEncryptedItem("parallel-b")).toBe("two");
    expect(await getEncryptedItem("parallel-c")).toBe("three");
  });
});
