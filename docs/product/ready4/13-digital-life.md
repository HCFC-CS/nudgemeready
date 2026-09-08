# Product Spec — Ready 4 Digital Life

| Field | Value |
| --- | --- |
| **Pack id** | `ready4-digital-life` |
| **Kind** | content |
| **Category** | lifestyle |
| **Version** | 1.0.0 |
| **Icon** | `laptop-outline` |
| **Source** | `src/data/readyPacks/ready4/digitalLife.ts` |

---

## 1. Positioning

Passwords, updates, subscriptions, backups and device health — digital admin in small steps.

### Problem it solves

Reduces mental load by providing editable, shame-free structure for this life area — install once, then adapt every nudge.

### Core outcomes

- Password review
- Software updates
- Subscription manager
- Cloud backup
- Device maintenance
- Digital inventory

### Perfect for

- Device overwhelm
- Subscription creep
- Backup anxiety

---

## 2. Commercial / access

**Paid catalogue SKU:** `ready.pack.ready4_digital_life`

Edition 1 commercial list price (when IAP live): typically ~£4.99 individual / included in Premium or bundles.
TestFlight with empty RevenueCat keys: installs without charge; UI must stay honest.

### Customers also buy (Edition 1)

- Ready 4 Finance
- Ready 4 Work
- Ready 4 Life Admin

---

## 3. Product principles (must hold)

- Warm, supportive copy — no guilt for skipped steps
- Every installed item is editable, snoozeable, dismissible
- Not medical, legal, or financial advice
- No clinical claims

---

## 4. Feature modules (in-app feature list)

- Password review
- Software updates
- Subscription manager
- Cloud backup
- Device maintenance
- Digital inventory

---

## 5. Shipped templates (6)

### Password review

- **Template id:** `password-review`
- **Type:** `list`
- **Repeat:** monthly
- **Notes:** Update critical passwords when you can. Use a password manager if you have one.
- **Checklist:**
  - Email / Apple ID / Google
  - Banking / payments
  - Work / school accounts
  - One other high-value account

### Software & security updates

- **Template id:** `software-updates`
- **Type:** `reminder`
- **Repeat:** weekly
- **Notes:** Phone, laptop, tablet — update when convenient.
- **Speaking text:** A soft reminder to check for software updates.

### Digital subscriptions review

- **Template id:** `subscriptions`
- **Type:** `list`
- **Repeat:** monthly
- **Notes:** Keep, pause or cancel — your choice.
- **Checklist:**
  - Streaming
  - Cloud / storage
  - Apps / games
  - Anything unused noted

### Backup check

- **Template id:** `cloud-backup`
- **Type:** `reminder`
- **Repeat:** monthly
- **Notes:** Confirm photos and important files are backing up.
- **Speaking text:** Reminder to check your backups when you can.

### Device health checklist

- **Template id:** `device-maintenance`
- **Type:** `list`
- **Repeat:** monthly
- **Checklist:**
  - Storage space glance
  - Battery / charging health noted
  - Security / screen lock ok
  - Clear one clutter folder (optional)

### Digital inventory note

- **Template id:** `digital-inventory`
- **Type:** `note`
- **Notes:** Devices, licences, important account emails — for your own records.

---

## 6. AI Coach prompts (stored; Coach UI may be deferred)

- Help me prioritise one digital admin task this week.
- Suggest a calm monthly device-health checklist.

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
