# Platform consolidation audit — September 2026

Maps the **Nudge Me Ready / Ready4 Master Platform Consolidation** prompt onto the live Expo 54 app. **Do not rebuild.** Dual stores stay. Chips stay Save · Sorted · Later · Ask · Remove. Points stay +1 / +2 / +3. Five-tab bar stays.

**Rule:** audit first, then adapters and UX consolidation. No second task system, calendar store, wallet, or budget engine.

## 1. Existing architecture found

| Area | Live implementation | Canonical files |
| --- | --- | --- |
| Navigation | 5 tabs: Home / Nudges (`Today`) / Add (`Capture`) / Menu (`More`) / Focus. Custom `TabMenu`. | `src/navigation/RootNavigator.tsx`, `src/components/TabMenu.tsx` |
| Nudge model | `NudgeItem` is the only create path. Legacy `TaskItem` create routes redirect. | `src/types/nudge.ts`, `src/services/nudgeItems.ts` |
| Planner overlay | `PlannerItem` is a specialist dated store. Horizon merges it at read time. | `src/types/ready4Planner.ts`, `src/hooks/useReady4Planner.tsx` |
| One life timeline | `nudgeHorizonEngine` unifies nudges + planner + budget dates. | `src/services/nudgeHorizonEngine.ts`, `src/hooks/useNudgeHorizon.ts` |
| Capture | Six core intents + voice + `classifyCaptureText`. Pack actions only when installed. | `src/screens/CaptureScreen.tsx`, `src/services/nudgeIntentCatalog.ts` |
| Rewards | One `RewardWallet`. Sorted / Focus / I did something earn +1/+2/+3. | `src/services/rewardBank.ts`, `src/screens/DidSomethingScreen.tsx` |
| Crew | Hub is Invite only. Circle / MyCrew / NudgyCrew / CrewsISupport alias the hub. | `src/screens/CrewHubScreen.tsx` |
| Budget | One ledger. Core My Money + Ready4 project budgets. | `src/services/budgetEngine.ts` |
| Affiliates | One `withAffiliate()` + ranking engine. | `src/services/affiliateRecommendationEngine.ts` |
| Calendar sync | Phone calendar import/export on items. Hub is a **list**, not a grid. | `src/services/calendarSync.ts`, `src/screens/CalendarHubScreen.tsx` |
| Voice | `VoiceCaptureButton` + speech recognition + TTS reminders. | `src/components/NudgeComponents.tsx` |
| Storage | Local encrypted stores. No cloud account. | `src/services/secureStore.ts` |
| Ready4 | Catalogue + install templates into `NudgeItem`. Pack planners optional. `linkNudge()` exists. | `src/data/readyPacks/`, `PackPlannerScreen` |

## 2. Duplicate / overlapping systems found

| Overlap | What the user sees | Keep |
| --- | --- | --- |
| Nudges tab vs What's coming up | Nudges opens a **filter-first list**. Coming Up is the real TODAY/WEEK/MONTH timeline. Same underlying data. | Make Nudges the timeline. Keep Coming Up as a deep-link wrapper over the same views. |
| Today vs Ready4 today | Menu → Planner hub when a planner pack is installed. Second “today”. | Keep planner as a pack filter, not a competing home. |
| Calendar hub vs Coming Up | Calendar lists appointments only. Coming Up already has every dated item. | Back Calendar with the **same horizon entries**. Visual grid, no new store. |
| Add decision tree vs free text | Categories first; “Something else” and voice exist but are secondary. | Lead with “What’s on your mind?” Voice + type first. Categories optional. |
| Home vs Coming Up vs Nudges | Home peeks Coming Up, then sends people to a second screen. | Home = control centre. See my day / coming up land on Nudges tabs. |
| Menu tiles | Flat ungrouped list; “Everything” + Coming Up + Calendar compete. | Group: My life / Tools / App. |

**Not duplicates (do not merge destructively):** `NudgeItem` vs `PlannerItem`; Reward Bank vs pack `rewardNote`; My Money vs pack project budgets.

## 3. Components to retain

- `NudgeItem` store, Capture six intents, Item Details, Focus, Reward Bank, I did something
- Horizon engine and `HorizonEntryCard`
- Ready4 catalogue, pack install, `linkNudge`, planner configs
- Crew hub + invite aliases, permissions
- Budget engine, documents, Saved Things, affiliates
- Voice capture, speaking reminders, location / pay-later, phone calendar sync
- Sorted language, +1/+2/+3, 5-tab bar, encryption
- Adaptation / Why hard / Make it smaller

## 4. Components to consolidate (UX, not schema)

| User job | After |
| --- | --- |
| Everything I need to remember | **Nudges** = TODAY \| WEEK \| MONTH \| YEAR \| ALL. Timeline from horizon. ALL keeps search/filters. |
| Visual dates | **Calendar** month/week/day/year grid over the same entries. |
| Get it out of my head | **Add** starts with type/voice + lightweight confirm. |
| What matters right now? | **Home**: Right now / Your day / Reward / Coming up counts / quiet Ready4. |
| Menu | Grouped My life / Tools / App. |
| Ready4 dated work | Pack add with a date **links a nudge** (already exists on quick-add; missing on pack section add). |

## 5. Components / routes that appear obsolete

| Route / screen | Status |
| --- | --- |
| `AddTask`, `VoiceAddTask`, `TaskBuddy` | **REDIRECT** → Capture. Keep. |
| `Circle`, `NudgyCrew`, `MyCrew`, `CrewsISupport` | **ALIAS** → Crew hub. Keep for deep links. Hide from Menu (already hidden). |
| `MyWorld` (“Everything”) | **ACTIVE** advanced list. Keep under Menu Tools; Nudges ALL is the everyday filter surface. |
| `ComingUp` | **ACTIVE** wrapper. Not deleted. Nudges becomes the habit. |
| `CrewsISupportScreen` / `MyCrewScreen` / `CircleScreen` / `NudgyCrewScreen` | **UNUSED UI** still in `src/screens`. Navigator mounts `CrewHubScreen` on those names. Do not delete this pass. |
| Ready4 Today (`PlannerHub`) | **ACTIVE** when a planner pack is installed. Keep in Menu, not tabs. |

## 6. Data migrations required

**None for this phase.** No schema drop, no PlannerItem → NudgeItem merge, no RewardWallet rewrite.

Adapters only:

- Horizon already de-dupes planner `nudgeItemId` and budget `reminderItemId`.
- Pack dated add should call existing `linkNudge`.
- Calendar reads horizon entries; phone `calendarEventId` stays on the nudge.

Existing encrypted blobs keep working.

## 7. Proposed implementation sequence

1. **Audit (this document)** — no data change.
2. **Central model** — confirm Horizon as the read model. Add calendar-grid + home-count helpers. No store rewrite.
3. **Navigation** — keep 5 tabs. Group Menu.
4. **Nudge views** — TODAY / WEEK / MONTH / YEAR / ALL on the Nudges tab using existing horizon builders.
5. **Calendar** — visual day/week/month/year over the same entries. Keep phone sync.
6. **Capture** — What’s on your mind, Tell me / Type it, confirm, optional categories. Fix “morning” time parse.
7. **Home + rewards glance** — Right now / Your day counts / compact progress. Keep +1/+2/+3. Completion card already on Focus.
8. **Ready4** — dated pack-section add links a nudge so it appears on Nudges / Calendar tagged with the pack.
9. **Crew / budgets / affiliates** — terminology already Crew; engines already shared. No rewrite.
10. **Legacy** — leave redirects; do not delete unmounted screens this pass.
11. **Tests** — horizon dates, calendar selection, capture confirm, pack→nudge link, existing vitest + tsc.

## 8. Risks

- Nudges tab currently hides Ready4 catalogue templates (`isReady4PackItem` filter). Timeline must **show dated pack items** without dumping undated install templates (Horizon already skips those).
- Default “later today” when the person did not say a time is already product policy (so items appear on the timeline). Confirmation must label it as a suggestion, not invented certainty.
- Calendar month grid must not load a second event store or break `syncToCalendar`.
- Do not rename Sorted, inflate points, add tabs, or merge PlannerItem into NudgeItem.
- Coming Up deep links and user-guide screenshots still mention that screen — keep the route.

## 9. Tests required

| Flow | Test |
| --- | --- |
| Nudge creation / date parse | Existing `classifyCaptureText`, `quickCapture`; add Friday afternoon / morning; capture preview summary |
| Date filtering / Today / Week | Existing horizon engine tests; home peek counts |
| Calendar date selection | New `calendarGrid` tests: month cells, next month changes dates, today, selected-day entries |
| Ready4 → Nudge | Pack dated add calls `linkNudge`; horizon still de-dupes |
| Reward allocation | Existing `rewardBank` tests (do not change scale) |
| Focus skip | Behaviour in Focus: “Not this one” advances and does not reshuffle the rejected item to the front |

Functional journeys A–F still need a running app after code lands (Expo web / device), not compile-only.
