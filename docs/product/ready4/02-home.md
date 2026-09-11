# Product Spec — Ready4 Home

| Field | Value |
| --- | --- |
| **Pack id** | `ready4-home` |
| **Kind** | content |
| **Category** | lifestyle |
| **Version** | 1.0.0 |
| **Icon** | `home-outline` |
| **Source** | `src/data/readyPacks/ready4/home.ts` |

---

## 1. Positioning

Calm home routines — daily reset, cleaning, bins, maintenance and bills — without overwhelm.

### Problem it solves

Reduces mental load by providing editable, shame-free structure for this life area — install once, then adapt every nudge.

### Core outcomes

- Daily reset
- Cleaning planner
- Leaving-home check
- Bin collection
- Home maintenance
- Bill reminders

### Perfect for

- Busy households
- Young adults leaving home
- Shared homes
- Anyone wanting structure

---

## 2. Commercial / access

**Free** — included with the app (no `productId`).

### Customers also buy (Edition 1)

- Ready4 Shopping
- Ready4 Finance
- Ready4 Family

---

## 3. Product principles (must hold)

- Warm, supportive copy — no guilt for skipped steps
- Every installed item is editable, snoozeable, dismissible
- Not medical, legal, or financial advice
- No clinical claims

---

## 4. Feature modules (in-app feature list)

- Daily reset
- Cleaning planner
- Leaving-home check
- Bin collection
- Home maintenance
- Bill reminders

---

## 5. Shipped templates (6)

### Daily home reset

- **Template id:** `daily-reset`
- **Type:** `routine`
- **Repeat:** daily
- **Notes:** Keep it short. One or two steps still count.
- **Speaking text:** A soft home reset when you are ready.
- **Checklist:**
  - Clear one surface
  - Dishes or sink tidy
  - Bins / recycling glance
  - Keys and phone in usual place

### Leaving-home check

- **Template id:** `leaving-home`
- **Type:** `list`
- **Notes:** Edit to match your day.
- **Checklist:**
  - Keys
  - Phone
  - Wallet / cards
  - Doors locked if needed

### Cleaning planner

- **Template id:** `cleaning-planner`
- **Type:** `list`
- **Repeat:** weekly
- **Notes:** Room by room — skip what does not need doing.
- **Checklist:**
  - Kitchen
  - Bathroom
  - Floors / vacuum
  - Laundry
  - Beds / freshen

### Bin collection

- **Template id:** `bin-day`
- **Type:** `reminder`
- **Priority:** soon
- **Repeat:** weekly
- **Notes:** Edit the day to match your collection. Put bins out the night before if that helps.
- **Speaking text:** Bin day reminder when you are ready.

### Home maintenance checklist

- **Template id:** `maintenance`
- **Type:** `list`
- **Due in:** 30 day(s) from install
- **Notes:** A gentle quarterly glance. Edit freely.
- **Checklist:**
  - Smoke / CO alarm check
  - Filter / extractor wipe
  - Boiler / heating glance
  - Anything needing a call-out noted

### Household bills glance

- **Template id:** `bill-reminders`
- **Type:** `list`
- **Repeat:** monthly
- **Notes:** Organisational only — not financial advice.
- **Checklist:**
  - Rent / mortgage noted
  - Utilities noted
  - Council tax / service charge
  - Any overdue item handled or deferred kindly

---

## 6. AI Coach prompts (stored; Coach UI may be deferred)

- Help me plan a ten-minute home reset.
- Suggest a simple weekly cleaning plan without pressure.

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
