# Nudge me Ready v4 — TestFlight (fresh start beside v2 and v3)

**v4 now has its own GitHub repository:** [HCFC-CS/nudgemeready-v4](https://github.com/HCFC-CS/nudgemeready-v4). See [NUDGEMEREADY_V4_REPO.md](NUDGEMEREADY_V4_REPO.md). This repo still holds v2 and v3.

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

4. Put that number in `eas.json` → `submit.v4.ios.ascAppId` (currently `6820066881`).

5. Privacy / support (same as v2 is fine):
   - `https://nudgemeready.app/privacy/`
   - `https://nudgemeready.app/support/`

---

## Build & upload v4 (do this in order)

Use the existing folder `C:\Users\HCCun\Documents\nudgemeready` and branch `cursor/ready4-platform-audit-fixes`. That is where slices 1–12 live. Do **not** build from a separate `nudgemeready-v4` folder, and do **not** use `--profile v3` or `--profile production`.

This first drop uses **one EAS build credit**. Later JavaScript-only fixes can use `eas update` and do not need another IPA.

### A. On your PC — get the code

1. Open **PowerShell**.
2. Run:

```powershell
cd C:\Users\HCCun\Documents\nudgemeready
git fetch origin cursor/ready4-platform-audit-fixes
git checkout cursor/ready4-platform-audit-fixes
git pull origin cursor/ready4-platform-audit-fixes
```

3. Confirm you are logged into Expo:

```powershell
npx eas-cli whoami
```

If it says you are not logged in:

```powershell
npx eas-cli login
```

Use your Expo account (the same one as v2 / v3).

### B. On your PC — start the v4 iOS build

4. Run:

```powershell
npx eas-cli build --platform ios --profile v4
```

5. If Expo asks whether to set up **expo-updates**, type **Y** and press Enter.  
6. If it asks which Apple team, choose **656UL52XWW**.  
7. Wait until Expo says the build finished. This can take a while. Leave the window open.

### C. On your PC — send it to TestFlight

8. When the build is finished, run:

```powershell
npx eas-cli submit --platform ios --profile v4 --latest
```

9. Confirm Apple login / 2FA if asked.  
10. Wait until App Store Connect shows the v4 build as **Ready to Test**.

### D. On your iPhone — install only v4

11. Open **TestFlight**.  
12. Open the app named **Nudge me Ready v4** (not v2, not v3).  
13. Install / update that app.  
14. Open it. You should get past the title to register or Home.  
15. Leave **Nudge me Ready** (v2) and **Nudge me Ready v3** as they are.

### E. Later — JavaScript-only update (no new IPA)

Only after that v4 app is already on your phone. Do this when we have a small JS fix and you do not need a new native build.

16. On your PC, in the same folder and branch:

```powershell
cd C:\Users\HCCun\Documents\nudgemeready
git pull origin cursor/ready4-platform-audit-fixes
npx eas-cli update --channel v4 --platform ios --message "short note about what changed"
```

17. On the iPhone: force-close **Nudge me Ready v4**, wait a few seconds, open it once (it may download in the background), then force-close and open it **again**. The new JavaScript applies on that second open.

`eas update` is not a build credit. If the change needs a new native module, skip this and do another `--profile v4` build instead.

---

## What to tell testers

- **Most testers:** keep **Nudge me Ready** 0.2.0.  
- **v3:** leave installed if you still want it; it is a separate app.  
- **v4:** install **Nudge me Ready v4** from the new TestFlight invite.
