# Changes after 0.3.1 (1)

This is the list of **product work after the first 0.3.1 TestFlight drop**, so we can put it back **one change at a time**.

Applying every later commit in one IPA is what crashed on iOS 26. Do not do that again.

**You do not spend an Expo credit on every slice.** I add one change, then I check it here (tests, launch-path review). We only use a TestFlight credit when we agree a checkpoint is worth installing on your iPhone.

## Where we are now

| | Git | What it is |
| --- | --- | --- |
| Baseline that opened | `1efb159` (restored later as `a945018` and `2a0991a`) | 0.3.1 **build 1** |
| Last commit before the splash crash | `260cc81` | All of the slices below, in one tree |
| Rebuild that crashed again | `702b037` | Those slices applied together |
| v4 fresh start | current v4 / `v4-standalone` | Same product as build 1, new icon and data |

v4 **0.4.0 (1)** is the same app as 0.3.1 (1), not the later features.

## Who checks what (credits)

| | Who | Uses Expo credits? |
| --- | --- | --- |
| Add one slice of code | Me | No |
| Run tests and look at launch / crash risk | Me | No |
| Confirm it actually opens on your iPhone | You, on TestFlight | Yes — only at a checkpoint |

I cannot see your phone from here, and this environment is not logged into Expo, so I cannot start an EAS build. A real iOS 26 crash only shows up on a real IPA.

**Checkpoints** (the only times to spend a credit):

1. After slices 1–5 (small JS fixes, no new native modules)
2. After slice 6 (document picker — native)
3. After slice 7 (Nudges timeline — big screens)
4. After slice 10 (first-run / splash path)

Between checkpoints, I keep going in git. If my checks fail, I stop and we do not build.

## How to use this list

1. Keep the v4 that already opens on the phone.
2. I add **one slice** and check it here.
3. At a checkpoint, you run one EAS/TestFlight build from the v4 folder.
4. If that IPA opens, we keep those slices. If it crashes, those slices are the suspect — we revert them. We do not stack the old splash/native crash fixes on top.

Do **not** re-apply the September–October splash / Keychain / new-architecture / Expo Updates series. Those were crash-loop patches, not product features.

---

## Skip for the phone app (no TestFlight)

These never needed to be inside the IPA. Leave them out of v4 builds.

| # | Date | Commit | What it was |
| --- | --- | --- | --- |
| S1 | 11 Sep | `140b3b6` | PDF of the 0.3.1 user manual |
| S2 | 11 Sep | `8323af5` | Zip of the HTML user manual |
| S3 | 11 Sep | `510ec4d` (website / PDF library) | Pack and module guide PDFs on the website |
| S4 | 11 Sep | `fb4dfa5` (website / screenshots) | Illustrated website manual |

`fb4dfa5` and `510ec4d` also touched app code for **screenshot / web capture**. That helper is not needed on a real iPhone. Do not bring `src/services/secureStore.ts` across yet: it wraps Keychain, and iOS 26 later aborted on Keychain.

---

## Recommended order

Each slice is one **code** change. “What to try” is what I check here, and what you try on the phone at the next checkpoint.

### Slice 1 — Readable type chips

- **Commit:** `ce94f4b` (23 Sep)
- **What you see:** Small-step / type chips on a project card use darker ink on ivory, so labels are readable.
- **Risk:** Low (theme and item details only).
- **What to try:** Open a project or item with type chips. Confirm Save still works. App must open past the title.

### Slice 2 — Readable Save / Sorted chips

- **Commit:** `3b732f5` (23 Sep)
- **What you see:** Save, Sorted, and Remove chips are easier to read (no pale blue on pale blue).
- **Risk:** Low (chip styles only).
- **What to try:** On a nudge: Save, Sorted, Later. No launch change.

### Slice 3 — Buttons are real buttons

- **Commit:** `07e97de` (23 Sep)
- **What you see:** Upload and other actions announce as buttons to VoiceOver.
- **Risk:** Very low (one accessibility role).
- **What to try:** Documents Upload still tappable.

### Slice 4 — Keep a project while adding tasks

- **Commit:** `553f3ef` (23 Sep)
- **What you see:** Plan something saves the project first, then linked tasks, and comes back to the project so it is not lost.
- **Risk:** Low–medium (save path, not splash).
- **What to try:** Menu → project → add a task → return. Project still there with the task linked.

### Slice 5 — Finish “Prepare for something” on the item screen

- **Commit:** `4b45202` (23 Sep)
- **What you see:** Typing an unfinished “Prepare for …” prompt opens the item screen instead of auto-saving a half title onto Nudges.
- **Risk:** Low (Add / capture only).
- **What to try:** Add → Prepare for something. You land on details, not a finished Nudges row.

### Slice 6 — Document upload from the button

- **Commit:** `eef98ed` (23 Sep)
- **What you see:** Upload opens the file picker straight away (no stacked alerts). Documents hub can add files. Needs `expo-document-picker` in the native app.
- **Risk:** Medium (native file picker). Does not run at splash.
- **What to try:** Documents → Upload a photo or file. Leave it if this build crashes; the rest of the app does not depend on it.

### Slice 7 — Nudges as the one life timeline *(largest JS change)*

- **Commit:** `0238042` (23 Sep)
- **What you see:** Home, Add, Menu and Focus share one horizon. Nudges has Today / Week / month. Calendar uses the same dates. Dated Ready4 planner rows create a linked nudge.
- **Risk:** High (Home, Nudges, Calendar, Add, Menu rewrite). Still JavaScript, not a new native module — but it is the first slice that reshapes launch screens.
- **What to try:** App opens to Home. Add a dated nudge. It appears on Nudges Today/Week and on Calendar. Menu still opens. Do not skip this slice’s TestFlight.

### Slice 8 — Keep the date you typed

- **Commit:** `dea0ff8` (23 Sep)
- **Needs:** Slice 7
- **What you see:** “Tomorrow evening” (and similar) still has a date after the short confirmation save.
- **Risk:** Low if slice 7 is already good.
- **What to try:** Add → type “remind me to take the bins out tomorrow evening” → save. It keeps tomorrow.

### Slice 9 — Week shows each day even when busy

- **Commit:** `ecf5a25` (23 Sep)
- **Needs:** Slice 7
- **What you see:** Nudges Week keeps Today, Tomorrow and the rest of the week visible. Coming Up can still offer Simplify.
- **Risk:** Low if slice 7 is already good.
- **What to try:** Put several items in the week. Open Nudges → Week. Days are still listed.

### Slice 10 — Linked dates, one reward, first-run *(launch path)*

- **Commit:** `25db9b1` (23 Sep)
- **Needs:** Slice 7
- **What you see:**
  - Ready4 planner dates reuse one linked nudge (no duplicates)
  - Money remaining is budget minus actual
  - Points awarded once per item
  - After signup, a new first-run screen lets you save a first nudge without installing Ready4
- **Risk:** **Highest product slice.** Touches Splash (navigate to FirstRun), registration, Home, planner, budget, rewards.
- **What to try:** Fresh v4 install. Complete signup. Confirm you reach Home or FirstRun, not a stuck title. Save one nudge. Open a dated planner item — one linked nudge, not two. Sorted awards points once.

### Slice 11 — Honest Week, menus, first-run

- **Commit:** `260cc81` (23 Sep) app bits only (skip the QA markdown if you want a tiny diff)
- **Needs:** Slices 7 and 10
- **What you see:** Week can open later days so a tomorrow reminder is visible; menu tiles have accessible names; empty first-run does not preview a fake save.
- **Risk:** Low if slice 10 already opens.
- **What to try:** Tomorrow reminder visible in Week. First-run empty state does not look pre-saved.

---

## Do not put back as a bundle

These came **after** `260cc81`. They were launch-crash patches and rollbacks. Re-applying them together is how the app spent weeks aborting or sticking on the title.

| Commit | What it tried to do |
| --- | --- |
| `037451b` | Splash survives Face ID / notification errors |
| `b0b9401` | Delay iOS notification native calls |
| `6107af5` | Do not load notification modules during splash |
| `bc697cb` | Do not load calendar / location / Face ID during splash |
| `7bff780` | Plain splash shell before native modules |
| `06979ec` | Turn off new React Native architecture |
| `e03c20c` | Stop Keychain stampede after splash |
| `d2f790b` | Catch native-module abort in release |
| `c285e61` | Branded shell instead of white screen |
| `bbb8044` | Leave the title if storage never returns — last v3 IPA that **stayed open** (build 14) |
| `fc70ddc` | Show register if launch stalls — later v3 builds stuck or crashed |
| `7aeeec5`–`bcfef6f` | Expo Updates, then remove them, pod / SDK pinning |
| `f316be3` | Roll back to build 14 |
| `a945018` | Restore 0.3.1 (1) |
| `702b037` | Restore slices 1–11 **all at once** — crashed |
| `2a0991a` | Return to 0.3.1 (1) again |
| `ce65ce7`+ | v4 identity (already done) |

If a **single** later slice crashes on launch, stop and inspect that slice. Do not replay this table.

---

## What was already in 0.3.1 (1)

Do not treat these as “new” slices. They were in the first drop:

- Five tabs: Home / Nudges / Add / Menu / Focus
- Chips: Save · Sorted · Later · Ask · Remove
- Points +1 / +2 / +3
- Ready4 packs as optional configuration
- Crew on this phone (Invite)
- Local-first reminders, no calorie / barcode / diet tools
- Coming Up, Focus, settings, app lock as in that IPA

---

## Suggested first step

Slices **1–5 are in git** on this branch and have been checked here (tests). No Expo credit yet. Checkpoint 1 is the next phone TestFlight, when you want it.
