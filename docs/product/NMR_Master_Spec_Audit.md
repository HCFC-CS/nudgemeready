# NudgeMeReady master spec — audit vs current build

Maps the master product prompt (10 Sep 2026) onto the Expo 54 local-first app. **Do not rebuild.** Shared engines already exist; Ready4 packs are configuration.

**Rule:** one Reward Bank, one `NudgeItem` store, one Coming Up horizon, one My Money budget, one affiliate URL helper. Planner is a specialist overlay, not a second task app.

**Status date:** 10 Sep 2026 — Phases 1–4 of this audit are **shipped on this branch**. The tables below describe the **live code**, not the original Phase 1 gap list.

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
| One Saved Things area | Menu → Saved Things. Compare up to three. Encrypted on device. | **ALREADY EXISTS** |
| One affiliate engine | `withAffiliate()` is the only tracker. Pack `affiliate` categories are ranked into 3–6 offers. | **ALREADY EXISTS** |
| One notification engine | Speaking reminders, quiet hours, daily summary, geofence, pay-later. | **PARTIALLY EXISTS** |
| One Crew layer | Local roles, invites, Ask for help on item details. Crew hub is Invite only. No multi-device sync. | **PARTIALLY EXISTS** |
| Ready4 as context only | 18 content packs install templates into `NudgeItem`. Planner is a second dated store merged at read time. | **PARTIALLY EXISTS** — keep dual stores; Horizon already unifies the timeline |

## How the prompt maps onto the app

The master prompt described a full life-support product (philosophy, rewards, health, find-it, nav). NMR did **not** rebuild that product. Phases 1–4 reused existing engines and only added missing *behaviours*.

| Prompt cluster | What the prompt asked | How NMR actually works |
| --- | --- | --- |
| §3–8 Philosophy / loop / action language | Remember → nudge → start → smaller → do → earn. DONE / LATER / MAKE IT SMALLER / SKIP TODAY. Why hard; missed-item adaptation. | Same loop across Capture, Nudges, Focus, Reward Bank. Chips stay **Save · Sorted · Later · Ask · Remove**. Make it smaller, Why hard, and adaptation are extra cards — they do not replace Sorted. |
| §9–27 Rewards | Primary engine; next + big goal; Keep saving; weekly review; 5/10/20 points; dream list / images. | One wallet. Compact glance on Home, Today (Nudges), Focus. Keep saving / Claim. Weekly review from the ledger. Scale stays **+1 / +2 / +3**. No dream-list images. |
| §28–56 Health | Optional calories, macros, hydration tracker, recipes, barcode, Mifflin-St Jeor. | **Not a diet app.** Hydration / meal / movement are ordinary core lists. Points blocked for weight / deficit / skipped meals. No NutritionProvider. |
| §57–82 Affiliates / find-it | One recommendation engine; Help me find it; I already have it; Saved Things; disable; no unsafe products. | Pack `affiliate` config ranked 3–6, still `withAffiliate()`. Collapsed Help me find it. Persist already-have. Menu Saved Things. Settings toggle. Health-unsafe queries dropped. |
| §83–88 Nav / a11y / data | Today, Nudges, Coming Up, Rewards, Ready4 as first-class dests; 3-tap actions. | Calm **5-tab** bar: Home / Nudges / Add / Menu / Focus. Rewards, Ready4Packs, Coming Up, Saved Things live in Menu / Home. Do not add a 10-tab bar. |

## Requirement groups

### Philosophy, loop, action language (§3–8)

| Requirement | Status | How it works vs the prompt |
| --- | --- | --- |
| Calm, non-judgemental copy | **MATCH** | “It still counts”; no miss penalties; adaptation never says overdue. |
| Remember → nudge → start → smaller → do → earn | **MATCH** | Capture → Nudges/Focus → Make it smaller / Sorted → Reward Bank. |
| DONE / LATER / MAKE IT SMALLER / SKIP TODAY | **INTENTIONAL CONFLICT** | Live chips are **Save · Sorted · Later · Ask · Remove**. Keep Sorted. Make it smaller and skip live on Why-hard / adaptation cards, not as a renamed chip. |
| Make it smaller + partial points | **MATCH** | Every Item Details type + Focus. Generic tiny steps when no keyword plan. Tiny steps = +1. |
| Why is this hard today? | **MATCH** | Item Details + Focus. Reasons never diagnose. Actions: shrink / 5-minute / later / skip today. |
| Missed-item adaptation | **MATCH** | One Nudges card (`pickStalledNudge`): “This one doesn’t seem to be working for you.” Options: smaller / move / less often / change / remove. |

### Rewards (§9–27, §84, §93)

| Requirement | Status | How it works vs the prompt |
| --- | --- | --- |
| Primary motivational engine | **MATCH** | Wallet + glance on Home, Today, Focus + Menu Reward Bank + Sorted completion. |
| One global wallet | **MATCH** | `RewardWallet` only. Packs never mint their own points. |
| Immediate / next / big goal | **MATCH** | Next reward line + bigger-goal line (`getBigGoal` = highest-threshold reward). |
| Visible on Today / week / completion | **MATCH** | Glance on Home / Today / Focus. Weekly review on Home + Reward Bank. Sorted still awards. |
| Dream list, images, styles, free-reward catalogue | **MISSING** | User can customise titles/points. No images, categories, or dream list. |
| Achievable pacing from activity | **MISSING** | Thresholds are user-editable defaults, not activity-based. |
| Point scale 5/10/20 | **INTENTIONAL CONFLICT** | Live scale is **+1 / +2 / +3**. Do not inflate. |
| Effort weighting + “That was hard” | **PARTIAL** | Difficulty exists at earn time. No post-task extra bonus. |
| No negative points / no punitive streaks | **MATCH** | Claim spends available; lifetime stays. Skip/snooze never deduct. |
| Claim vs Keep saving | **MATCH** | Alert: **Keep saving** / **Claim reward**. |
| Dual targets next + big | **MATCH** | Compact glance shows both when they differ. |
| Momentum messages / weekly review | **MATCH** | “You didn’t need a perfect week. You still moved forward.” Hidden if the week has no ledger activity. |
| Guilt-free treat copy | **MATCH** | Default is **£10 treat**. Exact title `£10 guilt-free treat` is migrated once. |
| No points for restriction | **MATCH** | Earn path blocks weight-loss / deficit / skipped-meal titles. Drink / walk still earn. |

### Health (§28–56, §94)

| Requirement | Status | How it works vs the prompt |
| --- | --- | --- |
| Optional health goals, calories, macros, hydration, recipes, meal planner | **PARTIAL — by design** | Core **Have a drink / I ate something / Move a little** lists (no pack required). Ready4 Wellbeing pack adds the same lists plus a meal-check template. No calories, macros, recipes, or meal planner. |
| NutritionProvider, barcode, Mifflin-St Jeor | **MISSING — do not build** | No real nutrition data source. Inventing one would fight “NMR is not a dieting app.” |
| No points for weight loss / restriction | **MATCH** | `isRestrictionRewardTitle` / `formatRewardEarnNotice`. |

Do **not** start a health tracker to “complete” the prompt. Product principle: NMR is not a dieting app. Health is optional, organisational, and reuses nudges/rewards/lists.

### Affiliates & find-it (§57–82, §95)

| Requirement | Status | How it works vs the prompt |
| --- | --- | --- |
| One AffiliateRecommendationEngine | **MATCH** | Ranks 3–6 offers from pack categories; still calls `withAffiliate()`. |
| Help Me Find It | **MATCH** | Named collapsed journey on item details, with Save. |
| I already have it / non-purchase route | **MATCH** | Hides the block; persists per item. Completing a nudge never requires purchase. |
| Pack `affiliateCategories` | **MATCH** | Pack content `affiliate` config; ranking in the shared engine. |
| Saved Things + Compare | **MATCH** | Menu hub; compare limit 3. Encrypted. |
| User can disable suggestions | **MATCH** | Settings → Show shop and booking ideas. |
| Disclosure | **MATCH** | Short/long pending vs active. |
| No banner ads / no pressure copy | **MATCH** | Quiet rows only. |
| Health-unsafe products | **MATCH** | Ranking drops weight-loss / diet-pill / similar queries. Yoga mat / water bottle allowed. |
| Location-aware ranking, registries, real partner IDs | **MISSING** | Search URLs + partner ids only. Gift registries / suppliers / local services stay thin. |

### Navigation, a11y, data (§83–88, §96–97)

| Requirement | Status | How it works vs the prompt |
| --- | --- | --- |
| Simple nav: Today, Nudges, Coming Up, Rewards, Ready4 | **INTENTIONAL CONFLICT** | Tabs: Home / Nudges / Add / Menu / Focus. Rewards and Ready4Packs live in Menu. Coming Up is Home + Menu. Do not add a 10-tab bar. |
| Three-tap common actions | **PARTIAL** | Confirm on list; Later/Sorted on details. |
| Accessibility | **PARTIAL** | Roles/labels on many controls; contrast unmeasured. |
| Dual dated stores | **KEEP AS-IS** | Horizon merges `NudgeItem` + `PlannerItem` at read time. Correct product split; do not invent a third store or force-merge. |

## Conflicts to respect

1. **Do not create a second wallet, nudge store, calendar, or affiliate tracker.**
2. **Do not rename Sorted → Done** — it would fight the shipped calm language.
3. **Do not inflate points to 5/10/20** — current +1/+2/+3 is readable and already earned everywhere.
4. **Do not build a calorie/weight tracker.** Optional wellbeing is ordinary nudges and lists only. Never medical, never rewarded for restriction.
5. **Do not merge PlannerItem into NudgeItem** as a breaking migration. Link them; Horizon already unifies the timeline.
6. **Do not add Ask to the Crew hub.** Invite only. Ask stays on item details.
7. **Do not add a 10-tab bar.**

## Implementation plan (priority)

### Phase 1 — shared motivation — **SHIPPED**

Compact next + big-goal glance; Keep saving / Claim; £10 treat (no guilt); Sorted awards +1/+2/+3 from Item Details; Help me find it; I already have this; Settings shop toggle.

### Phase 2 — adapt the task to the person — **SHIPPED**

Why is this hard; missed-item “this doesn’t seem to be working”; Make it smaller on every item type with default tiny steps; weekly review from the existing ledger.

### Phase 3 — find-it depth — **SHIPPED**

Pack `affiliateCategories` feeding `withAffiliate`; Saved Things; 3-item compare; ranking tests; health-unsafe drop.

### Phase 4 — optional wellbeing — **SHIPPED**

Hydration / meal-check / movement lists as **core nudges** (no Ready4 pack required). Points only for logging/movement, never for weight or deficit. No NutritionProvider.

### What still needs doing for a useful daily companion

See [What_Needs_Doing.md](./What_Needs_Doing.md). Remaining work is the **short daily path** (quick save, reminders that fire, act from the list, Coming Up as the habit) — not more engines, not a diet tracker, not a 10-tab bar.

### Still missing vs the prompt (polish / do not start until A–F feel natural)

Dream-list images / reward styles; activity-based reward pacing; post-task “That was hard” bonus; location-aware shop ranking; gift registries / suppliers; cloud sync; RevenueCat; cosmetics; AI Coach; calorie calculator / barcode; 10-tab bar.

### Deferred / out of scope

Cloud sync, multi-device Crew, RevenueCat store, cosmetics, AI Coach, 10-tab bar, calorie calculator, barcode, dream-list images, NutritionProvider.
