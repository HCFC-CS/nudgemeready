import { describe, expect, it } from "vitest";

import { deleteItemAsync, getItemAsync, setItemAsync } from "./secureStore";

describe("secureStore", () => {
  it("round-trips a value on native", async () => {
    await setItemAsync("guide-test-key", "kept-local");
    expect(await getItemAsync("guide-test-key")).toBe("kept-local");
    await deleteItemAsync("guide-test-key");
    expect(await getItemAsync("guide-test-key")).toBeNull();
  });
});
