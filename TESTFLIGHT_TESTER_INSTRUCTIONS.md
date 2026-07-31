# Nudge me Ready — TestFlight tester instructions

**App:** Nudge me Ready  
**Platform:** iPhone / iPad (iOS)  
**Build to use:** 0.1.0 (7) or the latest Ready to Test build

---

## Part A — For Helen (add testers)

Do this in [App Store Connect → TestFlight](https://appstoreconnect.apple.com/apps/6777057778/testflight/ios).

### Internal testers (fastest — up to 100 people on your Apple team)

1. Open **TestFlight**.
2. Under **Internal Testing**, open your group (e.g. **Team (Expo)**) or create one: **+** → name it (e.g. “Testing team”).
3. Click **Testers** → **+** → add people by **Apple ID email**.
4. Make sure build **0.1.0 (7)** (or the latest) is **added to that group** and status is **Ready to Test**.
5. If Apple asks about **Export Compliance / Encryption**, answer that the app uses only exempt encryption (standard for this app).

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
7. If asked for permissions (notifications, location, microphone, Face ID), choose what you’re happy to allow for testing.

### Updates

When Helen ships a new build:

1. Open **TestFlight**.
2. Open **Nudge me Ready**.
3. Tap **Update** if shown (or turn on automatic updates in TestFlight).

---

## Part C — Quick checks for testers

Please try and note anything that breaks:

- [ ] App opens and splash shows: *forget me never, one nudge at a time*
- [ ] Add a nudge / reminder / list
- [ ] Settings → Leaving reminders toggle
- [ ] Settings → Security (password / Face ID) if you want to test lock
- [ ] My Crew → invite / pending **Resend link** (if you have crew access)
- [ ] Voice mic / speaker on a text field (mic needs a real device build — TestFlight counts)

Send feedback to Helen with: **device model**, **iOS version**, and **what you did when it failed**.

---

## Troubleshooting

| Problem | What to try |
|--------|-------------|
| No invite / app not in TestFlight | Confirm Helen added your **Apple ID email**; check Spam; open the invite on the iPhone |
| “This invite is not available” | Wrong Apple ID signed into the device — Settings → [your name] |
| Build still “Processing” | Wait 10–30 minutes after Helen’s upload; pull to refresh in TestFlight |
| Install greyed out | Build not added to your tester group, or compliance questions unanswered in App Store Connect |
| App crashes on launch | Note iOS version + time; reinstall from TestFlight; send Helen a screenshot |

---

## Links (Helen)

- TestFlight builds: https://appstoreconnect.apple.com/apps/6777057778/testflight/ios  
- Expo build history: https://expo.dev/accounts/helencunliffe/projects/nudge-me/builds  
