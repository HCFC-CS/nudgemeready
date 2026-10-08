import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

describe("nudgemeready-v4 is v4-only", () => {
  it("uses the v4 name, version, scheme and bundle id with no variant switch", () => {
    const src = readFileSync(join(root, "app.config.js"), "utf8");
    expect(src).toContain("Nudge me Ready v4");
    expect(src).toContain("0.4.0");
    expect(src).toContain("nudge-me-v4");
    expect(src).toContain("com.helencunliffe.nudgeme.v4");
    expect(src).not.toContain("process.env.APP_VARIANT");
  });

  it("builds and submits production to the v4 App Store Connect app only", () => {
    const eas = JSON.parse(readFileSync(join(root, "eas.json"), "utf8"));
    expect(eas.build.production.ios.distribution).toBe("store");
    expect(eas.build.v2).toBeUndefined();
    expect(eas.build.v3).toBeUndefined();
    expect(eas.build.v4).toBeUndefined();
    expect(eas.submit.production.ios.ascAppId).toBe("6820066881");
    expect(eas.submit.v3).toBeUndefined();
    expect(eas.submit.v4).toBeUndefined();
  });

  it("accepts v4 deep links", () => {
    const src = readFileSync(join(root, "App.tsx"), "utf8");
    expect(src).toContain("nudge-me-v4://");
  });
});
