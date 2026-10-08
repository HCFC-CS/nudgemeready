# Product Spec — Ready4 Pets

| Field | Value |
| --- | --- |
| **Pack id** | `ready4-pets` |
| **Kind** | content |
| **Category** | lifestyle |
| **Version** | 1.0.0 |
| **Icon** | `paw-outline` |
| **Source** | `src/data/readyPacks/ready4/pets.ts` |

---

## 1. Positioning

Feeding, walks, vet plans, treatments and records — so pet care is not only in your head.

### Problem it solves

Reduces mental load by providing editable, shame-free structure for this life area — install once, then adapt every nudge.

### Core outcomes

- Daily care
- Medication / treatments
- Vet planner
- Vaccinations
- Grooming
- Pet records

### Perfect for

- Dog / cat / small animal homes
- Shared pet care

---

## 2. Commercial / access

**Paid catalogue SKU:** `ready.pack.ready4_pets`

Edition 1 commercial list price (when IAP live): typically ~£4.99 individual / included in Premium or bundles.
TestFlight with empty RevenueCat keys: installs without charge; UI must stay honest.

### Customers also buy (Edition 1)

- Ready4 Appointments
- Ready4 Shopping
- Ready4 Family

---

## 3. Product principles (must hold)

- Warm, supportive copy — no guilt for skipped steps
- Every installed item is editable, snoozeable, dismissible
- Not medical, legal, or financial advice
- No clinical claims

---

## 4. Feature modules (in-app feature list)

- Daily care
- Medication / treatments
- Vet planner
- Vaccinations
- Grooming
- Pet records

---

## 5. Shipped templates (6)

### Daily pet care

- **Template id:** `daily-care`
- **Type:** `list`
- **Repeat:** daily
- **Notes:** Edit for your pet. Medication notes are organisational only.
- **Checklist:**
  - Morning feed / water
  - Walk / play / enrichment
  - Evening feed / water
  - Litter / outdoor toilet check

### Pet medication / treatments

- **Template id:** `pet-medication`
- **Type:** `reminder`
- **Priority:** soon
- **Notes:** Organisational support only. This pack does not diagnose, prescribe, or change medication. Follow advice from your clinician. For pets: follow your vet's advice. Do not change doses yourself.
- **Speaking text:** Pet medication or treatment reminder when relevant.

### Vet appointment prep

- **Template id:** `vet-planner`
- **Type:** `list`
- **Due in:** 7 day(s) from install
- **Checklist:**
  - Confirm time and clinic
  - Travel / carrier ready
  - Questions for the vet
  - Records / insurance card if needed

### Vaccinations & boosters

- **Template id:** `vaccinations`
- **Type:** `list`
- **Due in:** 30 day(s) from install
- **Notes:** Organisational tracker — follow your vet's schedule.
- **Checklist:**
  - Next vaccination / booster noted
  - Flea / worming due noted
  - Clinic booked if needed

### Grooming checklist

- **Template id:** `grooming`
- **Type:** `list`
- **Repeat:** weekly
- **Checklist:**
  - Brush / coat check
  - Nails if needed
  - Bath / groomer if booked

### Pet records note

- **Template id:** `pet-records`
- **Type:** `note`
- **Notes:** Chip number, insurance, emergency contacts, diet notes — for your own use.

---

## 6. AI Coach prompts (stored; Coach UI may be deferred)

- Help me set a simple daily pet-care checklist.
- Suggest a calm vet-appointment prep list.

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
