import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

describe("v4 is a separate install from v2 and v3", () => {
  it("uses its own name, version, scheme and bundle id", () => {
    const src = readFileSync(join(root, "app.config.js"), "utf8");
    expect(src).toContain("Nudge me Ready v4");
    expect(src).toContain("0.4.0");
    expect(src).toContain("nudge-me-v4");
    expect(src).toContain("com.helencunliffe.nudgeme.v4");
    expect(src).toContain('process.env.APP_VARIANT === "v3"');
  });

  it("builds v4 on its own EAS profile so v3 TestFlight is left alone", () => {
    const eas = JSON.parse(readFileSync(join(root, "eas.json"), "utf8"));
    expect(eas.build.v4.env.APP_VARIANT).toBe("v4");
    expect(eas.build.v4.ios.distribution).toBe("store");
    expect(eas.build.v3.env.APP_VARIANT).toBe("v3");
    expect(eas.build.production.env.APP_VARIANT).toBe("v2");
    expect(eas.submit.v3.ios.ascAppId).toBe("6805037796");
  });

  it("accepts v4 deep links without dropping v2 or v3 prefixes", () => {
    const src = readFileSync(join(root, "App.tsx"), "utf8");
    expect(src).toContain("nudge-me-v4://");
    expect(src).toContain("nudge-me-v3://");
    expect(src).toContain("nudge-me://");
  });
});
