# Platform Functional QA — September 2026

Interactive pass on Expo web (phone viewport 390×844) plus the unit suite. Architecture was not redesigned. Five-tab navigation, one Nudges timeline, dual NudgeItem + PlannerItem stores, and the existing Reward / Crew / Money / affiliate engines were left in place.

Statuses: **PASS** · **FAIL** · **PARTIAL** · **NOT APPLICABLE**

---

## How this was tested

- Expo web at `http://localhost:19006`, APP_VARIANT=v3, Metro without CI freeze.
- Playwright as a normal user on a phone-sized viewport (and one desktop width).
- Screenshot mode (`?screenshot=`) for signed-in demo journeys.
- First-run screens opened directly to prove the new copy.
- TypeScript `tsc --noEmit` clean.
- Vitest **296** tests passing (baseline was 287).

Voice capture, camera upload, and PIN/Face ID were not available in this web session. Those are called out below rather than marked as product failures.

---

## Phase 1 — Screen and control audit

| Area | Status | Notes |
| --- | --- | --- |
| Home | PASS | Right now, Your day, Coming up, Reward glance, Ready4 chips. |
| Home → See my day | PASS | Opens Nudges Today. |
| Home Your day count | PASS | Uses the same horizon count as Nudges Today (open dated items). |
| Nudges Today / Week / Month / Year / All | PASS | Tabs present and switch the timeline. |
| Nudges Week (busy week) | PASS | Days of the week stay listed. Later days expand by default so a new item is visible. |
| Add | PASS | “What’s on your mind?”, Type it, path list. |
| Voice on web | PASS | Calm “Voice works on iPhone” copy. No fake Listening microphone. |
| Add confirm | PASS | Title, date and daypart shown before save. Back / Try again / Add details present. |
| Add Save | PASS | Saves and lands on Nudges. |
| Calendar month / next / previous / Today | PASS | Displayed month changes. |
| Calendar Day / Week / Month / Year | PASS | Views switch. Empty day copy is calm. |
| Focus | PASS | Selects one item. Not this one changes the item. Sorted present. |
| I did something | PASS | Saves once, +1 once, recent win list. |
| Menu | PASS | My life / Tools / App. No “Circle” wording. |
| Settings | PASS | Shop / Help me find it toggle present. |
| Crew hub | PASS | Invite, People supporting you, People you support, empty state. |
| Documents hub | PASS | Live Upload button, empty state. |
| Reward Bank | PASS | Available, lifetime, next reward, keep saving / claim. |
| My money | PASS | Core budget without a pack. |
| Ready4 catalogue | PASS | 18 content packs. |
| Pack planner | PASS | Glance, sections, quick add, Budget/Documents/Crew when supported. |
| First-run | PASS | Four short screens after legal signup + PIN. |
| Coming Up alias | PASS | Safe timeline, not a blank page. |
| Circle / AddTask aliases | PASS | Circle → Crew hub. AddTask → Add. |
| Console user-facing errors | PASS | No user-facing failure toasts or stack traces in the session. |

### Defects recorded this pass

#### F-1 — Linked Ready4 dates could mint a second Nudge

| | |
| --- | --- |
| **Screen** | Pack planner / Quick add |
| **Action** | Save a dated item, save again, or edit the date |
| **Expected** | One user-facing row on Nudges and Calendar |
| **Actual** | `linkNudge` always called `createItem` |
| **Cause** | No reuse of `nudgeItemId` |
| **Fix** | Idempotent `plannerNudgeLink` + date sync |
| **Retest** | PASS (unit + planner create) |

#### F-2 — Completing the same item could award points twice

| | |
| --- | --- |
| **Screen** | Focus / Nudges / Item details |
| **Action** | Sorted more than once, or planner Sorted then Nudges Sorted |
| **Expected** | Points once |
| **Actual** | `earnPoints` always added |
| **Cause** | Ledger had `sourceItemId` but no uniqueness |
| **Fix** | Skip when the same `sourceItemId` + kind (except tiny steps) already exists |
| **Retest** | PASS (unit) |

#### F-3 — Project remaining double-counted committed and actual

| | |
| --- | --- |
| **Screen** | Wedding / Moving budget |
| **Action** | Enter budget, committed, actual |
| **Expected** | Remaining = budget − actual. Overspend may be negative, calmly. |
| **Actual** | `leftMinor = budget − spent − committed` (often £0) |
| **Cause** | Committed is the unspent slice of expected, so subtracting it twice hid remaining |
| **Fix** | Remaining = envelope or item total − actual. Labels: Budget, Committed, Actual, Remaining |
| **Retest** | PASS (unit + on-screen £5,000 / £1,500.50 / £300 / £4,700) |

#### F-4 — Home “Your day” did not match Nudges Today

| | |
| --- | --- |
| **Screen** | Home |
| **Action** | Compare counts |
| **Expected** | Same open dated-today count |
| **Actual** | Home counted completed nudges only, not the unified horizon |
| **Cause** | `countTodayProgress(nudges)` vs horizon `todayCount` |
| **Fix** | Home uses `homePeek.todayCount` |
| **Retest** | PASS |

#### F-5 — Web Add showed a microphone that pretended to listen

| | |
| --- | --- |
| **Screen** | Add |
| **Action** | Open Add on web |
| **Expected** | Supported-device message |
| **Actual** | Large mic, “Listening…” fallback |
| **Cause** | `heroMic` always started a fake listen |
| **Fix** | “Voice works on iPhone. On this device, type…” |
| **Retest** | PASS |

#### F-6 — Onboarding never offered a first useful nudge

| | |
| --- | --- |
| **Screen** | After PIN |
| **Action** | New user enters the app |
| **Expected** | Short path to first nudge, Ready4 later |
| **Actual** | Welcome → Home, Ready4 discovery mixed in |
| **Cause** | No first-run |
| **Fix** | `FirstRunScreen` after new registration + PIN |
| **Retest** | PASS (four screens) |

#### F-7 — Pack planner had no edit / budget / documents door

| | |
| --- | --- |
| **Screen** | Pack planner |
| **Action** | Open item, budget, documents |
| **Expected** | Edit dated item; Budget and Documents when the pack supports them |
| **Actual** | Card had no `onOpen`; no Budget/Documents buttons |
| **Cause** | Shared planner UI omitted pack flags |
| **Fix** | Open linked nudge editor; Budget / Documents / Crew buttons from config |
| **Retest** | PASS (Moving + Wedding) |

#### F-8 — Nudges Week hid tomorrow’s new item under a collapsed day

| | |
| --- | --- |
| **Screen** | Nudges Week |
| **Action** | Save “Call dentist tomorrow morning”, open Week |
| **Expected** | Item visible on the week timeline |
| **Actual** | Day headings showed; only Today was expanded, so the title was off-screen in the collapsed Tomorrow row |
| **Cause** | Chronological week still defaulted expansion to day 0 |
| **Fix** | Expand all week days when showing the full chronological week |
| **Retest** | PASS — “Call dentist” under Tomorrow · 09:00 |

---

## Phase 2 — Core journeys

### Journey 1 — Simple nudge

Home → Add → Type “Call dentist tomorrow morning” → Confirm.

| Check | Status |
| --- | --- |
| Title = Call dentist | PASS |
| Date = tomorrow | PASS |
| Time/daypart 09:00 morning | PASS |
| Save | PASS |
| Nudges Week | PASS (after F-8) |
| Nudges Month | PASS |
| Calendar (same session) | PASS |
| Reload in screenshot demo | NOT APPLICABLE — demo items reset on `?screenshot=` reload by design |
| Sorted / reward once | PASS (Focus Sorted + earnPoints uniqueness) |

### Journey 2 — Today

Demo profile already has timed, untimed, future and completed items.

| Check | Status |
| --- | --- |
| Timed vs flexible bands | PASS |
| Future (dentist tomorrow) not due today | PASS |
| Completed excluded from open Today | PASS |

### Journey 3 — Calendar

| Check | Status |
| --- | --- |
| Previous / next / Today | PASS |
| Day / Week / Month / Year | PASS |
| Add then return without destructive refresh | PASS (same session) |
| Empty day copy | PASS |

Edit date / delete were exercised on pack items via the linked Item Details path (F-7).

### Journey 4 — Focus

| Check | Status |
| --- | --- |
| One item selected | PASS |
| Not this one | PASS |
| Rejected item not immediately returned | PASS |
| Sorted / reward / timeline | PASS (idempotent points) |

### Journey 5 — Voice

| Check | Status |
| --- | --- |
| Web: supported-device message | PASS |
| No broken microphone | PASS |
| Speak on iPhone | NOT APPLICABLE in this environment — TestFlight device required |

### Journey 6 — I did something

| Check | Status |
| --- | --- |
| Saved once | PASS |
| Reward once | PASS (+1) |
| Recent win appears | PASS |
| No extra Nudge on the open list | PASS (done note, not an open task) |

---

## Phases 7–16 (summary)

| Phase | Status | Notes |
| --- | --- | --- |
| 7 Home accuracy | PASS | Your day = horizon today. Coming up tomorrow/week from the same engine. |
| 8 Reward integrity | PASS | +1/+2/+3 unchanged. Once per source item + kind. Tiny steps still stack. |
| 9 Crew | PASS | Hub, empty state, Invite. Circle aliases remain redirects and do not appear in Menu. |
| 10 Documents | PASS | Hub Upload is a real picker. Attachments stay on the nudge. |
| 11 Affiliate | PASS | Shared engine. Saved Things empty state. Hide setting in Settings. Does not block Save. |
| 12 Accessibility | PASS | Button semantics. Menu tiles have accessible names. Calendar cells min 56px. Tab items min 52px. |
| 13 Mobile | PASS | No horizontal overflow on Home, Nudges, Add, Calendar at 390px. |
| 14 Empty states | PASS | Home, Today, Calendar day, Rewards, Crew, planner, budget £0.00, Documents. |
| 15 Failure states | PARTIAL | Storage load no longer surfaces raw `Error.message`. Microphone unavailable copy added. Device permissions need an iPhone. |
| 16 Legacy routes | PASS | Coming Up, Circle, AddTask. No loops observed. |

---

## Remaining known issues (not blocking TestFlight)

1. Legal name, email, date of birth, terms and PIN still come **before** the four first-run screens. That is required.
2. Voice and live file-picker UX need an iPhone for a complete pass.
3. On a very busy Today, Week still lists later days underneath — the user scrolls.
4. Date picker is a modal; Add here is blocked until the date is chosen or the sheet is dismissed.
5. Confirm project-budget values after a full app kill on a real signed-in profile (same-session persist passed).
