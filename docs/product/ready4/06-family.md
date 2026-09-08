# Product Spec — Ready 4 Family

| Field | Value |
| --- | --- |
| **Pack id** | `ready4-family` |
| **Kind** | content |
| **Category** | family |
| **Version** | 1.0.0 |
| **Icon** | `people-outline` |
| **Source** | `src/data/readyPacks/ready4/family.ts` |

---

## 1. Positioning

School, meals, chores and shared plans — so the mental load is not only in one person's head.

### Problem it solves

Reduces mental load by providing editable, shame-free structure for this life area — install once, then adapt every nudge.

### Core outcomes

- Family week glance
- School hub
- Meal planner
- Chores
- Family budget glance
- Handover notes

### Perfect for

- Parents
- Carers
- Shared households

---

## 2. Commercial / access

**Paid catalogue SKU:** `ready.pack.ready4_family`

Edition 1 commercial list price (when IAP live): typically ~£4.99 individual / included in Premium or bundles.
TestFlight with empty RevenueCat keys: installs without charge; UI must stay honest.

### Customers also buy (Edition 1)

- Ready 4 Home
- Ready 4 Shopping
- Ready 4 Study

---

## 3. Product principles (must hold)

- Warm, supportive copy — no guilt for skipped steps
- Every installed item is editable, snoozeable, dismissible
- Not medical, legal, or financial advice
- No clinical claims

---

## 4. Feature modules (in-app feature list)

- Family week glance
- School hub
- Meal planner
- Chores
- Family budget glance
- Handover notes

---

## 5. Shipped templates (6)

### Family week glance

- **Template id:** `family-week`
- **Type:** `list`
- **Repeat:** weekly
- **Notes:** One calm look at the week ahead.
- **Checklist:**
  - Clubs / fixtures noted
  - Work late days noted
  - Who covers pickup
  - One rest / family moment

### School / nursery checklist

- **Template id:** `school-hub`
- **Type:** `list`
- **Repeat:** daily
- **Notes:** Edit for your household. Skip days that do not apply.
- **Checklist:**
  - Bags packed
  - PE / kit if needed
  - Forms / payments noted
  - Packed lunch or dinner money
  - Anything special today

### Meal ideas this week

- **Template id:** `meal-planner`
- **Type:** `list`
- **Repeat:** weekly
- **Notes:** Simple ideas only — no perfect plate required.
- **Checklist:**
  - Mon / Tue idea
  - Wed / Thu idea
  - Fri idea
  - Shopping linked (optional)

### Chore share

- **Template id:** `chores`
- **Type:** `list`
- **Notes:** Age-appropriate and optional. Rest still counts.
- **Checklist:**
  - Job 1 — (edit me)
  - Job 2 — (edit me)
  - Job 3 — (edit me)

### Family spend glance

- **Template id:** `family-budget`
- **Type:** `list`
- **Repeat:** weekly
- **Notes:** Organisational only — not financial advice.
- **Checklist:**
  - Food / shop noted
  - Activities / clubs
  - Upcoming birthdays / trips

### Pickup / handover notes

- **Template id:** `handover`
- **Type:** `note`
- **Notes:** Who is collecting, where, and any change of plan.

---

## 6. AI Coach prompts (stored; Coach UI may be deferred)

- Help me plan tomorrow morning for the family with fewer decisions.
- Suggest a calm school-run checklist.

---

## 7. Install behaviour (product requirements)

1. User can preview title, summary, features, and templates before install.
2. Install copies templates into the user’s nudge store as editable items.
3. Provenance / pack origin may be shown on installed items.
4. Uninstall modes (where implemented): remove unedited-only or all items from pack.
5. Free packs install without purchase; paid packs respect entitlement / honest complimentary mode.

---

## 8. Acceptance criteria (QA)

- [ ] Pack appears in ReadyPacks catalogue with correct free/paid labelling
- [ ] Preview lists all 6 templates
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
