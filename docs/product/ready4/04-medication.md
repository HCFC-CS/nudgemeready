# Product Spec — Ready4 Medication

| Field | Value |
| --- | --- |
| **Pack id** | `ready4-medication` |
| **Kind** | content |
| **Category** | health |
| **Version** | 1.0.0 |
| **Icon** | `medkit-outline` |
| **Source** | `src/data/readyPacks/ready4/medication.ts` |

---

## 1. Positioning

Medication organisation, refill checks and appointment prep — organisational support only, not medical advice.

### Problem it solves

Reduces mental load by providing editable, shame-free structure for this life area — install once, then adapt every nudge.

### Core outcomes

- Medication schedule
- Prescription tracker
- Pharmacy collection
- Health appointments
- Symptom journal

### Perfect for

- Multi-dose routines
- Repeat prescriptions
- Appointment prep

---

## 2. Commercial / access

**Paid catalogue SKU:** `ready.pack.ready4_medication`

Edition 1 commercial list price (when IAP live): typically ~£4.99 individual / included in Premium or bundles.
TestFlight with empty RevenueCat keys: installs without charge; UI must stay honest.

### Customers also buy (Edition 1)

- Ready4 Appointments
- Ready4 Wellbeing
- Ready4 Emergencies

---

## 3. Product principles (must hold)

- Warm, supportive copy — no guilt for skipped steps
- Every installed item is editable, snoozeable, dismissible
- Not medical, legal, or financial advice
- **Health:** Organisational support only. This pack does not diagnose, prescribe, or change medication. Follow advice from your clinician.

---

## 4. Feature modules (in-app feature list)

- Medication schedule
- Prescription tracker
- Pharmacy collection
- Health appointments
- Symptom journal

---

## 5. Shipped templates (6)

### Medication organisation check

- **Template id:** `med-schedule`
- **Type:** `reminder`
- **Priority:** important
- **Repeat:** daily
- **Notes:** Organisational support only. This pack does not diagnose, prescribe, or change medication. Follow advice from your clinician.
- **Speaking text:** Medication organisation reminder. Follow your clinician's advice.

### Daily medication times

- **Template id:** `med-times`
- **Type:** `list`
- **Repeat:** daily
- **Notes:** Organisational support only. This pack does not diagnose, prescribe, or change medication. Follow advice from your clinician. Edit times to match what you have been prescribed.
- **Checklist:**
  - Morning — if prescribed
  - Midday — if prescribed
  - Evening — if prescribed
  - Bedtime — if prescribed

### Prescription / supply check

- **Template id:** `prescription-tracker`
- **Type:** `list`
- **Repeat:** weekly
- **Notes:** Organisational support only. This pack does not diagnose, prescribe, or change medication. Follow advice from your clinician.
- **Checklist:**
  - Enough for the next few days
  - Repeat / refill arranged if needed
  - Stored in the usual safe place

### Pharmacy collection / delivery

- **Template id:** `pharmacy-collection`
- **Type:** `reminder`
- **Priority:** soon
- **Due in:** 5 day(s) from install
- **Notes:** Organisational only. Confirm collection or delivery with your pharmacy.
- **Speaking text:** Reminder about pharmacy collection if you need it.

### Health appointment prep

- **Template id:** `health-appointment`
- **Type:** `list`
- **Due in:** 7 day(s) from install
- **Notes:** Organisational support only. This pack does not diagnose, prescribe, or change medication. Follow advice from your clinician.
- **Checklist:**
  - Confirm time and place
  - Travel plan
  - Questions written down
  - Medication list for clinician (as advised)

### Symptom / wellbeing journal

- **Template id:** `symptom-journal`
- **Type:** `note`
- **Notes:** For your own records and clinician visits. Not a diagnosis tool. Do not change medication based on this note — ask your clinician.

---

## 6. AI Coach prompts (stored; Coach UI may be deferred)

- Help me organise a calm medication routine without giving medical advice.
- Suggest questions to prepare for a clinician appointment.

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
