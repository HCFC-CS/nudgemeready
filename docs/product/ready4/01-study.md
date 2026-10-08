# Product Spec — Ready4 Study

| Field | Value |
| --- | --- |
| **Pack id** | `ready4-study` |
| **Kind** | content |
| **Category** | education |
| **Version** | 1.0.0 |
| **Icon** | `school-outline` |
| **Source** | `src/data/readyPacks/ready4/study.ts` |

---

## 1. Positioning

Assignments, revision, exams and calm study routines — without shame around deadlines.

### Problem it solves

Reduces mental load by providing editable, shame-free structure for this life area — install once, then adapt every nudge.

### Core outcomes

- Assignment planner
- Revision planner
- Exam countdown
- Lecture prep
- Study routine
- Weekly reset

### Perfect for

- Students
- Adult learners
- Exam seasons
- Anyone restarting after a slip

---

## 2. Commercial / access

**Paid catalogue SKU:** `ready.pack.ready4_study`

Edition 1 commercial list price (when IAP live): typically ~£4.99 individual / included in Premium or bundles.
TestFlight with empty RevenueCat keys: installs without charge; UI must stay honest.

### Customers also buy (Edition 1)

- Ready4 Work
- Ready4 Digital Life
- Ready4 Wellbeing

---

## 3. Product principles (must hold)

- Warm, supportive copy — no guilt for skipped steps
- Every installed item is editable, snoozeable, dismissible
- Not medical, legal, or financial advice
- No clinical claims

---

## 4. Feature modules (in-app feature list)

- Assignment planner
- Revision planner
- Exam countdown
- Lecture prep
- Study routine
- Weekly reset

---

## 5. Shipped templates (8)

### What would help today?

- **Template id:** `what-helps`
- **Type:** `list`
- **Notes:** Pick one. Missing a deadline does not mean you failed — edit and restart.
- **Checklist:**
  - Break one assignment into steps
  - A short revision block
  - Prep for class
  - Admin / form catch-up
  - Rest — also valid

### Assignment due soon

- **Template id:** `assignment-planner`
- **Type:** `task`
- **Priority:** important
- **Due in:** 7 day(s) from install
- **Notes:** Break the work into smaller steps on this card. Edit the due date.

### Assignment tiny steps

- **Template id:** `assignment-steps`
- **Type:** `list`
- **Checklist:**
  - Open the brief
  - Write one messy outline
  - Find one source
  - Ask for help if stuck
  - Submit when ready

### Revision topic list

- **Template id:** `revision-planner`
- **Type:** `list`
- **Notes:** Short sessions with a clear topic. Start tiny.
- **Checklist:**
  - Topic 1
  - Topic 2
  - Practice question
  - Break

### Exam day checklist

- **Template id:** `exam-countdown`
- **Type:** `list`
- **Priority:** important
- **Due in:** 3 day(s) from install
- **Checklist:**
  - Confirm time and room
  - Pack ID and stationery
  - Plan travel
  - Rest and water
  - Phone on silent / left outside if required

### Class bag checklist

- **Template id:** `lecture-prep`
- **Type:** `list`
- **Notes:** Bag, charger, reading glance. Skip what you do not need.
- **Checklist:**
  - Notebook / laptop
  - Charger
  - Student ID
  - Water / snack
  - Reading open (optional)

### Study routine block

- **Template id:** `study-routine`
- **Type:** `reminder`
- **Priority:** soon
- **Notes:** A short focus window. A break afterwards is part of the plan.
- **Speaking text:** Study time when you are ready.

### Week ahead glance

- **Template id:** `weekly-reset`
- **Type:** `list`
- **Repeat:** weekly
- **Notes:** One calm look at the week.
- **Checklist:**
  - Note deadlines this week
  - Note classes to prep
  - Plan one revision slot (optional)
  - Rest / social time

---

## 6. AI Coach prompts (stored; Coach UI may be deferred)

- Help me turn one assignment into three tiny steps.
- Suggest a calm exam-day checklist.
- Help me plan a short revision block without pressure.

---

## 7. Install behaviour (product requirements)

1. User can preview title, summary, features, and templates before install.
2. Install copies templates into the user’s nudge store as editable items.
3. Provenance / pack origin may be shown on installed items.
4. Uninstall modes (where implemented): remove unedited-only or all items from pack.
5. Free packs install without purchase; paid packs respect entitlement / honest complimentary mode.

---

## 8. Acceptance criteria (QA)

- [ ] Pack appears in Ready4Packs catalogue with correct free/paid labelling
- [ ] Preview lists all 8 templates
- [ ] Install creates editable nudges matching template titles
- [ ] Checklist items appear where specified
- [ ] Speaking text present where specified
- [ ] Repeat / due offsets behave as defined (or degrade gracefully if calendar unset)
- [ ] Copy stays non-shaming; health disclaimer visible when required
- [ ] Billing honesty: no fake charge when RevenueCat keys empty

---

## 9. Out of scope for this pack

- Diagnosis, dosing, or treatment changes
- Guaranteed cloud sync of pack content
- Live AI Coach conversation (prompts only until Coach ships)
- Bundle pricing (see Edition 1 Volume 2 Part 16)

---

## 10. Traceability

- Catalogue order: `src/data/readyPacks/ready4/index.ts`
- Factory: `ready4Pack()` in `src/data/readyPacks/packFactory.ts`
- Edition 1 overview: `docs/product/02-Ready4_Catalogue_Edition_1.md`
- **Template process flows (capture → treatment → next action):** [01-study-process-flow.md](./01-study-process-flow.md)
