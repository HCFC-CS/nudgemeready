# Product Spec — Ready 4 Finance

| Field | Value |
| --- | --- |
| **Pack id** | `ready4-finance` |
| **Kind** | content |
| **Category** | lifestyle |
| **Version** | 1.0.0 |
| **Icon** | `wallet-outline` |
| **Source** | `src/data/readyPacks/ready4/finance.ts` |

---

## 1. Positioning

Bills, subscriptions, renewals and a simple budget glance — organised calmly, not judged.

### Problem it solves

Reduces mental load by providing editable, shame-free structure for this life area — install once, then adapt every nudge.

### Core outcomes

- Bill calendar
- Subscription tracker
- Savings goals
- Annual renewals
- Budget planner

### Perfect for

- Solo adults
- Shared bills
- Anyone drowning in renewals

---

## 2. Commercial / access

**Paid catalogue SKU:** `ready.pack.ready4_finance`

Edition 1 commercial list price (when IAP live): typically ~£4.99 individual / included in Premium or bundles.
TestFlight with empty RevenueCat keys: installs without charge; UI must stay honest.

### Customers also buy (Edition 1)

- Ready 4 Life Admin
- Ready 4 Home
- Ready 4 Shopping

---

## 3. Product principles (must hold)

- Warm, supportive copy — no guilt for skipped steps
- Every installed item is editable, snoozeable, dismissible
- Not medical, legal, or financial advice
- No clinical claims

---

## 4. Feature modules (in-app feature list)

- Bill calendar
- Subscription tracker
- Savings goals
- Annual renewals
- Budget planner

---

## 5. Shipped templates (6)

### Upcoming bills

- **Template id:** `bill-calendar`
- **Type:** `list`
- **Repeat:** monthly
- **Notes:** Organisational only — not financial advice. Edit amounts and dates to suit you.
- **Checklist:**
  - Bill 1 — (edit me)
  - Bill 2 — (edit me)
  - Bill 3 — (edit me)
  - Payday / buffer noted

### Subscription review

- **Template id:** `subscriptions`
- **Type:** `list`
- **Repeat:** monthly
- **Notes:** Keep, pause or cancel — your choice. No shame for unused trials.
- **Checklist:**
  - Streaming / media
  - Apps / cloud
  - Memberships
  - Anything to cancel noted

### Savings goal note

- **Template id:** `savings-goals`
- **Type:** `note`
- **Notes:** One goal is enough. Track progress kindly — not financial advice.

### Annual renewals checklist

- **Template id:** `annual-renewals`
- **Type:** `list`
- **Due in:** 60 day(s) from install
- **Notes:** Insurance, MOT, tax, memberships — edit to suit.
- **Checklist:**
  - Car insurance / MOT
  - Home / contents insurance
  - Tax / self-assessment if relevant
  - Other memberships

### Simple monthly budget glance

- **Template id:** `budget-planner`
- **Type:** `list`
- **Repeat:** monthly
- **Notes:** Rough categories only. Not a formal budget product.
- **Checklist:**
  - Essentials covered
  - Flexible spend noted
  - One money admin task done
  - Rest — money worry pause if needed

### Payment due soon

- **Template id:** `payment-nudge`
- **Type:** `reminder`
- **Priority:** soon
- **Due in:** 3 day(s) from install
- **Notes:** Edit to match a real payment. Organisational only.
- **Speaking text:** A soft reminder about an upcoming payment.

---

## 6. AI Coach prompts (stored; Coach UI may be deferred)

- Help me list this month's bills without overwhelm.
- Suggest a calm subscription review checklist.

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
