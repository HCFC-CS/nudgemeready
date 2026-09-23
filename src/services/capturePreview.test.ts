import { describe, expect, it } from "vitest";

import { buildCapturePreview } from "./capturePreview";

describe("buildCapturePreview", () => {
  it("summarises a dated reminder without inventing a pack", () => {
    const preview = buildCapturePreview("Call the dentist tomorrow morning", []);
    expect(preview.title.toLowerCase()).toMatch(/call.*dentist/);
    expect(preview.inferredWhen).toBe(false);
    expect(preview.whenLabel.toLowerCase()).toMatch(/tomorrow/);
    expect(preview.packId).toBeUndefined();
  });

  it("marks when as inferred if the person did not say a day or time", () => {
    const preview = buildCapturePreview("Order prescription", []);
    expect(preview.inferredWhen).toBe(true);
    expect(preview.whenLabel.length).toBeGreaterThan(0);
  });

  it("links Ready4 Moving only when that pack is installed", () => {
    const without = buildCapturePreview("Book removals 1 October", []);
    const withPack = buildCapturePreview("Book removals 1 October", ["ready4-moving"]);
    expect(without.packId).toBeUndefined();
    expect(withPack.packId).toBe("ready4-moving");
  });
});
