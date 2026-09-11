# Nudge me Ready v3 — TestFlight (side by side with v2)

Use this so **0.2.0 testers keep using v2**, while you (and a small v3 group) install **Nudge me Ready v3** next to it.

| | **v2 (testers)** | **v3 (new work)** |
| --- | --- | --- |
| Home screen name | Nudge me Ready | Nudge me Ready v3 |
| Version | 0.2.0 | 0.3.1 |
| Bundle ID | `com.helencunliffe.nudgeme` | `com.helencunliffe.nudgeme.v3` |
| URL scheme | `nudge-me://` | `nudge-me-v3://` |
| EAS profile | `production` | `v3` |
| Existing TestFlight builds | Leave as-is | New App Store Connect app |

v2 and v3 can both sit on the same iPhone because the bundle IDs differ. Data is **not** shared between them.

## What is in v3 0.3.1

This drop is the current feature branch (`cursor/ready4-platform-audit-fixes`). Leave **v2 0.2.0** testers on the original TestFlight app.

Please try:

- Add something you don’t want to forget from empty Home or Nudges
- Voice or Something else: “remind me to take the bins out tomorrow evening” — it should save with a time, then sit on Nudges
- First save may ask to turn on quiet phone reminders
- Later / Sorted / Smaller / Ask on a Nudges row
- Home leads with What’s coming up; **Show my appointments here** if you want phone calendar
- Ask for help and Crew stay on this phone (they do not share your list live)
- Reward glance, why-this-is-hard, Help me find it, and optional drink / meal / move lists

Push reminders need **Settings → Push** on a real iPhone. They will not fire in a web preview.

---

## One-time Apple setup (Helen)

1. **Apple Developer → Identifiers**  
   Create App ID: `com.helencunliffe.nudgeme.v3`  
   Enable the same capabilities as v2 (Sign in with Apple, Associated Domains, Push if used, etc.).

2. **App Store Connect → My Apps → +**  
   Create a new app:
   - Name: e.g. **Nudge me Ready v3** (or “Nudge me Ready Beta”)
   - Bundle ID: `com.helencunliffe.nudgeme.v3`
   - SKU: e.g. `nudgemeready-v3`

3. Copy the new app’s **Apple ID** (numeric) from App Information.

4. Put that id in `eas.json` → `submit.v3.ios.ascAppId`.

5. Privacy / support URLs (same as v2 is fine):
   - `https://nudgemeready.app/privacy/`
   - `https://nudgemeready.app/support/`

---

## Build & upload v3

From the project root (with current code — this branch):

```bash
npm run build:ios:v3
```

Or:

```bash
eas build --platform ios --profile v3
```

When the build finishes:

```bash
eas submit --platform ios --profile v3 --latest
```

(Or download the IPA and upload with Transporter.)

In TestFlight for the **v3** app:

1. Wait until the build is **Ready to Test**.
2. Add yourself (and anyone else) to an **Internal Testing** group on the **v3** app only.
3. Do **not** add the v3 build to the existing v2 TestFlight groups.

Leave the **v2** app (`6777057778`) and its 0.2.0 builds untouched.

---

## Local / Expo

- Default local config is **v3** (`APP_VARIANT` defaults to v3 in `app.config.js`).
- To force v2 identity locally: `APP_VARIANT=v2` (or `npm run start:v2` on Unix).

Do **not** run `eas build --profile production` from this feature branch if you want the store/TestFlight **v2** binary to stay as the old 0.2.0 feature set — that profile still points at the original bundle ID. Prefer leaving existing v2 builds alone.

---

## What to tell testers

- **Most testers:** keep using **Nudge me Ready** 0.2.0 from the original TestFlight invite.  
- **v3 testers:** install **Nudge me Ready v3** from the new TestFlight app invite. Both icons can appear on the home screen.
- Illustrated user guide (this version): [docs/product/03-User_Guides.md](./product/03-User_Guides.md) and https://nudgemeready.app/manual/
