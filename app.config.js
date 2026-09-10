/**
 * App config with build variants.
 *
 * - Default / APP_VARIANT=v3 → "Nudge me Ready v3" (0.3.1) — new TestFlight track, can sit beside v2
 * - APP_VARIANT=v2 → original "Nudge me Ready" (0.2.0) identity — only rebuild from a v2 commit if needed
 *
 * Build v3:
 *   eas build --platform ios --profile v3
 */

const appJson = require("./app.json");

const variant = process.env.APP_VARIANT === "v2" ? "v2" : "v3";
const isV3 = variant === "v3";

const base = appJson.expo;

module.exports = {
  ...base,
  name: isV3 ? "Nudge me Ready v3" : base.name,
  slug: base.slug,
  version: isV3 ? "0.3.1" : "0.2.0",
  scheme: isV3 ? "nudge-me-v3" : base.scheme,
  ios: {
    ...base.ios,
    bundleIdentifier: isV3 ? "com.helencunliffe.nudgeme.v3" : base.ios.bundleIdentifier,
    buildNumber: base.ios.buildNumber
  },
  android: {
    ...base.android,
    package: isV3 ? "com.helencunliffe.nudgeme.v3" : base.android.package,
    versionCode: base.android.versionCode
  },
  extra: {
    ...base.extra,
    appVariant: variant
  }
};
