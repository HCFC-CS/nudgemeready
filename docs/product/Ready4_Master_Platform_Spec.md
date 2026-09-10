# NudgeMeReady — Master Ready4 Platform Specification

Canonical architecture for the Ready4 platform. **Shared engines first; packs are configuration, not separate apps.**

See also: [Ready4_Platform_Gap_and_Roadmap.md](./Ready4_Platform_Gap_and_Roadmap.md), [AGENTS.md](../../AGENTS.md).

## Objective

Build NudgeMeReady as a modular life-support platform with a shared core and configurable Ready4 packs.

**Build shared functionality once, then reuse it across every Ready4 pack.**

Do NOT build each Ready4 pack as a separate application.

Create:

1. Shared NudgeMeReady Core  
2. Shared Reward & Motivation Engine  
3. Shared Crew / Support Engine  
4. Shared Lists / Tasks Engine  
5. Shared Budget Engine  
6. Shared Documents Engine  
7. Shared Calendar / Reminder Engine  
8. Shared Affiliate / Recommendations Engine  
9. Shared Local Services Engine  
10. Pack-specific templates and journeys  

Tone: calm, supportive, adult, non-judgemental. **Progress over perfection. Small nudges. Bigger progress.**

## Navigation (target vs current)

Target destinations: Home, My Day, Ready4 Packs, Rewards, Crew, Calendar, Documents, Money, My Lists, Settings.

**Current shipping app** keeps a calm 5-tab bar (**Home, Nudges, Add, Menu, Focus**) and surfaces Rewards / packs / Coming Up via Home and Menu.

## Shared engines (summary)

| Engine | Principle |
| --- | --- |
| Reward Bank | One wallet for all packs. +1 / +2 / +3. Never remove points for miss, skip, or hard days. Customisable rewards. |
| I did something | Log unplanned wins; credit points; keep “Things I Did That Weren’t On The List”. |
| Quick Wins | Any task can shrink to tiny steps; “Not now” has no penalty. |
| Nudge | Do now / Later / Snooze / Make smaller / Ask Crew / Skip today / Done. |
| Crew | Granular permissions; never assume full access. |
| Tasks / Lists / Calendar / Documents / Budget | One model each; pack content via `packId`. |
| Affiliate / Local services | Structured categories; optional location; subtle UI. |

## Points

- 1 = normal  
- 2 = hard / avoided  
- 3 = genuinely difficult  

Difficulty may vary by day. No negative scoring. No shame language. No failure states.

## Default reward bank examples

```text
5  Favourite coffee
10 £10 guilt-free treat
15 Takeaway or lunch out
25 £25 treat
40 Beauty, hobby or clothing treat
60 Something bigger I've been wanting
100 Day out or experience
```

Users may customise all rewards.

## Pack configuration

Each Ready4 pack is generated from configuration (`id`, modules, templates, document/budget categories, affiliate categories, crew/local flags) — not hard-coded duplicate layouts.

## MVP order

1. Core + pack framework + tasks + nudges + rewards + Quick Wins + Today/Home  
2. Calendar, lists, documents, crew deepen, budget  
3. Affiliate categories, registries, suppliers, local services, advanced journeys  
4. Analytics, personalisation, adaptive nudges, AI breakdown  

## Do not duplicate

Ask: *Does NudgeMeReady already have a shared component that can do this?*  
One Budget Engine, one Checklist Engine, one Reward Engine — load pack-specific categories.

## Product principle

Not primarily a task-management app. A **life initiation, organisation and support system** that moves people from “I know I need to do it” to “I know the next small step.”

Full pack module lists (Home, Finance, Study, Medication, Work, Family, Travel, Wellbeing, Shopping, Independence, Appointments, Moving, Wedding, Baby, Party) and detailed field models live in Edition 1 product docs under `docs/product/ready4/` and in this repository’s Ready4 catalogue (`src/data/readyPacks/ready4/`).
