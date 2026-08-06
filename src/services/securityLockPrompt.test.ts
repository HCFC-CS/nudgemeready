import { beforeEach, describe, expect, it } from "vitest";

import {
  dismissSecurityLockPrompt,
  loadSecurityLockPromptState,
  resetSecurityLockPrompt
} from "./securityLockPrompt";

describe("securityLockPrompt", () => {
  beforeEach(async () => {
    await resetSecurityLockPrompt();
  });

  it("defaults to showing the Home tip", async () => {
    const state = await loadSecurityLockPromptState();
    expect(state.dismissed).toBe(false);
  });

  it("remembers dismiss and can reset after lock is turned on", async () => {
    await dismissSecurityLockPrompt();
    expect((await loadSecurityLockPromptState()).dismissed).toBe(true);
    await resetSecurityLockPrompt();
    expect((await loadSecurityLockPromptState()).dismissed).toBe(false);
  });
});
