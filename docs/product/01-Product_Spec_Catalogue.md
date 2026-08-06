# Nudge Me Ready — Product Spec Catalogue

**Product:** Nudge Me Ready  
**Platform:** iOS (primary), Expo / React Native  
**Version focus:** 0.2.0 TestFlight  
**Edition alignment:** Catalogue Edition 1 (Ready 4 content packs)  
**Last updated:** 2026-08-06

---

## 1. Purpose

Nudge Me Ready is a supportive reminder, routine and shared-care companion. It helps people prepare, remember and complete everyday life tasks without shame, guilt or medical diagnosis.

It is more than a timer: it combines **smart nudges**, **ReadyPack life systems**, **Crew support**, optional **voice**, **calendar/contacts**, and **on-device privacy**.

### Mission (Edition 1)

Remove the anxiety of forgetting by delivering timely, compassionate nudges that help people prepare, remember and succeed without judgement.

### Vision (Edition 1)

Become a trusted digital companion for remembering life’s important moments — at home, at work, in education and in care settings — without claiming to replace clinicians or emergency services.

---

## 2. Product principles

From `AGENTS.md` and Edition 1 brand book:

| Principle | Spec implication |
| --- | --- |
| Never shame | Copy, empty states and missed reminders stay warm and restart-friendly |
| No guilt language | No streaks-as-punishment; rest is valid |
| Warm & clear | Plain language; short sentences |
| All reminders editable | Every installed ReadyPack item can be edited, snoozed, rescheduled or dismissed |
| No penalty for pause | Snooze / dismiss / skip without loss of dignity |
| Privacy | On-device storage; encryption; optional app lock |
| Accessibility | Large tap targets, VoiceOver-friendly labels, voice capture, calm colour system |
| No medical advice | Medication / emergencies / wellbeing packs are organisational only |

### Brand system

- Warm taupe, baby blue, soft grey, restrained gold  
- Calm, uncluttered layouts  
- Tone: trusted friend — calm, practical, encouraging

---

## 3. Who we serve

| Audience | How the product helps |
| --- | --- |
| Neurodivergent adults | External structure, tiny steps, editable routines |
| Busy families | Shared mental load via Crew + Family / Home packs |
| Students | Study pack, Focus, calendar |
| Older adults / independence | Independence, Appointments, Emergencies (organisational) |
| Carers / supporters | Crew invite, supporter-only mode, Ask for Help |
| Anyone with high cognitive load | Ready 4 systems instead of blank-slate planners |

**Not a medical device.** Does not diagnose, prescribe, change medication, or replace emergency services.

---

## 4. Platform modules (catalogue)

### 4.1 Core nudge engine — **Shipped**

| Capability | Detail |
| --- | --- |
| Item types | task, project, subtask, appointment, reminder, routine, chore, list, event, occasion / special_day, note |
| Status | open, done, paused, waiting, cancelled |
| Priority | not_urgent, soon, important, needs_attention |
| Repeat | none, daily, weekly, monthly, yearly, custom |
| Actions | edit, complete, snooze, reschedule, dismiss, attach documents/photos |
| Energy / effort | optional low–high / tiny–large fields |
| Speaking text | optional spoken reminder phrasing |
| Provenance | ReadyPack installs can show pack origin banner |

**Primary surfaces:** Home, Today (My Nudges), Capture (+nudge), Focus, type browse screens, Item Details.

### 4.2 Navigation — **Shipped**

**Tabs:** Home · Today · Capture (+nudge) · Focus · More  

**Key stacks:** Splash (register / unlock) · ItemDetails · Add / Voice add · Help · Projects / Lists / Chores / Reminders / Routines / Events / Appointments / Notes / Occasions · Done · MyCrew / Invite / Accept / Crews I Support · ReadyPacks / Preview · Profile · Settings · Legal / Terms / Crew terms · DevAdmin (dev only)

### 4.3 ReadyPacks — **Shipped (content)**

| Kind | Status |
| --- | --- |
| Content packs (Ready 4 × 15) | Live catalogue |
| Theme / voice / character cosmetics | In data; largely gated off for market honesty |
| AI Coach prompts on packs | Stored on packs; full Coach UI not market-ready |
| Achievements / badges UI | Gated |
| Bundles / Premium subscription | Edition 1 commercial; not store-live while RevenueCat keys empty |

See [02 — Ready 4 Catalogue](./02-Ready4_Catalogue_Edition_1.md).

### 4.4 Crew (shared support) — **Shipped**

| Capability | Detail |
| --- | --- |
| Roles | captain, guardian, guide, anchor, cheerleader, observer, admin |
| Invite | email / SMS / WhatsApp / deep link |
| Supporter-only | Invitee sees supported person’s nudges until they set up their own world |
| Permissions | Category-scoped (e.g. medication view) |
| Ask for Help | Request support from Crew |
| Crew terms | Supporter acknowledgement (not emergencies) |
| Org dashboard | Organisation-oriented view present |

### 4.5 Security & privacy — **Shipped**

| Capability | Detail |
| --- | --- |
| App lock | Face ID / biometrics + password or PIN |
| Lock on background | Optional |
| Recovery | Recovery email + one-time recovery code (share / store offline) |
| Forgot | Device passcode / Face ID, email reset link, or recovery code |
| Encryption | AES-GCM on-device for sensitive stores; keys in Secure Store |
| Guidance | Device passcode + app lock on + recovery code offline |

**Practical coverage:** lost phone + casual snooping for this class of app. Not a full E2E cloud vault (no cloud sync in this version).

### 4.6 Calendar & contacts — **Shipped**

| Capability | Detail |
| --- | --- |
| Contacts | Search device contacts; favourites; appointment guests |
| Calendar write | Add appointments / events to phone calendars |
| Calendar import | Import phone events into the app |
| Permissions | Explained in Settings and system prompts |

### 4.7 Voice — **Shipped (device-dependent)**

| Capability | Detail |
| --- | --- |
| Voice capture | Create / fill fields by speech (needs mic + speech recognition; full install) |
| Speaking reminders | Optional TTS / speaking text on items |
| Needs | TestFlight / dev client — not Expo Go for full native path |

### 4.8 Location / leaving home — **Shipped (optional)**

Leaving-home style reminders (keys, wallet, phone) with optional location permissions. Background location explained in Info.plist copy.

### 4.9 Focus — **Shipped**

Single-task Focus timer surface for one-thing-at-a-time sessions.

### 4.10 Documents / attachments — **Shipped**

Photo / document attachments on nudges (encrypted at rest where applicable). Categories for identity, medical, insurance, etc. — organisational filing only.

### 4.11 Partner / affiliate links — **Shipped (soft attribution)**

Travel / shopping / gift partner links with disclosure. Commission tracking only when partner programme IDs configured; until then links work as normal shopping pages. Official airport assistance / maps / search are never affiliate.

### 4.12 In-app purchases — **Honest beta**

| State | Behaviour |
| --- | --- |
| RevenueCat API key empty | Store billing **off**; paid packs install without charge; UI says purchases not enabled / will not be charged |
| Key present | Store billing **on**; `ready.pack.*` product IDs used |
| Free packs | `ready4-home`, `ready4-wellbeing` (no productId) |
| Dev `allowAll` | Only in `__DEV__`; forced off in production builds |

### 4.13 Legal & trust — **Shipped**

In-app Legal, Terms of Use, Crew supporter terms, privacy / support URLs, health organisational disclaimer on Medication & Emergencies packs.

---

## 5. Screen catalogue (user-facing)

| Area | Screens / entry | Job |
| --- | --- | --- |
| Onboarding | Splash | Register profile, optional lock, recovery code |
| Hub | Home | Brand hub, lock tip, ReadyPacks CTA, tiles |
| Day | Today | Open nudges for self or supported person |
| Create | Capture, type screens, Item Details | Add and edit any nudge type |
| Focus | Focus | One task concentration |
| Packs | ReadyPacks, Preview | Browse, preview templates, install |
| People | My Crew, Invite, Accept, Crews I Support | Shared care |
| Self | Profile, Settings | Identity, notifications, security, calendars |
| Trust | Legal, Terms, Crew terms | Policies and disclosures |
| Done | Completed | Finished items |

---

## 6. Data & architecture (product view)

| Concern | Approach |
| --- | --- |
| Sync | Local-only this version (uninstall removes data) |
| Persistence | Encrypted async storage + Secure Store keys |
| Packs | Static catalogue in app binary; install copies editable nudges into user store |
| Deep links | `nudge-me://` + `https://nudgemeready.app/invite` and `/recover` |
| Analytics / ads | Not a core shipped module in this build |

---

## 7. Edition 1 commercial map vs shipped

| Edition 1 volume theme | Shipped now? |
| --- | --- |
| Volume 1 Brand & platform | Principles reflected in product |
| Volume 2 Ready 4 packs (15) | **Yes** — content templates live |
| Volume 2 Bundles | Spec only — not purchasable yet |
| Volume 3 Subscriptions / Premium / GTM | Commercial planning; billing keys empty on TestFlight |
| Volume 4 NHS / Education / Workplace / White-label | Future editions — not in consumer 0.2.0 |
| AI Coach product pages | Prompts on packs; full Coach experience deferred |
| Rewards / achievements | Deferred / gated |

---

## 8. Non-goals (current)

- Diagnosis or treatment recommendations  
- Guaranteed cloud backup  
- Cryptographic unlock of all data solely via app lock (lock is access control; data key model is device-local)  
- Live paid IAP until RevenueCat + App Store products configured  
- Situation packs (ADHD Starter etc.) as live catalogue — archived, replaced by Ready 4 taxonomy  

---

## 9. Success criteria for TestFlight 0.2.0

1. Fresh install → register → optional app lock → recovery code shared offline  
2. Install free Ready 4 Home & Wellbeing; edit and complete items without shame copy  
3. Install a paid Ready 4 pack with billing off — no charge, honest copy  
4. Create appointment with guest + calendar link  
5. Invite Crew; supporter accepts with terms understanding  
6. Lock / unlock / forgot path works  
7. Privacy & support URLs reachable  

---

## 10. Spec owners & source of truth

| Topic | Source of truth |
| --- | --- |
| Product principles | `AGENTS.md` |
| Ready 4 content | `src/data/readyPacks/ready4/*` |
| Entitlements / billing honesty | `src/services/readyPackEntitlements.ts`, `iapRevenueCat.ts` |
| Security UX | `SecuritySettingsCard`, `RecoveryCodeSaveCard`, Splash |
| Commercial catalogue narrative | Edition 1 volumes under `exports/catalogue-edition-1/` |
| End-user illustrated guide | https://nudgemeready.app/manual/ |
