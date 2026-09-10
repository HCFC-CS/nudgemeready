# Product Spec — Ready4 Wellbeing

| Field | Value |
| --- | --- |
| **Pack id** | `ready4-wellbeing` |
| **Kind** | content |
| **Category** | wellbeing |
| **Version** | 1.0.0 |
| **Icon** | `heart-outline` |
| **Source** | `src/data/readyPacks/ready4/wellbeing.ts` |

---

## 1. Positioning

Gentle structure for mornings, hydration, movement, sleep and gratitude — supportive, not pressured.

### Problem it solves

Reduces mental load by providing editable, shame-free structure for this life area — install once, then adapt every nudge.

### Core outcomes

- Morning reset
- Hydration
- Movement
- Mindfulness pause
- Sleep routine
- Gratitude journal

### Perfect for

- Anyone rebuilding gentle habits
- Low-energy days

---

## 2. Commercial / access

**Free** — included with the app (no `productId`).

### Customers also buy (Edition 1)

- Ready4 Medication
- Ready4 Independence
- Ready4 Emergencies

---

## 3. Product principles (must hold)

- Warm, supportive copy — no guilt for skipped steps
- Every installed item is editable, snoozeable, dismissible
- Not medical, legal, or financial advice
- No clinical claims

---

## 4. Feature modules (in-app feature list)

- Morning reset
- Hydration
- Movement
- Mindfulness pause
- Sleep routine
- Gratitude journal

---

## 5. Shipped templates (6)

### Morning reset

- **Template id:** `morning-reset`
- **Type:** `routine`
- **Repeat:** daily
- **Notes:** Start gently. Skip steps that do not fit.
- **Speaking text:** A soft morning reset when you are ready.
- **Checklist:**
  - Drink water
  - Open a curtain / get some light
  - One kind intention for the day
  - Eat or drink something

### Hydration nudge

- **Template id:** `hydration`
- **Type:** `reminder`
- **Repeat:** daily
- **Notes:** A quiet reminder only. No streak pressure.
- **Speaking text:** A quiet reminder to have some water.

### Movement choices

- **Template id:** `movement`
- **Type:** `list`
- **Notes:** Whatever feels doable. Rest days are valid.
- **Checklist:**
  - Short walk
  - Stretch
  - Move at home
  - Rest day — also valid

### Mindfulness pause

- **Template id:** `mindfulness`
- **Type:** `reminder`
- **Notes:** A few slow breaths or a short sit. Seek professional support if you need it.
- **Speaking text:** A quiet moment for a few slow breaths.

### Sleep wind-down

- **Template id:** `sleep-routine`
- **Type:** `routine`
- **Repeat:** daily
- **Notes:** Comfort only. Ongoing sleep problems may need clinical advice.
- **Speaking text:** Wind-down when you are ready.
- **Checklist:**
  - Dim lights if you can
  - Phone face-down
  - Quiet wind-down
  - Rest

### Gratitude / good thing note

- **Template id:** `gratitude`
- **Type:** `note`
- **Notes:** Optional. One good thing is enough. No pressure to be positive.

---

## 6. AI Coach prompts (stored; Coach UI may be deferred)

- Suggest one kind wellbeing step for a low-energy day.
- Help me plan a gentle evening wind-down.

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
