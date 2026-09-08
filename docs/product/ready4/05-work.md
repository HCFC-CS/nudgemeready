# Product Spec — Ready 4 Work

| Field | Value |
| --- | --- |
| **Pack id** | `ready4-work` |
| **Kind** | content |
| **Category** | work |
| **Version** | 1.0.0 |
| **Icon** | `briefcase-outline` |
| **Source** | `src/data/readyPacks/ready4/work.ts` |

---

## 1. Positioning

Top 3 priorities, meeting prep, follow-ups and breaks — structured workdays without overwhelm.

### Problem it solves

Reduces mental load by providing editable, shame-free structure for this life area — install once, then adapt every nudge.

### Core outcomes

- Daily planner
- Top 3 focus
- Meeting prep
- Project tracker
- Email follow-up
- Breaks

### Perfect for

- Knowledge workers
- Hybrid days
- Overwhelm-prone planners

---

## 2. Commercial / access

**Paid catalogue SKU:** `ready.pack.ready4_work`

Edition 1 commercial list price (when IAP live): typically ~£4.99 individual / included in Premium or bundles.
TestFlight with empty RevenueCat keys: installs without charge; UI must stay honest.

### Customers also buy (Edition 1)

- Ready 4 Study
- Ready 4 Digital Life
- Ready 4 Finance

---

## 3. Product principles (must hold)

- Warm, supportive copy — no guilt for skipped steps
- Every installed item is editable, snoozeable, dismissible
- Not medical, legal, or financial advice
- No clinical claims

---

## 4. Feature modules (in-app feature list)

- Daily planner
- Top 3 focus
- Meeting prep
- Project tracker
- Email follow-up
- Breaks

---

## 5. Shipped templates (6)

### Workday start

- **Template id:** `daily-planner`
- **Type:** `routine`
- **Repeat:** daily
- **Notes:** Glance at the calendar, then pick your Top 3. Skip what does not fit.
- **Speaking text:** A soft start for your workday.
- **Checklist:**
  - Open calendar
  - Note any hard deadlines
  - Pick Top 3
  - One kind check-in with yourself

### Today's Top 3

- **Template id:** `top-3`
- **Type:** `list`
- **Repeat:** daily
- **Notes:** Only three. If everything feels urgent, pick the kindest useful three.
- **Checklist:**
  - Top 1 — (edit me)
  - Top 2 — (edit me)
  - Top 3 — (edit me)

### Meeting prep checklist

- **Template id:** `meeting-prep`
- **Type:** `list`
- **Notes:** Agenda, links, follow-ups. Edit freely.
- **Checklist:**
  - Confirm time and link / place
  - Notes or agenda ready
  - Questions listed
  - Follow-up owner noted

### Project milestones

- **Template id:** `project-tracker`
- **Type:** `list`
- **Notes:** One project at a time is fine.
- **Checklist:**
  - Next milestone
  - Blocked on? (edit)
  - Who needs an update
  - Review date noted

### Follow-up actions

- **Template id:** `email-follow-up`
- **Type:** `list`
- **Notes:** Capture replies and actions before they fade.
- **Checklist:**
  - Reply owed
  - Action from meeting
  - Waiting on someone else

### Break & stretch

- **Template id:** `break-nudge`
- **Type:** `reminder`
- **Notes:** Stand, stretch, drink water. A break is part of the plan.
- **Speaking text:** Time for a short break when you can.

---

## 6. AI Coach prompts (stored; Coach UI may be deferred)

- Help me choose three priorities for today without pressure.
- Suggest a short meeting-prep checklist.

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
