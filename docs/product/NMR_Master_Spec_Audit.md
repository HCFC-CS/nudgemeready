# NudgeMeReady master spec — audit vs current build

Maps the master product prompt (10 Sep 2026) onto the Expo 54 local-first app. **Do not rebuild.** Shared engines already exist; Ready4 packs are configuration.

**Rule:** one Reward Bank, one `NudgeItem` store, one Coming Up horizon, one My Money budget, one affiliate URL helper. Planner is a specialist overlay, not a second task app.

## Engine map

| Spec “one of” | Current | Classification |
| --- | --- | --- |
| One user / profile | On-device profile + app lock. No cloud account. | **PARTIALLY EXISTS** |
| One task system | Canonical `NudgeItem`. Legacy `TaskItem` retired from create paths. | **ALREADY EXISTS** |
| One nudge system | Same store. Capture six intents work with no pack. | **ALREADY EXISTS** |
| One calendar/time | Item dates + phone calendar sync + Coming Up. No month grid. | **PARTIALLY EXISTS** |
| One goal framework | Informal project notes + budget savings goals + reward thresholds. Not one Goal entity. | **PARTIALLY EXISTS** |
| One reward wallet | `RewardWallet` / Reward Bank only. Packs do not have their own points. | **ALREADY EXISTS** |
| One shopping-list architecture | Nudge `list` items + Ready4 Shopping templates. No separate shopping engine. | **PARTIALLY EXISTS** |
| One Saved Things area | Missing. | **MISSING** |
| One affiliate engine | `withAffiliate()` is the only tracker. Gift / travel / pack shops are catalogues that call it. | **PARTIALLY EXISTS** |
| One notification engine | Speaking reminders, quiet hours, daily summary, geofence, pay-later. | **PARTIALLY EXISTS** |
| One Crew layer | Local roles, invites, Ask for help. No multi-device sync. | **PARTIALLY EXISTS** |
| Ready4 as context only | 18 content packs install templates into `NudgeItem`. Planner is a second dated store merged at read time. | **NEEDS EXTENDING** |

## Requirement groups

### Philosophy, loop, action language (§3–8)

| Requirement | Status | Notes |
| --- | --- | --- |
| Calm, non-judgemental copy | **ALREADY EXISTS** | “It still counts”; no miss penalties. |
| Remember → nudge → start → smaller → do → earn | **PARTIALLY EXISTS** | Loop lives across Capture, Nudges, Focus, Reward Bank. |
| DONE / LATER / MAKE IT SMALLER / SKIP TODAY | **CONFLICTS WITH CURRENT BUILD** | Live chips are **Save · Sorted · Later · Ask · Remove**. Keep Sorted — it is the calm completion word. Add Make it smaller more widely; do not rename Sorted to Done. |
| Make it smaller + partial points | **ALREADY EXISTS** | Every Item Details type + Focus. Generic tiny steps when no keyword plan. Tiny steps = +1. |
| Why is this hard today? | **ALREADY EXISTS** | Item Details + Focus. Supportive reasons; shrink / skip / move. Never diagnoses. |
| Missed-item adaptation | **ALREADY EXISTS** | One Nudges card plus Item Details: “This one doesn’t seem to be working for you.” |

### Rewards (§9–27, §84, §93)

| Requirement | Status | Notes |
| --- | --- | --- |
| Primary motivational engine | **NEEDS EXTENDING** | Wallet works; visibility is thin (Home glance, Menu bank, Done). Today/Focus have no compact progress. |
| One global wallet | **ALREADY EXISTS** | |
| Immediate / next / big goal | **PARTIALLY EXISTS** | Next reward only. No explicit big-goal line. |
| Visible on Today / week / completion | **NEEDS EXTENDING** | Home only. |
| Dream list, images, styles, free-reward catalogue | **MISSING** | User can customise titles/points. No images, categories, or dream list. |
| Achievable pacing from activity | **MISSING** | Thresholds are user-editable defaults, not activity-based. |
| Point scale 5/10/20 | **CONFLICTS WITH CURRENT BUILD** | Live scale is **+1 / +2 / +3** (normal / hard / really hard). Do not inflate. Keep understandable small numbers. |
| Effort weighting + “That was hard” | **PARTIALLY EXISTS** | Difficulty exists. No post-task effort bonus. |
| No negative points / no punitive streaks | **ALREADY EXISTS** | Claim spends available; lifetime stays. |
| Claim vs Keep saving | **PARTIALLY EXISTS** | Alert uses “Not yet”. Needs explicit Keep saving. |
| Dual targets next + big | **MISSING** | |
| Momentum messages / weekly review | **ALREADY EXISTS** | Home + Reward Bank card from the existing ledger. Dismissible per ISO week. |
| Guilt-free treat copy | **NEEDS EXTENDING** | Default title still used guilt framing. |

### Health (§28–56, §94)

| Requirement | Status | Notes |
| --- | --- | --- |
| Optional health goals, calories, macros, hydration, recipes, meal planner | **MISSING** | Ready4 Wellbeing/Medication are organisational templates only. |
| NutritionProvider, barcode, Mifflin-St Jeor | **MISSING** | |
| No points for weight loss / restriction | **ALREADY EXISTS** | Nothing to gamify — keep this invariant if health is added later. |

Do **not** start a health tracker in this pass. Product principle: NMR is not a dieting app. Health is Phase 4+, optional, organisational, and must reuse nudges/rewards/lists.

### Affiliates & find-it (§57–82, §95)

| Requirement | Status | Notes |
| --- | --- | --- |
| One AffiliateRecommendationEngine | **PARTIALLY EXISTS** | URL helper + several catalogues, not ranked 3–6 offers. |
| Help Me Find It | **MISSING** as a named journey | Closest: collapsed “Optional shops / ideas”. |
| I already have it / non-purchase route | **MISSING** | Completing a nudge never requires purchase. |
| Pack `affiliateCategories` | **MISSING** | Hardcoded `readyPackShopLinks`. |
| Saved Things + Compare | **MISSING** | |
| User can disable suggestions | **MISSING** | |
| Disclosure | **ALREADY EXISTS** | Short/long pending vs active. |
| No banner ads / no pressure copy | **ALREADY EXISTS** | |
| Health-unsafe products | **PARTIALLY EXISTS** | Policy copy; no ranking block-list yet. |

### Navigation, a11y, data (§83–88, §96–97)

| Requirement | Status | Notes |
| --- | --- | --- |
| Simple nav: Today, Nudges, Coming Up, Rewards, Ready4 | **PARTIALLY EXISTS** | Tabs: Home / Nudges / Add / Menu / Focus. Rewards and Ready4Packs live in Menu. Do not add a 10-tab bar. |
| Three-tap common actions | **PARTIALLY EXISTS** | Confirm on list; Later/Sorted on details. |
| Accessibility | **PARTIALLY EXISTS** | Roles/labels on many controls; contrast unmeasured. |
| Dual dated stores | **NEEDS EXTENDING** | Horizon merges NudgeItem + PlannerItem. Correct product split; keep both, do not invent a third. |

## Conflicts to respect

1. **Do not create a second wallet, nudge store, calendar, or affiliate tracker.**
2. **Do not rename Sorted → Done** in this pass — it would fight the shipped calm language.
3. **Do not inflate points to 5/10/20** — current +1/+2/+3 is readable and already earned everywhere.
4. **Do not build calories/hydration/weight now.** Optional later, never medical, never rewarded for restriction.
5. **Do not merge PlannerItem into NudgeItem** as a breaking migration. Link them; Horizon already unifies the timeline.

## Implementation plan (priority)

### Phase 1 — shared motivation

Extend Reward Bank and find-it **in place**:

1. Compact next + big-goal glance on Home, Nudges, and Focus.
2. Explicit **Keep saving** / **Claim reward**.
3. Drop guilt framing on the default £10 treat; migrate that exact title only.
4. Award the same +1/+2/+3 when Sorted from Item Details (parity with Nudges / Focus).
5. Label pack shop rows **Help me find it**; allow **I already have this**.
6. Settings toggle to hide shop/booking ideas.

### Phase 2 — adapt the task to the person (this pass)

Why is this hard; missed-item “this doesn’t seem to be working”; Make it smaller on every item type with default tiny steps; weekly review from the existing ledger. Still no second engine.

### Phase 3 — find-it depth

Pack `affiliateCategories` feeding the existing `withAffiliate` helper; Saved Things; 3-item compare; ranking tests. Still one engine.

### Phase 4 — optional wellbeing (not a diet app)

Hydration / meal-check lists as **nudges and lists**, points only for logging/movement, never for weight or deficit. NutritionProvider only if a real data source exists.

### Deferred / out of scope

Cloud sync, multi-device Crew, RevenueCat store, cosmetics, AI Coach, 10-tab bar, calorie calculator, barcode, dream-list images.
