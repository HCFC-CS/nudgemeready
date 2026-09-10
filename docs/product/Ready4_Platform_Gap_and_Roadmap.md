# Ready4 Platform — Gap analysis and roadmap

Maps the [Master Ready4 Platform Spec](./Ready4_Master_Platform_Spec.md) to the current Expo app.

## Architecture rule

**Shared engines once; packs as templates.** Never ship a separate “Wedding app” or “Moving app”.

**Canonical models:** `NudgeItem` + Capture / ItemDetails; **Reward Bank** is the only points wallet. Legacy `TaskItem` / `useTasks` and soft `gamification` badges are deprecated and not mounted in the live app.

## Gap snapshot

| Spec area | Current state | Status |
| --- | --- | --- |
| Core nudges / Today / Capture / Focus | Strong | **Shipped** |
| Ready4 pack catalogue + install | 15+ packs in `src/data/readyPacks/ready4/` | **Shipped** |
| Crew | CrewHub + invite / roles / permissions | **Shipped** (deepen later) |
| Lists / documents / calendar sync | Present on items | **Shipped** (unify later) |
| Affiliate / shop suggestions | SubtleOutboundLinks | **Shipped** (quiet) |
| Core “What do you want to do?” (6 intents) | CaptureScreen + intent catalog | **Shipped** |
| Ready4 nudge extensions (installed only) | `ready4NudgeExtensions.ts` | **Shipped** |
| Reward Bank (+1/+2/+3, custom rewards, claim) | `rewardBank.ts` + RewardBankScreen + DidSomething | **Shipped** |
| I did something | Nested under Reward Bank | **Shipped** |
| Quick Wins / tiny steps | Task breakdown + Make it smaller | **Shipped** |
| Cross-pack Home | Greeting, Coming Up peek, pack strip, reward glance | **Shipped** (calm IA) |
| Budget engine (My Money core + Ready4 project stubs) | `BudgetScreen` + encrypted ledger | **Shipped** |
| Ready4 Planner engine | PackPlanner + PlannerHub + Study-rich configs | **Foundation shipped** |
| Universal Nudge Horizon | `nudgeHorizonEngine` + ComingUp + Home peek | **Shipped** |
| List dates from planner events | `listPlannerAnchor` + ListPlannerDateLink | **Shipped** (Study exam lists) |
| Gift registries / suppliers / local services | Thin / missing | Phase 3 |
| Reward glance on Today / Focus + Keep saving | Compact next + bigger goal | **Shipped (Phase 1)** |
| Help me find it / I already have this / shop toggle | SubtleOutboundLinks + Settings | **Shipped (Phase 1)** |
| 10-destination tab bar | 5 tabs: Home → Nudges → Add → Menu → Focus | Deferred |
| Packs without planner configs | All catalogue content packs have planner configs | **Shipped** |
| Documents / Calendar hubs | Thin Menu hubs over item attachments / calendar-linked nudges | **Shipped** (light) |
| Cloud sync / multi-device | Local encrypted storage only | By design for now |

## IA (locked)

| Job | Home |
| --- | --- |
| Add | Add tab → Capture |
| Working list | Nudges tab |
| Life timeline | Coming Up (Home + Menu) |
| Pack Today / week | Menu → Ready4 today & this week (when a planner pack is installed) |
| Money / Rewards / Crew / Packs | Menu |
| Everything / Calendar / Documents | Menu hubs (browse engines already on items) |

## Master-prompt phases (NMR audit)

See [NMR master spec audit](./NMR_Master_Spec_Audit.md) for the vs-spec tables.

| Phase | Theme | Status |
| --- | --- | --- |
| 1 | Shared motivation (glance, Keep saving, find-it labels) | **Shipped** |
| 2 | Adapt the task (Why hard, stalled-item card, Make it smaller, weekly review) | **Shipped** |
| 3 | Find-it depth (pack affiliate ranking, Saved Things, compare 3) | **Shipped** |
| 4 | Optional wellbeing as core nudges (not a diet app) | **Shipped** |

Still out of scope unless asked: dream-list images, 5/10/20 points, calorie/barcode trackers, 10-tab bar, cloud sync.

**What still needs doing for usefulness** (quick save, reminders that fire, act from the list): [What_Needs_Doing.md](./What_Needs_Doing.md).

## File anchors

- Items: `src/types/nudge.ts`, `src/services/nudgeItems.ts`  
- Packs: `src/data/readyPacks/`, `src/hooks/useReadyPacks.tsx`  
- Planner: `src/types/ready4Planner.ts`, `src/services/ready4Planner*.ts`, `src/hooks/useReady4Planner.tsx`  
- Horizon: `src/types/nudgeHorizon.ts`, `src/services/nudgeHorizonEngine.ts`, `src/hooks/useNudgeHorizon.ts`, `ComingUpScreen`  
- Rewards: `src/services/rewardBank.ts`, `src/hooks/useRewardBank.tsx`, `src/components/RewardGlance.tsx`  
- Breakdowns: `src/services/taskBreakdowns.ts`  
- List↔planner dates: `src/services/listPlannerAnchor.ts`  
