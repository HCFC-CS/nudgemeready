# Product Spec — Ready4 Life Admin

| Field | Value |
| --- | --- |
| **Pack id** | `ready4-life-admin` |
| **Kind** | content |
| **Category** | lifestyle |
| **Version** | 1.0.0 |
| **Icon** | `folder-outline` |
| **Source** | `src/data/readyPacks/ready4/lifeAdmin.ts` |

---

## 1. Positioning

Documents, renewals, vehicle and household admin — small important jobs that are easy to forget.

### Problem it solves

Reduces mental load by providing editable, shame-free structure for this life area — install once, then adapt every nudge.

### Core outcomes

- Document vault
- Renewal calendar
- Household admin
- Vehicle reminders
- Paperwork glance

### Perfect for

- Paperwork avoiders
- Car owners
- Anyone with “one day” piles

---

## 2. Commercial / access

**Paid catalogue SKU:** `ready.pack.ready4_life_admin`

Edition 1 commercial list price (when IAP live): typically ~£4.99 individual / included in Premium or bundles.
TestFlight with empty RevenueCat keys: installs without charge; UI must stay honest.

### Customers also buy (Edition 1)

- Ready4 Finance
- Ready4 Home
- Ready4 Emergencies

---

## 3. Product principles (must hold)

- Warm, supportive copy — no guilt for skipped steps
- Every installed item is editable, snoozeable, dismissible
- Not medical, legal, or financial advice
- No clinical claims

---

## 4. Feature modules (in-app feature list)

- Document vault
- Renewal calendar
- Household admin
- Vehicle reminders
- Paperwork glance

---

## 5. Shipped templates (6)

### Important documents checklist

- **Template id:** `document-vault`
- **Type:** `list`
- **Notes:** Note where things live — not a secure vault inside the app.
- **Checklist:**
  - Passport / ID location noted
  - Certificates / warranties noted
  - Insurance docs noted
  - Emergency paper copies if useful

### Renewals this season

- **Template id:** `renewal-calendar`
- **Type:** `list`
- **Due in:** 45 day(s) from install
- **Checklist:**
  - Home / contents insurance
  - Memberships / clubs
  - Licences / permits
  - Other renewals

### Household admin tasks

- **Template id:** `household-admin`
- **Type:** `list`
- **Repeat:** monthly
- **Checklist:**
  - Boiler / appliance service if due
  - Meters / readings if needed
  - Post / paperwork sorted
  - One admin call or form

### Vehicle reminders

- **Template id:** `vehicle`
- **Type:** `list`
- **Due in:** 30 day(s) from install
- **Notes:** Skip if you do not drive.
- **Checklist:**
  - MOT due noted
  - Service due noted
  - Tax / insurance noted
  - Tyres / lights glance

### Paperwork / statements glance

- **Template id:** `paperwork`
- **Type:** `reminder`
- **Repeat:** monthly
- **Notes:** Open post, file or recycle. Organisational only.
- **Speaking text:** A soft reminder to glance at paperwork when you can.

### Admin pause

- **Template id:** `admin-timeout`
- **Type:** `reminder`
- **Notes:** Permission to stop. Come back to one tiny next step later.
- **Speaking text:** It is okay to pause life admin for a bit.

---

## 6. AI Coach prompts (stored; Coach UI may be deferred)

- Help me break life admin into one small next step.
- Suggest a calm renewals checklist for the next month.

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
