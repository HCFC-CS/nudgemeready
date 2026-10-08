/**
 * Nudge me Ready v4 — own TestFlight app beside v2 and v3.
 *
 *   eas build --platform ios --profile production
 */

const appJson = require("./app.json");
const base = appJson.expo;

module.exports = {
  ...base,
  name: "Nudge me Ready v4",
  slug: base.slug,
  version: "0.4.0",
  scheme: "nudge-me-v4",
  ios: {
    ...base.ios,
    bundleIdentifier: "com.helencunliffe.nudgeme.v4",
    buildNumber: base.ios.buildNumber
  },
  android: {
    ...base.android,
    package: "com.helencunliffe.nudgeme.v4",
    versionCode: base.android.versionCode
  },
  extra: {
    ...base.extra,
    appVariant: "v4"
  }
};
