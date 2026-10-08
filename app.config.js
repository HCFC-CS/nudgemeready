/**
 * App config with build variants.
 *
 * - Default / APP_VARIANT=v4 → "Nudge me Ready v4" (0.4.0) — fresh TestFlight, beside v2 and v3
 * - APP_VARIANT=v3 → "Nudge me Ready v3" (0.3.1) — leave existing TestFlight alone
 * - APP_VARIANT=v2 → original "Nudge me Ready" (0.2.0)
 *
 * Build v4:
 *   eas build --platform ios --profile v4
 */

const appJson = require("./app.json");

const variant =
  process.env.APP_VARIANT === "v2" ? "v2" : process.env.APP_VARIANT === "v3" ? "v3" : "v4";

const identity = {
  v2: {
    name: appJson.expo.name,
    version: "0.2.0",
    scheme: appJson.expo.scheme,
    bundleIdentifier: appJson.expo.ios.bundleIdentifier,
    androidPackage: appJson.expo.android.package
  },
  v3: {
    name: "Nudge me Ready v3",
    version: "0.3.1",
    scheme: "nudge-me-v3",
    bundleIdentifier: "com.helencunliffe.nudgeme.v3",
    androidPackage: "com.helencunliffe.nudgeme.v3"
  },
  v4: {
    name: "Nudge me Ready v4",
    version: "0.4.0",
    scheme: "nudge-me-v4",
    bundleIdentifier: "com.helencunliffe.nudgeme.v4",
    androidPackage: "com.helencunliffe.nudgeme.v4"
  }
}[variant];

const base = appJson.expo;

module.exports = {
  ...base,
  name: identity.name,
  slug: base.slug,
  version: identity.version,
  scheme: identity.scheme,
  // Written here (not only in app.json) so `eas build` can see EAS Update
  // on a dynamic app.config.js and does not try to rewrite this file.
  runtimeVersion: {
    policy: "appVersion"
  },
  updates: {
    url: "https://u.expo.dev/6ca4ec88-2487-43ae-a858-5c3d96abf41e",
    enabled: true,
    checkAutomatically: "NEVER",
    fallbackToCacheTimeout: 0
  },
  ios: {
    ...base.ios,
    bundleIdentifier: identity.bundleIdentifier,
    buildNumber: base.ios.buildNumber
  },
  android: {
    ...base.android,
    package: identity.androidPackage,
    versionCode: base.android.versionCode
  },
  extra: {
    ...base.extra,
    appVariant: variant
  }
};
