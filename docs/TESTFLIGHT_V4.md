# Nudge me Ready v4 — TestFlight

v4 lives in this repository: [HCFC-CS/nudgemeready](https://github.com/HCFC-CS/nudgemeready), on branch `cursor/ready4-platform-audit-fixes`. On this PC the folder is `C:\Users\HCCun\Documents\nudgemeready`.

v2 and v3 live in the same repository. They are separate apps beside v4. Build v4 from this folder and this branch.

Use this so **v2 testers keep 0.2.0**, **v3 stays as it is**, and **Nudge me Ready v4** sits next to both. The three apps do not share reminders or profile data.

| | **v2** | **v3** | **v4** |
| --- | --- | --- | --- |
| Home screen name | Nudge me Ready | Nudge me Ready v3 | Nudge me Ready v4 |
| Version | 0.2.0 | 0.3.1 | 0.4.0 |
| Bundle ID | `com.helencunliffe.nudgeme` | `com.helencunliffe.nudgeme.v3` | `com.helencunliffe.nudgeme.v4` |
| URL scheme | `nudge-me://` | `nudge-me-v3://` | `nudge-me-v4://` |
| EAS profile | `production` | `v3` | `v4` |
| Windows build | `Build-TestFlight-v2.bat` | `npm run build:ios:v3` | `Build-TestFlight-v4.bat` |
| Windows submit | `Submit-TestFlight-v2.bat` | `npm run submit:ios:v3` | `Submit-TestFlight-v4.bat` |

`Build-TestFlight.bat` and `Submit-TestFlight.bat` no longer start a build or a submit. They remind you which versioned file to open.

---

## What is already on TestFlight

**Nudge me Ready v4** is on TestFlight as **0.4.0 (3)**.

That binary was built from commit `2cfa133c62292fc8585db2f84471fa34f0010354`.

A JavaScript update is already published for that same binary:

| | |
| --- | --- |
| iOS update commit | `3c9a6ebecb4df264d59324eda511cddc16e1f277` |
| Update group | `fa281984-4221-41db-b99c-f15ca78f8519` |
| Channel | `v4` |
| Runtime | `0.4.0` |

A **binary** is a new TestFlight build. It gets a new build number, uses an EAS build credit, and is what you install from TestFlight. Build one when native code changes.

A **JavaScript update** changes the app inside the v4 binary people already have, when the runtime stays `0.4.0`. It does not create a new TestFlight build, and it does not change 0.4.0 (3) into a new build number. The update above is that kind of publish. The first open after it is published downloads it. The next open uses it.

---

## Windows entry points for v4

These match the v4 scripts in `package.json`.

| What you want | Double-click | Same command |
| --- | --- | --- |
| New v4 binary | `Build-TestFlight-v4.bat` | `npm run build:ios:v4` |
| Send that binary to TestFlight | `Submit-TestFlight-v4.bat <EAS build ID>` | `npm run submit:ios:v4 -- <EAS build ID>` |
| JavaScript update on channel v4 | `Update-iOS-v4.bat <full SHA> "short note"` | `npm run update:ios:v4 -- --sha <full SHA> --channel v4 --platform ios --message "short note"` |

v2 stays on `npm run build:ios:v2` (profile `production`) and `Submit-TestFlight-v2.bat`. v3 stays on `npm run build:ios:v3` and `npm run submit:ios:v3`, which submits the latest v3 build.

The v2 submit file sends the latest build from the production profile. The v4 submit file sends only the build ID you give it.

The v4 submit asks for the EAS build ID from the v4 build you mean. It reads that build and continues only when the record is the finished v4 iOS app: profile `v4`, channel `v4`, version `0.4.0`, runtime `0.4.0`, bundle ID `com.helencunliffe.nudgeme.v4`. If the ID is missing, EAS cannot show the build, or the record is not that app, it stops and tells you what to do next. It submits that ID only.

---

## Apple app (already created)

The v4 App Store Connect app is already in place.

- Bundle ID: `com.helencunliffe.nudgeme.v4`
- Apple ID in `eas.json` → `submit.v4.ios.ascAppId`: `6820066881`
- Privacy: `https://nudgemeready.app/privacy/`
- Support: `https://nudgemeready.app/support/`

A later binary uses this same app. You do not need a new App Store Connect app for the next 0.4.0 build.

---

## Build a new v4 binary

Do this when the change needs a new native build. In PowerShell:

```powershell
cd C:\Users\HCCun\Documents\nudgemeready
git fetch origin cursor/ready4-platform-audit-fixes
git checkout cursor/ready4-platform-audit-fixes
git pull origin cursor/ready4-platform-audit-fixes
npx eas-cli whoami
npm run build:ios:v4
```

Or double-click `Build-TestFlight-v4.bat`.

If Expo asks whether to set up **expo-updates**, answer yes. If it asks which Apple team, choose **656UL52XWW**. Leave the window open until Expo says the build finished.

If the build fails at **Install pods**, pull this branch again, then run `npm run build:ios:v4` once more. That retry uses another build credit.

When it finishes, copy the EAS build ID. You need that ID for the submit step. A git commit is not the build ID.

---

## Send that binary to TestFlight

```powershell
npm run submit:ios:v4 -- <EAS build ID>
```

Or:

```powershell
.\Submit-TestFlight-v4.bat <EAS build ID>
```

Confirm Apple login if asked. Wait until App Store Connect shows this v4 build as **Ready to Test**, then install **Nudge me Ready v4** from TestFlight. Leave **Nudge me Ready** (v2) and **Nudge me Ready v3** as they are.

To see IDs without submitting:

```powershell
npx eas-cli build:list --platform ios --limit 10
```

Pick the finished row whose profile is `v4`.

---

## Publish a JavaScript update

Do this when the v4 app is already on the phone, the runtime stays `0.4.0`, and the change is JavaScript only. This is the same kind of publish as update group `fa281984-4221-41db-b99c-f15ca78f8519`. It is not a new TestFlight binary.

Get the commit first, and read its full SHA. Keep that as its own step.

```powershell
cd C:\Users\HCCun\Documents\nudgemeready
git fetch origin cursor/ready4-platform-audit-fixes
git checkout cursor/ready4-platform-audit-fixes
git pull origin cursor/ready4-platform-audit-fixes
git rev-parse HEAD
git status
```

When `git status` is clean and that SHA is the commit you mean, publish with a second command. `npm run update:ios:v4` checks the SHA, the clean tree, `APP_VARIANT=v4`, version `0.4.0`, runtime `0.4.0`, the v4 name and bundle id, the EAS project, channel `v4`, and platform `ios`. If a check fails, it stops and does not publish. It does not check out a commit for you.

```powershell
$env:APP_VARIANT = "v4"
npm run update:ios:v4 -- --sha <full 40-character commit SHA> --channel v4 --platform ios --message "short note about what changed"
```

To run those checks and print the command without publishing:

```powershell
$env:APP_VARIANT = "v4"
npm run update:ios:v4 -- --dry-run --sha <full 40-character commit SHA> --channel v4 --platform ios --message "short note about what changed"
```

From this folder, the Windows file runs the same checks:

```powershell
.\Update-iOS-v4.bat <full 40-character commit SHA> "short note about what changed"
```

On the iPhone: force-close **Nudge me Ready v4**, wait a few seconds, open it once, then force-close and open it again. The new JavaScript applies on that second open.

`npm run update:ios:v4` does not use a build credit. When the change needs a new native module, use **Build a new v4 binary** above instead, then submit that new build ID.

---

## What to tell testers

- **Most testers:** keep **Nudge me Ready** 0.2.0.
- **v3:** leave it installed if you still want it. It is a separate app.
- **v4:** install **Nudge me Ready v4** from the v4 TestFlight invite. The current binary is 0.4.0 (3), with the JavaScript update on channel `v4` for runtime `0.4.0`.
