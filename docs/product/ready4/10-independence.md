# Product Spec — Ready 4 Independence

| Field | Value |
| --- | --- |
| **Pack id** | `ready4-independence` |
| **Kind** | content |
| **Category** | lifestyle |
| **Version** | 1.0.0 |
| **Icon** | `walk-outline` |
| **Source** | `src/data/readyPacks/ready4/independence.ts` |

---

## 1. Positioning

Morning and evening routines, safety checks and essential tasks for confident independent living.

### Problem it solves

Reduces mental load by providing editable, shame-free structure for this life area — install once, then adapt every nudge.

### Core outcomes

- Morning & evening routines
- Home safety checks
- Essential tasks
- Appointments glance
- Emergency contacts note

### Perfect for

- Leaving home
- Supported living
- Rebuilding routines

---

## 2. Commercial / access

**Paid catalogue SKU:** `ready.pack.ready4_independence`

Edition 1 commercial list price (when IAP live): typically ~£4.99 individual / included in Premium or bundles.
TestFlight with empty RevenueCat keys: installs without charge; UI must stay honest.

### Customers also buy (Edition 1)

- Ready 4 Home
- Ready 4 Wellbeing
- Ready 4 Life Admin

---

## 3. Product principles (must hold)

- Warm, supportive copy — no guilt for skipped steps
- Every installed item is editable, snoozeable, dismissible
- Not medical, legal, or financial advice
- No clinical claims

---

## 4. Feature modules (in-app feature list)

- Morning & evening routines
- Home safety checks
- Essential tasks
- Appointments glance
- Emergency contacts note

---

## 5. Shipped templates (6)

### Morning independence routine

- **Template id:** `morning-routine`
- **Type:** `routine`
- **Repeat:** daily
- **Notes:** Edit to fit you. Skip steps that do not apply.
- **Speaking text:** Your morning routine is here when you want it.
- **Checklist:**
  - Wash / dress
  - Eat or drink something
  - Medication organisation if relevant (as prescribed)
  - Keys / phone / bag ready

### Evening settle routine

- **Template id:** `evening-routine`
- **Type:** `routine`
- **Repeat:** daily
- **Speaking text:** Evening settle when you are ready.
- **Checklist:**
  - Doors / windows as preferred
  - Phone on charge
  - Clothes for tomorrow (optional)
  - Rest

### Home safety check

- **Template id:** `safety-checks`
- **Type:** `list`
- **Repeat:** daily
- **Checklist:**
  - Doors locked when leaving / overnight
  - Keys in usual place
  - Appliances off if needed
  - Heating / windows as preferred

### Essential tasks this week

- **Template id:** `essential-tasks`
- **Type:** `list`
- **Repeat:** weekly
- **Notes:** One or two items only — rest still counts.
- **Checklist:**
  - Laundry
  - Shopping / food
  - One bill or message
  - Cleaning glance

### Upcoming appointments

- **Template id:** `appointments-glance`
- **Type:** `list`
- **Notes:** Medical, social or personal — edit freely.
- **Checklist:**
  - Next appointment noted
  - Travel plan
  - Support person if needed

### Important contacts note

- **Template id:** `emergency-info`
- **Type:** `note`
- **Notes:** Trusted people and key numbers for your own use. Share with Crew only if you choose. Not a substitute for emergency services.

---

## 6. AI Coach prompts (stored; Coach UI may be deferred)

- Help me build a simple morning routine for independent living.
- Suggest a calm evening safety checklist.

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
