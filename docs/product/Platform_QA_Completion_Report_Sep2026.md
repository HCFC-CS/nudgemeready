# Platform QA Completion Report — September 2026

Branch: `cursor/ready4-platform-audit-fixes`  
PR: kept **Draft** (not merged, not pushed to `main`).

This pass did not redesign the app. It proved journeys, repaired defects, audited every Ready4 pack, shortened onboarding after legal signup, and checked persistence and mobile use.

---

## 1. Tests performed

- Interactive Expo web, phone viewport 390×844, plus one desktop width.
- Core journeys 1–6 (simple nudge, Today, Calendar, Focus, Voice fallback, I did something).
- All 18 catalogue Ready4 packs: open, create, empty state, back.
- Moving + Wedding: dated planner, Budget, Documents, remaining maths.
- Home / Reward / Crew / Documents / Affiliate / Menu / Settings / legacy aliases.
- First-run four screens.
- TypeScript clean.
- Full Vitest suite.

---

## 2. Defects found

1. Dated pack save could create a second NudgeItem.
2. Completing the same item could add points twice.
3. Project remaining subtracted committed and actual (false £0).
4. Home “Your day” disagreed with Nudges Today.
5. Web Add used a fake listening microphone.
6. After PIN, no short path to a first useful nudge.
7. Pack planner had no edit door and hid Budget/Documents even when configured.
8. Nudges Week listed later days but left them collapsed, so “Call dentist tomorrow” looked missing.
9. Storage failures could show a raw `Error.message`.
10. Menu tiles had no accessible name (subtitle polluted the label).
11. Planner card still said “Done” instead of “Sorted”.

---

## 3. Defects fixed

| Defect | Fix |
| --- | --- |
| Duplicate linked nudges | `plannerNudgeLink` reuses the existing nudge; planner ↔ nudge dates stay in sync |
| Double points | `earnPoints` is unique per `sourceItemId` + kind (tiny steps still stack) |
| Budget remaining | Remaining = budget − actual; optional overall envelope; calm overspend |
| Home counts | Your day uses horizon `todayCount` |
| Web voice | Supported-device message; type instead |
| Onboarding | Four-screen first-run after new registration + PIN; Ready4 after first value |
| Pack doors | onOpen → linked editor; Budget / Documents / Crew from pack flags |
| Week visibility | Chronological Week expands each day |
| Storage errors | Calm copy, no stack / raw exception |
| Menu a11y | `accessibilityLabel` on tiles |
| Planner chip | Sorted |

---

## 4. Remaining known issues

None of these block a careful TestFlight group, but testers should know them:

- Name, email, date of birth, terms and PIN are still required **before** the four first-run screens (legal / lock). Ready4 is not required.
- Voice capture and a real document picker need an iPhone. Web is honest about that.
- A packed Today still sits above later week days; users scroll. Items are not deleted.
- Date picker is a modal; choose a date or dismiss it before Add here.
- Confirm project-budget figures after killing the app on a signed-in device (same-session persist passed).
- Ready4Party is not in the catalogue.
- Screenshot/demo mode resets demo nudges on reload. That is not how a signed-in profile behaves.

---

## 5. Ready4 pack matrix summary

18 / 18 catalogue packs load, accept a created item, and return with Back.  
Ready4Party: **N/A** (not shipping).

Budget-enabled packs expose the shared money engine (not a second wallet).  
Document-enabled packs open the shared Documents hub.  
Dated items feed Nudges and Calendar **once**.

Full table: `docs/product/Ready4_Pack_Functional_Audit_Sep2026.md`.

---

## 6. Persistence results

| Store | Same session | After reload (signed-in) |
| --- | --- | --- |
| NudgeItem | PASS | PASS in app storage; screenshot demo N/A |
| PlannerItem | PASS | PASS (encrypted planner state) |
| Project budget figures | PASS (Wedding Journey F totals) | Confirm on device after process kill |
| Reward ledger | PASS | Unique earn events persist with the wallet |
| First-run flag | PASS | `pendingFirstRun` / `firstRunCompletedAt` on profile |
| Documents | PASS (attachments on the nudge) | Unchanged from the live-upload fix |

---

## 7. Accessibility results

- Interactive controls use button semantics where they are pressable.
- Menu tiles now have a short accessible name.
- Calendar cells 56px min height; tab items 52px; Invite / Save remain full-width.
- Meaning is not colour-only (labels on Today/Week, Sorted, Remaining).
- Baby-blue / taupe label contrast from the previous pass kept.
- Screen titles: Home, Nudges, Add, Menu, Focus, pack planner names, Wedding budget, Crew.

---

## 8. Mobile results

Phone viewport 390×844:

- Home, Nudges, Add, Calendar: no horizontal overflow.
- Bottom navigation does not cover padded scroll content.
- Add confirm, first-run, and budget fields sit above the keyboard with `keyboardShouldPersistTaps`.
- Calendar cells stay tappable.
- No cut-off primary actions on Home / Add / Budget save.

---

## 9. Automated test result

| Check | Result |
| --- | --- |
| `tsc --noEmit` | Clean |
| Vitest | **296 passed** (was 287) |
| New coverage | planner link reuse, reward once-only, budget remaining / envelope / overspend, money parse (blank / decimal / NaN) |

Tests were not weakened to hide failures.

---

## 10. User acceptance result

Clean-profile sequence (first-run screens + demo journeys as a person who does not know the code):

| Step | Result |
| --- | --- |
| Launch / legal / PIN | Unchanged, required |
| First-run: Get started → what would help → notifications → first nudge | PASS, skippable, Ready4 not required |
| Home | PASS |
| Today | PASS |
| Add another (Call dentist tomorrow morning) | PASS — title + Tomorrow 09:00 |
| Week | PASS — dentist under Tomorrow |
| Calendar | PASS — same timeline |
| Focus / complete | PASS |
| Reward | PASS, +1 once |
| Ready4Moving planner + dated item | PASS |
| Central timeline / calendar | PASS (one row) |
| Edit from pack | PASS (linked editor) |
| Budget | PASS — envelope, free-form category, remaining |
| Crew | PASS — empty + Invite |
| Menu / Settings | PASS |

Friction fixed during UAT: collapsed Week days, fake web mic, missing pack Budget/Documents, first-run preview of “Something for later” on an empty field.

---

# READY FOR TESTFLIGHT USER TESTING

A normal person can add a nudge, see it on Nudges and Calendar, complete it for points once, open a Ready4 pack, add a dated item without doubling it, and set a wedding/moving budget without NaN. Voice and camera still need a phone; that is expected for this web audit, not a ship blocker for TestFlight beside v2.
