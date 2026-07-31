# Nudge me Ready — TestFlight tester instructions

**App:** Nudge me Ready  
**Platform:** iPhone / iPad (iOS)  
**Build to use:** **0.2.0** (latest Ready to Test build in TestFlight)

---

## Part A — For Helen (add testers)

Do this in [App Store Connect → TestFlight](https://appstoreconnect.apple.com/apps/6777057778/testflight/ios).

### Before inviting

1. Confirm App Information privacy / support URLs:
   - Privacy: `https://nudgemeready.app/privacy/`
   - Support: `https://nudgemeready.app/support/`
2. Upload the new **0.2.0** production build (EAS) and wait until it is **Ready to Test**.

### Internal testers (fastest — up to 100 people on your Apple team)

1. Open **TestFlight**.
2. Under **Internal Testing**, open your group (e.g. **Team (Expo)**) or create one: **+** → name it (e.g. “Testing team”).
3. Click **Testers** → **+** → add people by **Apple ID email**.
4. Make sure the latest **0.2.0** build is **added to that group** and status is **Ready to Test**.
5. If Apple asks about **Export Compliance / Encryption**, answer that the app uses only exempt / standard encryption.

Internal testers must use an Apple ID that is (or can be) a user on your App Store Connect team.

### External testers (anyone with an email — needs a short Beta App Review the first time)

1. TestFlight → **External Testing** → create a group (e.g. “Friends & family”).
2. Add the build, fill in **What to Test**, submit for **Beta App Review** if prompted.
3. When approved, add emails or enable a **public link**.
4. Share the invite email or public link with testers.

---

## Part B — For testers (install on iPhone)

### What you need

- An iPhone or iPad
- Your own Apple ID
- An invite email from TestFlight **or** a public TestFlight link from Helen
- Internet (Wi‑Fi preferred for the first download)

### Steps

1. On your iPhone, open the **App Store**.
2. Search for **TestFlight** (Apple) and **Install** it if you don’t have it.
3. Open the **invite email** on the same iPhone (or open the public link Helen sent).
4. Tap **View in TestFlight** / **Start Testing**.
5. TestFlight opens → find **Nudge me Ready** → tap **Install**.
6. When install finishes, open **Nudge me Ready** from your Home Screen (or from TestFlight → **Open**).
7. If asked for permissions (notifications, location, microphone, Face ID, contacts, calendar), choose what you’re happy to allow for testing.

### Updates

When Helen ships a new build:

1. Open **TestFlight**.
2. Open **Nudge me Ready**.
3. Tap **Update** if shown (or turn on automatic updates in TestFlight).

---

## Part C — Quick checks for testers

Please try and note anything that breaks:

- [ ] First open shows **registration** (name, email, optional phone, avatar), then optional Face ID/PIN
- [ ] Optional: set Face ID / PIN / password + recovery email; save recovery code
- [ ] Lock the app, reopen, unlock (Face ID or password)
- [ ] Forgot password → email reset link / recovery code / device passcode
- [ ] Add a reminder, note, and appointment (optional guests + calendar)
- [ ] Attach a document photo to a nudge
- [ ] Settings → Push / Quiet hours / Focus timer / Leaving reminders
- [ ] My Crew → invite / pending **Resend link**
- [ ] Ask for Help opens Messages or Share
- [ ] Voice mic / speaker on a text field (needs this TestFlight build)

Send feedback to Helen with: **device model**, **iOS version**, and **what you did when it failed**.

---

## Troubleshooting

| Problem | What to try |
|--------|-------------|
| No invite / app not in TestFlight | Confirm Helen added your **Apple ID email**; check Spam; open the invite on the iPhone |
| Build still “Processing” | Wait 10–30 minutes after Helen’s upload; pull to refresh in TestFlight |
| App crashes on launch | Note iOS version + time; reinstall from TestFlight; send Helen a screenshot |
| Face ID / calendar / contacts missing | Confirm you installed the new **0.2.0** build, not an older one |

---

## Links (Helen)

- App Store Connect / TestFlight: https://appstoreconnect.apple.com/apps/6777057778/testflight/ios  
- Privacy: https://nudgemeready.app/privacy/  
- Support: https://nudgemeready.app/support/  
- Site: https://nudgemeready.app/  
