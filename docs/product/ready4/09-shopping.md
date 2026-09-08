# Product Spec — Ready 4 Shopping

| Field | Value |
| --- | --- |
| **Pack id** | `ready4-shopping` |
| **Kind** | content |
| **Category** | lifestyle |
| **Version** | 1.0.0 |
| **Icon** | `cart-outline` |
| **Source** | `src/data/readyPacks/ready4/shopping.ts` |

---

## 1. Positioning

Reusable lists, household essentials and a calm shop plan — buy what you need without the mental load.

### Problem it solves

Reduces mental load by providing editable, shame-free structure for this life area — install once, then adapt every nudge.

### Core outcomes

- Shopping lists
- Meal ingredients
- Household essentials
- Budget basket glance
- Seasonal / event shop

### Perfect for

- Weekly shops
- Meal planning
- Shared lists

---

## 2. Commercial / access

**Paid catalogue SKU:** `ready.pack.ready4_shopping`

Edition 1 commercial list price (when IAP live): typically ~£4.99 individual / included in Premium or bundles.
TestFlight with empty RevenueCat keys: installs without charge; UI must stay honest.

### Customers also buy (Edition 1)

- Ready 4 Home
- Ready 4 Family
- Ready 4 Finance

---

## 3. Product principles (must hold)

- Warm, supportive copy — no guilt for skipped steps
- Every installed item is editable, snoozeable, dismissible
- Not medical, legal, or financial advice
- No clinical claims

---

## 4. Feature modules (in-app feature list)

- Shopping lists
- Meal ingredients
- Household essentials
- Budget basket glance
- Seasonal / event shop

---

## 5. Shipped templates (6)

### Shopping list

- **Template id:** `main-list`
- **Type:** `list`
- **Notes:** Edit freely. Tick as you go.
- **Checklist:**
  - Fruit / veg
  - Dairy / alternatives
  - Bread / staples
  - Protein / mains
  - Household

### Ingredients for planned meals

- **Template id:** `meal-ingredients`
- **Type:** `list`
- **Notes:** Link to this week's meals if helpful.
- **Checklist:**
  - Meal 1 ingredients
  - Meal 2 ingredients
  - Snacks

### Household essentials restock

- **Template id:** `household-essentials`
- **Type:** `list`
- **Repeat:** weekly
- **Checklist:**
  - Toilet paper / tissues
  - Cleaning / washing
  - Personal care
  - Pet food if relevant

### Budget basket glance

- **Template id:** `budget-basket`
- **Type:** `note`
- **Notes:** Optional spend limit for this trip. Organisational only — not financial advice.

### Event / seasonal shop

- **Template id:** `seasonal-shop`
- **Type:** `list`
- **Notes:** Birthdays, holidays, guests — edit as needed.
- **Checklist:**
  - Card / gift
  - Food extras
  - Decor / wrapping (optional)

### Before you leave for the shop

- **Template id:** `before-you-go`
- **Type:** `list`
- **Checklist:**
  - Bags / trolley token
  - List open
  - Loyalty / payment card
  - Anything from the fridge checked

---

## 6. AI Coach prompts (stored; Coach UI may be deferred)

- Help me turn this week's meals into a short shopping list.
- Suggest a calm essentials restock checklist.

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
