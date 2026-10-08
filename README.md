# Nudge me Ready v4

Standalone repository for **Nudge me Ready v4** (TestFlight 0.4.0).

v2 and v3 stay in [HCFC-CS/nudgemeready](https://github.com/HCFC-CS/nudgemeready). This repo is v4 only, so `eas build --profile production` cannot overwrite those apps.

| | Value |
| --- | --- |
| Home screen name | Nudge me Ready v4 |
| Version | 0.4.0 |
| Bundle ID | `com.helencunliffe.nudgeme.v4` |
| URL scheme | `nudge-me-v4://` |
| App Store Connect | 6820066881 |
| EAS profile | `production` |

The three apps do not share reminders or profile data.

## Run locally

```bash
npm install
npm start
```

## TestFlight (from this folder only)

```powershell
cd C:\Users\HCCun\Documents\nudgemeready-v4
npx eas-cli build --platform ios --profile production
```

When the build finishes:

```powershell
npx eas-cli submit --platform ios --profile production --latest
```

If Expo asks about expo-updates, type **n**.

See [docs/TESTFLIGHT_V4.md](docs/TESTFLIGHT_V4.md).
