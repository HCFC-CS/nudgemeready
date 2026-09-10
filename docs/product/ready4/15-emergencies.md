# Product Spec — Ready4 Emergencies

| Field | Value |
| --- | --- |
| **Pack id** | `ready4-emergencies` |
| **Kind** | content |
| **Category** | lifestyle |
| **Version** | 1.0.0 |
| **Icon** | `alert-circle-outline` |
| **Source** | `src/data/readyPacks/ready4/emergencies.ts` |

---

## 1. Positioning

Contacts, grab bag, home plan and document locations — preparation for peace of mind, not panic.

### Problem it solves

Reduces mental load by providing editable, shame-free structure for this life area — install once, then adapt every nudge.

### Core outcomes

- Emergency contacts
- Medical information note
- Grab bag checklist
- Home emergency plan
- Important documents
- Annual review

### Perfect for

- Households wanting a calm plan
- Carers
- Independent living

---

## 2. Commercial / access

**Paid catalogue SKU:** `ready.pack.ready4_emergencies`

Edition 1 commercial list price (when IAP live): typically ~£4.99 individual / included in Premium or bundles.
TestFlight with empty RevenueCat keys: installs without charge; UI must stay honest.

### Customers also buy (Edition 1)

- Ready4 Medication
- Ready4 Independence
- Ready4 Life Admin

---

## 3. Product principles (must hold)

- Warm, supportive copy — no guilt for skipped steps
- Every installed item is editable, snoozeable, dismissible
- Not medical, legal, or financial advice
- **Health:** Organisational support only. This pack does not diagnose, prescribe, or change medication. Follow advice from your clinician.

---

## 4. Feature modules (in-app feature list)

- Emergency contacts
- Medical information note
- Grab bag checklist
- Home emergency plan
- Important documents
- Annual review

---

## 5. Shipped templates (6)

### Emergency contacts

- **Template id:** `emergency-contacts`
- **Type:** `note`
- **Notes:** Trusted people and key numbers for your household. In an emergency dial local emergency services. This pack is organisational only.

### Essential medical information note

- **Template id:** `medical-info`
- **Type:** `note`
- **Notes:** Organisational support only. This pack does not diagnose, prescribe, or change medication. Follow advice from your clinician. Optional allergies, conditions and clinician contacts for your own or household use — not a medical device.

### Grab bag checklist

- **Template id:** `grab-bag`
- **Type:** `list`
- **Notes:** Prepare when calm. Edit for your household.
- **Checklist:**
  - Torch / power bank
  - Water / snacks
  - Medications list / supply as prescribed
  - Copies of key documents
  - Cash / cards / keys
  - Phone chargers

### Home emergency plan

- **Template id:** `home-plan`
- **Type:** `list`
- **Checklist:**
  - Meeting point noted
  - Utility shut-offs location noted
  - Smoke / CO alarms checked
  - Evacuation route thought through
  - Shared with trusted person (optional)

### Where vital documents live

- **Template id:** `important-docs`
- **Type:** `note`
- **Notes:** Passports, insurance, deeds — note locations only. Keep originals secure.

### Annual emergency plan review

- **Template id:** `annual-review`
- **Type:** `reminder`
- **Priority:** soon
- **Due in:** 365 day(s) from install
- **Notes:** Refresh contacts, kit and plans once a year.
- **Speaking text:** Reminder to review your emergency plan when you can.

---

## 6. AI Coach prompts (stored; Coach UI may be deferred)

- Help me build a simple grab-bag checklist for my household.
- Suggest a calm annual review of emergency contacts and plans.

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
