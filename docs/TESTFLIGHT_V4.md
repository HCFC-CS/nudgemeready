# Nudge me Ready v4 — TestFlight

This repository is **v4 only**. v2 testers keep 0.2.0 and v3 stays as it is in [HCFC-CS/nudgemeready](https://github.com/HCFC-CS/nudgemeready).

| | **v2** (other repo) | **v3** (other repo) | **v4 (this repo)** |
| --- | --- | --- | --- |
| Home screen name | Nudge me Ready | Nudge me Ready v3 | Nudge me Ready v4 |
| Version | 0.2.0 | 0.3.1 | 0.4.0 |
| Bundle ID | `com.helencunliffe.nudgeme` | `com.helencunliffe.nudgeme.v3` | `com.helencunliffe.nudgeme.v4` |
| URL scheme | `nudge-me://` | `nudge-me-v3://` | `nudge-me-v4://` |
| EAS profile | `production` in nudgemeready | `v3` in nudgemeready | `production` here |
| App Store Connect | leave as-is | leave as-is | 6820066881 |

The three apps do **not** share reminders or profile data.

---

## Clone this repo (not the v2/v3 folder)

```powershell
cd C:\Users\HCCun\Documents
git clone https://github.com/HCFC-CS/nudgemeready-v4.git
cd nudgemeready-v4
npm.cmd install
```

Leave `C:\Users\HCCun\Documents\nudgemeready` as the v2/v3 project.

---

## Build and upload v4

```powershell
cd C:\Users\HCCun\Documents\nudgemeready-v4
npx eas-cli build --platform ios --profile production
```

If Expo asks about expo-updates, type **n**.

When the build finishes:

```powershell
npx eas-cli submit --platform ios --profile production --latest
```

In TestFlight for the **v4** app only:

1. Wait until the build is **Ready to Test**.
2. Add yourself to an **Internal Testing** group on **v4**.
3. Do **not** add this IPA to the v2 or v3 groups.

---

## What to tell testers

- **Most testers:** keep **Nudge me Ready** 0.2.0.
- **v3:** leave installed if you still want it; it is a separate app.
- **v4:** install **Nudge me Ready v4** from the new TestFlight invite.
