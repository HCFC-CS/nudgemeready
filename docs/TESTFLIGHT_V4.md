# Nudge me Ready v4 — TestFlight (fresh start beside v2 and v3)

Use this so **v2 testers keep 0.2.0**, **v3 stays as it is**, and you install **Nudge me Ready v4** next to both. v4 is the same product as the first 0.3.1 drop, with a new home-screen icon and its own data.

| | **v2** | **v3** | **v4 (fresh)** |
| --- | --- | --- | --- |
| Home screen name | Nudge me Ready | Nudge me Ready v3 | Nudge me Ready v4 |
| Version | 0.2.0 | 0.3.1 | 0.4.0 |
| Bundle ID | `com.helencunliffe.nudgeme` | `com.helencunliffe.nudgeme.v3` | `com.helencunliffe.nudgeme.v4` |
| URL scheme | `nudge-me://` | `nudge-me-v3://` | `nudge-me-v4://` |
| EAS profile | `production` | `v3` | `v4` |
| TestFlight | Leave as-is | Leave as-is | New App Store Connect app |

The three apps do **not** share reminders or profile data.

Do **not** run `eas build --profile v3` or `--profile production` for this drop.

---

## One-time Apple setup (Helen)

Do this **before** the first v4 Expo build.

1. **Apple Developer → Identifiers → +**  
   App ID: `com.helencunliffe.nudgeme.v4`  
   Same capabilities as v3 (Sign in with Apple, Associated Domains, Push if used).

2. **App Store Connect → My Apps → +**  
   - Name: **Nudge me Ready v4**  
   - Bundle ID: `com.helencunliffe.nudgeme.v4`  
   - SKU: e.g. `nudgemeready-v4`

3. Copy the new app’s **Apple ID** (numeric) from App Information.

4. Put that number in `eas.json` → `submit.v4.ios.ascAppId`.

5. Privacy / support (same as v2 is fine):
   - `https://nudgemeready.app/privacy/`
   - `https://nudgemeready.app/support/`

---

## Build & upload v4

From the project folder, after Apple setup:

```powershell
cd C:\Users\HCCun\Documents\nudgemeready
git pull origin cursor/ready4-platform-audit-fixes
npx eas-cli build --platform ios --profile v4
```

If Expo asks about expo-updates, type **n**.

When the build finishes:

```powershell
npx eas-cli submit --platform ios --profile v4 --latest
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
